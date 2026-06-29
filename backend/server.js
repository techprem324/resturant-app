// Node.js + Express API Server with Socket.io - Lumina Restaurant OS
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// API Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// --- In-Memory Mock Database (Aligned with PostgreSQL DDL & Seed) ---

const db = {
  users: [
    { id: 1, firebase_uid: 'firebase_user_sarah', email: 'sarah@connor.com', full_name: 'Sarah Connor', phone: '+15550293', loyalty_points: 240 },
    { id: 2, firebase_uid: 'firebase_user_alex', email: 'alex@rivera.com', full_name: 'Alex Rivera', phone: '+15559812', loyalty_points: 80 }
  ],
  crm_profiles: [
    { id: 1, user_id: 1, allergies: ['gluten'], taste_preferences: { wine: ['Barolo', 'Nebbiolo'], vibe: ['intimate'] }, staff_notes: 'Strict Gluten-free requirement. Prefers low-light table.', last_visited: '2026-06-25T19:30:00.000Z' },
    { id: 2, user_id: 2, allergies: [], taste_preferences: { wine: ['Pinot Noir', 'Sauvignon Blanc'], vibe: ['moody'] }, staff_notes: 'Prefers Table 2. Always orders the smoked cocktails.', last_visited: '2026-06-28T21:00:00.000Z' }
  ],
  tables: [
    { id: 1, table_number: '1', capacity: 2, zone: 'window', status: 'available' },
    { id: 2, table_number: '2', capacity: 2, zone: 'main_hall', status: 'available' },
    { id: 3, table_number: '3', capacity: 4, zone: 'main_hall', status: 'available' },
    { id: 4, table_number: '4', capacity: 4, zone: 'patio', status: 'available' },
    { id: 5, table_number: '5', capacity: 6, zone: 'main_hall', status: 'available' },
    { id: 6, table_number: '6', capacity: 8, zone: 'lounge', status: 'available' }
  ],
  reservations: [],
  orders: [],
  inventory: [
    { id: 1, item_name: 'Alba White Truffles', current_stock: 120.0, reorder_level: 300.0, unit: 'grams', last_restocked: new Date().toISOString() },
    { id: 2, item_name: 'A5 Wagyu Beef Ribeyes', current_stock: 12.0, reorder_level: 5.0, unit: 'units', last_restocked: new Date().toISOString() },
    { id: 3, item_name: 'House Bourbon Vintage Casks', current_stock: 24.0, reorder_level: 10.0, unit: 'bottles', last_restocked: new Date().toISOString() }
  ],
  waitlist: [
    { name: 'Taylor P.', size: 2, waiting: '14m' },
    { name: 'James K.', size: 4, waiting: '5m' }
  ]
};

// --- API Endpoints ---

// Check table availability
app.get('/api/reservations/availability', (req, res) => {
  const availableTables = db.tables.filter(t => t.status === 'available');
  res.json({
    available: availableTables,
    waitlistCount: db.waitlist.length
  });
});

// Book a table reservation
app.post('/api/reservations/book', (req, res) => {
  const { userEmail, guests, date, time, tableId, occasion, arrangements } = req.body;
  
  if (!userEmail || !guests || !date || !time) {
    return res.status(400).json({ error: 'Missing required reservation fields' });
  }

  // Find or create user
  let user = db.users.find(u => u.email === userEmail.toLowerCase());
  if (!user) {
    user = {
      id: db.users.length + 1,
      firebase_uid: `firebase_user_${Math.random().toString(36).substr(2, 9)}`,
      email: userEmail.toLowerCase(),
      full_name: userEmail.split('@')[0],
      phone: '',
      loyalty_points: 10
    };
    db.users.push(user);
    // Create crm profile
    db.crm_profiles.push({
      id: db.crm_profiles.length + 1,
      user_id: user.id,
      allergies: [],
      taste_preferences: { wine: [], vibe: [] },
      staff_notes: 'New web registrant.',
      last_visited: null
    });
  }

  // Handle table allocation
  let allocatedTable = null;
  if (tableId) {
    allocatedTable = db.tables.find(t => t.id === parseInt(tableId) && t.status === 'available');
  } else {
    // Auto-allocate first available matching capacity
    allocatedTable = db.tables.find(t => t.capacity >= parseInt(guests) && t.status === 'available');
  }

  if (!allocatedTable) {
    // Add to waitlist
    const waitItem = { name: user.full_name, size: parseInt(guests), waiting: '0m' };
    db.waitlist.push(waitItem);
    io.emit('waitlist-update', db.waitlist);
    return res.json({
      status: 'waitlisted',
      message: 'Lumina is currently at full capacity. You have been placed on our VIP Waitlist.',
      position: db.waitlist.length
    });
  }

  // Allocate table
  allocatedTable.status = 'reserved';
  
  const reservation = {
    id: db.reservations.length + 1,
    user_id: user.id,
    table_id: allocatedTable.id,
    party_size: parseInt(guests),
    reservation_time: `${date}T${time}:00.000Z`,
    occasion: occasion || 'dinner',
    special_arrangements: arrangements || '',
    status: 'confirmed',
    created_at: new Date().toISOString()
  };
  
  db.reservations.push(reservation);
  io.emit('table-update', db.tables);

  res.json({
    status: 'confirmed',
    reservationId: reservation.id,
    tableNumber: allocatedTable.table_number,
    message: `Table reservation confirmed for ${guests} guests on ${date} at ${time}.`
  });
});

// Checkout Order
app.post('/api/orders/checkout', (req, res) => {
  const { items, type, subtotal } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain items' });
  }

  const order = {
    id: db.orders.length + 1,
    items,
    order_type: type || 'dine-in',
    subtotal: parseFloat(subtotal),
    status: 'preparing',
    created_at: new Date().toISOString()
  };

  db.orders.push(order);

  // Trigger automated inventory decrement
  items.forEach(item => {
    if (item.id === 'risotto') {
      const truffle = db.inventory.find(i => i.id === 1);
      if (truffle) truffle.current_stock -= 15; // consume 15g truffle
    } else if (item.id === 'steak') {
      const beef = db.inventory.find(i => i.id === 2);
      if (beef) beef.current_stock -= 1; // consume 1 cut
    }
  });

  res.json({
    status: 'success',
    orderId: order.id,
    invoice: {
      subtotal: order.subtotal,
      tax: order.subtotal * 0.08,
      total: order.subtotal * 1.08,
      paymentMethod: 'UPI'
    }
  });

  // Socket: Simulate kitchen cooking progression status updates
  let currentStep = 0;
  const steps = ['preparing', 'ready', 'delivered'];
  const interval = setInterval(() => {
    order.status = steps[currentStep];
    io.emit('order-status', { orderId: order.id, status: order.status });
    currentStep++;
    if (currentStep >= steps.length) {
      clearInterval(interval);
    }
  }, 10000); // status moves every 10s
});

// Admin CRM Lookup
app.get('/api/admin/crm/search', (req, res) => {
  const query = req.query.q ? req.query.q.toLowerCase() : '';
  if (!query) {
    return res.json([]);
  }

  const results = db.users
    .filter(u => u.full_name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
    .map(u => {
      const profile = db.crm_profiles.find(p => p.user_id === u.id) || {};
      return {
        name: u.full_name,
        email: u.email,
        phone: u.phone,
        loyalty: u.loyalty_points,
        allergies: profile.allergies || [],
        preferences: profile.taste_preferences || {},
        notes: profile.staff_notes || '',
        lastVisited: profile.last_visited
      };
    });

  res.json(results);
});

// Auto-assign Waitlist table allocation
app.post('/api/admin/waitlist/auto-assign', (req, res) => {
  if (db.waitlist.length === 0) {
    return res.status(400).json({ error: 'No guests on the waitlist' });
  }

  // Find first available table
  const openTable = db.tables.find(t => t.status === 'available');
  if (!openTable) {
    return res.status(400).json({ error: 'No open tables available for allocation.' });
  }

  // Seating the first guest
  const seatedGuest = db.waitlist.shift();
  openTable.status = 'reserved';

  io.emit('waitlist-update', db.waitlist);
  io.emit('table-update', db.tables);

  res.json({
    success: true,
    seatedGuest,
    tableNumber: openTable.table_number,
    message: `Waitlist party seated. Automated SMS notification dispatched to ${seatedGuest.name}.`
  });
});

// Inventory supply chain alerts and reorder
app.post('/api/admin/inventory/reorder', (req, res) => {
  const { id } = req.body;
  const item = db.inventory.find(i => i.id === parseInt(id));
  if (!item) {
    return res.status(404).json({ error: 'Inventory item not found' });
  }

  // Simulate supplier restock API dispatch
  item.current_stock += 500.0;
  item.last_restocked = new Date().toISOString();

  res.json({
    success: true,
    item,
    message: `Supply chain API order dispatched for ${item.item_name}. 500 units credited.`
  });
});

// Virtual Sommelier pairing matching
app.post('/api/ai/sommelier', (req, res) => {
  const { prompt, cartItems } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  let response = "";
  if (cartItems && cartItems.length > 0) {
    const pairings = cartItems.map(item => {
      if (item === 'risotto') return 'Barolo Vintage Riserva (2016)';
      if (item === 'wagyu-burger') return 'Napa Valley Cabernet Sauvignon (2018)';
      if (item === 'steak') return 'Mendoza Malbec or French Bordeaux Red (2015)';
      return 'French Chablis or Sangiovese';
    });
    response = `Lumina cellar recommendation based on your selections: We suggest pairing with **${pairings.join(', ')}**. Excellent vintage profile choices!`;
  } else {
    response = `For red meats like Wagyu, I highly recommend our 2015 Bordeaux Grand Cru. For truffles, choose a classic Nebbiolo or mature Pinot Noir. Let me know your preferred grape!`;
  }

  res.json({ response });
});

// --- Socket Connection Handler ---
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Lumina Operating System API Server running on port ${PORT}`);
});

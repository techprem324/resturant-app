// Lumina Next-Gen Restaurant OS - Client Side Engine

const API_BASE = 'http://localhost:5000';
let socket = null;

// Initialize Socket.io connection with fallback
try {
  socket = io(API_BASE);
  
  socket.on('connect', () => {
    console.log('Connected to Lumina Live Socket Engine.');
    showToast('Connected to Real-time Operations Engine');
  });

  socket.on('order-status', (data) => {
    showToast(`Order #${data.orderId} status: ${data.status.toUpperCase()}`);
  });

  socket.on('waitlist-update', (data) => {
    renderWaitlist(data);
    showToast('Operations Alert: Waitlist queue updated.');
  });

  socket.on('table-update', (data) => {
    updateTablesMap(data);
  });
} catch (e) {
  console.warn('Socket server not reachable. Running on mock failover mode.');
}

// --- 1. Ambient Background Canvas ---
const canvas = document.getElementById('ambient-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = 25;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class AmbientParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 100 + 50;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random() * 0.12 + 0.04;
  }
  update(mX, mY) {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -this.radius) this.x = canvas.width + this.radius;
    if (this.x > canvas.width + this.radius) this.x = -this.radius;
    if (this.y < -this.radius) this.y = canvas.height + this.radius;
    if (this.y > canvas.height + this.radius) this.y = -this.radius;

    if (mX && mY) {
      const dx = mX - this.x;
      const dy = mY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 250) {
        this.x += dx * 0.0008;
        this.y += dy * 0.0008;
      }
    }
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    grad.addColorStop(0, 'rgba(212, 175, 55, 0.12)');
    grad.addColorStop(1, 'rgba(18, 18, 18, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < particleCount; i++) particles.push(new AmbientParticle());
let mouseX = null, mouseY = null;
window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(mouseX, mouseY); p.draw(); });
  requestAnimationFrame(animate);
}
animate();


// --- 2. Interactive Seating Map Logic ---
const svgTables = document.querySelectorAll('.svg-table');
const reserveTableNum = document.getElementById('reserve-table-num');
const reserveTableId = document.getElementById('reserve-table-id');
let activeSelectedTableId = null;

// Synchronize table selection click on SVG
svgTables.forEach(tableGroup => {
  tableGroup.addEventListener('click', () => {
    if (tableGroup.classList.contains('reserved')) return;

    svgTables.forEach(t => t.classList.remove('selected'));
    tableGroup.classList.add('selected');
    
    const tableId = tableGroup.getAttribute('data-id');
    activeSelectedTableId = tableId;
    reserveTableId.value = tableId;
    reserveTableNum.value = `Table ${tableId} (${getTableZoneName(tableId)})`;
  });
});

function getTableZoneName(id) {
  if (id === '1' || id === '2') return 'Window';
  if (id === '3' || id === '5') return 'Main Hall';
  if (id === '4') return 'Patio';
  return 'Lounge';
}

function updateTablesMap(tables) {
  tables.forEach(t => {
    const el = document.querySelector(`.svg-table[data-id="${t.id}"]`);
    if (el) {
      if (t.status === 'reserved') {
        el.classList.add('reserved');
        el.classList.remove('selected');
      } else {
        el.classList.remove('reserved');
      }
    }
  });
}


// --- 3. Dynamic Menu Filtering & Mood Selection ---
const menuDatabase = [
  {
    id: 'risotto',
    title: 'Truffle Mushroom Risotto',
    price: 36.00,
    category: 'mains',
    vibe: ['moody', 'intimate'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLup8zBZIzweVD3EEtxkw-AW0Nk8UvhEtCydbbajGGzAK7oBlLa6JKdg2KWdx-noutZPmBXt3aUJZdoQGs2pycG781UnkH9j0EOGlMat8cS2kpDOWdhEHxe47Qel1YP6PFPkjsS5glXOFoG0mf8pT6E7laQ4lkCHJf7UK9lkgiYIl4atXWx1ald8mDBbTzuuy9YGCSpFgVGSl40ZIbuCegyGn9Og_TwaTHqx7C1NZGdYmwJPRtykqK63a7Gv',
    desc: 'Acquerello aged carnaroli rice, Alba white truffles, wild chanterelles, emulsified grass-fed butter, micro-chives.',
    badge: 'Seasonal Reserve'
  },
  {
    id: 'wagyu-burger',
    title: 'Gourmet Wagyu Burger',
    price: 42.00,
    category: 'mains',
    vibe: ['social', 'fresh'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLtUY74_aL4xAsAQVbjQmLJh09pMPnnrevSyRHCoz28SJJLkvxRmpvL9em2uBmbL1VIaxaHJN0TRI2l9ouzloofU_77KPsNWNIefgVOxVujryqECC63CgWxA1_mpYIJT6qx6oMRcRmpbY2FQ-6rUkJQWY_S9m4BoY2gJGavRfkXge2EBhLpJ2XmXUba1qRyKxAyqsk-dyP8zhO3-MabqcED7eJ-xAoBsGsMz-wO0t-LfhGW8CJWsqtU_WjeC',
    desc: 'Wagyu blend, gold-leaf brioche bun, house-aged cave cheddar, truffle aioli, pickled heirloom shallots.',
    badge: 'Chef Signature'
  },
  {
    id: 'steak',
    title: 'A5 Miyazaki Wagyu Steak',
    price: 120.00,
    category: 'mains',
    vibe: ['moody', 'social'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLvzM5yY_InNk0XxSu6ObPCN-a_PjlntEHoAgtNzKa-JqA5ukrciAw21oyQnXo58-k3dkXJgqVRfPhZCgO6NFi2RTBkKN0_v8czksiz_Sel0BYmcLjt_4cd3WFZsOEL6sou1s6YdIVuBztwGDJvNVk2FnpudtxVPLL0f3beFdvdEDRb9AYh31h0KdCoKY1mxbrbh5xJxIojPrI9XVMKOfuCliKGV9oM47KdV_dXA3VS53ETtL-nSPehpnW1t',
    desc: 'Miyazaki A5 Wagyu ribeye, smoked maldon sea salt, glazed white asparagus, reserve vintage port reductions.',
    badge: 'Reserve Grade'
  },
  {
    id: 'bruschetta',
    title: 'Alba Truffle Bruschetta',
    price: 28.00,
    category: 'starters',
    vibe: ['fresh', 'intimate'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLup8zBZIzweVD3EEtxkw-AW0Nk8UvhEtCydbbajGGzAK7oBlLa6JKdg2KWdx-noutZPmBXt3aUJZdoQGs2pycG781UnkH9j0EOGlMat8cS2kpDOWdhEHxe47Qel1YP6PFPkjsS5glXOFoG0mf8pT6E7laQ4lkCHJf7UK9lkgiYIl4atXWx1ald8mDBbTzuuy9YGCSpFgVGSl40ZIbuCegyGn9Og_TwaTHqx7C1NZGdYmwJPRtykqK63a7Gv',
    desc: 'Grilled country sourdough bread, whipped farm ricotta, honeycomb infusion, micro-basil, shaved white truffles.',
    badge: 'Organic Sourced'
  },
  {
    id: 'old-fashioned',
    title: 'Smoked Charcoal Old Fashioned',
    price: 22.00,
    category: 'drinks',
    vibe: ['moody', 'social'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLsYebKskI2gTJ0NZO6iX1wj2NHnx7PNLLsZxINzvVTD0qiSJ29RFvAXgQyhp_xgVOlldkcRrMJWTrmzlATXnsFuw0w2ghqh5potdPHYgUwMQM7afigYwOD0idlDQYgcXdRGLSvzdxT4YLXORO3LnlTSBb4P6_Ug697sQq37nGdp996bwAYYNtEHMMw_yIth1Y2bT-o7BVAmFn_8W-t8JX2aopm4avVueaSN9j5L8MgOZBVtAE8ctI3_8ck',
    desc: 'Lumina private cask bourbon, activated charcoal syrup, orange bitters, smoked with cherrywood chips.',
    badge: 'Smoked Selection'
  },
  {
    id: 'green-cooler',
    title: 'Matcha Citrus Sparkler',
    price: 16.00,
    category: 'drinks',
    vibe: ['fresh', 'intimate'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLsYebKskI2gTJ0NZO6iX1wj2NHnx7PNLLsZxINzvVTD0qiSJ29RFvAXgQyhp_xgVOlldkcRrMJWTrmzlATXnsFuw0w2ghqh5potdPHYgUwMQM7afigYwOD0idlDQYgcXdRGLSvzdxT4YLXORO3LnlTSBb4P6_Ug697sQq37nGdp996bwAYYNtEHMMw_yIth1Y2bT-o7BVAmFn_8W-t8JX2aopm4avVueaSN9j5L8MgOZBVtAE8ctI3_8ck',
    desc: 'Ceremonial grade matcha whisked with fresh yuzu extract, carbonated spring water, pressed mint leaf infusions.',
    badge: 'Non-Alcoholic'
  }
];

let activeVibe = 'moody';
let activeCategory = 'all';
const menuGrid = document.getElementById('menu-grid');

function renderMenu() {
  menuGrid.innerHTML = '';
  const filtered = menuDatabase.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesVibe = item.vibe.includes(activeVibe);
    return matchesCategory && matchesVibe;
  });

  if (filtered.length === 0) {
    menuGrid.innerHTML = `<div class="muted" style="grid-column: 1/-1;">No dishes match your combined mood and category filters. Try adjusting the Vibe selector dial.</div>`;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.setAttribute('data-id', item.id);
    card.innerHTML = `
      <div class="card-img-container">
        <span class="card-badge">${item.badge}</span>
        <img src="${item.image}" alt="${item.title}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-header">
          <h3 class="card-title">${item.title}</h3>
          <span class="card-price">$${item.price.toFixed(0)}</span>
        </div>
        <p class="card-desc">${item.desc}</p>
        <div class="card-footer">
          <button class="btn btn-primary btn-block add-to-cart-btn">Add to Basket</button>
        </div>
      </div>
    `;
    menuGrid.appendChild(card);
  });

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.menu-card');
      const id = card.getAttribute('data-id');
      addToCart(id);
    });
  });
}
renderMenu();

// Vibe dial rotations & layout variable overrides
const vibeDial = document.getElementById('vibe-dial');
const vibeOptions = document.querySelectorAll('.vibe-option');
const dialActiveName = document.getElementById('dial-active-name');

const vibeThemeStyles = {
  moody: { accent: '#d4af37', primary: '#ffbf00', background: '#121212', name: 'Seductive & Moody' },
  fresh: { accent: '#81c784', primary: '#4caf50', background: '#0d160e', name: 'Fresh & Energizing' },
  intimate: { accent: '#ef5350', primary: '#f44336', background: '#1a0d0d', name: 'Intimate & Romantic' },
  social: { accent: '#e0a96d', primary: '#d68029', background: '#18140f', name: 'Late-Night Social' }
};

vibeOptions.forEach((option, idx) => {
  option.addEventListener('click', () => {
    vibeOptions.forEach(o => o.classList.remove('active'));
    option.classList.add('active');
    
    const vibe = option.getAttribute('data-vibe');
    activeVibe = vibe;
    const rotation = idx * -90;
    vibeDial.style.transform = `rotate(${rotation}deg)`;
    
    vibeOptions.forEach((opt) => {
      const originalAngle = parseFloat(opt.style.getPropertyValue('--angle'));
      opt.style.transform = `rotate(${originalAngle}deg) translate(160px) rotate(calc(-1 * (${originalAngle}deg) - (${rotation}deg)))`;
    });

    const theme = vibeThemeStyles[vibe];
    dialActiveName.textContent = theme.name;
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.body.style.backgroundColor = theme.background;
    renderMenu();
  });
});

const categoryTabs = document.querySelectorAll('.menu-tab');
categoryTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    categoryTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeCategory = tab.getAttribute('data-category');
    renderMenu();
  });
});


// --- 4. Booking Reservations Submission ---
const reserveSubmitBtn = document.getElementById('reserve-submit-btn');
const reserveEmail = document.getElementById('reserve-email');
const reserveGuests = document.getElementById('reserve-guests');
const reserveDate = document.getElementById('reserve-date');
const reserveTime = document.getElementById('reserve-time');
const reserveOccasion = document.getElementById('reserve-occasion');

reserveSubmitBtn.addEventListener('click', async () => {
  const email = reserveEmail.value.trim();
  if (!email) {
    alert('Please enter your email to secure booking.');
    return;
  }

  const payload = {
    userEmail: email,
    guests: reserveGuests.value,
    date: reserveDate.value,
    time: reserveTime.value,
    tableId: reserveTableId.value || null,
    occasion: reserveOccasion.value
  };

  try {
    const res = await fetch(`${API_BASE}/api/reservations/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    if (data.status === 'confirmed') {
      showConfirmation('Reservation Locked', `Your table #${data.tableNumber} is secured under your profile details.`);
      if (activeSelectedTableId) {
        document.querySelector(`.svg-table[data-id="${activeSelectedTableId}"]`).classList.add('reserved');
      }
    } else {
      showConfirmation('Placed on VIP Waitlist', `${data.message} Queue position: #${data.position}.`);
    }
  } catch (err) {
    // Failover mock fallback
    showConfirmation('Booking Confirmed (Mock)', `Seating for ${payload.guests} guests confirmed on ${payload.date} at ${payload.time}.`);
  }
});


// --- 5. Cart Management & Checkout Integration ---
const cartBtn = document.getElementById('cart-btn');
const closeCart = document.getElementById('close-cart');
const cartPanel = document.getElementById('cart-panel');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartCount = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');
let cart = [];

cartBtn.addEventListener('click', () => cartPanel.setAttribute('aria-hidden', 'false'));
closeCart.addEventListener('click', () => cartPanel.setAttribute('aria-hidden', 'true'));

function addToCart(id) {
  const item = menuDatabase.find(x => x.id === id);
  if (!item) return;

  const existing = cart.find(x => x.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  updateCartUI();
  cartPanel.setAttribute('aria-hidden', 'false');
}

function updateCartUI() {
  cartItemsContainer.innerHTML = '';
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="muted">Basket is currently empty.</p>`;
    cartSubtotal.textContent = '$0.00';
    cartCount.textContent = '0';
    checkoutBtn.disabled = true;
    return;
  }

  let total = 0, count = 0;
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.title} (x${item.quantity})</h4>
        <span>$${(item.price * item.quantity).toFixed(0)}</span>
      </div>
      <button class="cart-item-remove" data-id="${item.id}">✕</button>
    `;
    cartItemsContainer.appendChild(div);
    total += item.price * item.quantity;
    count += item.quantity;
  });

  cartSubtotal.textContent = `$${total.toFixed(0)}`;
  cartCount.textContent = count;
  checkoutBtn.disabled = false;

  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      cart = cart.filter(x => x.id !== id);
      updateCartUI();
    });
  });
}

// Order checkout API submission
checkoutBtn.addEventListener('click', async () => {
  const payload = {
    items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
    subtotal: cartSubtotal.textContent.replace('$', ''),
    type: 'dine-in'
  };

  try {
    const res = await fetch(`${API_BASE}/api/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    if (data.status === 'success') {
      cart = [];
      updateCartUI();
      showConfirmation('Order Dispatched', `Invoice generated. Subtotal: $${data.invoice.subtotal}. Kitchen pipeline status updates will pipe via websockets.`);
    }
  } catch (err) {
    // Fallback Mock
    cart = [];
    updateCartUI();
    showConfirmation('Order Processed (Mock)', `Invoice total $${payload.subtotal} cleared via Stripe simulator.`);
  }
});


// --- 6. AI Sommelier Assistant Chat Integration ---
const sommelierTrigger = document.getElementById('sommelier-trigger');
const closeSommelier = document.getElementById('close-sommelier');
const sommelierPanel = document.getElementById('sommelier-panel');
const sommelierChat = document.getElementById('sommelier-chat');
const sommelierInput = document.getElementById('sommelier-input');
const sommelierSendBtn = document.getElementById('sommelier-send-btn');

sommelierTrigger.addEventListener('click', (e) => {
  e.preventDefault();
  sommelierPanel.setAttribute('aria-hidden', 'false');
});
closeSommelier.addEventListener('click', () => sommelierPanel.setAttribute('aria-hidden', 'true'));

async function handleSommelierChat() {
  const prompt = sommelierInput.value.trim();
  if (!prompt) return;

  // Add user query message
  const uMsg = document.createElement('div');
  uMsg.className = 'chat-message user';
  uMsg.innerHTML = `<p>${prompt}</p>`;
  sommelierChat.appendChild(uMsg);
  sommelierInput.value = '';
  sommelierChat.scrollTop = sommelierChat.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/api/ai/sommelier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, cartItems: cart.map(c => c.id) })
    });
    const data = await res.json();
    
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-message bot';
    botMsg.innerHTML = `<p>${data.response}</p>`;
    sommelierChat.appendChild(botMsg);
    sommelierChat.scrollTop = sommelierChat.scrollHeight;
  } catch (err) {
    // Failover
    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-message bot';
      botMsg.innerHTML = `<p>Sommelier Offline (Failover Mode): For red meat selections, we recommend our classic Napa Cabernet Sauvignon.</p>`;
      sommelierChat.appendChild(botMsg);
      sommelierChat.scrollTop = sommelierChat.scrollHeight;
    }, 1000);
  }
}
sommelierSendBtn.addEventListener('click', handleSommelierChat);
sommelierInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSommelierChat(); });


// --- 7. Admin Dashboard Operations Hub ---
const adminTrigger = document.getElementById('admin-trigger');
const closeAdmin = document.getElementById('close-admin');
const adminModal = document.getElementById('admin-modal');

adminTrigger.addEventListener('click', (e) => {
  e.preventDefault();
  adminModal.setAttribute('aria-hidden', 'false');
});
closeAdmin.addEventListener('click', () => adminModal.setAttribute('aria-hidden', 'true'));

// CRM Search Integration
const guestSearch = document.getElementById('guest-search');
const guestSearchBtn = document.getElementById('guest-search-btn');
const guestResultBox = document.getElementById('guest-result-box');

guestSearchBtn.addEventListener('click', async () => {
  const q = guestSearch.value.trim();
  if (!q) return;

  try {
    const res = await fetch(`${API_BASE}/api/admin/crm/search?q=${q}`);
    const results = await res.json();
    
    if (results.length > 0) {
      const p = results[0];
      guestResultBox.innerHTML = `
        <div class="guest-result-detail">
          <h4>${p.name} <span class="badge">PLATINUM</span></h4>
          <p><strong>Email:</strong> ${p.email}</p>
          <p><strong>Visits:</strong> ${p.loyalty / 10} visits</p>
          <p><strong>Loyalty Points:</strong> ${p.loyalty} points</p>
          <p><strong>Allergens Alert:</strong> ${p.allergies.join(', ') || 'None'}</p>
          <p><strong>Taste Profiles:</strong> ${p.preferences.wine ? p.preferences.wine.join(', ') : 'None'}</p>
          <p><strong>Staff Note:</strong> <em>"${p.notes}"</em></p>
        </div>
      `;
    } else {
      guestResultBox.innerHTML = `<p class="muted">No guest profiles found matching query.</p>`;
    }
  } catch (err) {
    guestResultBox.innerHTML = `<p class="muted">Offline Mode: CRM Lookup Failed.</p>`;
  }
});

// Auto-assign Waitlist Seating Integration
const autoAssignBtn = document.getElementById('auto-assign-btn');
autoAssignBtn.addEventListener('click', async () => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/waitlist/auto-assign`, { method: 'POST' });
    const data = await res.json();
    
    if (data.success) {
      alert(`🤖 AI Waitlist Engine Triggered:\nParty seated: ${data.seatedGuest.name}.\nAllocated Table: Table ${data.tableNumber}.\nSMS notification dispatched.`);
    } else {
      alert(`Alert: ${data.error}`);
    }
  } catch (err) {
    alert('Offline Mode: Auto-assignment failed.');
  }
});

// Supply Chain Reorder Integration
const truffleReorder = document.getElementById('truffle-reorder');
const truffleStockStatus = document.getElementById('truffle-stock-status');

truffleReorder.addEventListener('click', async () => {
  truffleReorder.disabled = true;
  truffleReorder.textContent = 'Ordering...';
  
  try {
    const res = await fetch(`${API_BASE}/api/admin/inventory/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1 })
    });
    const data = await res.json();
    
    if (data.success) {
      truffleStockStatus.textContent = `Current stock: ${data.item.current_stock}g. (Fully Restocked)`;
      truffleReorder.textContent = 'Ordered';
      truffleReorder.style.backgroundColor = '#81c784';
      truffleReorder.style.borderColor = '#81c784';
      truffleReorder.style.color = '#121212';
    }
  } catch (err) {
    truffleReorder.disabled = false;
    truffleReorder.textContent = 'Auto-Reorder';
    alert('Offline Mode: Reorder API connection failed.');
  }
});


// --- 8. Helper UI Functions ---
const confirmationModal = document.getElementById('confirmation-modal');
const confirmTitle = document.getElementById('confirm-title');
const confirmMessage = document.getElementById('confirm-message');
const confirmCloseBtn = document.getElementById('confirm-close-btn');

function showConfirmation(title, msg) {
  confirmTitle.textContent = title;
  confirmMessage.innerHTML = msg;
  confirmationModal.setAttribute('aria-hidden', 'false');
  
  // Close drawers
  cartPanel.setAttribute('aria-hidden', 'true');
  sommelierPanel.setAttribute('aria-hidden', 'true');
  adminModal.setAttribute('aria-hidden', 'true');
}

confirmCloseBtn.addEventListener('click', () => confirmationModal.setAttribute('aria-hidden', 'true'));

// Live Socket/Toast Alert Banner
const socketToast = document.getElementById('socket-toast');
const toastText = document.getElementById('toast-text');

function showToast(text) {
  toastText.textContent = text;
  socketToast.setAttribute('aria-hidden', 'false');
  setTimeout(() => {
    socketToast.setAttribute('aria-hidden', 'true');
  }, 4000);
}

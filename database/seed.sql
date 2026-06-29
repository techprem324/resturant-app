-- Seed File: Populating Lumina Restaurant OS

-- 1. Insert Menu Categories
INSERT INTO menu_categories (name) VALUES 
('mains'),
('starters'),
('drinks');

-- 2. Insert Menu Items
INSERT INTO menu_items (category_id, title, description, price, image_url, calories, allergens, vibe_tags, badge) VALUES
(1, 'Truffle Mushroom Risotto', 'Acquerello aged carnaroli rice, Alba white truffles, wild chanterelles, emulsified grass-fed butter, micro-chives.', 36.00, 'https://lh3.googleusercontent.com/aida/AP1WRLup8zBZIzweVD3EEtxkw-AW0Nk8UvhEtCydbbajGGzAK7oBlLa6JKdg2KWdx-noutZPmBXt3aUJZdoQGs2pycG781UnkH9j0EOGlMat8cS2kpDOWdhEHxe47Qel1YP6PFPkjsS5glXOFoG0mf8pT6E7laQ4lkCHJf7UK9lkgiYIl4atXWx1ald8mDBbTzuuy9YGCSpFgVGSl40ZIbuCegyGn9Og_TwaTHqx7C1NZGdYmwJPRtykqK63a7Gv', 620, '["dairy", "gluten"]', '["moody", "intimate"]', 'Seasonal Reserve'),
(1, 'Gourmet Wagyu Burger', 'Wagyu blend, gold-leaf brioche bun, house-aged cave cheddar, truffle aioli, pickled heirloom shallots.', 42.00, 'https://lh3.googleusercontent.com/aida/AP1WRLtUY74_aL4xAsAQVbjQmLJh09pMPnnrevSyRHCoz28SJJLkvxRmpvL9em2uBmbL1VIaxaHJN0TRI2l9ouzloofU_77KPsNWNIefgVOxVujryqECC63CgWxA1_mpYIJT6qx6oMRcRmpbY2FQ-6rUkJQWY_S9m4BoY2gJGavRfkXge2EBhLpJ2XmXUba1qRyKxAyqsk-dyP8zhO3-MabqcED7eJ-xAoBsGsMz-wO0t-LfhGW8CJWsqtU_WjeC', 850, '["dairy", "gluten"]', '["social", "fresh"]', 'Chef Signature'),
(1, 'A5 Miyazaki Wagyu Steak', 'Miyazaki A5 Wagyu ribeye, smoked maldon sea salt, glazed white asparagus, reserve vintage port reductions.', 120.00, 'https://lh3.googleusercontent.com/aida/AP1WRLvzM5yY_InNk0XxSu6ObPCN-a_PjlntEHoAgtNzKa-JqA5ukrciAw21oyQnXo58-k3dkXJgqVRfPhZCgO6NFi2RTBkKN0_v8czksiz_Sel0BYmcLjt_4cd3WFZsOEL6sou1s6YdIVuBztwGDJvNVk2FnpudtxVPLL0f3beFdvdEDRb9AYh31h0KdCoKY1mxbrbh5xJxIojPrI9XVMKOfuCliKGV9oM47KdV_dXA3VS53ETtL-nSPehpnW1t', 980, '[]', '["moody", "social"]', 'Reserve Grade'),
(2, 'Alba Truffle Bruschetta', 'Grilled country sourdough bread, whipped farm ricotta, honeycomb infusion, micro-basil, shaved white truffles.', 28.00, 'https://lh3.googleusercontent.com/aida/AP1WRLup8zBZIzweVD3EEtxkw-AW0Nk8UvhEtCydbbajGGzAK7oBlLa6JKdg2KWdx-noutZPmBXt3aUJZdoQGs2pycG781UnkH9j0EOGlMat8cS2kpDOWdhEHxe47Qel1YP6PFPkjsS5glXOFoG0mf8pT6E7laQ4lkCHJf7UK9lkgiYIl4atXWx1ald8mDBbTzuuy9YGCSpFgVGSl40ZIbuCegyGn9Og_TwaTHqx7C1NZGdYmwJPRtykqK63a7Gv', 350, '["gluten", "dairy"]', '["fresh", "intimate"]', 'Organic Sourced'),
(3, 'Smoked Charcoal Old Fashioned', 'Lumina private cask bourbon, activated charcoal syrup, orange bitters, smoked with cherrywood chips.', 22.00, 'https://lh3.googleusercontent.com/aida/AP1WRLsYebKskI2gTJ0NZO6iX1wj2NHnx7PNLLsZxINzvVTD0qiSJ29RFvAXgQyhp_xgVOlldkcRrMJWTrmzlATXnsFuw0w2ghqh5potdPHYgUwMQM7afigYwOD0idlDQYgcXdRGLSvzdxT4YLXORO3LnlTSBb4P6_Ug697sQq37nGdp996bwAYYNtEHMMw_yIth1Y2bT-o7BVAmFn_8W-t8JX2aopm4avVueaSN9j5L8MgOZBVtAE8ctI3_8ck', 180, '[]', '["moody", "social"]', 'Smoked Selection');

-- 3. Insert Tables Layout
INSERT INTO tables (table_number, capacity, zone, status) VALUES
('1', 2, 'window', 'available'),
('2', 2, 'main_hall', 'available'),
('3', 4, 'main_hall', 'available'),
('4', 4, 'patio', 'available'),
('5', 6, 'main_hall', 'available'),
('6', 8, 'lounge', 'available');

-- 4. Insert Test Users
INSERT INTO users (firebase_uid, email, full_name, phone, loyalty_points) VALUES
('firebase_user_sarah', 'sarah@connor.com', 'Sarah Connor', '+15550293', 240),
('firebase_user_alex', 'alex@rivera.com', 'Alex Rivera', '+15559812', 80);

-- 5. Insert CRM Profiles
INSERT INTO crm_profiles (user_id, allergies, taste_preferences, staff_notes, last_visited) VALUES
(1, '["gluten"]', '{"wine": ["Barolo", "Nebbiolo"], "vibe": ["intimate"]}', 'Strict Gluten-free requirement. Prefers low-light table.', '2026-06-25 19:30:00'),
(2, '[]', '{"wine": ["Pinot Noir", "Sauvignon Blanc"], "vibe": ["moody"]}', 'Prefers Table 2. Always orders the smoked cocktails.', '2026-06-28 21:00:00');

-- 6. Insert Inventory
INSERT INTO inventory (item_name, current_stock, reorder_level, unit) VALUES
('Alba White Truffles', 120.0, 300.0, 'grams'),
('A5 Wagyu Beef Ribeyes', 12.0, 5.0, 'units'),
('House Bourbon Vintage Casks', 24.0, 10.0, 'bottles');

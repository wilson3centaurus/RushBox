-- Seed data. Generated from lib/mock/data.ts — regenerate rather than hand-edit.
-- Safe to re-run: every insert is idempotent.

insert into dark_stores (id, name, area) values
  ('a0000000-0000-4000-8000-000000000001', 'RushBox Msasa', 'Msasa'),
  ('a0000000-0000-4000-8000-000000000002', 'RushBox Avondale', 'Avondale'),
  ('a0000000-0000-4000-8000-000000000003', 'RushBox Mbare', 'Mbare')
on conflict (id) do nothing;

insert into categories (slug, name, emoji, tile, sort) values
  ('fruit-veg', 'Fruit & Veg', '🥬', 'from-green-50 to-green-100', 0),
  ('dairy-eggs', 'Dairy & Eggs', '🥚', 'from-amber-50 to-yellow-100', 1),
  ('bakery', 'Bakery', '🍞', 'from-orange-50 to-amber-100', 2),
  ('meat-fish', 'Meat & Fish', '🍗', 'from-rose-50 to-red-100', 3),
  ('drinks', 'Drinks', '🥤', 'from-sky-50 to-blue-100', 4),
  ('snacks', 'Snacks', '🍪', 'from-orange-50 to-orange-100', 5),
  ('pantry', 'Pantry', '🍚', 'from-stone-50 to-stone-100', 6),
  ('household', 'Household', '🧼', 'from-indigo-50 to-indigo-100', 7),
  ('baby', 'Baby', '🍼', 'from-pink-50 to-pink-100', 8),
  ('pharmacy', 'Pharmacy', '💊', 'from-emerald-50 to-emerald-100', 9)
on conflict (slug) do update set name = excluded.name, emoji = excluded.emoji, tile = excluded.tile, sort = excluded.sort;

insert into products (name, category, price, was_price, unit, emoji, store_id, stock, tags) values
  ('Tomatoes', 'fruit-veg', 1.2, null, 'per kg', '🍅', 'a0000000-0000-4000-8000-000000000001', 48, '{bestseller}'),
  ('Bananas', 'fruit-veg', 1.5, null, 'per kg', '🍌', 'a0000000-0000-4000-8000-000000000001', 32, '{}'),
  ('Onions', 'fruit-veg', 0.9, null, 'per kg', '🧅', 'a0000000-0000-4000-8000-000000000001', 60, '{}'),
  ('Rape / Covo Bundle', 'fruit-veg', 0.5, 0.8, 'bundle', '🥬', 'a0000000-0000-4000-8000-000000000001', 25, '{deal}'),
  ('Potatoes', 'fruit-veg', 2.4, null, '2kg bag', '🥔', 'a0000000-0000-4000-8000-000000000002', 40, '{}'),
  ('Apples', 'fruit-veg', 2.8, null, 'per kg', '🍎', 'a0000000-0000-4000-8000-000000000002', 18, '{}'),
  ('Dairibord Fresh Milk', 'dairy-eggs', 1.4, null, '500ml', '🥛', 'a0000000-0000-4000-8000-000000000001', 55, '{bestseller}'),
  ('Eggs', 'dairy-eggs', 3.2, null, 'tray of 30', '🥚', 'a0000000-0000-4000-8000-000000000001', 22, '{}'),
  ('Cheddar Cheese', 'dairy-eggs', 4.5, null, '250g', '🧀', 'a0000000-0000-4000-8000-000000000002', 12, '{}'),
  ('Lacto Sour Milk', 'dairy-eggs', 1.1, null, '500ml', '🥛', 'a0000000-0000-4000-8000-000000000001', 38, '{}'),
  ('White Bread', 'bakery', 1, null, 'loaf', '🍞', 'a0000000-0000-4000-8000-000000000001', 44, '{bestseller}'),
  ('Brown Bread', 'bakery', 1.1, null, 'loaf', '🥖', 'a0000000-0000-4000-8000-000000000001', 30, '{}'),
  ('Buns', 'bakery', 1.8, null, 'pack of 6', '🥐', 'a0000000-0000-4000-8000-000000000002', 16, '{}'),
  ('Chicken Pieces', 'meat-fish', 4.2, null, '1kg', '🍗', 'a0000000-0000-4000-8000-000000000001', 20, '{bestseller}'),
  ('Beef Mince', 'meat-fish', 5.5, null, '1kg', '🥩', 'a0000000-0000-4000-8000-000000000001', 14, '{}'),
  ('Kapenta', 'meat-fish', 3, null, '500g', '🐟', 'a0000000-0000-4000-8000-000000000003', 26, '{}'),
  ('Boerewors', 'meat-fish', 6, null, '1kg', '🌭', 'a0000000-0000-4000-8000-000000000002', 9, '{}'),
  ('Mazoe Orange Crush', 'drinks', 3.5, null, '2L', '🧃', 'a0000000-0000-4000-8000-000000000001', 50, '{bestseller}'),
  ('Coca-Cola', 'drinks', 1.2, null, '500ml', '🥤', 'a0000000-0000-4000-8000-000000000001', 72, '{}'),
  ('Still Water', 'drinks', 0.7, null, '1.5L', '💧', 'a0000000-0000-4000-8000-000000000001', 90, '{}'),
  ('Cascade Juice', 'drinks', 2.2, 2.8, '1L', '🧃', 'a0000000-0000-4000-8000-000000000002', 28, '{deal}'),
  ('Lobels Biscuits', 'snacks', 1.6, null, '200g', '🍪', 'a0000000-0000-4000-8000-000000000001', 34, '{}'),
  ('Willards Chips', 'snacks', 1, null, '125g', '🥔', 'a0000000-0000-4000-8000-000000000001', 46, '{}'),
  ('Peanut Butter', 'snacks', 2.5, null, '375g', '🥜', 'a0000000-0000-4000-8000-000000000002', 21, '{}'),
  ('Charhons Sweets', 'snacks', 0.8, null, 'pack', '🍬', 'a0000000-0000-4000-8000-000000000003', 60, '{}'),
  ('Mealie Meal (Roller)', 'pantry', 6.5, null, '10kg', '🌽', 'a0000000-0000-4000-8000-000000000001', 35, '{bestseller}'),
  ('White Rice', 'pantry', 3.8, null, '2kg', '🍚', 'a0000000-0000-4000-8000-000000000001', 29, '{}'),
  ('Cooking Oil', 'pantry', 4, null, '2L', '🛢️', 'a0000000-0000-4000-8000-000000000001', 24, '{}'),
  ('Sugar', 'pantry', 1.9, null, '2kg', '🍬', 'a0000000-0000-4000-8000-000000000002', 41, '{}'),
  ('Salt', 'pantry', 0.6, null, '1kg', '🧂', 'a0000000-0000-4000-8000-000000000001', 55, '{}'),
  ('Tanganda Tea', 'pantry', 2.1, null, '100 bags', '🍵', 'a0000000-0000-4000-8000-000000000001', 33, '{}'),
  ('Sunlight Washing Powder', 'household', 3.4, null, '1kg', '🧺', 'a0000000-0000-4000-8000-000000000001', 27, '{}'),
  ('Geisha Soap', 'household', 0.9, null, 'bar', '🧼', 'a0000000-0000-4000-8000-000000000001', 64, '{}'),
  ('Toilet Paper', 'household', 3.2, null, '9 rolls', '🧻', 'a0000000-0000-4000-8000-000000000002', 31, '{}'),
  ('Dishwashing Liquid', 'household', 1.8, null, '750ml', '🧴', 'a0000000-0000-4000-8000-000000000001', 19, '{}'),
  ('Nappies (Size 3)', 'baby', 8.5, null, 'pack of 40', '🧷', 'a0000000-0000-4000-8000-000000000002', 11, '{}'),
  ('Baby Formula', 'baby', 12, null, '400g', '🍼', 'a0000000-0000-4000-8000-000000000002', 7, '{}'),
  ('Baby Wipes', 'baby', 2.4, null, '80 wipes', '🧻', 'a0000000-0000-4000-8000-000000000001', 23, '{}'),
  ('Paracetamol', 'pharmacy', 1.5, null, '20 tablets', '💊', 'a0000000-0000-4000-8000-000000000001', 48, '{bestseller}'),
  ('Ibuprofen', 'pharmacy', 2.2, null, '24 tablets', '💊', 'a0000000-0000-4000-8000-000000000001', 30, '{}'),
  ('Cough Syrup', 'pharmacy', 4, null, '100ml', '🧪', 'a0000000-0000-4000-8000-000000000002', 15, '{}'),
  ('Plasters', 'pharmacy', 1.2, null, 'pack of 20', '🩹', 'a0000000-0000-4000-8000-000000000001', 40, '{}'),
  ('Antiseptic Liquid', 'pharmacy', 3.6, null, '250ml', '🧴', 'a0000000-0000-4000-8000-000000000001', 8, '{}')
on conflict (store_id, name) do update set
  price     = excluded.price,
  was_price = excluded.was_price,
  unit      = excluded.unit,
  emoji     = excluded.emoji,
  stock     = excluded.stock,
  tags      = excluded.tags;

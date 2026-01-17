-- QUICK FIX: Run this in Supabase SQL Editor to fix all canteen issues

-- 1. Drop and recreate tables with correct structure
DROP TABLE IF EXISTS canteen_inventory CASCADE;
DROP TABLE IF EXISTS daily_specials CASCADE;
DROP TABLE IF EXISTS canteen_settings CASCADE;
DROP TABLE IF EXISTS canteen_orders CASCADE;
DROP TABLE IF EXISTS canteen_items CASCADE;
DROP TABLE IF EXISTS canteens CASCADE;

-- 2. Create canteens
CREATE TABLE canteens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  contact_number VARCHAR(15),
  location TEXT,
  image_url TEXT,
  operating_hours JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create canteen_items
CREATE TABLE canteen_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  is_veg BOOLEAN DEFAULT true,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  category VARCHAR(50) DEFAULT 'main',
  preparation_time INTEGER DEFAULT 15,
  spice_level VARCHAR(20) CHECK (spice_level IN ('mild', 'medium', 'spicy', 'very_spicy')),
  calories INTEGER,
  is_special BOOLEAN DEFAULT false,
  available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create canteen_orders
CREATE TABLE canteen_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  canteen_id UUID REFERENCES canteens(id),
  items JSONB NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  payment_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  estimated_time INTEGER DEFAULT 15,
  customer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create canteen_inventory
CREATE TABLE canteen_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE,
  item_id UUID REFERENCES canteen_items(id) ON DELETE CASCADE,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(canteen_id, item_id)
);

-- 6. Enable RLS
ALTER TABLE canteens ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_inventory ENABLE ROW LEVEL SECURITY;

-- 7. Create policies
CREATE POLICY "Public read canteens" ON canteens FOR SELECT USING (true);
CREATE POLICY "Public read canteen_items" ON canteen_items FOR SELECT USING (true);
CREATE POLICY "Users can view own orders" ON canteen_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON canteen_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admin full access canteens" ON canteens FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email = 'rjdhav67@gmail.com')
);
CREATE POLICY "Admin full access canteen_items" ON canteen_items FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email = 'rjdhav67@gmail.com')
);
CREATE POLICY "Admin full access canteen_orders" ON canteen_orders FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email = 'rjdhav67@gmail.com')
);
CREATE POLICY "Admin full access canteen_inventory" ON canteen_inventory FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email = 'rjdhav67@gmail.com')
);

-- 8. Insert sample data
INSERT INTO canteens (name, description, contact_number, location) VALUES 
('Atharva Canteen', 'Main college canteen', '8459262203', 'Ground Floor'),
('Bistro Canteen', 'Modern bistro canteen', '8459262203', 'First Floor');

-- 9. Insert menu items
INSERT INTO canteen_items (canteen_id, name, description, price, is_veg, meal_type, category, preparation_time, spice_level, calories, available) 
SELECT 
  c.id,
  items.name,
  items.description,
  items.price,
  items.is_veg,
  items.meal_type,
  items.category,
  items.preparation_time,
  items.spice_level,
  items.calories,
  true
FROM canteens c
CROSS JOIN (
  VALUES 
  -- Atharva Canteen Items
  ('Atharva Canteen', 'Vada Pav', 'Mumbai street food with spicy potato filling', 25, true, 'breakfast', 'snacks', 5, 'medium', 350),
  ('Atharva Canteen', 'Poha', 'Flattened rice with onions and spices', 30, true, 'breakfast', 'main', 10, 'mild', 280),
  ('Atharva Canteen', 'Masala Chai', 'Traditional Indian spiced tea', 10, true, 'breakfast', 'beverages', 3, 'mild', 50),
  ('Atharva Canteen', 'Maharashtrian Thali', 'Complete meal with rice, dal, sabji, roti', 80, true, 'lunch', 'thali', 20, 'medium', 650),
  ('Atharva Canteen', 'Pav Bhaji', 'Spicy vegetable curry with bread', 60, true, 'lunch', 'main', 15, 'spicy', 480),
  ('Atharva Canteen', 'Chicken Curry', 'Spicy chicken curry with rice', 120, false, 'lunch', 'main', 30, 'spicy', 680),
  ('Atharva Canteen', 'Veg Biryani', 'Aromatic rice with vegetables', 85, true, 'dinner', 'biryani', 35, 'medium', 520),
  ('Atharva Canteen', 'Chicken Biryani', 'Fragrant rice with chicken', 120, false, 'dinner', 'biryani', 40, 'medium', 680),
  
  -- Bistro Canteen Items
  ('Bistro Canteen', 'Club Sandwich', 'Multi-layered sandwich with vegetables', 40, true, 'breakfast', 'sandwich', 8, 'mild', 320),
  ('Bistro Canteen', 'Cold Coffee', 'Chilled coffee with ice cream', 45, true, 'breakfast', 'beverages', 5, 'mild', 180),
  ('Bistro Canteen', 'Margherita Pizza', 'Classic pizza with mozzarella', 80, true, 'lunch', 'pizza', 15, 'mild', 350),
  ('Bistro Canteen', 'White Sauce Pasta', 'Creamy pasta with herbs', 90, true, 'lunch', 'pasta', 20, 'mild', 480),
  ('Bistro Canteen', 'Chicken Sandwich', 'Grilled chicken sandwich', 70, false, 'lunch', 'sandwich', 10, 'mild', 380),
  ('Bistro Canteen', 'Hakka Noodles', 'Stir-fried noodles with vegetables', 55, true, 'dinner', 'noodles', 15, 'medium', 380),
  ('Bistro Canteen', 'Chicken Noodles', 'Noodles with chicken and vegetables', 85, false, 'dinner', 'noodles', 20, 'medium', 480)
) AS items(canteen_name, name, description, price, is_veg, meal_type, category, preparation_time, spice_level, calories)
WHERE c.name = items.canteen_name;

-- 10. Set today's specials
UPDATE canteen_items SET is_special = true WHERE name IN ('Maharashtrian Thali', 'Cold Coffee');

-- 11. Add inventory
INSERT INTO canteen_inventory (canteen_id, item_id, stock_quantity, low_stock_threshold)
SELECT canteen_id, id, 50, 10 FROM canteen_items;
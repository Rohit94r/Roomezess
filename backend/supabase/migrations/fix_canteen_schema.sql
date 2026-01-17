-- Fix Canteen Database Schema Issues

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS canteen_inventory CASCADE;
DROP TABLE IF EXISTS daily_specials CASCADE;
DROP TABLE IF EXISTS canteen_settings CASCADE;
DROP TABLE IF EXISTS canteen_orders CASCADE;
DROP TABLE IF EXISTS canteen_items CASCADE;
DROP TABLE IF EXISTS canteens CASCADE;

-- Create canteens table
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

-- Create canteen_items table
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
  ingredients TEXT,
  allergens TEXT,
  is_special BOOLEAN DEFAULT false,
  available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create canteen_orders table
CREATE TABLE canteen_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  canteen_id UUID REFERENCES canteens(id),
  items JSONB NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  payment_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  estimated_time INTEGER DEFAULT 15,
  actual_time INTEGER,
  customer_notes TEXT,
  admin_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create canteen_inventory table
CREATE TABLE canteen_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE,
  item_id UUID REFERENCES canteen_items(id) ON DELETE CASCADE,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(canteen_id, item_id)
);

-- Create daily_specials table
CREATE TABLE daily_specials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE,
  item_id UUID REFERENCES canteen_items(id) ON DELETE CASCADE,
  special_date DATE DEFAULT CURRENT_DATE,
  special_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(canteen_id, special_date, item_id)
);

-- Create canteen_settings table
CREATE TABLE canteen_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(canteen_id, setting_key)
);

-- Create indexes for performance
CREATE INDEX idx_canteen_items_canteen_meal ON canteen_items(canteen_id, meal_type);
CREATE INDEX idx_canteen_items_available ON canteen_items(available);
CREATE INDEX idx_canteen_items_special ON canteen_items(is_special);
CREATE INDEX idx_canteen_orders_status ON canteen_orders(status);
CREATE INDEX idx_canteen_orders_created ON canteen_orders(created_at);
CREATE INDEX idx_daily_specials_date ON daily_specials(special_date);

-- Enable RLS
ALTER TABLE canteens ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_specials ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Canteens viewable by authenticated users" ON canteens
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Canteen items viewable by authenticated users" ON canteen_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view own orders" ON canteen_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON canteen_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Daily specials viewable by authenticated users" ON daily_specials
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Admin policies
CREATE POLICY "Admin can manage canteens" ON canteens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'rjdhav67@gmail.com'
    )
  );

CREATE POLICY "Admin can manage canteen items" ON canteen_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'rjdhav67@gmail.com'
    )
  );

CREATE POLICY "Admin can view all orders" ON canteen_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'rjdhav67@gmail.com'
    )
  );

CREATE POLICY "Admin can manage inventory" ON canteen_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'rjdhav67@gmail.com'
    )
  );

CREATE POLICY "Admin can manage daily specials" ON daily_specials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'rjdhav67@gmail.com'
    )
  );

CREATE POLICY "Admin can manage settings" ON canteen_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'rjdhav67@gmail.com'
    )
  );

-- Insert default canteens
INSERT INTO canteens (name, description, contact_number, location, operating_hours) VALUES 
(
  'Atharva Canteen',
  'Main college canteen serving traditional Indian meals',
  '8459262203',
  'Ground Floor, Main Building',
  '{"breakfast": "7:00-10:00", "lunch": "12:00-15:00", "dinner": "18:00-21:00"}'::jsonb
),
(
  'Bistro Canteen',
  'Modern bistro with continental and fast food options',
  '8459262203',
  'First Floor, Student Center',
  '{"breakfast": "8:00-11:00", "lunch": "12:00-16:00", "dinner": "17:00-22:00"}'::jsonb
);

-- Insert sample menu items
DO $$
DECLARE
    atharva_id UUID;
    bistro_id UUID;
BEGIN
    SELECT id INTO atharva_id FROM canteens WHERE name = 'Atharva Canteen';
    SELECT id INTO bistro_id FROM canteens WHERE name = 'Bistro Canteen';

    -- Atharva Canteen Items
    INSERT INTO canteen_items (canteen_id, name, description, price, is_veg, meal_type, category, preparation_time, spice_level, calories, display_order, available) VALUES
    -- Breakfast
    (atharva_id, 'Vada Pav', 'Mumbai''s iconic street food with spicy potato filling', 25, true, 'breakfast', 'snacks', 5, 'medium', 350, 1, true),
    (atharva_id, 'Poha', 'Flattened rice with onions, peanuts and spices', 30, true, 'breakfast', 'main', 10, 'mild', 280, 2, true),
    (atharva_id, 'Upma', 'Semolina porridge with vegetables', 25, true, 'breakfast', 'main', 12, 'mild', 320, 3, true),
    (atharva_id, 'Samosa', 'Crispy fried pastry with spiced potato filling', 15, true, 'breakfast', 'snacks', 3, 'medium', 200, 4, true),
    (atharva_id, 'Masala Chai', 'Traditional Indian spiced tea', 10, true, 'breakfast', 'beverages', 3, 'mild', 50, 5, true),
    
    -- Lunch
    (atharva_id, 'Maharashtrian Thali', 'Complete meal with rice, dal, sabji, roti', 80, true, 'lunch', 'thali', 20, 'medium', 650, 1, true),
    (atharva_id, 'Pav Bhaji', 'Spicy vegetable curry with buttered bread', 60, true, 'lunch', 'main', 15, 'spicy', 480, 2, true),
    (atharva_id, 'Chole Bhature', 'Spicy chickpea curry with fried bread', 70, true, 'lunch', 'main', 18, 'spicy', 520, 3, true),
    (atharva_id, 'Paneer Butter Masala', 'Rich creamy paneer curry', 90, true, 'lunch', 'main', 25, 'medium', 580, 4, true),
    (atharva_id, 'Chicken Curry', 'Spicy chicken curry with rice', 120, false, 'lunch', 'main', 30, 'spicy', 680, 5, true),
    
    -- Dinner
    (atharva_id, 'Roti Sabji', 'Fresh rotis with vegetable curry', 45, true, 'dinner', 'combo', 15, 'medium', 380, 1, true),
    (atharva_id, 'Veg Fried Rice', 'Wok-tossed rice with vegetables', 65, true, 'dinner', 'rice', 20, 'medium', 450, 2, true),
    (atharva_id, 'Veg Biryani', 'Aromatic rice with vegetables', 85, true, 'dinner', 'biryani', 35, 'medium', 520, 3, true),
    (atharva_id, 'Chicken Biryani', 'Fragrant rice with chicken', 120, false, 'dinner', 'biryani', 40, 'medium', 680, 4, true);

    -- Bistro Canteen Items
    INSERT INTO canteen_items (canteen_id, name, description, price, is_veg, meal_type, category, preparation_time, spice_level, calories, display_order, available) VALUES
    -- Breakfast
    (bistro_id, 'Club Sandwich', 'Multi-layered sandwich with vegetables', 40, true, 'breakfast', 'sandwich', 8, 'mild', 320, 1, true),
    (bistro_id, 'Veg Burger', 'Grilled vegetable patty burger', 60, true, 'breakfast', 'burger', 12, 'mild', 420, 2, true),
    (bistro_id, 'Masala Maggi', 'Instant noodles with spices', 35, true, 'breakfast', 'noodles', 8, 'medium', 280, 3, true),
    (bistro_id, 'Cold Coffee', 'Chilled coffee with ice cream', 45, true, 'breakfast', 'beverages', 5, 'mild', 180, 4, true),
    
    -- Lunch
    (bistro_id, 'Margherita Pizza', 'Classic pizza with mozzarella', 80, true, 'lunch', 'pizza', 15, 'mild', 350, 1, true),
    (bistro_id, 'White Sauce Pasta', 'Creamy pasta with herbs', 90, true, 'lunch', 'pasta', 20, 'mild', 480, 2, true),
    (bistro_id, 'Chicken Sandwich', 'Grilled chicken sandwich', 70, false, 'lunch', 'sandwich', 10, 'mild', 380, 3, true),
    (bistro_id, 'Grilled Chicken', 'Herb-marinated grilled chicken', 150, false, 'lunch', 'grilled', 25, 'medium', 520, 4, true),
    
    -- Dinner
    (bistro_id, 'Hakka Noodles', 'Stir-fried noodles with vegetables', 55, true, 'dinner', 'noodles', 15, 'medium', 380, 1, true),
    (bistro_id, 'Veg Manchurian', 'Vegetable balls in tangy sauce', 65, true, 'dinner', 'chinese', 18, 'spicy', 420, 2, true),
    (bistro_id, 'Chicken Noodles', 'Noodles with chicken and vegetables', 85, false, 'dinner', 'noodles', 20, 'medium', 480, 3, true);

    -- Add inventory for all items
    INSERT INTO canteen_inventory (canteen_id, item_id, stock_quantity, low_stock_threshold)
    SELECT canteen_id, id, 50, 10 FROM canteen_items WHERE canteen_id = atharva_id;
    
    INSERT INTO canteen_inventory (canteen_id, item_id, stock_quantity, low_stock_threshold)
    SELECT canteen_id, id, 30, 5 FROM canteen_items WHERE canteen_id = bistro_id;

    -- Set today's specials
    INSERT INTO daily_specials (canteen_id, item_id, special_date, is_active)
    SELECT atharva_id, id, CURRENT_DATE, true 
    FROM canteen_items 
    WHERE canteen_id = atharva_id AND name = 'Maharashtrian Thali';

    INSERT INTO daily_specials (canteen_id, item_id, special_date, is_active)
    SELECT bistro_id, id, CURRENT_DATE, true 
    FROM canteen_items 
    WHERE canteen_id = bistro_id AND name = 'Cold Coffee';

    -- Update items to mark specials
    UPDATE canteen_items SET is_special = true 
    WHERE name IN ('Maharashtrian Thali', 'Cold Coffee');

END $$;
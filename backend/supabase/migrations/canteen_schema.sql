-- Canteen Module Database Schema

-- Canteens table
CREATE TABLE canteens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Canteen items table
CREATE TABLE canteen_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_veg BOOLEAN DEFAULT true,
  meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  is_special BOOLEAN DEFAULT false,
  available BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE canteen_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  canteen_id UUID REFERENCES canteens(id),
  items JSONB NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  payment_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default canteens
INSERT INTO canteens (name) VALUES 
('Atharva Canteen'),
('Bistro Canteen');

-- RLS Policies
ALTER TABLE canteens ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_orders ENABLE ROW LEVEL SECURITY;

-- Canteens - readable by all authenticated users
CREATE POLICY "Canteens are viewable by authenticated users" ON canteens
  FOR SELECT USING (auth.role() = 'authenticated');

-- Canteen items - readable by all authenticated users
CREATE POLICY "Canteen items are viewable by authenticated users" ON canteen_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Orders - users can only see their own orders
CREATE POLICY "Users can view own orders" ON canteen_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON canteen_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies (assuming admin email)
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
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'rjdhav67@gmail.com'
    )
  );
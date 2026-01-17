-- Enhanced Canteen Management Schema Updates

-- Add more fields to canteen_items for better management
ALTER TABLE canteen_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE canteen_items ADD COLUMN IF NOT EXISTS preparation_time INTEGER DEFAULT 10; -- in minutes
ALTER TABLE canteen_items ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';
ALTER TABLE canteen_items ADD COLUMN IF NOT EXISTS ingredients TEXT;
ALTER TABLE canteen_items ADD COLUMN IF NOT EXISTS allergens TEXT;
ALTER TABLE canteen_items ADD COLUMN IF NOT EXISTS calories INTEGER;
ALTER TABLE canteen_items ADD COLUMN IF NOT EXISTS spice_level VARCHAR(20) CHECK (spice_level IN ('mild', 'medium', 'spicy', 'very_spicy'));
ALTER TABLE canteen_items ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add canteen management settings table
CREATE TABLE IF NOT EXISTS canteen_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(canteen_id, setting_key)
);

-- Add daily specials tracking
CREATE TABLE IF NOT EXISTS daily_specials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE,
  item_id UUID REFERENCES canteen_items(id) ON DELETE CASCADE,
  special_date DATE DEFAULT CURRENT_DATE,
  special_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(canteen_id, special_date, item_id)
);

-- Add inventory tracking
CREATE TABLE IF NOT EXISTS canteen_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE,
  item_id UUID REFERENCES canteen_items(id) ON DELETE CASCADE,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update canteens table with more details
ALTER TABLE canteens ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE canteens ADD COLUMN IF NOT EXISTS contact_number VARCHAR(15);
ALTER TABLE canteens ADD COLUMN IF NOT EXISTS operating_hours JSONB;
ALTER TABLE canteens ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE canteens ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update canteen_orders with more tracking
ALTER TABLE canteen_orders ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 15; -- in minutes
ALTER TABLE canteen_orders ADD COLUMN IF NOT EXISTS actual_time INTEGER;
ALTER TABLE canteen_orders ADD COLUMN IF NOT EXISTS customer_notes TEXT;
ALTER TABLE canteen_orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE canteen_orders ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE canteen_orders ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_canteen_items_canteen_meal ON canteen_items(canteen_id, meal_type);
CREATE INDEX IF NOT EXISTS idx_canteen_items_available ON canteen_items(available);
CREATE INDEX IF NOT EXISTS idx_canteen_items_special ON canteen_items(is_special);
CREATE INDEX IF NOT EXISTS idx_canteen_orders_status ON canteen_orders(status);
CREATE INDEX IF NOT EXISTS idx_canteen_orders_created ON canteen_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_specials_date ON daily_specials(special_date);

-- Update RLS policies for new tables
ALTER TABLE canteen_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_specials ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_inventory ENABLE ROW LEVEL SECURITY;

-- Admin policies for new tables
CREATE POLICY "Admin can manage canteen settings" ON canteen_settings
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

CREATE POLICY "Admin can manage inventory" ON canteen_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'rjdhav67@gmail.com'
    )
  );

-- Users can view daily specials
CREATE POLICY "Users can view daily specials" ON daily_specials
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Update canteen data with enhanced information
UPDATE canteens SET 
  description = 'Main college canteen serving traditional Indian meals',
  contact_number = '8459262203',
  location = 'Ground Floor, Main Building',
  operating_hours = '{"breakfast": "7:00-10:00", "lunch": "12:00-15:00", "dinner": "18:00-21:00"}'::jsonb
WHERE name = 'Atharva Canteen';

UPDATE canteens SET 
  description = 'Modern bistro with continental and fast food options',
  contact_number = '8459262203',
  location = 'First Floor, Student Center',
  operating_hours = '{"breakfast": "8:00-11:00", "lunch": "12:00-16:00", "dinner": "17:00-22:00"}'::jsonb
WHERE name = 'Bistro Canteen';

-- Function to automatically update inventory when orders are placed
CREATE OR REPLACE FUNCTION update_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease inventory for each item in the order
  UPDATE canteen_inventory 
  SET stock_quantity = stock_quantity - (item->>'quantity')::integer,
      last_updated = NOW()
  FROM jsonb_array_elements(NEW.items) AS item
  WHERE canteen_inventory.item_id = (item->>'id')::uuid
    AND canteen_inventory.canteen_id = NEW.canteen_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory updates
DROP TRIGGER IF EXISTS trigger_update_inventory ON canteen_orders;
CREATE TRIGGER trigger_update_inventory
  AFTER INSERT ON canteen_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_order();
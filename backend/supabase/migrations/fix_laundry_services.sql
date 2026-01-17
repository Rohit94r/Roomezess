-- Fix Laundry Services - Drop and recreate table with correct structure

-- Drop existing table
DROP TABLE IF EXISTS laundry_shops CASCADE;

-- Create laundry_shops table with correct structure
CREATE TABLE laundry_shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  pricing_details JSONB,
  phone VARCHAR(15),
  address TEXT,
  owner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for testing
ALTER TABLE laundry_shops DISABLE ROW LEVEL SECURITY;

-- Insert sample laundry shops
INSERT INTO laundry_shops (name, description, price, image_url, available, pricing_details, phone, address) VALUES
(
  'Quick Wash Laundry',
  'Fast and reliable laundry service with pickup and delivery. Professional cleaning for all types of clothes.',
  50,
  'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500',
  true,
  '[
    {"item": "Shirt/T-shirt", "price": 20},
    {"item": "Pants/Jeans", "price": 25},
    {"item": "Dress", "price": 35},
    {"item": "Jacket", "price": 50},
    {"item": "Bedsheet", "price": 30},
    {"item": "Blanket", "price": 80},
    {"item": "Dry Cleaning", "price": 100}
  ]'::jsonb,
  '8459262203',
  'Near Atharva College Gate, Malad West'
),
(
  'Express Laundry Service',
  'Same day laundry service with premium quality cleaning. Specializes in delicate fabrics and formal wear.',
  60,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
  true,
  '[
    {"item": "Regular Wash & Fold", "price": 40},
    {"item": "Express Service (4 hours)", "price": 80},
    {"item": "Dry Cleaning", "price": 120},
    {"item": "Ironing Only", "price": 15},
    {"item": "Shoe Cleaning", "price": 50},
    {"item": "Curtain Cleaning", "price": 100}
  ]'::jsonb,
  '8459262203',
  'Opposite College Campus, Malad West'
),
(
  'Campus Clean Laundry',
  'Student-friendly laundry service with affordable rates. Weekly and monthly packages available.',
  35,
  'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=500',
  true,
  '[
    {"item": "Student Package (5kg)", "price": 150},
    {"item": "Weekly Package", "price": 300},
    {"item": "Monthly Package", "price": 1000},
    {"item": "Single Item", "price": 25},
    {"item": "Heavy Items (Blanket)", "price": 60},
    {"item": "Urgent Service", "price": 200}
  ]'::jsonb,
  '8459262203',
  'Student Housing Area, Malad West'
);

-- Grant permissions
GRANT ALL ON laundry_shops TO authenticated;
GRANT ALL ON laundry_shops TO anon;
-- Migration to support new features: Multiple Rooms images, Detailed Laundry pricing, Multiple Canteens

-- 1. Update Rooms for multiple images
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS images TEXT[];
-- Ensure description exists
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS description TEXT;
-- Ensure room_type exists
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS room_type TEXT;
-- Ensure furnishing exists
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS furnishing TEXT;

-- 2. Update Laundry (Services) for detailed pricing
ALTER TABLE public.laundry_shops ADD COLUMN IF NOT EXISTS pricing_details JSONB;

-- 3. Create Canteens Table
CREATE TABLE IF NOT EXISTS public.canteens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    location TEXT,
    opening_time TIME,
    closing_time TIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for canteens
ALTER TABLE public.canteens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view canteens" ON public.canteens FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage canteens" ON public.canteens USING (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  )
);

-- 4. Update Canteen Menu (Items) to link to Canteens
ALTER TABLE public.canteen_menu ADD COLUMN IF NOT EXISTS canteen_id UUID REFERENCES public.canteens(id);
ALTER TABLE public.canteen_menu ADD COLUMN IF NOT EXISTS category TEXT; -- Ensure category exists

-- 5. Seed Canteens (Atharva and Bistro) if not exist
INSERT INTO public.canteens (name, description, image_url, is_active)
SELECT 'Atharva Canteen', 'Main college canteen serving mainly breakfast and lunch.', 'https://ysicwtkdhvpvilsxhekp.supabase.co/storage/v1/object/public/service-images/atharva_canteen.jpg', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.canteens WHERE name = 'Atharva Canteen');

INSERT INTO public.canteens (name, description, image_url, is_active)
SELECT 'Bistro', 'Premium canteen with variety of snacks, drinks and dinner options.', 'https://ysicwtkdhvpvilsxhekp.supabase.co/storage/v1/object/public/service-images/bistro.jpg', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.canteens WHERE name = 'Bistro');

-- 6. Seed Laundry Pricing Details (Example)
-- Update existing shops to have default pricing if null
UPDATE public.laundry_shops 
SET pricing_details = '[
  {"item": "Shirt (Wash & Iron)", "price": 15}, 
  {"item": "Pant (Wash & Iron)", "price": 20},
  {"item": "Bedweb (Per Kg)", "price": 50},
  {"item": "Ironing Only", "price": 10}
]'::jsonb
WHERE pricing_details IS NULL;

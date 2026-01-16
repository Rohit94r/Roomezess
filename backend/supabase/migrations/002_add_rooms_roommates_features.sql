-- ====================================================
-- MIGRATION 002: Add Rooms & Roommates Admin Features
-- ====================================================

-- 1. Alter rooms table to add admin-friendly fields
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS map_link TEXT,
ADD COLUMN IF NOT EXISTS room_type TEXT CHECK (room_type IN ('single', 'double', 'triple', 'shared')),
ADD COLUMN IF NOT EXISTS furnishing TEXT CHECK (furnishing IN ('unfurnished', 'semi-furnished', 'fully-furnished')),
ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT TRUE;

-- 2. Create roommates_admin table (for admin to manage roommate requirements)
CREATE TABLE IF NOT EXISTS public.roommates_admin (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'any')),
    budget INTEGER,
    preferences TEXT,
    contact TEXT NOT NULL,
    location TEXT,
    image_url TEXT,
    available BOOLEAN DEFAULT TRUE,
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_owner ON public.rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON public.rooms(available);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON public.rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_roommates_admin_owner ON public.roommates_admin(owner_id);
CREATE INDEX IF NOT EXISTS idx_roommates_admin_available ON public.roommates_admin(available);
CREATE INDEX IF NOT EXISTS idx_roommates_admin_gender ON public.roommates_admin(gender);

-- 4. Enable RLS on new table
ALTER TABLE public.roommates_admin ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for roommates_admin table
-- Anyone can view available roommate listings
CREATE POLICY "Anyone can view available roommates" ON public.roommates_admin
    FOR SELECT USING (available = TRUE);

-- Admin/Owner can view their own roommate listings
CREATE POLICY "Owners can view own roommate listings" ON public.roommates_admin
    FOR SELECT USING (auth.uid() = owner_id);

-- Admins can create roommate listings (service role bypass)
CREATE POLICY "Admins can create roommate listings" ON public.roommates_admin
    FOR INSERT WITH CHECK (true);

-- Owners can update their own listings
CREATE POLICY "Owners can update own roommate listings" ON public.roommates_admin
    FOR UPDATE USING (auth.uid() = owner_id OR auth.role() = 'service_role');

-- Owners can delete their own listings
CREATE POLICY "Owners can delete own roommate listings" ON public.roommates_admin
    FOR DELETE USING (auth.uid() = owner_id OR auth.role() = 'service_role');

-- 6. Update rooms table RLS policies
DROP POLICY IF EXISTS "Owners can manage own rooms" ON public.rooms;

CREATE POLICY "Admins can manage rooms" ON public.rooms
    FOR ALL USING (auth.role() = 'service_role' OR auth.uid() = owner_id);

-- 7. Create updated_at trigger for roommates_admin
CREATE OR REPLACE FUNCTION public.update_roommates_admin_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_roommates_admin_updated_at ON public.roommates_admin;
CREATE TRIGGER update_roommates_admin_updated_at
    BEFORE UPDATE ON public.roommates_admin
    FOR EACH ROW
    EXECUTE FUNCTION public.update_roommates_admin_updated_at();

-- 8. Storage policies for room images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('roommate-images', 'roommate-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for room-images bucket
CREATE POLICY "Anyone can view room images" ON storage.objects
    FOR SELECT USING (bucket_id = 'room-images' AND auth.role() = 'authenticated');

CREATE POLICY "Owners can upload room images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'room-images' 
        AND auth.role() = 'authenticated'
    );

-- RLS policies for roommate-images bucket
CREATE POLICY "Anyone can view roommate images" ON storage.objects
    FOR SELECT USING (bucket_id = 'roommate-images' AND auth.role() = 'authenticated');

CREATE POLICY "Owners can upload roommate images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'roommate-images' 
        AND auth.role() = 'authenticated'
    );

-- ====================================================
-- Sample data for testing (optional - comment out if not needed)
-- ====================================================
-- INSERT INTO public.rooms (title, rent, distance_km, amenities, contact, owner_id, description, room_type, furnishing, available)
-- VALUES (
--     'Cozy Single Room near Campus',
--     8000,
--     0.5,
--     ARRAY['WiFi', 'AC', 'Attached Bathroom'],
--     '9876543210',
--     (SELECT id FROM public.profiles LIMIT 1),
--     'Well-maintained single room with all basic amenities',
--     'single',
--     'fully-furnished',
--     TRUE
-- );

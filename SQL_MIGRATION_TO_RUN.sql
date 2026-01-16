-- ====================================================
-- COPY-PASTE THIS ENTIRE SQL INTO SUPABASE SQL EDITOR
-- File: backend/supabase/migrations/002_add_rooms_roommates_features.sql
-- ====================================================

-- 1. Alter rooms table to add admin-friendly fields
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS map_link TEXT,
ADD COLUMN IF NOT EXISTS room_type TEXT CHECK (room_type IN ('single', 'double', 'triple', 'shared')),
ADD COLUMN IF NOT EXISTS furnishing TEXT CHECK (furnishing IN ('unfurnished', 'semi-furnished', 'fully-furnished')),
ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT TRUE;

-- 2. Create roommates_admin table
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

-- 3. Add indexes
CREATE INDEX IF NOT EXISTS idx_rooms_owner ON public.rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON public.rooms(available);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON public.rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_roommates_admin_owner ON public.roommates_admin(owner_id);
CREATE INDEX IF NOT EXISTS idx_roommates_admin_available ON public.roommates_admin(available);
CREATE INDEX IF NOT EXISTS idx_roommates_admin_gender ON public.roommates_admin(gender);

-- 4. Enable RLS
ALTER TABLE public.roommates_admin ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for roommates_admin
CREATE POLICY "Anyone can view available roommates" ON public.roommates_admin
    FOR SELECT USING (available = TRUE);

CREATE POLICY "Owners can view own roommate listings" ON public.roommates_admin
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create roommate listings" ON public.roommates_admin
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own roommate listings" ON public.roommates_admin
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own roommate listings" ON public.roommates_admin
    FOR DELETE USING (auth.uid() = owner_id);

-- 6. Drop old policy and recreate rooms policy
DROP POLICY IF EXISTS "Owners can manage own rooms" ON public.rooms;

CREATE POLICY "Owners can manage own rooms" ON public.rooms
    FOR ALL USING (auth.uid() = owner_id);

-- 7. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_roommates_admin_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 8. Create trigger
DROP TRIGGER IF EXISTS update_roommates_admin_updated_at ON public.roommates_admin;
CREATE TRIGGER update_roommates_admin_updated_at
    BEFORE UPDATE ON public.roommates_admin
    FOR EACH ROW
    EXECUTE FUNCTION public.update_roommates_admin_updated_at();

-- 9. Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('roommate-images', 'roommate-images', true)
ON CONFLICT (id) DO NOTHING;

-- 10. Storage RLS policies - room-images bucket
CREATE POLICY "Anyone can view room images" ON storage.objects
    FOR SELECT USING (bucket_id = 'room-images' AND auth.role() = 'authenticated');

CREATE POLICY "Owners can upload room images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'room-images' 
        AND auth.role() = 'authenticated'
    );

-- 11. Storage RLS policies - roommate-images bucket
CREATE POLICY "Anyone can view roommate images" ON storage.objects
    FOR SELECT USING (bucket_id = 'roommate-images' AND auth.role() = 'authenticated');

CREATE POLICY "Owners can upload roommate images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'roommate-images' 
        AND auth.role() = 'authenticated'
    );

-- ====================================================
-- VERIFICATION QUERIES (RUN AFTER MIGRATION)
-- ====================================================

-- Check if rooms table has new columns
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'rooms' 
-- ORDER BY column_name;

-- Check if roommates_admin table exists
-- SELECT * FROM information_schema.tables 
-- WHERE table_name = 'roommates_admin';

-- Check if buckets exist
-- SELECT * FROM storage.buckets 
-- WHERE id IN ('room-images', 'roommate-images');

-- ====================================================
-- END OF MIGRATION
-- ====================================================

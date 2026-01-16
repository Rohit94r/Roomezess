-- SQL Migrations for Services & Events Enhancement
-- Author: Roomezes Admin Panel Upgrade
-- Purpose: Add image uploads and Google Maps integration

-- ============================================
-- 1. ALTER SERVICES TABLE
-- ============================================
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS map_link TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_image_url ON public.services(image_url);
CREATE INDEX IF NOT EXISTS idx_services_map_link ON public.services(map_link);

-- ============================================
-- 2. ALTER EVENTS TABLE
-- ============================================
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS map_link TEXT,
ADD COLUMN IF NOT EXISTS register_link TEXT,
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_events_image_url ON public.events(image_url);
CREATE INDEX IF NOT EXISTS idx_events_map_link ON public.events(map_link);
CREATE INDEX IF NOT EXISTS idx_events_owner ON public.events(owner_id);

-- ============================================
-- 3. ENABLE RLS ON SERVICES TABLE
-- ============================================
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
DROP POLICY IF EXISTS "Owners can manage own services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage all services" ON public.services;

-- Recreate policies
-- View policy: Anyone can view services
CREATE POLICY "services_view_all" ON public.services
    FOR SELECT USING (TRUE);

-- Admin/Owner manage policy: Only admin or owner can modify
CREATE POLICY "services_admin_owner_manage" ON public.services
    FOR ALL USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- 4. ENABLE RLS ON EVENTS TABLE
-- ============================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;

-- Recreate policies
-- View policy: Anyone can view events
CREATE POLICY "events_view_all" ON public.events
    FOR SELECT USING (TRUE);

-- Admin manage policy: Only admin or event owner can modify
CREATE POLICY "events_admin_manage" ON public.events
    FOR ALL USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Insert policy for events: Only admins can create
CREATE POLICY "events_admin_create" ON public.events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- ============================================
-- 5. STORAGE BUCKETS & POLICIES
-- ============================================

-- Note: These SQL statements may need to be run via Supabase API
-- as storage bucket creation is not standard SQL

-- Create service-images bucket policy
CREATE POLICY "service_images_public_read"
    ON storage.objects
    FOR SELECT USING (bucket_id = 'service-images');

CREATE POLICY "service_images_auth_upload"
    ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'service-images' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "service_images_auth_update"
    ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'service-images' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "service_images_auth_delete"
    ON storage.objects
    FOR DELETE USING (
        bucket_id = 'service-images' AND
        auth.role() = 'authenticated'
    );

-- Create event-images bucket policy
CREATE POLICY "event_images_public_read"
    ON storage.objects
    FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "event_images_auth_upload"
    ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'event-images' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "event_images_auth_update"
    ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'event-images' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "event_images_auth_delete"
    ON storage.objects
    FOR DELETE USING (
        bucket_id = 'event-images' AND
        auth.role() = 'authenticated'
    );

-- ============================================
-- 6. MIGRATION COMPLETE
-- ============================================
-- All tables now support image uploads and location links
-- Services: image_url, map_link
-- Events: image_url, map_link, register_link, owner_id

-- ====================================================
-- FIX: Update RLS Policies for Rooms & Roommates
-- Run this in Supabase SQL Editor to fix the RLS errors
-- ====================================================

-- 1. Drop old rooms policy
DROP POLICY IF EXISTS "Owners can manage own rooms" ON public.rooms;

-- 2. Create new rooms policy that allows service role
CREATE POLICY "Admins can manage rooms" ON public.rooms
    FOR ALL USING (auth.role() = 'service_role' OR auth.uid() = owner_id);

-- 3. Drop old roommates policies
DROP POLICY IF EXISTS "Owners can create roommate listings" ON public.roommates_admin;
DROP POLICY IF EXISTS "Owners can update own roommate listings" ON public.roommates_admin;
DROP POLICY IF EXISTS "Owners can delete own roommate listings" ON public.roommates_admin;

-- 4. Create new roommates policies that allow service role
CREATE POLICY "Admins can create roommate listings" ON public.roommates_admin
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update roommate listings" ON public.roommates_admin
    FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = owner_id);

CREATE POLICY "Admins can delete roommate listings" ON public.roommates_admin
    FOR DELETE USING (auth.role() = 'service_role' OR auth.uid() = owner_id);

-- Done! Now rooms and roommates can be added via the API

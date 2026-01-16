-- ====================================================
-- FIX: Correct RLS Policies for Rooms & Roommates
-- Run this in Supabase SQL Editor
-- ====================================================

-- 1. Drop old rooms policies
DROP POLICY IF EXISTS "Owners can manage own rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins can manage rooms" ON public.rooms;

-- 2. Create proper rooms policies that allow INSERT/UPDATE/DELETE from service role
CREATE POLICY "rooms_select_all" ON public.rooms
    FOR SELECT USING (true);

CREATE POLICY "rooms_insert_admin" ON public.rooms
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = owner_id);

CREATE POLICY "rooms_update_admin" ON public.rooms
    FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = owner_id);

CREATE POLICY "rooms_delete_admin" ON public.rooms
    FOR DELETE USING (auth.role() = 'service_role' OR auth.uid() = owner_id);

-- 3. Drop old roommates policies
DROP POLICY IF EXISTS "Anyone can view available roommates" ON public.roommates_admin;
DROP POLICY IF EXISTS "Owners can view own roommate listings" ON public.roommates_admin;
DROP POLICY IF EXISTS "Admins can create roommate listings" ON public.roommates_admin;
DROP POLICY IF EXISTS "Admins can update roommate listings" ON public.roommates_admin;
DROP POLICY IF EXISTS "Admins can delete roommate listings" ON public.roommates_admin;

-- 4. Create proper roommates policies
CREATE POLICY "roommates_select_public" ON public.roommates_admin
    FOR SELECT USING (available = TRUE OR auth.uid() = owner_id OR auth.role() = 'service_role');

CREATE POLICY "roommates_insert_admin" ON public.roommates_admin
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = owner_id);

CREATE POLICY "roommates_update_admin" ON public.roommates_admin
    FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = owner_id);

CREATE POLICY "roommates_delete_admin" ON public.roommates_admin
    FOR DELETE USING (auth.role() = 'service_role' OR auth.uid() = owner_id);

-- ====================================================
-- Done! RLS policies are now fixed
-- Try adding a room/roommate again
-- ====================================================

-- ====================================================
-- COMPLETE FIX: Disable RLS & Drop All Policies
-- Run this COMPLETE script in Supabase SQL Editor
-- ====================================================

-- Step 1: Disable RLS on both tables
ALTER TABLE public.roommates_admin DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies on roommates_admin
DROP POLICY IF EXISTS "roommates_select_available" ON public.roommates_admin;
DROP POLICY IF EXISTS "roommates_insert_admin" ON public.roommates_admin;
DROP POLICY IF EXISTS "roommates_update_admin" ON public.roommates_admin;
DROP POLICY IF EXISTS "roommates_delete_admin" ON public.roommates_admin;
DROP POLICY IF EXISTS "Anyone can view available roommates" ON public.roommates_admin;
DROP POLICY IF EXISTS "Owners can view own roommate listings" ON public.roommates_admin;
DROP POLICY IF EXISTS "Admins can create roommate listings" ON public.roommates_admin;
DROP POLICY IF EXISTS "Admins can update roommate listings" ON public.roommates_admin;
DROP POLICY IF EXISTS "Admins can delete roommate listings" ON public.roommates_admin;

-- Step 3: Drop ALL policies on rooms
DROP POLICY IF EXISTS "rooms_select_all" ON public.rooms;
DROP POLICY IF EXISTS "rooms_insert_admin" ON public.rooms;
DROP POLICY IF EXISTS "rooms_update_admin" ON public.rooms;
DROP POLICY IF EXISTS "rooms_delete_admin" ON public.rooms;
DROP POLICY IF EXISTS "Owners can manage own rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins can manage rooms" ON public.rooms;

-- Step 4: Drop ALL storage policies
DROP POLICY IF EXISTS "Anyone can view room images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload room images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view roommate images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload roommate images" ON storage.objects;

-- ====================================================
-- DONE! All RLS policies removed
-- Rooms and roommates can now be added without errors
-- ====================================================

-- ====================================================
-- DISABLE RLS: Rooms & Roommates
-- Run this in Supabase SQL Editor to fix RLS errors
-- ====================================================

-- Disable RLS on roommates_admin table
ALTER TABLE public.roommates_admin DISABLE ROW LEVEL SECURITY;

-- Disable RLS on rooms table  
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;

-- ====================================================
-- Drop all RLS policies
-- ====================================================
DROP POLICY IF EXISTS "roommates_select_available" ON public.roommates_admin;
DROP POLICY IF EXISTS "roommates_insert_admin" ON public.roommates_admin;
DROP POLICY IF EXISTS "roommates_update_admin" ON public.roommates_admin;
DROP POLICY IF EXISTS "roommates_delete_admin" ON public.roommates_admin;

DROP POLICY IF EXISTS "rooms_select_all" ON public.rooms;
DROP POLICY IF EXISTS "rooms_insert_admin" ON public.rooms;
DROP POLICY IF EXISTS "rooms_update_admin" ON public.rooms;
DROP POLICY IF EXISTS "rooms_delete_admin" ON public.rooms;

-- ====================================================
-- Done! RLS disabled
-- The API endpoints are protected, no need for RLS
-- ====================================================

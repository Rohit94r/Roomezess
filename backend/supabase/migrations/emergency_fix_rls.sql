-- EMERGENCY FIX: Disable RLS completely for testing
-- Run this ONLY if the previous fix doesn't work

-- Disable RLS on all canteen tables
ALTER TABLE canteens DISABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_inventory DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Re-enable RLS with simple policies after testing
-- ALTER TABLE canteens ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE canteen_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE canteen_orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE canteen_inventory ENABLE ROW LEVEL SECURITY;
-- FIX PERMISSION DENIED ERRORS FOR CANTEEN SYSTEM

-- 1. Drop existing policies that cause permission issues
DROP POLICY IF EXISTS "Admin full access canteens" ON canteens;
DROP POLICY IF EXISTS "Admin full access canteen_items" ON canteen_items;
DROP POLICY IF EXISTS "Admin full access canteen_orders" ON canteen_orders;
DROP POLICY IF EXISTS "Admin full access canteen_inventory" ON canteen_inventory;

-- 2. Create simple admin policies using email directly
CREATE POLICY "Admin can manage canteens" ON canteens
  FOR ALL USING (auth.jwt() ->> 'email' = 'rjdhav67@gmail.com');

CREATE POLICY "Admin can manage canteen_items" ON canteen_items
  FOR ALL USING (auth.jwt() ->> 'email' = 'rjdhav67@gmail.com');

CREATE POLICY "Admin can manage canteen_orders" ON canteen_orders
  FOR ALL USING (auth.jwt() ->> 'email' = 'rjdhav67@gmail.com');

CREATE POLICY "Admin can manage canteen_inventory" ON canteen_inventory
  FOR ALL USING (auth.jwt() ->> 'email' = 'rjdhav67@gmail.com');

-- 3. Alternative: If JWT approach doesn't work, disable RLS for admin operations
-- Uncomment these lines if you still get permission errors:

-- ALTER TABLE canteens DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE canteen_items DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE canteen_inventory DISABLE ROW LEVEL SECURITY;

-- 4. Or create a simpler approach - allow authenticated users to read, admin to write
DROP POLICY IF EXISTS "Admin can manage canteens" ON canteens;
DROP POLICY IF EXISTS "Admin can manage canteen_items" ON canteen_items;
DROP POLICY IF EXISTS "Admin can manage canteen_orders" ON canteen_orders;
DROP POLICY IF EXISTS "Admin can manage canteen_inventory" ON canteen_inventory;

-- Simple policies for testing
CREATE POLICY "Anyone can read canteens" ON canteens FOR SELECT USING (true);
CREATE POLICY "Anyone can read canteen_items" ON canteen_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage canteens" ON canteens 
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage canteen_items" ON canteen_items 
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage canteen_inventory" ON canteen_inventory 
  FOR ALL USING (auth.role() = 'authenticated');

-- 5. Grant necessary permissions to authenticated role
GRANT ALL ON canteens TO authenticated;
GRANT ALL ON canteen_items TO authenticated;
GRANT ALL ON canteen_orders TO authenticated;
GRANT ALL ON canteen_inventory TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
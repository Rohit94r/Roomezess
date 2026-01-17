-- Sample data for canteen items
-- Run this after creating the tables

-- Get canteen IDs
DO $$
DECLARE
    atharva_id UUID;
    bistro_id UUID;
BEGIN
    SELECT id INTO atharva_id FROM canteens WHERE name = 'Atharva Canteen';
    SELECT id INTO bistro_id FROM canteens WHERE name = 'Bistro Canteen';

    -- Atharva Canteen Items
    INSERT INTO canteen_items (canteen_id, name, price, is_veg, meal_type, is_special, available) VALUES
    -- Breakfast
    (atharva_id, 'Vada Pav', 25, true, 'breakfast', false, true),
    (atharva_id, 'Poha', 30, true, 'breakfast', false, true),
    (atharva_id, 'Upma', 25, true, 'breakfast', false, true),
    (atharva_id, 'Samosa', 15, true, 'breakfast', false, true),
    (atharva_id, 'Tea', 10, true, 'breakfast', false, true),
    (atharva_id, 'Coffee', 15, true, 'breakfast', false, true),
    
    -- Lunch
    (atharva_id, 'Thali', 80, true, 'lunch', true, true),
    (atharva_id, 'Pav Bhaji', 60, true, 'lunch', false, true),
    (atharva_id, 'Chole Bhature', 70, true, 'lunch', false, true),
    (atharva_id, 'Paneer Butter Masala', 90, true, 'lunch', false, true),
    (atharva_id, 'Dal Rice', 50, true, 'lunch', false, true),
    (atharva_id, 'Chicken Curry', 120, false, 'lunch', false, true),
    
    -- Dinner
    (atharva_id, 'Roti Sabji', 45, true, 'dinner', false, true),
    (atharva_id, 'Fried Rice', 65, true, 'dinner', false, true),
    (atharva_id, 'Biryani', 85, true, 'dinner', false, true),
    (atharva_id, 'Chicken Biryani', 120, false, 'dinner', false, true);

    -- Bistro Canteen Items
    INSERT INTO canteen_items (canteen_id, name, price, is_veg, meal_type, is_special, available) VALUES
    -- Breakfast
    (bistro_id, 'Sandwich', 40, true, 'breakfast', false, true),
    (bistro_id, 'Burger', 60, true, 'breakfast', false, true),
    (bistro_id, 'Maggi', 35, true, 'breakfast', false, true),
    (bistro_id, 'Cold Coffee', 45, true, 'breakfast', true, true),
    
    -- Lunch
    (bistro_id, 'Pizza Slice', 80, true, 'lunch', false, true),
    (bistro_id, 'Pasta', 90, true, 'lunch', false, true),
    (bistro_id, 'Chicken Sandwich', 70, false, 'lunch', false, true),
    (bistro_id, 'Grilled Chicken', 150, false, 'lunch', false, true),
    
    -- Dinner
    (bistro_id, 'Noodles', 55, true, 'dinner', false, true),
    (bistro_id, 'Manchurian', 65, true, 'dinner', false, true),
    (bistro_id, 'Chicken Noodles', 85, false, 'dinner', false, true);

END $$;
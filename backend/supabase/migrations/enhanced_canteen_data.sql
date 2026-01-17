-- Enhanced sample data with detailed information
DO $$
DECLARE
    atharva_id UUID;
    bistro_id UUID;
BEGIN
    SELECT id INTO atharva_id FROM canteens WHERE name = 'Atharva Canteen';
    SELECT id INTO bistro_id FROM canteens WHERE name = 'Bistro Canteen';

    -- Clear existing data
    DELETE FROM canteen_items WHERE canteen_id IN (atharva_id, bistro_id);

    -- Atharva Canteen Items with enhanced details
    INSERT INTO canteen_items (canteen_id, name, description, price, is_veg, meal_type, category, preparation_time, spice_level, calories, display_order, available) VALUES
    -- Breakfast
    (atharva_id, 'Vada Pav', 'Mumbai''s iconic street food with spicy potato filling and chutneys', 25, true, 'breakfast', 'snacks', 5, 'medium', 350, 1, true),
    (atharva_id, 'Poha', 'Flattened rice with onions, peanuts and spices', 30, true, 'breakfast', 'main', 10, 'mild', 280, 2, true),
    (atharva_id, 'Upma', 'Semolina porridge with vegetables and tempering', 25, true, 'breakfast', 'main', 12, 'mild', 320, 3, true),
    (atharva_id, 'Samosa', 'Crispy fried pastry with spiced potato filling', 15, true, 'breakfast', 'snacks', 3, 'medium', 200, 4, true),
    (atharva_id, 'Masala Chai', 'Traditional Indian spiced tea', 10, true, 'breakfast', 'beverages', 3, 'mild', 50, 5, true),
    (atharva_id, 'Filter Coffee', 'South Indian style strong coffee', 15, true, 'breakfast', 'beverages', 5, 'mild', 30, 6, true),
    
    -- Lunch
    (atharva_id, 'Maharashtrian Thali', 'Complete meal with rice, dal, sabji, roti, pickle and sweet', 80, true, 'lunch', 'thali', 20, 'medium', 650, 1, true),
    (atharva_id, 'Pav Bhaji', 'Spicy vegetable curry served with buttered bread rolls', 60, true, 'lunch', 'main', 15, 'spicy', 480, 2, true),
    (atharva_id, 'Chole Bhature', 'Spicy chickpea curry with deep-fried bread', 70, true, 'lunch', 'main', 18, 'spicy', 520, 3, true),
    (atharva_id, 'Paneer Butter Masala', 'Rich and creamy paneer curry with rice', 90, true, 'lunch', 'main', 25, 'medium', 580, 4, true),
    (atharva_id, 'Dal Rice Combo', 'Yellow dal with steamed rice and pickle', 50, true, 'lunch', 'combo', 15, 'mild', 420, 5, true),
    (atharva_id, 'Chicken Curry', 'Spicy chicken curry with rice or roti', 120, false, 'lunch', 'main', 30, 'spicy', 680, 6, true),
    
    -- Dinner
    (atharva_id, 'Roti Sabji Combo', 'Fresh rotis with seasonal vegetable curry', 45, true, 'dinner', 'combo', 15, 'medium', 380, 1, true),
    (atharva_id, 'Veg Fried Rice', 'Wok-tossed rice with mixed vegetables', 65, true, 'dinner', 'rice', 20, 'medium', 450, 2, true),
    (atharva_id, 'Veg Biryani', 'Aromatic basmati rice with vegetables and spices', 85, true, 'dinner', 'biryani', 35, 'medium', 520, 3, true),
    (atharva_id, 'Chicken Biryani', 'Fragrant basmati rice with tender chicken pieces', 120, false, 'dinner', 'biryani', 40, 'medium', 680, 4, true);

    -- Bistro Canteen Items with enhanced details
    INSERT INTO canteen_items (canteen_id, name, description, price, is_veg, meal_type, category, preparation_time, spice_level, calories, display_order, available) VALUES
    -- Breakfast
    (bistro_id, 'Club Sandwich', 'Multi-layered sandwich with vegetables and cheese', 40, true, 'breakfast', 'sandwich', 8, 'mild', 320, 1, true),
    (bistro_id, 'Veg Burger', 'Grilled vegetable patty with fresh salad', 60, true, 'breakfast', 'burger', 12, 'mild', 420, 2, true),
    (bistro_id, 'Masala Maggi', 'Instant noodles with Indian spices and vegetables', 35, true, 'breakfast', 'noodles', 8, 'medium', 280, 3, true),
    (bistro_id, 'Cold Coffee', 'Chilled coffee with ice cream and whipped cream', 45, true, 'breakfast', 'beverages', 5, 'mild', 180, 4, true),
    
    -- Lunch
    (bistro_id, 'Margherita Pizza Slice', 'Classic pizza with tomato sauce and mozzarella', 80, true, 'lunch', 'pizza', 15, 'mild', 350, 1, true),
    (bistro_id, 'White Sauce Pasta', 'Creamy pasta with herbs and vegetables', 90, true, 'lunch', 'pasta', 20, 'mild', 480, 2, true),
    (bistro_id, 'Chicken Sandwich', 'Grilled chicken with lettuce and mayo', 70, false, 'lunch', 'sandwich', 10, 'mild', 380, 3, true),
    (bistro_id, 'Grilled Chicken', 'Herb-marinated grilled chicken with sides', 150, false, 'lunch', 'grilled', 25, 'medium', 520, 4, true),
    
    -- Dinner
    (bistro_id, 'Hakka Noodles', 'Stir-fried noodles with vegetables', 55, true, 'dinner', 'noodles', 15, 'medium', 380, 1, true),
    (bistro_id, 'Veg Manchurian', 'Deep-fried vegetable balls in tangy sauce', 65, true, 'dinner', 'chinese', 18, 'spicy', 420, 2, true),
    (bistro_id, 'Chicken Noodles', 'Stir-fried noodles with chicken and vegetables', 85, false, 'dinner', 'noodles', 20, 'medium', 480, 3, true);

    -- Add inventory data
    INSERT INTO canteen_inventory (canteen_id, item_id, stock_quantity, low_stock_threshold)
    SELECT canteen_id, id, 50, 10 FROM canteen_items WHERE canteen_id = atharva_id;
    
    INSERT INTO canteen_inventory (canteen_id, item_id, stock_quantity, low_stock_threshold)
    SELECT canteen_id, id, 30, 5 FROM canteen_items WHERE canteen_id = bistro_id;

    -- Set today's specials
    INSERT INTO daily_specials (canteen_id, item_id, special_date, is_active)
    SELECT atharva_id, id, CURRENT_DATE, true 
    FROM canteen_items 
    WHERE canteen_id = atharva_id AND name = 'Maharashtrian Thali';

    INSERT INTO daily_specials (canteen_id, item_id, special_date, is_active)
    SELECT bistro_id, id, CURRENT_DATE, true 
    FROM canteen_items 
    WHERE canteen_id = bistro_id AND name = 'Cold Coffee';

END $$;
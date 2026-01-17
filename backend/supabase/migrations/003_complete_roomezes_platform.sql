-- ====================================================
-- ROOMEZES COMPLETE PLATFORM SCHEMA
-- All modules in one migration
-- ====================================================

-- ====================================================
-- MODULE 1: PRINTING (SINGLE SHOP)
-- ====================================================

CREATE TABLE IF NOT EXISTS public.printing_shop (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    map_link TEXT,
    address TEXT,
    image_url TEXT,
    operating_hours TEXT,
    per_page_price_bw INTEGER DEFAULT 2,
    per_page_price_color INTEGER DEFAULT 5,
    location TEXT NOT NULL DEFAULT 'Main Gate',
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.printing_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    file_url TEXT,
    file_name TEXT,
    copies INTEGER NOT NULL,
    color_mode TEXT CHECK (color_mode IN ('bw', 'color')) DEFAULT 'bw',
    page_size TEXT CHECK (page_size IN ('A3', 'A4')) DEFAULT 'A4',
    sides TEXT CHECK (sides IN ('single', 'double')) DEFAULT 'single',
    total_pages INTEGER NOT NULL,
    total_cost INTEGER NOT NULL,
    delivery_location TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'printing', 'ready', 'completed', 'cancelled')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_printing_orders_user ON public.printing_orders(user_id);
CREATE INDEX idx_printing_orders_status ON public.printing_orders(status);

-- ====================================================
-- MODULE 2: LAUNDRY (MULTI-SHOP)
-- ====================================================

CREATE TABLE IF NOT EXISTS public.laundry_shops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    google_map_link TEXT,
    address TEXT,
    image_url TEXT,
    price_list JSONB, -- {"regular": 50, "express": 80, "bulk": 150}
    services TEXT, -- "washing, ironing, dry cleaning, folding"
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.laundry_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shop_id UUID REFERENCES public.laundry_shops(id) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    service_type TEXT NOT NULL, -- "regular", "express", "dry_cleaning"
    weight_kg DECIMAL(5,2),
    total_cost INTEGER NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'in_progress', 'ready', 'completed', 'cancelled')) DEFAULT 'pending',
    pickup_location TEXT,
    delivery_location TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_laundry_shops_owner ON public.laundry_shops(owner_id);
CREATE INDEX idx_laundry_orders_shop ON public.laundry_orders(shop_id);
CREATE INDEX idx_laundry_orders_user ON public.laundry_orders(user_id);
CREATE INDEX idx_laundry_orders_status ON public.laundry_orders(status);

-- ====================================================
-- MODULE 3: MESS SHOPS
-- ====================================================

CREATE TABLE IF NOT EXISTS public.mess_shops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES public.profiles(id) NOT NULL,
    image_url TEXT,
    monthly_price INTEGER NOT NULL,
    weekly_price INTEGER,
    per_meal_price INTEGER,
    phone TEXT NOT NULL,
    google_map_link TEXT,
    address TEXT,
    meals_offered TEXT, -- "breakfast,lunch,dinner"
    weekly_menu JSONB, -- {"monday": {"breakfast": "...", "lunch": "...", "dinner": "..."}}
    description TEXT,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mess_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mess_id UUID REFERENCES public.mess_shops(id) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    plan_type TEXT CHECK (plan_type IN ('monthly', 'weekly')) NOT NULL,
    total_cost INTEGER NOT NULL,
    status TEXT CHECK (status IN ('active', 'paused', 'cancelled')) DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mess_shops_owner ON public.mess_shops(owner_id);
CREATE INDEX idx_mess_subscriptions_user ON public.mess_subscriptions(user_id);
CREATE INDEX idx_mess_subscriptions_status ON public.mess_subscriptions(status);

-- ====================================================
-- MODULE 4: CANTEEN (SINGLE SHOP)
-- ====================================================

CREATE TABLE IF NOT EXISTS public.canteen_menu (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT NOT NULL, -- "snacks", "beverages", "meals", "desserts"
    item_name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image_url TEXT,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.canteen_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    items JSONB NOT NULL, -- [{"item_id": "...", "quantity": 2, "price": 50}]
    total_cost INTEGER NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    order_status TEXT CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')) DEFAULT 'pending',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_canteen_orders_user ON public.canteen_orders(user_id);
CREATE INDEX idx_canteen_orders_status ON public.canteen_orders(order_status);
CREATE INDEX idx_canteen_menu_category ON public.canteen_menu(category);

-- ====================================================
-- TRIGGERS FOR UPDATED_AT
-- ====================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_printing_shop_timestamp BEFORE UPDATE ON public.printing_shop
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_printing_orders_timestamp BEFORE UPDATE ON public.printing_orders
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_laundry_shops_timestamp BEFORE UPDATE ON public.laundry_shops
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_laundry_orders_timestamp BEFORE UPDATE ON public.laundry_orders
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_mess_shops_timestamp BEFORE UPDATE ON public.mess_shops
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_canteen_orders_timestamp BEFORE UPDATE ON public.canteen_orders
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ====================================================
-- STORAGE BUCKETS FOR IMAGES
-- ====================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('printing-files', 'printing-files', true),
    ('laundry-images', 'laundry-images', true),
    ('mess-images', 'mess-images', true),
    ('canteen-images', 'canteen-images', true)
ON CONFLICT (id) DO NOTHING;

-- ====================================================
-- SCHEMA COMPLETE
-- ====================================================

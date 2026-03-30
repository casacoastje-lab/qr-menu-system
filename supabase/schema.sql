-- QR Menu System Database Schema

-- 1. Restaurants
CREATE TABLE public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tables
CREATE TABLE public.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_number INT NOT NULL,
    qr_code_url TEXT,
    status TEXT DEFAULT 'empty' CHECK (status IN ('empty', 'occupied', 'ordering'))
);

-- 3. Table Sessions
CREATE TABLE public.table_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE,
    opened_by UUID REFERENCES auth.users(id),
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + interval '3 hours'),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'expired'))
);

-- 4. Menu Items
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    tags TEXT[],
    daily_limit INT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.table_sessions(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'ready', 'delivered')),
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Order Items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    item_notes TEXT,
    unit_price DECIMAL(10,2) NOT NULL
);

-- 7. Loyalty Accounts
CREATE TABLE public.loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    total_points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE
);

-- 8. Waiter Requests
CREATE TABLE public.waiter_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES public.tables(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiter_requests ENABLE ROW LEVEL SECURITY;

-- Setup basic RLS Policies (Allow all for rapid MVP, lock down owner_id in production)
CREATE POLICY "Public profiles are viewable by everyone." ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Public tables are viewable by everyone." ON public.tables FOR SELECT USING (true);
CREATE POLICY "Public menu items are viewable by everyone." ON public.menu_items FOR SELECT USING (true);

CREATE POLICY "Anyone can view active sessions" ON public.table_sessions FOR SELECT 
USING (status = 'active');

CREATE POLICY "Authenticated users can create sessions" ON public.table_sessions FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update sessions" ON public.table_sessions FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can read orders" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update orders" ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can read order items" ON public.order_items FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can request a waiter" ON public.waiter_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can read requests" ON public.waiter_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update requests" ON public.waiter_requests FOR UPDATE USING (auth.role() = 'authenticated');

-- Enable Realtime
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.table_sessions;
alter publication supabase_realtime add table public.waiter_requests;

-- Storage Bucket for Images
insert into storage.buckets (id, name, public) values ('food-images', 'food-images', true);
create policy "Public Access" on storage.objects for select using ( bucket_id = 'food-images' );
create policy "Auth Insert" on storage.objects for insert with check ( bucket_id = 'food-images' and auth.role() = 'authenticated' );

-- Fixes for Table Management RLS
CREATE POLICY "Authenticated users can create restaurants" ON public.restaurants FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Authenticated users can create tables" ON public.tables FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update tables" ON public.tables FOR UPDATE USING (auth.role() = 'authenticated');


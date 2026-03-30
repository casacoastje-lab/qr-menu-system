-- Supabase Seed Fake Data Script
-- Instructions: Run this script directly in your Supabase SQL Editor.

DO $$
DECLARE
    v_user_id UUID;
    v_restaurant_id UUID;
    v_table_id_1 UUID;
    v_table_id_2 UUID;
    v_session_id UUID;
    v_menu_item_1 UUID;
    v_menu_item_2 UUID;
    v_order_id UUID;
BEGIN
    -- STEP 1: Get the first registered user
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'You must create at least one user in Supabase Auth first!';
    END IF;

    -- STEP 2: Create or get restaurant linked to user
    SELECT id INTO v_restaurant_id FROM public.restaurants WHERE owner_id = v_user_id LIMIT 1;
    
    IF v_restaurant_id IS NULL THEN
        INSERT INTO public.restaurants (name, owner_id) VALUES ('L''ESSENCE DINING', v_user_id) RETURNING id INTO v_restaurant_id;
    END IF;

    -- STEP 3: Create 4 Tables
    INSERT INTO public.tables (restaurant_id, table_number, status) VALUES (v_restaurant_id, 1, 'occupied') RETURNING id INTO v_table_id_1;
    INSERT INTO public.tables (restaurant_id, table_number, status) VALUES (v_restaurant_id, 2, 'empty') RETURNING id INTO v_table_id_2;
    INSERT INTO public.tables (restaurant_id, table_number, status) VALUES (v_restaurant_id, 3, 'empty');
    INSERT INTO public.tables (restaurant_id, table_number, status) VALUES (v_restaurant_id, 4, 'empty');

    -- STEP 4: Create an Active Session for Table 1
    INSERT INTO public.table_sessions (table_id, opened_by, status) VALUES (v_table_id_1, v_user_id, 'active') RETURNING id INTO v_session_id;

    -- STEP 5: Insert Menu Items
    INSERT INTO public.menu_items (restaurant_id, category, name, description, price, image_url) 
    VALUES 
    (v_restaurant_id, 'Starters', 'Atlantic Citrus Tartare', 'Freshly caught Atlantic salmon diced with yuzu zest, avocado mousse, and toasted sesame pearls.', 24.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7VPFoRzVJG5_flKDR0-vUKK0vjMW2UwXUBfhoU4ioaFclAmSF4-sv16avsXGAwA1G4DacnIG69sp_AjPgUsVvY0UyxlIXezdKt8pl1eg3sEllLkEHKJKyDceQwhuNb8kIosI_sudH7SkvkOM7bZ6ay50z1ZrMiskmJAUG8Y4KNICklstLrDoBBZtcBN2WGCWnnkmsg3Gplw6Y_fwmu4B7pZJmx-NTK_t05OjyfOzkfqj0V5Qqk6BSUOGFLglvLodn8Xyec2ao2ZE6') RETURNING id INTO v_menu_item_1;
    
    INSERT INTO public.menu_items (restaurant_id, category, name, description, price, image_url) 
    VALUES 
    (v_restaurant_id, 'Mains', 'Truffle Burrata Flatbread', 'Hand-stretched dough topped with creamy burrata, black truffle oil, and wild forest mushrooms.', 21.50, 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6XdLA00wkwlSXxP-2AD6PEc7XmTYy2V_JQkBj5vXHDM2xTSeuN4rOZsl3D5kHhDFL34JvNM0PDmjIkdocpPDkotLVZMFpsGx0jbVUpr3s65NTGOET8Q3Iiu7A3V37LxYVr5tHLTx2iX6by8uu_rGPmJfxByPyO60Ljum5wAUegXSVf3GPdeF2dIg0l3or4712vtzqbs879ME-pWRGk17YbwOkQmoiNVFGUT9O1ZyoQOkgbDnVrQMZhrUPocjS_2d07laXbNvxIy9X') RETURNING id INTO v_menu_item_2;

    -- STEP 6: Create an Order for Table 1
    INSERT INTO public.orders (table_id, session_id, restaurant_id, status, total_price) 
    VALUES (v_table_id_1, v_session_id, v_restaurant_id, 'preparing', 45.50) RETURNING id INTO v_order_id;

    -- STEP 7: Create Order Items
    INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price) VALUES (v_order_id, v_menu_item_1, 1, 24.00);
    INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price) VALUES (v_order_id, v_menu_item_2, 1, 21.50);

    -- STEP 8: Create a Waiter Request
    INSERT INTO public.waiter_requests (table_id, restaurant_id, status) VALUES (v_table_id_1, v_restaurant_id, 'pending');

END $$;

-- ============================================
-- QR Menu System — Fake Menu Seed Data
-- Run this in your Supabase SQL Editor
-- ============================================

DO $$
DECLARE
    v_restaurant_id UUID;
BEGIN
    -- Auto-detect restaurant (the first one in your account)
    SELECT id INTO v_restaurant_id FROM public.restaurants LIMIT 1;

    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'No restaurant found! Go to /dashboard/tables first to auto-create one.';
    END IF;

    RAISE NOTICE 'Inserting menu for restaurant: %', v_restaurant_id;

    -- ==================== STARTERS ====================
    INSERT INTO public.menu_items (restaurant_id, category, name, description, price, image_url, tags, is_available) VALUES
    (v_restaurant_id, 'Starters', 'Atlantic Citrus Tartare', 'Freshly caught Atlantic salmon with yuzu zest, avocado mousse, and toasted sesame pearls.', 24.00, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', ARRAY['seafood', 'premium'], true),
    (v_restaurant_id, 'Starters', 'Truffle Burrata Flatbread', 'Hand-stretched dough with creamy burrata, black truffle oil, and wild forest mushrooms.', 21.50, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', ARRAY['vegetarian', 'popular'], true),
    (v_restaurant_id, 'Starters', 'Pan-Seared Scallops', 'Three Hokkaido scallops served over velvet cauliflower purée with crispy pancetta.', 28.00, 'https://images.unsplash.com/photo-1599794297088-9d9c6c2b4736?w=400', ARRAY['seafood', 'gluten-free'], true),
    (v_restaurant_id, 'Starters', 'Garden Tempura Medley', 'Seasonal organic vegetables in a light batter with a ginger-soy dipping reduction.', 18.00, 'https://images.unsplash.com/photo-1573225342350-16731dd9bf83?w=400', ARRAY['vegetarian', 'vegan'], true),
    (v_restaurant_id, 'Starters', 'Wagyu Beef Sliders', 'Trio of Japanese Wagyu beef sliders with caramelized onions and truffle aioli on brioche.', 32.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', ARRAY['beef', 'popular'], true);

    -- ==================== MAINS ====================
    INSERT INTO public.menu_items (restaurant_id, category, name, description, price, image_url, tags, is_available) VALUES
    (v_restaurant_id, 'Mains', 'Grilled Sea Bass', 'Wild-caught sea bass fillet grilled to perfection with lemon butter sauce and asparagus.', 38.00, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', ARRAY['seafood', 'gluten-free'], true),
    (v_restaurant_id, 'Mains', 'Dry-Aged Ribeye Steak', '220g premium dry-aged ribeye, served with roasted bone marrow and seasonal vegetables.', 58.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', ARRAY['beef', 'premium', 'popular'], true),
    (v_restaurant_id, 'Mains', 'Lobster Linguine', 'Fresh pasta tossed with butter-poached lobster, cherry tomatoes, and fresh basil.', 45.00, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', ARRAY['seafood', 'pasta'], true),
    (v_restaurant_id, 'Mains', 'Mushroom Wellington', 'Portobello and porcini mushroom duxelles wrapped in golden puff pastry with red wine jus.', 34.00, 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400', ARRAY['vegetarian', 'popular'], true),
    (v_restaurant_id, 'Mains', 'Duck Confit', 'Slow-cooked duck leg with crispy skin, cherry reduction, and roasted fingerling potatoes.', 42.00, 'https://images.unsplash.com/photo-1588347818122-d7fbcaf38c61?w=400', ARRAY['poultry', 'gluten-free'], true);

    -- ==================== DESSERTS ====================
    INSERT INTO public.menu_items (restaurant_id, category, name, description, price, image_url, tags, is_available) VALUES
    (v_restaurant_id, 'Desserts', 'Valrhona Chocolate Fondant', 'Warm dark chocolate lava cake with vanilla bean ice cream and gold leaf.', 16.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', ARRAY['chocolate', 'popular'], true),
    (v_restaurant_id, 'Desserts', 'Crème Brûlée', 'Classic French vanilla custard with a caramelized sugar crust and fresh berries.', 14.00, 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400', ARRAY['classic', 'gluten-free'], true),
    (v_restaurant_id, 'Desserts', 'Mango Panna Cotta', 'Italian silky panna cotta topped with fresh mango coulis and passion fruit.', 13.00, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', ARRAY['tropical', 'light'], true),
    (v_restaurant_id, 'Desserts', 'Pistachio Tiramisu', 'Classic Italian tiramisu with espresso-soaked savoiardi and pistachio mascarpone cream.', 15.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', ARRAY['italian', 'coffee'], true);

    -- ==================== JUICES & COLD DRINKS ====================
    INSERT INTO public.menu_items (restaurant_id, category, name, description, price, image_url, tags, is_available) VALUES
    (v_restaurant_id, 'Juices & Cold Drinks', 'Fresh Orange Juice', 'Freshly squeezed Valencia oranges, served chilled with a sprig of mint.', 7.50, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', ARRAY['fresh', 'vitamin-c'], true),
    (v_restaurant_id, 'Juices & Cold Drinks', 'Green Detox Blend', 'Spinach, green apple, cucumber, ginger, and lemon — cold-pressed daily.', 9.00, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', ARRAY['healthy', 'vegan'], true),
    (v_restaurant_id, 'Juices & Cold Drinks', 'Tropical Paradise', 'Mango, pineapple, coconut water, and passion fruit blended to perfection.', 8.50, 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400', ARRAY['tropical', 'popular'], true),
    (v_restaurant_id, 'Juices & Cold Drinks', 'Watermelon Lemonade', 'Hand-pressed watermelon juice with freshly squeezed lemon and a hint of basil.', 8.00, 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400', ARRAY['refreshing', 'summer'], true),
    (v_restaurant_id, 'Juices & Cold Drinks', 'Berry Antioxidant Smoothie', 'Blueberry, raspberry, strawberry, and acai with coconut milk and honey.', 10.00, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', ARRAY['healthy', 'berry'], true),
    (v_restaurant_id, 'Juices & Cold Drinks', 'Sparkling Mineral Water', 'Premium San Pellegrino sparkling mineral water — 750ml.', 5.00, 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=400', ARRAY['water'], true);

    -- ==================== COFFEE & HOT DRINKS ====================
    INSERT INTO public.menu_items (restaurant_id, category, name, description, price, image_url, tags, is_available) VALUES
    (v_restaurant_id, 'Coffee & Hot Drinks', 'Espresso', 'Single or double shot of our signature house blend, sourced from Ethiopia and Colombia.', 4.50, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400', ARRAY['coffee', 'classic'], true),
    (v_restaurant_id, 'Coffee & Hot Drinks', 'Flat White', 'Velvety microfoam milk poured over a double ristretto — bold and smooth.', 6.00, 'https://images.unsplash.com/photo-1577968897966-3d4325b36b02?w=400', ARRAY['coffee', 'popular'], true),
    (v_restaurant_id, 'Coffee & Hot Drinks', 'Caramel Macchiato', 'Steamed whole milk layered with vanilla syrup, espresso, and caramel drizzle.', 7.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', ARRAY['coffee', 'sweet', 'popular'], true),
    (v_restaurant_id, 'Coffee & Hot Drinks', 'Matcha Latte', 'Ceremonial grade Japanese green tea whisked with oat milk. Hot or iced.', 7.50, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400', ARRAY['tea', 'healthy', 'popular'], true),
    (v_restaurant_id, 'Coffee & Hot Drinks', 'Signature Hot Chocolate', 'Valrhona dark chocolate melted with steamed milk and topped with whipped cream.', 8.00, 'https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=400', ARRAY['chocolate', 'comfort'], true),
    (v_restaurant_id, 'Coffee & Hot Drinks', 'Chai Spice Latte', 'Handcrafted chai blend with cardamom, cinnamon, ginger, and steamed milk.', 6.50, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', ARRAY['tea', 'spiced'], true),
    (v_restaurant_id, 'Coffee & Hot Drinks', 'Cold Brew Coffee', '18-hour cold-steeped house blend served over ice with a splash of cream.', 7.00, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', ARRAY['coffee', 'cold', 'popular'], true);

    RAISE NOTICE 'Menu items inserted successfully for restaurant %!', v_restaurant_id;
END $$;

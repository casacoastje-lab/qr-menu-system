"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  tags: string[];
};

type CartItem = {
  item: MenuItem;
  quantity: number;
  notes: string;
};

type Restaurant = {
  id: string;
  name: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
};

type Table = { id: string; table_number: number; restaurant_id: string; };
type Session = { id: string; };

const CATEGORIES = ["All", "Starters", "Mains", "Desserts", "Juices & Cold Drinks", "Coffee & Hot Drinks"];
const CATEGORY_ICONS: Record<string, string> = {
  "All": "grid_view",
  "Starters": "dinner_dining",
  "Mains": "restaurant",
  "Desserts": "cake",
  "Juices & Cold Drinks": "local_bar",
  "Coffee & Hot Drinks": "coffee",
};

export default function CustomerMenuClient({
  table,
  restaurant,
  session,
  menuItems,
}: {
  table: Table;
  restaurant: Restaurant;
  session: Session;
  menuItems: MenuItem[];
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isOrderPlaced, setOrderPlaced] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"checking" | "ok" | "denied" | "skipped">("checking");
  const [search, setSearch] = useState("");

  // ===== GEOLOCATION CHECK =====
  useEffect(() => {
    if (!restaurant.latitude || !restaurant.longitude) {
      setGeoStatus("skipped");
      return;
    }
    if (!navigator.geolocation) {
      setGeoStatus("skipped");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = getDistanceKm(
          pos.coords.latitude, pos.coords.longitude,
          restaurant.latitude!, restaurant.longitude!
        );
        if (dist <= 0.3) { // 300 meters
          setGeoStatus("ok");
        } else {
          setGeoStatus("denied");
        }
      },
      () => setGeoStatus("skipped"), // Permission denied — allow for now (configurable)
      { timeout: 5000 }
    );
  }, [restaurant]);

  function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const filtered = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const grouped = filtered.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) return prev.map((c) => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { item, quantity: 1, notes: "" }];
    });
    toast.success(`${item.name} added to order!`);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const updateQty = (itemId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(itemId);
    setCart((prev) => prev.map((c) => c.item.id === itemId ? { ...c, quantity: qty } : c));
  };

  const cartTotal = cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
  const cartCount = cart.reduce((acc, c) => acc + c.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const orderRes = await supabase.from("orders").insert([{
      table_id: table.id,
      session_id: session.id,
      restaurant_id: table.restaurant_id,
      status: "received",
      total_price: cartTotal,
    }]).select().single();

    if (orderRes.error) { toast.error("Failed to place order"); return; }

    const orderItems = cart.map((c) => ({
      order_id: orderRes.data.id,
      menu_item_id: c.item.id,
      quantity: c.quantity,
      unit_price: c.item.price,
      item_notes: c.notes,
    }));
    await supabase.from("order_items").insert(orderItems);
    setCart([]);
    setCartOpen(false);
    setOrderPlaced(true);
    toast.success("Order placed! Kitchen is preparing your meal 🍽️");
  };

  const callWaiter = async () => {
    await supabase.from("waiter_requests").insert([{
      table_id: table.id,
      restaurant_id: table.restaurant_id,
      status: "pending",
    }]);
    toast.success("Waiter has been notified! They'll be with you shortly.");
  };

  // Geo deny hard-block
  if (geoStatus === "denied") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-5xl text-error">location_off</span>
        </div>
        <h1 className="text-2xl font-headline font-bold text-on-surface mb-3">You're Too Far Away</h1>
        <p className="text-on-surface-variant max-w-sm leading-relaxed">
          Our menu is only accessible from inside the restaurant. Please ensure you're at the venue to place an order.
        </p>
      </div>
    );
  }

  // Order success screen
  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-bounce">
          <span className="material-symbols-outlined text-6xl text-primary">check_circle</span>
        </div>
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-3">Order Received!</h1>
        <p className="text-on-surface-variant max-w-sm leading-relaxed mb-8">Your order has been sent to the kitchen. Sit back and relax!</p>
        <button
          onClick={() => setOrderPlaced(false)}
          className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-5 h-16">
          <div>
            <h1 className="text-lg font-headline font-bold text-on-surface">{restaurant.name}</h1>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Table {table.table_number}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={callWaiter} className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
              <span className="material-symbols-outlined">support_agent</span>
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-primary"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-32">
        {/* Search Bar */}
        <div className="px-4 pt-5 pb-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu..."
              className="w-full bg-surface-container-low rounded-full py-3 pl-12 pr-5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 px-4 overflow-x-auto py-3 pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{CATEGORY_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Sections */}
        <div className="px-4 mt-4 space-y-8">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 block">search_off</span>
              <p>No items found in this category</p>
            </div>
          ) : Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <h2 className="font-headline font-bold text-base text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">{CATEGORY_ICONS[category] || "category"}</span>
                {category}
                <span className="text-xs text-outline font-normal ml-auto">{items.length} items</span>
              </h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const cartItem = cart.find((c) => c.item.id === item.id);
                  return (
                    <div key={item.id} className="flex gap-4 bg-white rounded-2xl p-3 shadow-sm border border-transparent hover:border-primary/10 transition-all duration-300">
                      <div className="w-28 h-28 flex-none rounded-xl overflow-hidden bg-surface-container-low">
                        {item.image_url && (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                        <div>
                          <h3 className="font-headline font-bold text-sm leading-tight">{item.name}</h3>
                          <p className="text-on-surface-variant text-xs line-clamp-2 leading-relaxed mt-1">{item.description}</p>
                          {item.tags?.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {item.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-secondary-container text-on-secondary-container rounded-full font-bold uppercase">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-headline font-extrabold text-primary">${Number(item.price).toFixed(2)}</span>
                          {cartItem ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQty(item.id, cartItem.quantity - 1)} className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-bold">-</button>
                              <span className="font-bold w-4 text-center text-sm">{cartItem.quantity}</span>
                              <button onClick={() => updateQty(item.id, cartItem.quantity + 1)} className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold">+</button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(item)} className="w-9 h-9 bg-primary text-on-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-transform">
                              <span className="material-symbols-outlined text-lg">add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Floating Cart Bar */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-slate-950 text-white rounded-2xl p-4 flex justify-between items-center shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white">shopping_cart</span>
              </div>
              <span className="font-semibold">View Order ({cartCount} items)</span>
            </div>
            <span className="font-headline font-extrabold text-lg">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-headline font-bold">Your Order</h2>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="space-y-4">
              {cart.map((c) => (
                <div key={c.item.id} className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container-low flex-none">
                    {c.item.image_url && <img src={c.item.image_url} alt={c.item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{c.item.name}</p>
                    <p className="text-primary font-bold">${(c.item.price * c.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(c.item.id, c.quantity - 1)} className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-bold">-</button>
                    <span className="font-bold w-4 text-center">{c.quantity}</span>
                    <button onClick={() => updateQty(c.item.id, c.quantity + 1)} className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant/20 space-y-4">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-headline font-bold">${cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={placeOrder}
                className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
              >
                Place Order • ${cartTotal.toFixed(2)}
              </button>
              <button onClick={callWaiter} className="w-full bg-surface-container-low py-3 rounded-2xl font-medium text-on-surface flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">support_agent</span>
                Call Waiter Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

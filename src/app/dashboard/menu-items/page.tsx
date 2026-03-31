"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { toast } from "sonner";

type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  tags: string[];
  is_available: boolean;
};

const CATEGORIES = ["All", "Starters", "Mains", "Desserts", "Juices & Cold Drinks", "Coffee & Hot Drinks"];

const CATEGORY_ICONS: Record<string, string> = {
  "All": "grid_view",
  "Starters": "dinner_dining",
  "Mains": "restaurant",
  "Desserts": "cake",
  "Juices & Cold Drinks": "local_bar",
  "Coffee & Hot Drinks": "coffee",
};

export default function MenuItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: rest } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!rest) {
      toast.error("No restaurant found. Please go to Tables first.");
      setLoading(false);
      return;
    }

    setRestaurantId(rest.id);

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", rest.id)
      .order("category")
      .order("name");

    if (error) {
      toast.error("Failed to load menu items");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const toggleAvailability = async (item: MenuItem) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !item.is_available })
      .eq("id", item.id);

    if (error) {
      toast.error("Failed to update availability");
    } else {
      toast.success(`${item.name} marked as ${!item.is_available ? "available" : "unavailable"}`);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    }
  };

  const filtered = activeCategory === "All" ? items : items.filter(i => i.category === activeCategory);
  const grouped = filtered.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Menu Management</h3>
          <p className="text-on-surface-variant font-body mt-1">
            {items.length} items across {Object.keys(grouped).length} categories
          </p>
        </div>
        <button className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95">
          <span className="material-symbols-outlined">add_circle</span>
          Add Item
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-base">{CATEGORY_ICONS[cat]}</span>
            {cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-5xl text-primary">loop</span>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">restaurant_menu</span>
          <h4 className="text-xl font-headline font-bold text-on-surface mb-2">No Menu Items Found</h4>
          <p className="text-on-surface-variant max-w-sm">Run the <code className="bg-surface-container-high px-2 py-0.5 rounded text-sm">supabase/seed_menu.sql</code> script in your Supabase SQL Editor to add demo items!</p>
        </div>
      ) : (
        /* Grouped Menu Sections */
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">{CATEGORY_ICONS[category] || "category"}</span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-lg text-on-surface">{category}</h4>
                  <p className="text-xs text-on-surface-variant">{categoryItems.length} items</p>
                </div>
                <div className="ml-auto h-px flex-1 bg-outline-variant/20"></div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-200 hover:shadow-md group ${
                      item.is_available ? "border-outline-variant/10" : "border-dashed border-outline-variant/40 opacity-60"
                    }`}
                  >
                    {/* Item Image */}
                    <div className="relative h-36 bg-surface-container-low overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-outline-variant">image_not_supported</span>
                        </div>
                      )}
                      {/* Availability Badge */}
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        item.is_available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {item.is_available ? "Available" : "86'd"}
                      </div>
                    </div>

                    {/* Item Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h5 className="font-headline font-bold text-on-surface leading-tight">{item.name}</h5>
                        <span className="font-headline font-extrabold text-primary text-lg shrink-0">${Number(item.price).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">{item.description}</p>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-outline-variant/10">
                        <button
                          onClick={() => toggleAvailability(item)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                            item.is_available
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {item.is_available ? "visibility_off" : "visibility"}
                          </span>
                          {item.is_available ? "86 Item" : "Restore"}
                        </button>
                        <button className="px-3 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-lg text-xs font-bold text-on-surface transition-colors">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

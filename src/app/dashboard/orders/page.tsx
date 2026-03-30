"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Order = {
  id: string;
  status: "received" | "preparing" | "ready" | "delivered";
  total_price: number;
  created_at: string;
  tables: { table_number: number } | null;
  order_items: { quantity: number; menu_items: { name: string } | null }[];
};

const STATUS_CONFIG = {
  received:  { label: "Received",  color: "bg-blue-100 text-blue-700",   icon: "inbox",         next: "preparing" },
  preparing: { label: "Preparing", color: "bg-amber-100 text-amber-700", icon: "skillet",       next: "ready"     },
  ready:     { label: "Ready",     color: "bg-green-100 text-green-700", icon: "check_circle",  next: "delivered" },
  delivered: { label: "Delivered", color: "bg-slate-100 text-slate-500", icon: "done_all",      next: null        },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "received" | "preparing" | "ready">("all");

  useEffect(() => {
    fetchOrders();

    // Realtime subscription
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: rest } = await supabase.from("restaurants").select("id").eq("owner_id", user.id).single();
    if (!rest) { setLoading(false); return; }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("orders")
      .select(`
        id, status, total_price, created_at,
        tables(table_number),
        order_items(quantity, menu_items(name))
      `)
      .eq("restaurant_id", rest.id)
      .gte("created_at", today.toISOString())
      .neq("status", "delivered")
      .order("created_at", { ascending: false });

    setOrders((data as any) || []);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, nextStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: nextStatus }).eq("id", orderId);
    if (error) {
      toast.error("Failed to update order status");
    } else {
      toast.success(`Order marked as "${nextStatus}"`);
      fetchOrders();
    }
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const counts = {
    received:  orders.filter(o => o.status === "received").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    ready:     orders.filter(o => o.status === "ready").length,
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Live Orders</h3>
          <p className="text-on-surface-variant font-body mt-1">Real-time kitchen management — updates automatically</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live Realtime
        </div>
      </div>

      {/* Status KPI Chips */}
      <div className="grid grid-cols-3 gap-4">
        {(["received", "preparing", "ready"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(filter === status ? "all" : status)}
            className={`p-4 rounded-2xl text-left transition-all ${filter === status ? "ring-2 ring-primary" : ""} ${STATUS_CONFIG[status].color} bg-opacity-50`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{STATUS_CONFIG[status].label}</p>
            <p className="text-3xl font-headline font-bold mt-1">{counts[status]}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-5xl text-primary">loop</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-outline-variant/30 rounded-2xl">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">receipt_long</span>
          <h4 className="text-xl font-headline font-bold text-on-surface mb-2">No Active Orders</h4>
          <p className="text-on-surface-variant">Orders will appear here in real-time as customers place them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            const tNum = order.tables ? (Array.isArray(order.tables) ? order.tables[0]?.table_number : order.tables.table_number) : "?";
            return (
              <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-on-surface-variant">Table</p>
                    <p className="text-2xl font-headline font-extrabold text-on-surface">
                      {String(tNum).padStart(2, "0")}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${cfg.color}`}>
                    <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
                    {cfg.label}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1.5 border-t border-b border-outline-variant/10 py-3">
                  {(Array.isArray(order.order_items) ? order.order_items : []).map((oi: any, i: number) => {
                    const itemName = oi.menu_items?.name || "Unknown item";
                    return (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">{itemName}</span>
                        <span className="font-bold text-on-surface">×{oi.quantity}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-on-surface-variant">{timeAgo(order.created_at)}</p>
                    <p className="font-headline font-bold text-primary">${Number(order.total_price).toFixed(2)}</p>
                  </div>
                  {cfg.next && (
                    <button
                      onClick={() => updateStatus(order.id, cfg.next!)}
                      className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      Mark {STATUS_CONFIG[cfg.next as keyof typeof STATUS_CONFIG]?.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

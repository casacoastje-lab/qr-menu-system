import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DashboardOverviewPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: restData, error: restError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  const restId = restData?.id;

  if (!restId) {
     return (
        <div className="p-10 border-2 border-dashed border-outline-variant/30 rounded-2xl flex items-center justify-center text-center flex-col">
          <p className="text-outline text-lg font-bold mb-2">No Restaurant Connected to your Account.</p>
          <p className="text-outline text-sm">Please click "Tables" on the left menu to automatically generate one, OR ensure the fake data script targeted the exact email you are logged in with.</p>
        </div>
     );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parallelize data fetching to fix the slow page load (Waterfall issue)
  const [
    { count: activeSessionsCount },
    { count: totalSessionsCount },
    { data: todayOrders },
    { data: pendingRequests }
  ] = await Promise.all([
    supabase
      .from("table_sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
      
    supabase
      .from("tables")
      .select("*", { count: "exact", head: true })
      .eq("restaurant_id", restId),
      
    supabase
      .from("orders")
      .select("total_price, status, created_at, tables(table_number), id")
      .eq("restaurant_id", restId)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false }),
      
    supabase
      .from("waiter_requests")
      .select("created_at, tables(table_number)")
      .eq("restaurant_id", restId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
  ]);

  const totalRevenue = todayOrders?.reduce((acc, order) => acc + Number(order.total_price), 0) || 0;
  const activeOrdersCount = todayOrders?.length || 0;

  return (
    <div className="space-y-10">
      {/* Summary Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Large Highlight Card */}
        <div className="md:col-span-6 lg:col-span-5 bg-primary-container rounded-[2rem] p-8 text-on-primary-container relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-lg">
          <div className="relative z-10">
            <p className="font-label text-sm uppercase tracking-widest opacity-80 mb-1">Revenue Today</p>
            <h2 className="font-headline text-5xl font-extrabold tracking-tighter">${totalRevenue.toFixed(2)}</h2>
          </div>
          <div className="flex items-center gap-2 relative z-10 mt-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white">Live Calculation</span>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Secondary Summary Grid */}
        <div className="md:col-span-6 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-surface-container-low rounded-[2rem] p-8 flex flex-col justify-between shadow-sm border border-outline-variant/10 hover:bg-surface-container-high transition-colors">
            <div>
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">Total Orders Today</p>
              <h3 className="font-headline text-4xl font-bold text-on-surface">{activeOrdersCount}</h3>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-[2rem] p-8 flex flex-col justify-between shadow-sm border border-outline-variant/10 hover:bg-surface-container-high transition-colors">
            <div>
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">Active Tables</p>
              <h3 className="font-headline text-4xl font-bold text-on-surface">
                 {activeSessionsCount || 0}/{totalSessionsCount || 0}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Waiter Requests */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-headline text-xl font-bold">Waiter Requests</h3>
          </div>
          <div className="space-y-4">
             {(!pendingRequests || pendingRequests.length === 0) ? (
                <div className="text-sm text-outline px-2 p-4 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40">No pending requests</div>
             ) : (pendingRequests as any[]).map((req, i) => {
                // Ensure typescript doesn't fail if tables is an array or object from Postgrest
                const tables = req.tables;
                const tNum = tables ? (Array.isArray(tables) ? tables[0]?.table_number : (tables as any).table_number) : '?';
                return (
                <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border-l-4 border-tertiary shadow-sm flex items-start gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-on-surface">Table {tNum} <span className="text-on-surface-variant font-normal">requested</span> Service</p>
                  </div>
               </div>
                )
             })}
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-headline text-xl font-bold">Recent Orders</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {(!todayOrders || todayOrders.length === 0) ? (
                 <div className="text-sm text-outline px-2 p-4 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40">No orders today yet.</div>
             ) : (todayOrders as any[]).map((order) => {
                const tables = order.tables;
                const tNum = tables ? (Array.isArray(tables) ? tables[0]?.table_number : (tables as any).table_number) : '?';
                return (
                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col justify-between min-h-[140px]">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-bold text-on-surface">Order ...{order.id.toString().slice(-4)}</span>
                    <span className="text-xs font-bold text-primary">${Number(order.total_price).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-800">T{tNum}</div>
                    <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase">{order.status}</span>
                  </div>
                </div>
                )
             })}
          </div>
        </div>
      </div>
    </div>
  );
}

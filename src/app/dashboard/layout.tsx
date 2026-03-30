import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch user profile/restaurant info if needed here

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-screen w-64 border-r-0 bg-slate-50 dark:bg-slate-950 p-4 font-manrope text-sm font-medium z-50">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined">restaurant</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-800 dark:text-blue-300 leading-tight">The Digital Maître D’</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Premium Management</p>
          </div>
        </div>
        
        <Link href="/dashboard/orders" className="mb-8 w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 duration-150 shadow-md hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined text-sm">add</span>
          New Order
        </Link>
        
        <nav className="flex-1 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            Home
          </Link>
          <Link href="/dashboard/orders" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
            <span className="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
            Orders
          </Link>
          <Link href="/dashboard/tables" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
            <span className="material-symbols-outlined" data-icon="table_restaurant">table_restaurant</span>
            Tables
          </Link>
          <Link href="/dashboard/menu-items" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
            <span className="material-symbols-outlined" data-icon="restaurant_menu">restaurant_menu</span>
            Menu
          </Link>
          <Link href="/dashboard/analytics" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
            <span className="material-symbols-outlined" data-icon="leaderboard">leaderboard</span>
            Analytics
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
            <span className="material-symbols-outlined" data-icon="settings">settings</span>
            Settings
          </Link>
        </nav>
        
        <div className="mt-auto p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">
            {user.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-on-surface truncate">{user.email}</p>
            <p className="text-xs text-on-surface-variant truncate">Manager</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        {/* TopNavBar — centered search only */}
        <header className="w-full h-16 sticky top-0 z-40 bg-white/80 backdrop-blur-xl flex items-center justify-center px-6 border-b border-slate-100/80">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input
              className="w-full bg-surface-container-low rounded-full py-2.5 pl-11 pr-5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
              placeholder="Search tables, orders, items..."
              type="text"
            />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-end pb-safe px-4 h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] font-inter text-[10px] uppercase tracking-widest">
        <Link className="text-slate-400 flex flex-col items-center py-2 active:scale-90 transition-all" href="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span>Home</span>
        </Link>
        <Link className="bg-primary text-white rounded-full p-3 -mt-6 shadow-lg active:scale-90 transition-all flex flex-col items-center" href="/dashboard/orders">
          <span className="material-symbols-outlined">receipt_long</span>
          <span>Orders</span>
        </Link>
        <Link className="text-slate-400 flex flex-col items-center py-2 active:scale-90 transition-all" href="/dashboard/tables">
          <span className="material-symbols-outlined">table_restaurant</span>
          <span>Tables</span>
        </Link>
        <Link className="text-slate-400 flex flex-col items-center py-2 active:scale-90 transition-all" href="/dashboard/menu-items">
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span>Menu</span>
        </Link>
      </nav>
    </div>
  );
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import CustomerMenuClient from "./CustomerMenuClient";

export const dynamic = 'force-dynamic';

export default async function MenuPage({
  params,
}: {
  params: { tableId: string };
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

  // 1. Fetch Table and associated Restaurant
  const { data: tableData, error: tableError } = await supabase
    .from("tables")
    .select(`
      *,
      restaurants (
        id, name, logo_url, address, latitude, longitude
      )
    `)
    .eq("id", params.tableId)
    .single();

  if (tableError || !tableData) {
    return notFound();
  }

  // 2. Verify Active Session
  const { data: sessionData } = await supabase
    .from("table_sessions")
    .select("*")
    .eq("table_id", params.tableId)
    .eq("status", "active")
    .single();

  // 3. Fetch Menu Items for this restaurant
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", tableData.restaurant_id)
    .eq("is_available", true);

  // If no active session, show a locked screen
  if (!sessionData) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">lock</span>
        <h1 className="text-2xl font-headline font-bold text-on-surface mb-2">Table is Closed</h1>
        <p className="text-on-surface-variant max-w-sm">
          There is no active ordering session for this table. Please ask your waiter to open the table session.
        </p>
      </div>
    );
  }

  return (
    <CustomerMenuClient
      table={tableData as any}
      restaurant={tableData.restaurants as any}
      session={sessionData}
      menuItems={menuItems || []}
    />
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";

type Table = {
  id: string;
  table_number: number;
  status: "empty" | "occupied" | "ordering";
};

type Session = {
  id: string;
  table_id: string;
  status: "active" | "closed" | "expired";
  opened_at: string;
  opened_by: string;
  // Let's assume we can calculate active duration
};

export default function TablesClient() {
  const [tables, setTables] = useState<Table[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // QR Modal State
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isQrModalOpen, setQrModalOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime sessions changes
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "table_sessions" },
        (payload) => {
          fetchData(); // Simplest way to keep fresh on MVP
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 2. Get restaurant for this user
    const { data: restData } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    let restId = restData?.id;

    // If no restaurant exists (first time setup), auto-create one
    if (!restId) {
      const { data: newRest, error: createError } = await supabase
        .from("restaurants")
        .insert([{ owner_id: user.id, name: "My Restaurant" }])
        .select()
        .single();
        
      if (createError) {
        toast.error("Failed to create default restaurant");
        return;
      }
      restId = newRest.id;
    }

    setRestaurantId(restId);

    // 3. Fetch Tables
    const { data: tablesData } = await supabase
      .from("tables")
      .select("*")
      .eq("restaurant_id", restId)
      .order("table_number", { ascending: true });

    if (tablesData) setTables(tablesData);

    // 4. Fetch Active Sessions
    const { data: sessionsData } = await supabase
      .from("table_sessions")
      .select("*")
      .eq("status", "active");

    if (sessionsData) setSessions(sessionsData);
    
    setLoading(false);
  };

  const activeTablesCount = tables.filter((t) =>
    sessions.some((s) => s.table_id === t.id && s.status === "active")
  ).length;

  const handleAddTable = async () => {
    if (!restaurantId) return;
    const nextTableNumber = tables.length > 0 ? Math.max(...tables.map(t => t.table_number)) + 1 : 1;
    
    const { error } = await supabase
      .from("tables")
      .insert([{ restaurant_id: restaurantId, table_number: nextTableNumber, status: "empty" }]);
      
    if (error) {
      toast.error("Failed to add table");
    } else {
      toast.success(`Table ${nextTableNumber} added`);
      fetchData();
    }
  };

  const handleOpenSession = async (tableId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("table_sessions")
      .insert([{ table_id: tableId, opened_by: user?.id, status: "active" }]);

    if (error) {
       toast.error("Failed to open session");
    } else {
       await supabase.from("tables").update({ status: "occupied" }).eq("id", tableId);
       toast.success("Session opened successfully");
       // Optimistic update handled by realtime or fetch
       fetchData();
    }
  };

  const handleCloseSession = async (tableId: string) => {
    const activeSession = sessions.find((s) => s.table_id === tableId);
    if (!activeSession) return;

    const { error } = await supabase
      .from("table_sessions")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", activeSession.id);

    if (error) {
      toast.error("Failed to close session");
    } else {
      await supabase.from("tables").update({ status: "empty" }).eq("id", tableId);
      toast.success("Session closed");
      fetchData();
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `table_${selectedTable?.table_number}_qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const formatElapsedTime = (openedAt: string) => {
    const diff = new Date().getTime() - new Date(openedAt).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 sm:mt-0 mb-8 max-sm:hidden">
         {/* Offset title spacing on desktop since it was in server component */}
      </div>
      
      {/* Dashboard Stats Tonal Layering */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4 sm:mt-0">
        <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary shadow-sm">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Occupancy Rate</p>
          <p className="text-4xl font-headline font-bold text-primary">
            {tables.length > 0 ? Math.round((activeTablesCount / tables.length) * 100) : 0}%
          </p>
          <div className="mt-4 w-full bg-outline-variant/20 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-500 rounded-full" 
              style={{ width: `${tables.length > 0 ? (activeTablesCount / tables.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl shadow-sm">
          <div className="w-full flex justify-between items-start">
             <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Active Tables</p>
                <p className="text-4xl font-headline font-bold text-on-surface">{activeTablesCount} / {tables.length}</p>
             </div>
             <button onClick={handleAddTable} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-xl shadow-primary/10 hover:opacity-90 transition-all active:scale-95 text-sm">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Add Table
             </button>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Avg. Session</p>
          <p className="text-4xl font-headline font-bold text-on-surface">--<span className="text-lg font-medium text-outline">min</span></p>
          <p className="text-xs text-on-surface-variant font-medium mt-2">More data needed</p>
        </div>
      </div>

      {loading && tables.length === 0 ? (
         <div className="flex items-center justify-center py-20">
             <span className="material-symbols-outlined animate-spin text-4xl text-primary">loop</span>
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => {
            const activeSession = sessions.find((s) => s.table_id === table.id);
            const isOccupied = !!activeSession;

            return (
              <div 
                key={table.id} 
                className={`p-5 rounded-xl flex flex-col gap-4 transition-all duration-300 ${
                  isOccupied 
                    ? "bg-surface-container-lowest border border-outline-variant/10 shadow-md" 
                    : "bg-surface-container-low/50 border border-dashed border-outline-variant/40 opacity-80"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isOccupied ? 'text-outline' : 'text-outline-variant'}`}>Table</span>
                    <h4 className={`text-2xl font-headline font-bold ${isOccupied ? 'text-on-surface' : 'text-outline'}`}>
                      {table.table_number.toString().padStart(2, '0')}
                    </h4>
                  </div>
                  {isOccupied ? (
                    <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      Occupied
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant text-[10px] font-bold uppercase tracking-wide">
                      Empty
                    </span>
                  )}
                </div>

                {isOccupied ? (
                  <div className="space-y-3 py-2 flex-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        Session Time
                      </span>
                      <span className="font-bold text-primary font-headline">
                        {formatElapsedTime(activeSession.opened_at)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
                    <span className="material-symbols-outlined text-outline-variant text-4xl mb-2">deck</span>
                    <p className="text-xs text-outline font-medium italic">Available for guests</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button 
                    onClick={() => {
                        setSelectedTable(table);
                        setQrModalOpen(true);
                    }}
                    className="bg-surface-container-high py-2 rounded-lg text-xs font-bold text-on-surface hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">qr_code_2</span>
                    QR
                  </button>
                  {isOccupied ? (
                    <button 
                      onClick={() => handleCloseSession(table.id)}
                      className="bg-error-container/30 text-error py-2 rounded-lg text-xs font-bold hover:bg-error-container/50 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">lock</span>
                      Close
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleOpenSession(table.id)}
                      className="bg-primary text-on-primary py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      Open
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Dialog Overlay */}
      {isQrModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <div className="p-6 flex flex-col items-center text-center space-y-6">
              <div className="w-full flex justify-between items-center mb-2">
                <h5 className="text-xl font-headline font-bold text-on-surface">Generate Table QR</h5>
                <button 
                  onClick={() => setQrModalOpen(false)}
                  className="text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="relative group" ref={qrRef}>
                <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-xl group-hover:bg-primary/10 transition-all"></div>
                <div className="relative bg-white p-6 rounded-2xl shadow-inner border border-outline-variant/20 flex flex-col items-center">
                  
                  {/* Actual QR Code Rendering */}
                  <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-lg border-2 border-slate-200 overflow-hidden">
                     {/* The domain should be window.location.origin but we'll simulate the route */}
                     {typeof window !== "undefined" && (
                         <QRCodeCanvas 
                            value={`${window.location.origin}/menu/${selectedTable.id}`} 
                            size={180} 
                            fgColor="#191c1e" 
                            level="M" 
                            includeMargin={false}
                         />
                     )}
                  </div>

                  <div className="mt-4 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Scanning for</span>
                    <span className="text-2xl font-black font-headline text-on-surface">TABLE {selectedTable.table_number.toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 w-full">
                <p className="text-sm text-on-surface-variant font-medium">Use this QR code to access the digital menu from this specific table.</p>
                <div className="flex gap-3">
                  <button 
                    onClick={downloadQR}
                    className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Download PNG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

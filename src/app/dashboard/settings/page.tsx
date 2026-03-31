"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Restaurant = {
  id: string;
  name: string;
  address: string;
  logo_url: string;
  latitude: number | null;
  longitude: number | null;
};

export default function SettingsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [form, setForm] = useState({ name: "", address: "", latitude: "", longitude: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserEmail(user.email || "");

    const { data } = await supabase.from("restaurants").select("*").eq("owner_id", user.id).single();
    if (data) {
      setRestaurant(data);
      setForm({
        name: data.name || "",
        address: data.address || "",
        latitude: data.latitude?.toString() || "",
        longitude: data.longitude?.toString() || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!restaurant) return;
    setSaving(true);
    const { error } = await supabase
      .from("restaurants")
      .update({
        name: form.name,
        address: form.address,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      })
      .eq("id", restaurant.id);

    setSaving(false);
    if (error) { toast.error("Failed to save settings"); }
    else { toast.success("Settings saved!"); }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success("Location detected and set!");
      },
      () => toast.error("Location permission denied")
    );
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <h3 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Settings</h3>
        <p className="text-on-surface-variant font-body mt-1">Manage your restaurant profile and system preferences.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-5xl text-primary">loop</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Restaurant Info */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-outline-variant/10 space-y-6">
            <h4 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">storefront</span>
              Restaurant Profile
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Restaurant Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="L'ESSENCE DINING"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="123 Gourmet Avenue, City"
                />
              </div>
            </div>
          </div>

          {/* Geolocation Settings */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-outline-variant/10 space-y-6">
            <h4 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              Restaurant Location
            </h4>
            <p className="text-sm text-on-surface-variant -mt-2">
              Set your GPS coordinates so customers can only order from within your restaurant (within 300m radius).
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Latitude</label>
                <input
                  value={form.latitude}
                  onChange={(e) => setForm(f => ({ ...f, latitude: e.target.value }))}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="e.g. 48.858844"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Longitude</label>
                <input
                  value={form.longitude}
                  onChange={(e) => setForm(f => ({ ...f, longitude: e.target.value }))}
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="e.g. 2.294351"
                />
              </div>
            </div>

            <button
              onClick={handleDetectLocation}
              className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 px-4 py-2.5 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-sm">my_location</span>
              Auto-detect my current location
            </button>
          </div>

          {/* Account */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-outline-variant/10 space-y-4">
            <h4 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">manage_accounts</span>
              Account
            </h4>
            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-on-surface">{userEmail}</p>
                <p className="text-xs text-on-surface-variant">Restaurant Manager</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm font-bold text-error bg-error/5 hover:bg-error/10 px-4 py-2.5 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <><span className="material-symbols-outlined animate-spin">loop</span> Saving...</>
            ) : (
              <><span className="material-symbols-outlined">save</span> Save Settings</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

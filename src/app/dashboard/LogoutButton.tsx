"use client";

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function LogoutButton() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed", { description: error.message });
    } else {
      toast.success("Successfully logged out");
      // Use window.location.href for a hard redirect to clear all cookies & state
      window.location.href = "/auth";
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-lg transition-colors w-full text-left"
    >
      <span className="material-symbols-outlined text-sm">logout</span>
      <span>Sign Out</span>
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      toast.error("Failed to sign in", { description: error.message });
    } else if (data.session) {
      toast.success("Successfully signed in!");
      router.push("/dashboard");
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Decoration (Architectural Philosophy) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] rounded-full bg-primary-fixed/30 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-secondary-container/20 blur-[120px]"></div>
      </div>

      <main className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
         {/* Logo & Branding Section */}
         <div className="text-center mb-10 w-full">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-container mb-6 shadow-xl shadow-primary/10">
                {/* Fallback to text icon for now if Material Symbols aren't directly loaded, though they are in our globals. Or we can just use lucid react */}
                <span className="material-symbols-outlined text-on-primary text-3xl">restaurant_menu</span>
            </div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-background">Sign In to Dashboard</h1>
            <p className="text-on-surface-variant font-body mt-2 text-sm">Welcome back to The Digital Maître D’</p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white/80 backdrop-blur-[12px] rounded-xl p-8 shadow-[0_20px_40px_rgba(25,28,30,0.06)] border border-surface-container-highest/20">
            <form onSubmit={handleLogin} className="space-y-6">
                
                {/* Error State */}
                {error && (
                    <div className="bg-error-container/30 border-l-4 border-error p-4 rounded-lg flex items-center gap-3">
                        <span className="material-symbols-outlined text-error text-lg">error</span>
                        <p className="text-on-error-container text-xs font-medium">{error}</p>
                    </div>
                )}

                {/* Input Groups */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold px-1">Email Address</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg transition-colors group-focus-within:text-primary">mail</span>
                            <input 
                                type="email" 
                                id="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all font-body text-sm" 
                                placeholder="chef@restaurant.com" 
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                            <label htmlFor="password" className="block font-label text-[11px] uppercase tracking-widest text-on-surface-variant font-semibold">Password</label>
                        </div>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg transition-colors group-focus-within:text-primary">lock</span>
                            <input 
                                type="password" 
                                id="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/50 transition-all font-body text-sm" 
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>
                </div>

                {/* Login Action */}
                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-primary-container hover:bg-primary text-on-primary font-headline font-bold py-4 rounded-lg shadow-lg shadow-primary-container/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <span>{loading ? "Signing in..." : "Login"}</span>
                        <span className="material-symbols-outlined text-lg">login</span>
                    </button>
                </div>
            </form>

            <div className="mt-8 pt-6 border-t border-surface-container-highest/50">
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-label tracking-tight">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">verified_user</span>
                        <span>Secure SSL Encryption</span>
                    </div>
                    <span className="opacity-50">v2.4.0</span>
                </div>
            </div>
        </div>

      </main>
      
      {/* Footer Identity */}
      <footer className="absolute bottom-8 w-full text-center z-10">
        <div className="flex items-center justify-center gap-2 opacity-60 grayscale hover:grayscale-0 transition-all cursor-default">
            <span className="font-headline font-black text-xs tracking-tighter text-on-background">Maitre D' SaaS</span>
            <span className="w-1 h-1 rounded-full bg-outline"></span>
            <span className="font-body text-[10px] uppercase tracking-widest font-bold">Premium Management</span>
        </div>
      </footer>
    </div>
  );
}

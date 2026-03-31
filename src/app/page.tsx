import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface overflow-x-hidden relative">
      {/* Background Orbs (Material 3 Aesthetic) */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-container/10 blur-[120px] pointer-events-none"></div>

      {/* Header/Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-2xl">restaurant_menu</span>
          </div>
          <span className="font-headline font-black text-xl tracking-tight text-on-background">Digital Maître D’</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/auth" 
            className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors px-4 py-2"
          >
            Log In
          </Link>
          <Link 
            href="/dashboard" 
            className="bg-primary text-on-primary px-6 py-3 rounded-full text-sm font-bold shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 pt-20 pb-24 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container/20 rounded-full mb-8 border border-secondary-container/30">
          <span className="material-symbols-outlined text-sm text-on-secondary-container">verified</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-on-secondary-container">Version 2.4.0 Live</span>
        </div>
        
        <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter text-on-background mb-6 leading-[1.05]">
          The Future of Dining Is <br />
          <span className="text-primary tracking-tight">QR-Powered & Instant.</span>
        </h1>
        
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg mb-12 leading-relaxed">
          Premium digital ordering for modern restaurants. Give your guests the luxury of 
          ordering from their own device, while your staff manages everything from a single, 
          live-synced dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto bg-primary text-on-primary px-10 py-5 rounded-2xl font-headline font-black text-lg shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span>Enter Dashboard</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
          <button className="w-full sm:w-auto px-10 py-5 rounded-2xl font-headline font-black text-lg border border-outline-variant/30 hover:bg-surface-container-low transition-all">
            See the Demo
          </button>
        </div>
      </header>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm hover:shadow-xl hover:bg-white/60 transition-all duration-300">
            <div className="w-14 h-14 bg-tertiary-fixed rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-tertiary/10">
              <span className="material-symbols-outlined text-on-tertiary-fixed text-3xl">qr_code_2</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-3">Dynamic QR Codes</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Generate unique QR codes for every table. Track usage, active sessions, and open tabs in real-time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm hover:shadow-xl hover:bg-white/60 transition-all duration-300">
            <div className="w-14 h-14 bg-primary-fixed rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
              <span className="material-symbols-outlined text-on-primary-fixed text-3xl">dashboard_customize</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-3">Staff Dashboard</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Beautifully designed Material 3 dashboard for managing orders, menu items, and waiter requests.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm hover:shadow-xl hover:bg-white/60 transition-all duration-300">
            <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-secondary/10">
              <span className="material-symbols-outlined text-on-secondary-container text-3xl">bolt</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-3">Supabase Powered</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Built on a lightning-fast real-time architecture. Never miss an order or a waiter call with live sync.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="relative z-10 py-12 px-6 border-t border-outline-variant/10 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <span className="font-headline font-black text-xs tracking-tighter text-on-background uppercase">The Digital Maître D’</span>
            <span className="w-1 h-1 rounded-full bg-outline"></span>
            <span className="font-body text-[10px] uppercase tracking-widest font-bold">Premium SaaS Solutions</span>
          </div>
          <p className="text-[10px] text-outline uppercase tracking-widest font-medium">Built with Advanced Agentic Coding by Antigravity</p>
        </div>
      </footer>
    </div>
  );
}

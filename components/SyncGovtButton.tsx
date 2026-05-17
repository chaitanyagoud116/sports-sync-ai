"use client";

import { useState } from "react";
import { Globe, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SyncGovtButton() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      if (res.ok) {
        setSuccess(true);
        router.refresh(); // Tells Next.js to re-fetch the Server Component data (KPIs)
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSync}
      disabled={loading || success}
      className="glass-card p-5 hover:border-white/15 transition-all relative overflow-hidden flex flex-col justify-start items-start text-left w-full h-full"
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/20 blur-xl rounded-full pointer-events-none"></div>
      
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 relative z-10"
        style={{ background: `rgba(236,72,153,0.1)`, color: "#ec4899" }}>
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? <Check className="w-5 h-5 text-emerald-700" /> : <Globe className="w-5 h-5" />}
      </div>
      
      <div className="relative z-10">
        <div className="text-sm font-medium text-primary">
          {success ? "Sync Complete!" : "Sync Govt Ed. Database"}
        </div>
        <div className="text-[10px] mt-1 text-pink-400">Solves Cold Start</div>
      </div>
    </button>
  );
}

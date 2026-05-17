import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 hero-bg" style={{ background: "#0a0e1a" }}>
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10"
          style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 0 40px rgba(37,99,235,0.4)" }}>
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
      </div>
      <h2 className="text-xl font-bold text-primary mb-2 animate-pulse">Syncing...</h2>
      <p className="text-sm" style={{ color: "#64748b" }}>Loading Sports Sync AI Platform</p>
    </div>
  );
}

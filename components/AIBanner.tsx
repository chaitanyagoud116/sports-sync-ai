"use client";

import { useState } from "react";
import { Sparkles, Loader2, Target } from "lucide-react";

interface AIBannerProps {
  athleteSport: string;
  athleteScore: number;
}

export default function AIBanner({ athleteSport, athleteScore }: AIBannerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAI = async () => {
    setLoading(true);
    
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport: athleteSport, score: athleteScore })
      });
      
      const data = await res.json();
      setResult(data.recommendation);
    } catch (error) {
      console.error(error);
      setResult("AI coaching analysis temporarily unavailable. Keep training hard!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 mb-6 relative overflow-hidden group border border-blue-500/20">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none transition-all group-hover:bg-blue-500/20"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-primary flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-blue-400" /> 
            AI Coach Matchmaker
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Let our proprietary AI engine analyze your stats and find your perfect tournament match.
          </p>
        </div>
        
        {!result && (
          <button 
            onClick={handleAI} 
            disabled={loading} 
            className="btn-primary text-sm whitespace-nowrap px-6 py-2.5 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all"
            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Data...
              </span>
            ) : (
              "Find My Perfect Match"
            )}
          </button>
        )}
      </div>
      
      {/* AI Response Area */}
      {result && (
        <div className="relative z-10 mt-5 p-5 rounded-xl border" 
          style={{ background: "rgba(59,130,246,0.05)", borderColor: "rgba(59,130,246,0.2)" }}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0 mt-0.5">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-sm leading-relaxed text-blue-100">
              {result}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Loader2, CheckCircle, Trophy } from "lucide-react";

interface ApplyButtonProps {
  tournamentId: string;
  athleteId: string;
  hasApplied: boolean;
  isFull: boolean;
}

export default function ApplyButton({ tournamentId, athleteId, hasApplied, isFull }: ApplyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(hasApplied);
  const [error, setError] = useState("");

  const handleApply = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, athleteId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApplied(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm" style={{ color: "#34d399" }}>
        <CheckCircle className="w-4 h-4" /> Application Submitted
      </div>
    );
  }

  if (isFull) {
    return (
      <button disabled className="btn-secondary w-full justify-center opacity-50 cursor-not-allowed text-sm py-2">
        Tournament Full
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleApply}
        disabled={loading}
        className="btn-primary w-full justify-center text-sm py-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Applying...</>
        ) : (
          <><Trophy className="w-4 h-4" /> Apply Now</>
        )}
      </button>
      {error && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{error}</p>}
    </div>
  );
}

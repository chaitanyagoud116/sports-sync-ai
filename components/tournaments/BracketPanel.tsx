"use client";

import { useState } from "react";
import { Loader2, GitBranch } from "lucide-react";

interface MatchRow {
  id: string;
  round: string;
  matchNumber: number;
  homeLabel: string | null;
  awayLabel: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

interface BracketPanelProps {
  tournamentId: string;
  tournamentName: string;
  initialMatches: MatchRow[];
}

export default function BracketPanel({
  tournamentId,
  tournamentName,
  initialMatches,
}: BracketPanelProps) {
  const [matches, setMatches] = useState(initialMatches);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const generateBracket = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/bracket`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error?.message || "Failed to generate bracket");
        return;
      }
      const refreshed = await fetch(`/api/matches?tournamentId=${tournamentId}`);
      const data = await refreshed.json();
      if (data.data?.matches) setMatches(data.data.matches);
      setMessage(`Bracket generated: ${json.data?.matchCount ?? 0} matches`);
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  const rounds = [...new Set(matches.map((m) => m.round))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">{tournamentName}</h1>
          <p className="text-sm text-slate-400">Tournament bracket & live fixtures</p>
        </div>
        <button
          type="button"
          onClick={generateBracket}
          disabled={loading}
          className="btn-primary inline-flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <GitBranch className="w-4 h-4" />
          )}
          Generate Bracket
        </button>
      </div>

      {message && (
        <p className="text-sm text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
          {message}
        </p>
      )}

      {rounds.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-400">
          No matches yet. Approve athlete applications, then generate the bracket.
        </div>
      ) : (
        rounds.map((round) => (
          <div key={round} className="glass-card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">{round}</h2>
            <div className="grid gap-3">
              {matches
                .filter((m) => m.round === round)
                .map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex-1">
                      <p className="text-primary font-medium">
                        {m.homeLabel ?? "TBD"}{" "}
                        <span className="text-slate-500">vs</span>{" "}
                        {m.awayLabel ?? "TBD"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Match #{m.matchNumber} · {m.status}
                      </p>
                    </div>
                    <div className="text-lg font-bold text-primary tabular-nums">
                      {m.homeScore ?? "-"} : {m.awayScore ?? "-"}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

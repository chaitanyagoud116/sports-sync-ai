"use client";
import { useState } from "react";
import { Brain, Loader2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";

interface AIInsightPanelProps {
  athleteId: string;
  athleteName: string;
  compact?: boolean;
}

export default function AIInsightPanel({ athleteId, athleteName, compact = false }: AIInsightPanelProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate insight");
      setInsight(data.insight);
      setExpanded(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.05))",
        border: "1px solid rgba(139,92,246,0.2)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa" }}
          >
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-primary">AI Performance Insight</div>
            {!compact && (
              <div className="text-xs" style={{ color: "#64748b" }}>Powered by Gemini AI</div>
            )}
          </div>
        </div>

        <button
          onClick={insight ? () => setExpanded(!expanded) : generate}
          disabled={loading}
          className="btn-secondary text-xs gap-1.5"
          style={{ padding: "6px 14px" }}
        >
          {loading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
          ) : insight ? (
            expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Collapse</> : <><ChevronDown className="w-3.5 h-3.5" /> Show Insight</>
          ) : (
            <><Brain className="w-3.5 h-3.5" /> Generate Insight</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mx-4 mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
          style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Insight Content */}
      {insight && expanded && (
        <div className="px-4 pb-4">
          <div
            className="p-4 rounded-xl text-sm leading-relaxed"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#cbd5e1",
              whiteSpace: "pre-wrap",
            }}
          >
            {/* Simple markdown-ish rendering */}
            {insight.split("\n").map((line, i) => {
              if (line.startsWith("## ") || line.startsWith("# ")) {
                return (
                  <div key={i} className="font-bold text-primary mt-3 mb-1" style={{ fontSize: 13 }}>
                    {line.replace(/^#+\s/, "")}
                  </div>
                );
              }
              if (line.startsWith("**") && line.endsWith("**")) {
                return (
                  <div key={i} className="font-semibold mt-2 mb-1" style={{ color: "#a78bfa", fontSize: 13 }}>
                    {line.replace(/\*\*/g, "")}
                  </div>
                );
              }
              if (line.startsWith("- ") || line.startsWith("* ")) {
                return (
                  <div key={i} className="flex items-start gap-2 my-0.5">
                    <span style={{ color: "#a78bfa" }}>•</span>
                    <span>{line.replace(/^[-*]\s/, "")}</span>
                  </div>
                );
              }
              if (line.trim() === "") return <div key={i} className="h-1" />;
              return <div key={i}>{line}</div>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

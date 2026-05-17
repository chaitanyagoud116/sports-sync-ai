"use client";
import { useState } from "react";
import { Brain, Trophy, AlertTriangle, Loader2, FileText, TrendingUp, Star, ChevronDown, ChevronUp } from "lucide-react";
import AIInsightPanel from "@/components/ai/AIInsightPanel";

interface Athlete {
  id: string;
  fullName: string;
  sport: string;
  district: string;
  talentScore: number;
  medalCount: number;
  resultsCount: number;
  coachName: string | null;
  lastActivity: string | null;
}

interface Report {
  id: string;
  type: string;
  title: string;
  preview: string;
  createdAt: string;
}

interface Props {
  athletes: Athlete[];
  reports: Report[];
  riskCount: number;
}

function TalentBar({ score }: { score: number }) {
  const color = score >= 70 ? "#34d399" : score >= 50 ? "#fbbf24" : score >= 30 ? "#f97316" : "#f87171";
  return (
    <div className="flex items-center gap-2">
      <div className="progress-bar flex-1" style={{ height: 5 }}>
        <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{score.toFixed(0)}</span>
    </div>
  );
}

export default function AIInsightsClient({ athletes, reports, riskCount }: Props) {
  const [activeTab, setActiveTab] = useState<"talent" | "reports" | "generate">("talent");
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [generatingTalent, setGeneratingTalent] = useState(false);
  const [talentReport, setTalentReport] = useState<string | null>(null);

  const generateStateReport = async () => {
    setGenerating(true);
    setGeneratedReport(null);
    try {
      const res = await fetch("/api/ai/report", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGeneratedReport(data.report.content);
    } catch (e: any) {
      setGeneratedReport(`Error: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const generateTalentReport = async () => {
    setGeneratingTalent(true);
    setTalentReport(null);
    try {
      const res = await fetch("/api/ai/talent", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTalentReport(data.report);
    } catch (e: any) {
      setTalentReport(`Error: ${e.message}`);
    } finally {
      setGeneratingTalent(false);
    }
  };

  const tabs = [
    { id: "talent", label: "Talent Leaderboard", icon: <Trophy className="w-4 h-4" /> },
    { id: "reports", label: "AI Reports", icon: <FileText className="w-4 h-4" /> },
    { id: "generate", label: "Generate Report", icon: <Brain className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeTab === t.id ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
              color: activeTab === t.id ? "#a78bfa" : "#64748b",
              border: activeTab === t.id ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Talent Leaderboard Tab */}
      {activeTab === "talent" && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-primary">AI Talent Rankings</h3>
              <button
                onClick={generateTalentReport}
                disabled={generatingTalent}
                className="btn-secondary text-xs gap-1.5"
                style={{ padding: "6px 14px" }}
              >
                {generatingTalent ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
                ) : (
                  <><Brain className="w-3.5 h-3.5" /> Generate Talent Report</>
                )}
              </button>
            </div>

            <div className="space-y-3">
              {athletes.map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: selectedAthlete?.id === a.id ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)",
                    border: selectedAthlete?.id === a.id ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.04)",
                  }}
                  onClick={() => setSelectedAthlete(selectedAthlete?.id === a.id ? null : a)}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: i === 0 ? "rgba(251,191,36,0.2)" : i < 3 ? "rgba(148,163,184,0.15)" : "rgba(255,255,255,0.05)",
                      color: i === 0 ? "#fbbf24" : i < 3 ? "#94a3b8" : "#64748b",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-primary">{a.fullName}</span>
                      {a.medalCount > 0 && (
                        <span className="badge badge-pending" style={{ fontSize: 10, padding: "1px 6px" }}>
                          🏅 {a.medalCount} medal{a.medalCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: "#64748b" }}>
                      {a.sport.replace(/_/g, " ")} · {a.district.replace(/_/g, " ")}
                      {a.coachName && ` · Coach: ${a.coachName}`}
                    </div>
                    <div className="mt-1.5">
                      <TalentBar score={a.talentScore} />
                    </div>
                  </div>
                  {a.talentScore >= 70 && (
                    <span className="badge badge-approved text-xs flex-shrink-0">State Ready</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {selectedAthlete ? (
              <div>
                <div className="glass-card p-4 mb-4">
                  <h4 className="font-semibold text-primary mb-1">{selectedAthlete.fullName}</h4>
                  <div className="text-xs mb-3" style={{ color: "#64748b" }}>
                    {selectedAthlete.sport.replace(/_/g, " ")} · {selectedAthlete.district.replace(/_/g, " ")}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span style={{ color: "#64748b" }}>Talent Score</span>
                      <span className="font-bold text-primary">{selectedAthlete.talentScore.toFixed(1)}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#64748b" }}>Medals Won</span>
                      <span className="font-bold text-primary">{selectedAthlete.medalCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#64748b" }}>Events Entered</span>
                      <span className="font-bold text-primary">{selectedAthlete.resultsCount}</span>
                    </div>
                  </div>
                </div>
                <AIInsightPanel
                  athleteId={selectedAthlete.id}
                  athleteName={selectedAthlete.fullName}
                />
              </div>
            ) : (
              <div className="glass-card p-5 text-center">
                <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: "#a78bfa" }} />
                <p className="text-sm" style={{ color: "#64748b" }}>
                  Select an athlete to generate their AI performance insight
                </p>
              </div>
            )}

            {/* Talent Report */}
            {talentReport && (
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.05))",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4" style={{ color: "#a78bfa" }} />
                  <span className="text-sm font-semibold text-primary">Talent ID Report</span>
                </div>
                <div
                  className="text-xs leading-relaxed"
                  style={{ color: "#94a3b8", whiteSpace: "pre-wrap", maxHeight: 300, overflow: "auto" }}
                >
                  {talentReport}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "#64748b" }} />
              <p className="text-primary font-medium mb-1">No AI reports yet</p>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Generate your first state report from the "Generate Report" tab
              </p>
            </div>
          ) : reports.map((r) => (
            <div key={r.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="badge"
                      style={{
                        background: "rgba(139,92,246,0.15)",
                        color: "#a78bfa",
                        borderColor: "rgba(139,92,246,0.3)",
                        fontSize: 10,
                      }}
                    >
                      {r.type.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs" style={{ color: "#475569" }}>
                      {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-primary mb-2">{r.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{r.preview}...</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Tab */}
      {activeTab === "generate" && (
        <div className="grid grid-cols-2 gap-6">
          {/* State Report */}
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.06))",
              border: "1px solid rgba(139,92,246,0.25)",
            }}
          >
            <Brain className="w-10 h-10 mb-4" style={{ color: "#a78bfa" }} />
            <h3 className="text-lg font-bold text-primary mb-2">State Intelligence Report</h3>
            <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>
              Generate a comprehensive AI-powered executive summary of Goa's sports ecosystem,
              including talent distribution, medal tally, district analysis, and strategic recommendations.
            </p>
            <button
              onClick={generateStateReport}
              disabled={generating}
              className="btn-primary w-full justify-center"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating Report...</>
              ) : (
                <><Brain className="w-4 h-4" /> Generate State Report</>
              )}
            </button>
            {generatedReport && (
              <div
                className="mt-4 p-4 rounded-xl text-sm leading-relaxed"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#cbd5e1",
                  whiteSpace: "pre-wrap",
                  maxHeight: 400,
                  overflow: "auto",
                }}
              >
                {generatedReport}
              </div>
            )}
          </div>

          {/* Talent Identification */}
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.06))",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            <Trophy className="w-10 h-10 mb-4" style={{ color: "#34d399" }} />
            <h3 className="text-lg font-bold text-primary mb-2">Talent Identification Report</h3>
            <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>
              AI scans all athlete data and identifies top prospects for state and national representation,
              with personalized recommendations for each sport category.
            </p>
            <button
              onClick={generateTalentReport}
              disabled={generatingTalent}
              className="btn-primary w-full justify-center"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
            >
              {generatingTalent ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Identifying Talents...</>
              ) : (
                <><Star className="w-4 h-4" /> Identify Top Talents</>
              )}
            </button>
            {talentReport && (
              <div
                className="mt-4 p-4 rounded-xl text-sm leading-relaxed"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#cbd5e1",
                  whiteSpace: "pre-wrap",
                  maxHeight: 400,
                  overflow: "auto",
                }}
              >
                {talentReport}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// lib/ai.ts — Sports intelligence (OpenAI or Gemini via AI_PROVIDER)
import { generateAIText, getAIModelName, getAIProviderName } from "@/lib/ai/provider";

export { getAIProviderName, getAIModelName };

export interface AthleteInsightInput {
  name: string;
  sport: string;
  experienceLevel: string;
  district: string;
  talentScore: number;
  performanceRecords: { metric: string; value: number; unit: string; recordedAt: string }[];
  results: { tournamentName: string; rank?: number | null; medal?: string | null; score?: string | null }[];
}

export async function generateAthleteInsight(athlete: AthleteInsightInput): Promise<string> {
  const perfSummary = athlete.performanceRecords.length > 0
    ? athlete.performanceRecords
        .slice(-10)
        .map((p) => `  - ${p.metric}: ${p.value} ${p.unit} (${new Date(p.recordedAt).toLocaleDateString()})`)
        .join("\n")
    : "  No performance records available.";

  const resultsSummary = athlete.results.length > 0
    ? athlete.results
        .map((r) => `  - ${r.tournamentName}: Rank ${r.rank ?? "N/A"}, Medal: ${r.medal ?? "None"}, Score: ${r.score ?? "N/A"}`)
        .join("\n")
    : "  No tournament results available.";

  const prompt = `You are an expert AI sports analyst for the Goa State Sports Department.
Analyze this athlete's data and provide a concise, actionable insight report.

Athlete: ${athlete.name}
Sport: ${athlete.sport}
Experience Level: ${athlete.experienceLevel}
District: ${athlete.district}
AI Talent Score: ${athlete.talentScore.toFixed(1)}/100

Recent Performance Records:
${perfSummary}

Tournament Results:
${resultsSummary}

Provide a structured insight with these sections (use markdown):
1. **Strengths** (2-3 bullet points)
2. **Areas for Improvement** (2-3 bullet points)
3. **Training Recommendations** (2-3 specific suggestions)
4. **State Team Potential** (brief assessment: Low / Moderate / High / Very High)
5. **Risk Flags** (any concerns about performance decline or injury risk)

Keep the response professional, data-driven, and under 400 words.`;

  return generateAIText(prompt);
}

export interface StateSummaryInput {
  totalAthletes: number;
  totalTournaments: number;
  totalCoaches: number;
  sportBreakdown: { sport: string; count: number }[];
  districtBreakdown: { district: string; count: number }[];
  medalTally: { gold: number; silver: number; bronze: number };
  avgTalentScore: number;
  topAthletes: { name: string; sport: string; talentScore: number }[];
}

export async function generateStateReport(data: StateSummaryInput): Promise<string> {
  const sports = data.sportBreakdown.map((s) => `${s.sport}: ${s.count}`).join(", ");
  const districts = data.districtBreakdown.map((d) => `${d.district}: ${d.count}`).join(", ");
  const topList = data.topAthletes.map((a) => `${a.name} (${a.sport}, Score: ${a.talentScore.toFixed(1)})`).join(", ");

  const prompt = `You are a senior sports intelligence analyst for the Government of Goa.
Generate a professional executive summary report for the state sports department.

State Sports Statistics:
- Total Registered Athletes: ${data.totalAthletes}
- Active Tournaments: ${data.totalTournaments}
- Certified Coaches: ${data.totalCoaches}
- Average Talent Score: ${data.avgTalentScore.toFixed(1)}/100
- Medal Tally: Gold: ${data.medalTally.gold}, Silver: ${data.medalTally.silver}, Bronze: ${data.medalTally.bronze}

Sport Distribution: ${sports}
District Coverage: ${districts}
Top Athletes: ${topList}

Write a professional executive summary (markdown format) including:
1. **Executive Overview** — state of sports in Goa
2. **Key Achievements** — notable wins and milestones
3. **Talent Pipeline** — assessment of athlete depth
4. **District Analysis** — which districts are performing well
5. **Strategic Recommendations** — 3 actionable government-level recommendations
6. **Outlook** — 6-month projection

Tone: formal, data-driven, suitable for government presentation. Under 600 words.`;

  return generateAIText(prompt);
}

export interface TalentCandidateInput {
  name: string;
  sport: string;
  district: string;
  talentScore: number;
  resultsCount: number;
  medalCount: number;
  performanceCount: number;
}

export async function generateTalentReport(candidates: TalentCandidateInput[]): Promise<string> {
  const list = candidates
    .slice(0, 15)
    .map((c, i) => `${i + 1}. ${c.name} — ${c.sport} (${c.district}) | Score: ${c.talentScore.toFixed(1)} | Events: ${c.resultsCount} | Medals: ${c.medalCount}`)
    .join("\n");

  const prompt = `You are a national sports talent scout for the Government of Goa.
Based on the following athlete data, identify the most promising talents for state and national representation.

Top Athletes by Talent Score:
${list}

Provide:
1. **Top 5 Recommended for State Team** — with brief justification for each
2. **Emerging Talents (Next 6 months)** — athletes showing strong growth potential
3. **Sport-wise Representation Gaps** — sports where Goa needs more talent development
4. **Geographic Insights** — district-level talent distribution analysis
5. **Immediate Action Items** — for the sports department

Format in markdown. Under 500 words. Tone: official, strategic.`;

  return generateAIText(prompt);
}

export async function generatePerformanceRiskAssessment(input: {
  name: string;
  sport: string;
  recentMetrics: { metric: string; values: number[] }[];
}): Promise<string> {
  const metricsText = input.recentMetrics
    .map((m) => `${m.metric}: [${m.values.join(", ")}]`)
    .join("\n");

  const prompt = `Analyze performance trend risk for athlete ${input.name} (${input.sport}).
Recent metric series:
${metricsText}

Identify decline patterns (>10% regression), injury risk indicators, and recovery recommendations.
Respond in markdown with: Risk Level (Low/Medium/High), Key Findings, Recommended Actions. Under 250 words.`;

  return generateAIText(prompt);
}

export function buildAIReportMetadata(extra: Record<string, unknown> = {}) {
  return JSON.stringify({
    provider: getAIProviderName(),
    model: getAIModelName(),
    generatedAt: new Date().toISOString(),
    ...extra,
  });
}

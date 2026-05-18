// lib/services/divi-chatbot.ts — DIVI AI Chatbot Service
// Provides multi-role AI assistance for Sports Sync AI platform
import { prisma } from "@/lib/db";
import { generateAIText } from "@/lib/ai/provider";

// ─── Intent Classification ──────────────────────────────────────────────────
export type DiviIntent =
  | "REGISTRATION"
  | "EVENT_INFO"
  | "SCHEME_INFO"
  | "TRAINING"
  | "ANALYTICS"
  | "NAVIGATION"
  | "BUDGET"
  | "GENERAL"
  | "ESCALATE";

const INTENT_KEYWORDS: Record<DiviIntent, string[]> = {
  REGISTRATION: ["register", "signup", "sign up", "create account", "enroll", "enrollment", "join", "application", "apply"],
  EVENT_INFO: ["tournament", "event", "match", "schedule", "fixture", "competition", "championship", "league", "venue", "date"],
  SCHEME_INFO: ["scheme", "scholarship", "khelo india", "sai", "tops", "grant", "fund", "subsidy", "financial", "government scheme", "benefit"],
  TRAINING: ["training", "session", "practice", "coach", "fitness", "workout", "exercise", "warm up", "drill", "endurance"],
  ANALYTICS: ["performance", "score", "ranking", "talent", "statistics", "stats", "report", "analytics", "progress", "improvement"],
  NAVIGATION: ["where", "how to", "find", "navigate", "page", "dashboard", "portal", "menu", "link", "go to"],
  BUDGET: ["budget", "funding", "allocation", "expenditure", "finance", "cost", "money", "spend"],
  GENERAL: ["hello", "hi", "help", "about", "what is", "who", "thank", "bye", "good"],
  ESCALATE: ["complaint", "issue", "problem", "error", "bug", "not working", "contact admin", "human", "speak to"],
};

export function classifyIntent(message: string): DiviIntent {
  const lower = message.toLowerCase();
  let bestIntent: DiviIntent = "GENERAL";
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const score = keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent as DiviIntent;
    }
  }
  return bestIntent;
}

// ─── Quick Action Suggestions ────────────────────────────────────────────────
interface QuickAction {
  label: string;
  url: string;
  icon: string;
}

const ROLE_ACTIONS: Record<string, QuickAction[]> = {
  ATHLETE: [
    { label: "View My Performance", url: "/athlete/performance", icon: "📊" },
    { label: "Browse Tournaments", url: "/athlete/tournaments", icon: "🏆" },
    { label: "Upload Documents", url: "/athlete/documents", icon: "📄" },
    { label: "Check Results", url: "/athlete/results", icon: "🏅" },
  ],
  COACH: [
    { label: "My Athletes", url: "/coach/my-athletes", icon: "👥" },
    { label: "Training Sessions", url: "/coach/sessions", icon: "📋" },
    { label: "Performance Reports", url: "/coach/performance", icon: "📊" },
  ],
  ADMIN: [
    { label: "Admin Dashboard", url: "/admin/dashboard", icon: "🏛️" },
    { label: "Manage Athletes", url: "/admin/athletes", icon: "👥" },
    { label: "Tournament Management", url: "/admin/tournaments", icon: "🏆" },
    { label: "Budget Overview", url: "/admin/analytics", icon: "💰" },
  ],
  GOV_ADMIN: [
    { label: "State Analytics", url: "/admin/analytics", icon: "📊" },
    { label: "AI Insights", url: "/admin/ai-insights", icon: "🤖" },
    { label: "All Athletes", url: "/admin/athletes", icon: "👥" },
    { label: "Budget Monitoring", url: "/admin/analytics", icon: "💰" },
  ],
};

function getQuickActions(role: string): QuickAction[] {
  const actions = ROLE_ACTIONS[role] || ROLE_ACTIONS["ATHLETE"];
  return actions.slice(0, 3);
}

// ─── FAQ Database (rule-based fallback) ──────────────────────────────────────
const FAQ_DATABASE: { question: string; keywords: string[]; answer: string }[] = [
  {
    question: "How do I register as an athlete?",
    keywords: ["register", "athlete", "signup"],
    answer: "To register as an athlete on Sports Sync AI:\n1. Go to the Registration page (/register)\n2. Fill in your personal details, sport category, and district\n3. Upload required documents (Aadhaar, Birth Certificate)\n4. Submit for verification\n\nYour profile will be reviewed by the district sports officer within 3-5 working days.",
  },
  {
    question: "What is Khelo India scheme?",
    keywords: ["khelo india", "scheme"],
    answer: "Khelo India is a central government scheme for sports development. Under this scheme:\n- Talented athletes receive ₹5 lakh/year scholarship for 8 years\n- Covers training, competition, and equipment costs\n- Athletes must be identified through Khelo India Games\n- Apply through your district sports office or this platform\n\nEligibility: Indian citizen, age 10-18, must have represented state/district.",
  },
  {
    question: "How to apply for a tournament?",
    keywords: ["apply", "tournament", "event", "participate"],
    answer: "To apply for a tournament:\n1. Log in to the Athlete Portal\n2. Go to 'Tournaments' section\n3. Browse available tournaments\n4. Click 'Apply' on the tournament you want\n5. Accept the declaration and submit\n\nYour application will be reviewed by the tournament organizer. Keep your documents up to date for faster approval.",
  },
  {
    question: "What sports are supported?",
    keywords: ["sports", "category", "supported", "available"],
    answer: "Sports Sync AI currently supports 13 sport categories:\nFootball, Cricket, Kabaddi, Volleyball, Basketball, Athletics, Swimming, Boxing, Wrestling, Badminton, Table Tennis, Cycling, and Chess.\n\nMore sports are being added based on demand from districts.",
  },
  {
    question: "How is the talent score calculated?",
    keywords: ["talent", "score", "calculated", "ranking"],
    answer: "The AI Talent Score (0-100) is calculated using a weighted formula:\n- Win Rate: 30%\n- Performance Trend: 25%\n- Consistency: 20%\n- Participation Rate: 15%\n- Event Experience: 10%\n+ Medal Bonus: up to 15% extra\n\nScores are recalculated after each tournament result is published.",
  },
  {
    question: "How to check my performance analytics?",
    keywords: ["performance", "analytics", "check", "view"],
    answer: "To view your performance analytics:\n1. Go to Athlete Portal → Performance\n2. You'll see charts tracking your metrics over time\n3. AI-generated insights highlight strengths and areas for improvement\n4. Compare your progress with state averages\n\nCoaches can also log new performance records from their portal.",
  },
  {
    question: "What is SAI scholarship?",
    keywords: ["sai", "scholarship"],
    answer: "Sports Authority of India (SAI) offers scholarships for promising athletes:\n- Monthly stipend for training expenses\n- Access to SAI training centers\n- Equipment and coaching support\n- Available for athletes aged 14-25\n\nEligibility: Must have a talent score above 60 and at least 1 medal at district level or above.",
  },
  {
    question: "How to contact district sports office?",
    keywords: ["contact", "district", "office", "support"],
    answer: "You can reach your District Sports Office through:\n- This platform: Navigate to Help Center\n- Email: district-sports@goa.gov.in\n- Phone: Check your district page for specific numbers\n\nFor urgent issues, use the escalation button in this chat to flag your query to an admin.",
  },
  {
    question: "What documents are needed for registration?",
    keywords: ["documents", "needed", "required", "registration"],
    answer: "Required documents for athlete registration:\n1. Aadhaar Card (mandatory)\n2. Date of Birth Certificate\n3. Passport-size photograph\n4. Sports achievement certificates (if any)\n5. Medical fitness certificate\n6. School/College ID (for students)\n\nAll documents should be clear scans in JPG/PDF format, under 5MB each.",
  },
  {
    question: "How do government officials use this platform?",
    keywords: ["government", "official", "admin", "use"],
    answer: "Government officials (GOV_ADMIN role) have access to:\n- State-wide sports analytics dashboard\n- AI-generated executive reports\n- Budget allocation and monitoring\n- Athlete growth statistics\n- District performance comparisons\n- Policy monitoring tools\n\nLogin with your official credentials at the Government Portal.",
  },
];

function findFAQAnswer(message: string): string | null {
  const lower = message.toLowerCase();
  let bestMatch: typeof FAQ_DATABASE[0] | null = null;
  let bestScore = 0;

  for (const faq of FAQ_DATABASE) {
    const score = faq.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }
  return bestScore >= 1 ? bestMatch!.answer : null;
}

// ─── Platform Data Queries ───────────────────────────────────────────────────
async function getPlatformContext(): Promise<string> {
  const [athleteCount, tournamentCount, coachCount, activeEvents] = await Promise.all([
    prisma.athlete.count(),
    prisma.tournament.count(),
    prisma.coach.count(),
    prisma.tournament.count({ where: { status: { in: ["PUBLISHED", "ONGOING"] } } }),
  ]);

  return `Platform Stats: ${athleteCount} registered athletes, ${tournamentCount} total tournaments (${activeEvents} active), ${coachCount} coaches. Platform: Sports Sync AI — Official State Sports Portal of Government of Goa.`;
}

// ─── Main Chat Handler ──────────────────────────────────────────────────────
export interface DiviResponse {
  message: string;
  intent: DiviIntent;
  quickActions: QuickAction[];
  isEscalated: boolean;
  sessionTitle?: string;
}

export async function handleDiviChat(
  userMessage: string,
  userRole: string,
  sessionId: string
): Promise<DiviResponse> {
  // Session Message Limit Check
  const messageCount = await prisma.diviChatMessage.count({ where: { sessionId } });
  if (messageCount >= 50) {
    return {
      message: "This conversation has reached its limit. Please start a new session.",
      intent: "GENERAL",
      quickActions: [],
      isEscalated: false,
    };
  }

  // Input Sanitization
  let sanitizedInput = userMessage.replace(/ignore (all )?previous instructions/gi, "[REDACTED]");
  sanitizedInput = sanitizedInput.replace(/system prompt/gi, "[REDACTED]");

  const intent = classifyIntent(sanitizedInput);
  const quickActions = getQuickActions(userRole);

  // Store user message
  await prisma.diviChatMessage.create({
    data: { sessionId, role: "user", content: sanitizedInput, intent },
  });

  let responseMessage: string;
  let isEscalated = false;

  if (intent === "ESCALATE") {
    isEscalated = true;
    responseMessage =
      "I understand you need assistance from a human administrator. I've flagged your query for review. A district sports officer or admin will respond to you within 24 hours.\n\nIn the meantime, you can:\n- Check the Help Center for common solutions\n- Browse the FAQ section\n- Try rephrasing your question and I'll do my best to help.";
  } else {
    // Try FAQ first
    const faqAnswer = findFAQAnswer(userMessage);
    if (faqAnswer) {
      responseMessage = faqAnswer;
    } else {
      // Try AI-powered response
      try {
        const platformContext = await getPlatformContext();
        const systemPrompt = `You are DIVI, the official AI assistant for Sports Sync AI — the Government of Goa's state sports management platform.

Context: ${platformContext}
User Role: ${userRole}
User Intent: ${intent}

Rules:
- Be professional, helpful, and concise
- Answer in the context of Goa state sports governance
- If asked about specific data, note that the user should check the relevant portal section
- For role '${userRole}', tailor your response to their access level
- Do NOT make up data — refer users to the dashboard for live numbers
- Keep responses under 250 words
- Use bullet points for lists
- If you cannot answer, suggest contacting the district sports office`;

        responseMessage = await generateAIText(
          `${systemPrompt}\n\nUser: ${sanitizedInput}\n\nDIVI:`
        );
        
        // PII Output Redaction
        responseMessage = responseMessage
          .replace(/\b\d{12}\b/g, "[REDACTED AADHAAR]") // 12 digit numbers
          .replace(/\b\d{10}\b/g, "[REDACTED PHONE]") // 10 digit numbers
          .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED EMAIL]");
        
      } catch {
        // Fallback when AI provider is unavailable
        responseMessage = generateFallbackResponse(intent, userRole);
      }
    }
  }

  // Store assistant message
  await prisma.diviChatMessage.create({
    data: {
      sessionId,
      role: "assistant",
      content: responseMessage,
      intent,
      metadata: JSON.stringify({ quickActions, isEscalated }),
    },
  });

  // Update session title based on first message
  const totalmessages = await prisma.diviChatMessage.count({ where: { sessionId } });
  let sessionTitle: string | undefined;
  if (messageCount <= 2) {
    sessionTitle = userMessage.slice(0, 60) + (userMessage.length > 60 ? "..." : "");
    await prisma.diviChatSession.update({
      where: { id: sessionId },
      data: { title: sessionTitle },
    });
  }

  return { message: responseMessage, intent, quickActions, isEscalated, sessionTitle };
}

// ─── Fallback Responses ─────────────────────────────────────────────────────
function generateFallbackResponse(intent: DiviIntent, role: string): string {
  const responses: Record<DiviIntent, string> = {
    REGISTRATION:
      "For registration help, please visit the Registration page at /register. You'll need your Aadhaar card, birth certificate, and a recent photograph. The process takes about 5 minutes.",
    EVENT_INFO:
      "You can browse all upcoming tournaments and events in your portal's Tournaments section. Each event listing shows the sport, dates, venue, eligibility criteria, and registration deadline.",
    SCHEME_INFO:
      "Goa offers several sports schemes including:\n- **Khelo India**: ₹5 lakh/year for 8 years\n- **SAI Scholarship**: Monthly training stipend\n- **Goa Sports Merit Award**: State-level recognition\n- **TOPS**: Olympic preparation support\n\nCheck your eligibility in the Scholarships section of your profile.",
    TRAINING:
      "Training sessions are managed by certified coaches. Check your portal's Schedule section for upcoming sessions. Your coach can also assign personalized training plans based on your performance data.",
    ANALYTICS:
      "Your performance analytics are available in the Performance section of your portal. The AI system tracks metrics like speed, endurance, and consistency to calculate your talent score.",
    NAVIGATION:
      `As a ${role}, you have access to your dedicated portal. Use the sidebar menu to navigate between Dashboard, Tournaments, Performance, and other sections.`,
    BUDGET:
      "Budget information is managed by Government Administrators. For budget queries, please contact your district sports office or check the Admin Analytics dashboard if you have access.",
    GENERAL:
      "Hello! I'm **DIVI**, your AI assistant for Sports Sync AI — the Government of Goa's official sports management platform. I can help you with:\n\n- 🏃 Registration & Profile management\n- 🏆 Tournament information\n- 📊 Performance analytics\n- 💰 Government sports schemes\n- 🧭 Platform navigation\n\nHow can I assist you today?",
    ESCALATE:
      "I've noted your concern. For immediate assistance, please contact the district sports office or email support@sportssync.goa.in.",
  };
  return responses[intent];
}

// ─── Session Management ──────────────────────────────────────────────────────
export async function createChatSession(userId: string): Promise<string> {
  // Session Limit Check
  const sessionCount = await prisma.diviChatSession.count({ where: { userId, isActive: true } });
  if (sessionCount >= 10) {
    throw new Error("You have reached the maximum number of active chat sessions. Please delete older sessions.");
  }

  const session = await prisma.diviChatSession.create({
    data: { userId, title: "New Conversation" },
  });
  return session.id;
}

export async function getChatHistory(sessionId: string, userId: string) {
  // Verify ownership
  const session = await prisma.diviChatSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  return session;
}

export async function getUserSessions(userId: string) {
  return prisma.diviChatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });
}

export async function deleteChatSession(sessionId: string, userId: string): Promise<boolean> {
  const session = await prisma.diviChatSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) return false;
  await prisma.diviChatSession.delete({ where: { id: sessionId } });
  return true;
}

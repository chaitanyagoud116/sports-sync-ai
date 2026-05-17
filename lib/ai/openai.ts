const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

interface OpenAIChatResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

export async function callOpenAI(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    return "AI service unavailable: OPENAI_API_KEY not configured.";
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert sports intelligence analyst for the Government of Goa Sports Department. Respond in clear markdown suitable for official reports.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenAI API error:", err);
    return "AI generation failed. Please try again.";
  }

  const data: OpenAIChatResponse = await res.json();
  return data.choices?.[0]?.message?.content ?? "No response generated.";
}

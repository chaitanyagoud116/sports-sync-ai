import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sport, score } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const sportString = String(sport || "general sports").replace(/_/g, " ").toLowerCase();
    const scoreNum = Number(score || 0).toFixed(1);

    const mockResponse = `Based on your Talent Score of ${scoreNum} and recent performance metrics, you are in the top 15% of ${sportString} athletes in your district. I strongly recommend applying for the "State Championship" to maximize your visibility to state selectors. Focus your next 3 training sessions on endurance conditioning.`;

    // Hackathon Fallback: If no API key, return the mock safely.
    if (!apiKey) {
      await new Promise((r) => setTimeout(r, 1500)); // Simulate latency
      return NextResponse.json({ recommendation: mockResponse });
    }

    const prompt = `You are an elite sports coach AI. Analyze an athlete who plays ${sportString} and has an AI Talent Score of ${scoreNum} out of 100. Write a 3-sentence personalized recommendation telling them what tournament level they should aim for and what specific training they should focus on. Keep it highly professional, technical, and encouraging. Do not use asterisks or markdown, just plain text sentences.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!res.ok) {
      console.warn("Gemini API failed, falling back to mock.");
      return NextResponse.json({ recommendation: mockResponse });
    }

    const data = await res.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) throw new Error("Invalid response format from Gemini");

    return NextResponse.json({ recommendation: aiText });
  } catch (error) {
    console.error("AI Error:", error);
    // Ultimate fallback
    return NextResponse.json({ 
      recommendation: "System analyzed your profile. Based on your metrics, keep pushing hard in your technical training to elevate your talent score to the next tier!" 
    });
  }
}

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { prompt, context } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        reply: "[Simulated AI Command] There are currently 3 active anomalies. Dispatch heavy rescue to the Eastern quadrant. (Export GEMINI_API_KEY for live AI responses)."
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemPrompt = `You are a highly advanced Tactical AI Assistant for First Responders.
Here is the real-time context of the disaster zone:
${JSON.stringify(context, null, 2)}

Answer the commander's question concisely and tactically. Suggest exact deployments based on the risk scores and hazards available in the context.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: systemPrompt + "\\n\\nCommander's Question: " + prompt }] }
        ]
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ reply: "Error connecting to AI Command Center." }, { status: 500 });
  }
}

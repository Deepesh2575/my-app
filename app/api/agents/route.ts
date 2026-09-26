import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { eventData } = await request.json();
    
    // Check if key is available
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        actions: [
          "[Agent-1: Medical] Querying City Hospital ICU capacity... [OK] 42 beds reserved.",
          "[Agent-2: Traffic] Interfacing with Municipal Grid API... [OK] Re-routing traffic 5km away.",
          "[Agent-3: Insurance] Compiling evidence for Parametric Contract... [OK] Tx 0x8f2a submitted.",
          "[Agent-4: Drone Ops] Launching inspection swarm to GPS coordinates... [OK] Airborne (ETA 4m)."
        ]
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are the master coordinator AI for a disaster response system.
A structural anomaly or collapse has been detected with the following data:
Location: ${eventData?.latitude}, ${eventData?.longitude}
Risk Score: ${eventData?.finalRiskScore}
Local Devices: ${eventData?.localDeviceCount}

Generate a short array of 4 distinct autonomous agent actions that are currently taking place in real-time. 
Format each string precisely like: "[Agent-<ID>: <Department>] <Action>... [<Status>] <Detail>"

Output ONLY a JSON array of 4 strings. No markdown formatting, just the raw JSON array.
Example:
[
  "[Agent-1: Medical] Querying City Hospital ICU capacity... [OK] 42 beds reserved.",
  "[Agent-2: Fire] Dispatching HAZMAT unit to sector 7... [IN TRANSIT] ETA 2m.",
  ...
]`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    let text = response.text || "[]";
    // Clean up potential markdown formatting
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const actions = JSON.parse(text);

    return NextResponse.json({ actions });
  } catch (error: any) {
    console.error("Error generating agent actions:", error);
    return NextResponse.json({
        actions: [
          "[Agent-System: Error] Failed to connect to Gemini API. Reverting to manual dispatch.",
          "[Agent-1: Medical] Standby...",
          "[Agent-2: Traffic] Standby..."
        ]
      }, { status: 500 });
  }
}

import { GoogleGenAI, Type } from "@google/genai";
import { Combo } from "../types";

// Initialize the client. API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Generates a boxing workout combination based on difficulty and focus.
 */
export const generateBoxingCombo = async (difficulty: string, focus: string): Promise<Combo> => {
  try {
    const prompt = `Create a boxing combination for a ${difficulty} level boxer focusing on ${focus}. Return JSON.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            sequence: { 
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of punches, e.g., 'Jab', 'Cross', 'Left Hook', 'Uppercut', 'Slip'"
            },
            difficulty: { type: Type.STRING },
            description: { type: Type.STRING, description: "Brief tactical advice for this combo" }
          },
          required: ["name", "sequence", "difficulty", "description"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      id: Date.now().toString(),
      name: data.name || "Custom Combo",
      sequence: data.sequence || ["Jab", "Cross"],
      difficulty: (data.difficulty as any) || "Beginner",
      description: data.description || "Focus on technique."
    };

  } catch (error) {
    console.error("Gemini Combo Error:", error);
    // Fallback
    return {
      id: "error-fallback",
      name: "Emergency Fallback",
      sequence: ["Jab", "Cross", "Hook"],
      difficulty: "Beginner",
      description: "Connection failed. Focus on basics."
    };
  }
};

/**
 * Chat with the "Cornerman" (AI Coach).
 */
export const getCornermanAdvice = async (history: {role: string, parts: {text: string}[]}[], userMessage: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      history: history,
      config: {
        systemInstruction: "You are 'Mickey', an old-school, gritty, but highly intelligent boxing trainer. You give short, punchy advice. You use boxing terminology. Keep responses under 50 words unless asked for a detailed strategy. You are coaching a fighter in a VR simulation.",
      }
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "Keep your hands up, kid.";
  } catch (error) {
    console.error("Cornerman Error:", error);
    return "I can't hear you over the crowd! (Network Error)";
  }
};

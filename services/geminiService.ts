
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getTutorResponse = async (userPrompt: string, context: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      You are an expert high school chemistry tutor specializing in Solubility Equilibrium (Grade 12 level).
      Context: ${context}
      Student: ${userPrompt}
    `,
    config: {
      systemInstruction: "Keep explanations clear, concise, and focused on Ksp, Qsp, common ion effect, and precipitation calculations. Use LaTeX formatting for chemical formulas and math where possible (e.g., $AgCl$, $1.8 \\times 10^{-10}$).",
      temperature: 0.7,
    },
  });
  return response.text;
};

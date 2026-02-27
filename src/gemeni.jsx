import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generatePitch(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" }); // gemini-1.5-pro
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // text = text.replace(/\*\*|[#_*]/g, "");
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating pitch.";
  }
}

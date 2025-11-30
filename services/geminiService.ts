import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEventDescription = async (title: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found, returning mock data");
    return "Experience an unforgettable evening with us. (API Key missing)";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, exciting, and professional event description (max 50 words) for an event titled: "${title}".`,
    });
    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate description due to an error.";
  }
};

export const generateEventIdeas = async (category: string): Promise<string[]> => {
    if (!process.env.API_KEY) return ["Music Festival", "Tech Conference", "Art Workshop"];
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `List 3 creative event names for the category: ${category}. Return only the names separated by commas.`,
        });
        const text = response.text || "";
        return text.split(',').map(s => s.trim());
    } catch (e) {
        return ["Networking Mixer", "Product Launch", "Charity Gala"];
    }
}
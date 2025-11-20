
import { GoogleGenAI, Type } from "@google/genai";

// Fallback heuristique si pas de clé API ou erreur
const localHeuristic = (name: string, context: 'category' | 'item') => {
  const lower = name.toLowerCase();
  if (lower.includes('sport') || lower.includes('tennis') || lower.includes('foot') || lower.includes('gym')) 
    return { icon: 'Dumbbell', assetType: 'sport', color: '#f97316' };
  if (lower.includes('voyage') || lower.includes('avion') || lower.includes('trip') || lower.includes('vacances')) 
    return { icon: 'Plane', assetType: 'travel', color: '#0ea5e9' };
  if (lower.includes('tech') || lower.includes('ordi') || lower.includes('code') || lower.includes('apple')) 
    return { icon: 'Monitor', assetType: 'tech', color: '#6366f1' };
  if (lower.includes('maison') || lower.includes('immo') || lower.includes('loyer')) 
    return { icon: 'Home', assetType: 'home', color: '#ec4899' };
  if (lower.includes('santé') || lower.includes('doc') || lower.includes('hopital')) 
    return { icon: 'Heart', assetType: 'health', color: '#10b981' };
  if (lower.includes('banque') || lower.includes('argent') || lower.includes('bourse')) 
    return { icon: 'Wallet', assetType: 'finance', color: '#eab308' };
  
  return { icon: 'Box', assetType: 'default', color: '#94a3b8' };
};

export const suggestAttributes = async (name: string, context: 'category' | 'item') => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found, using heuristics.");
    return localHeuristic(name, context);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Suggest visual attributes for a 3D dashboard item named "${name}". 
      Context: ${context}.
      
      Available Assets: 'finance', 'health', 'home', 'nature', 'sport', 'tech', 'travel', 'default'.
      Available Colors: Hex codes.
      Available Icons: Lucide React icon names (e.g., 'Activity', 'Home', 'Dumbbell', 'Plane', 'Cpu', 'Wallet', 'TreeDeciduous').`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            icon: { type: Type.STRING, description: "Lucide icon name" },
            assetType: { type: Type.STRING, description: "One of the available assets" },
            color: { type: Type.STRING, description: "Best fitting hex color" }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return localHeuristic(name, context);
    return JSON.parse(text);

  } catch (error) {
    console.error("AI Suggestion failed:", error);
    return localHeuristic(name, context);
  }
};

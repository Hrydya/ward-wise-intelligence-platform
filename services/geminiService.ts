
import { GoogleGenAI, Type } from "@google/genai";
import { WardData, SimulationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPolicySimulation = async (ward: WardData, policy: string): Promise<SimulationResult> => {
  const prompt = `Act as an NCT Delhi environmental policy expert. Simulate the impact of: "${policy}" on ward "${ward.name}" (Current AQI: ${ward.aqi}). 
  Source profile: Ind:${ward.sourceDistribution.industrial}%, Veh:${ward.sourceDistribution.vehicular}%, Constr:${ward.sourceDistribution.construction}%, Bio:${ward.sourceDistribution.biomass}%. 
  Provide a scientific estimation considering emission factors and localized drift. 
  Include social equity impact (how it affects vulnerable groups like street vendors or children). 
  Be realistic; do not overclaim results.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          policy: { type: Type.STRING },
          projectedAqiReduction: { type: Type.NUMBER },
          confidenceRange: { type: Type.STRING, description: "Scientific confidence interval like '+/- 12%'" },
          feasibility: { type: Type.NUMBER, description: "Political and logistical feasibility index 0-100" },
          economicImpact: { type: Type.STRING, description: "Concise analysis of trade friction vs environmental gain" },
          socialEquityImpact: { type: Type.STRING, description: "Impact on vulnerable demographics" },
          detailedAnalysis: { type: Type.STRING, description: "Decision support summary for high-level officials" },
        },
        required: ["policy", "projectedAqiReduction", "confidenceRange", "feasibility", "economicImpact", "socialEquityImpact", "detailedAnalysis"],
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Simulation parse error", error);
    throw error;
  }
};

export const getGeneralInsight = async (topic: string): Promise<string> => {
  const prompt = `Provide a high-level strategic governance insight (max 40 words) for: "${topic}". Use formal NCT Delhi official terminology. Focus on inter-departmental synergy and measurable air quality goals.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text || "Strategic feed interrupted.";
};

export const getWardExplainer = async (ward: WardData): Promise<string> => {
  const prompt = `In 20 words, explain why AQI is ${ward.aqi} in ${ward.name} using these sources: Vehicular ${ward.sourceDistribution.vehicular}%, Industrial ${ward.sourceDistribution.industrial}%. Mention localized wind drift or traffic peaks if relevant. Professional but accessible for a citizen.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text || "Analyzing localized vector data...";
};

export const getHealthAdvice = async (aqi: number): Promise<string> => {
  const prompt = `Provide 3 highly specific protective actions for a citizen in ${aqi} AQI. Use actionable, localized advice (e.g. 'Use N95 during evening commute peaks'). Add disclaimer about consulting doctors.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text || "Localized health guidance offline.";
};

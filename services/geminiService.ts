import { GoogleGenAI, Type } from "@google/genai";
import { MacAnalysisResult } from "../types";

const apiKey = process.env.API_KEY;

export const analyzeMacAddress = async (macAddress: string): Promise<MacAnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze this MAC Address (OUI): ${macAddress}.
    Provide the most likely manufacturer, the typical device type associated with this manufacturer/range,
    a potential security risk assessment (Low/Medium/High) with a brief reason, and its likely usage context.
    If the MAC is a placeholder or invalid, provide a realistic hypothesis based on standard formats.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            manufacturer: { type: Type.STRING, description: "The likely manufacturer of the device" },
            deviceType: { type: Type.STRING, description: "Typical device type (e.g., Smartphone, IoT Camera, Laptop)" },
            securityRisk: { type: Type.STRING, description: "Risk level (Low, Medium, High) and brief reason" },
            likelyUsage: { type: Type.STRING, description: "Common context for this device (e.g., Personal use, Industrial automation)" }
          },
          required: ["manufacturer", "deviceType", "securityRisk", "likelyUsage"],
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }
    return JSON.parse(text) as MacAnalysisResult;
  } catch (error) {
    console.error("Error analyzing MAC:", error);
    return {
      manufacturer: "Unknown",
      deviceType: "Unidentified Generic Device",
      securityRisk: "Low - Unable to verify OUI",
      likelyUsage: "General Network Traffic"
    };
  }
};

export const generateSecurityReport = async (devicesCount: number, riskCount: number): Promise<string> => {
  if (!apiKey) return "API Key missing. Cannot generate report.";
  
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate a short, professional, executive summary (2 sentences) for a network security dashboard. 
    There are ${devicesCount} active tracked devices and ${riskCount} potential high-risk anomalies detected.`
  });
  
  return response.text || "System status normal.";
};

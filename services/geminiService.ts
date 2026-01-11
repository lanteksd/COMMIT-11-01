import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, Resident } from "../types";

// Initialize Gemini
// NOTE: In a real production app, ensure this key is not exposed to the client if not using user-provided keys.
// For this demo, we assume process.env.API_KEY is available via build config.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a clinical summary for a resident based on their recent logs.
 */
export const generateClinicalSummary = async (resident: Resident, recentLogs: DailyLog[]): Promise<string> => {
  try {
    const logsText = recentLogs.map(log => 
      `- [${new Date(log.timestamp).toLocaleString()}] ${log.type}: ${log.description} ${log.mood ? `(Mood: ${log.mood})` : ''} ${log.vitals ? `(BP: ${log.vitals.systolic}/${log.vitals.diastolic}, Temp: ${log.vitals.temperature}C)` : ''}`
    ).join('\n');

    const prompt = `
      Atue como um enfermeiro chefe experiente em geriatria (ILPI).
      Analise os seguintes registros recentes do residente ${resident.name} (Idade: ${resident.age}).
      
      Condições Médicas: ${resident.medicalConditions.join(', ')}
      
      Registros Recentes:
      ${logsText}
      
      Forneça um resumo clínico conciso em português (máximo 2 parágrafos). 
      Destaque quaisquer tendências preocupantes (ex: alterações de humor, sinais vitais instáveis) 
      ou confirme a estabilidade. Use tom profissional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar o resumo no momento.";
  } catch (error) {
    console.error("Erro ao gerar resumo clínico:", error);
    return "Erro ao conectar com a IA para gerar o resumo. Verifique sua chave API.";
  }
};

/**
 * Suggests activities based on resident capabilities.
 */
export const suggestActivities = async (resident: Resident): Promise<string[]> => {
  try {
    const prompt = `
      Sugira 3 atividades recreativas ou terapêuticas específicas para um idoso em uma ILPI.
      
      Perfil:
      - Nome: ${resident.name}
      - Idade: ${resident.age}
      - Mobilidade: ${resident.mobilityStatus}
      - Condições: ${resident.medicalConditions.join(', ')}
      
      Retorne APENAS um array JSON de strings com os títulos das atividades.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Erro ao sugerir atividades:", error);
    return ["Caminhada leve supervisionada", "Leitura em grupo", "Musicoterapia"];
  }
};

/**
 * Checks for anomalies in vitals using AI reasoning.
 */
export const checkVitalSignsAnomaly = async (vitals: any, history: any[]): Promise<string | null> => {
    // Light-weight check
    try {
        const prompt = `
        Analise estes sinais vitais atuais comparados ao histórico breve.
        Atual: ${JSON.stringify(vitals)}
        Histórico (médias): ${JSON.stringify(history)}
        
        Se houver algo alarmante (risco imediato), retorne uma frase curta de alerta em Português.
        Se estiver normal ou aceitável, retorne "OK".
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        const text = response.text?.trim();
        return text === "OK" ? null : text || null;
    } catch (e) {
        return null;
    }
}

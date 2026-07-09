import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export async function analyzePatient(patientText) {
 const prompt = `
You are an experienced medical AI assistant.

Analyze the patient and respond in a SHORT format.

Return only these sections:

Overall Health:
Possible Disease:
Risk:
Recommended Tests:
Next Step:

Keep the response under 120 words.
Do NOT use markdown.
Do NOT use headings with ###.
Do NOT explain in detail.

Patient Details:
${patientText}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
  });

  return response.text;
}
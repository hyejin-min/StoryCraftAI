import { GoogleGenAI, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a base64 string (without mime prefix)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove "data:image/xyz;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzes the image and ghostwrites a story opener.
 */
export const generateStoryFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  
  const prompt = `
    Analyze the mood, lighting, setting, and details of this image. 
    Based on this analysis, ghostwrite a captivating opening paragraph (approx 150 words) 
    for a fiction story set in this world. 
    
    The tone should be immersive and match the visual aesthetics of the image.
    Do NOT preface the story with "Here is a story" or include the analysis in the output. 
    Just write the story text directly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          { text: prompt }
        ]
      }
    });

    return response.text || "The creative spark flickered, but no words appeared. Please try again.";
  } catch (error) {
    console.error("Error generating story:", error);
    throw new Error("Failed to generate story.");
  }
};

/**
 * Generates speech audio from text.
 * Returns base64 encoded raw PCM audio.
 */
export const generateSpeechFromText = async (text: string): Promise<string> => {
  const ai = getAI();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore', 'Fenrir', 'Puck', 'Charon'
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received from model.");
    }

    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Failed to generate speech.");
  }
};

import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  // Always use a named parameter for the API key obtained exclusively from process.env.API_KEY.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const performTryOn = async (
  personImageBase64: string,
  personMimeType: string,
  clothingImageBase64: string,
  clothingMimeType: string,
  clothingName: string
): Promise<string> => {
  const ai = getAIClient();
  
  const prompt = `
    TASK: Professional AI Fashion Virtual Try-On.
    INPUTS: 
    1. A base image of a model person.
    2. A reference image of a clothing item (${clothingName}).
    
    INSTRUCTIONS:
    - Fit the clothing item from the second image perfectly onto the person in the first image.
    - PRESERVE: Face, body structure, skin tone, pose, expression, and background of the person.
    - FABRIC: Apply realistic fabric behavior including natural folds, wrinkles, stretching, and gravity-influenced drape.
    - LIGHTING: Match lighting and shadows seamlessly between the person and the new garment.
    - QUALITY: Studio-quality, high-resolution, photorealistic finish.
    - RESTRICTION: Do NOT change the person's identity. Only replace the relevant clothing part.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: personImageBase64.split(',')[1] || personImageBase64,
            mimeType: personMimeType,
          },
        },
        {
          inlineData: {
            data: clothingImageBase64.split(',')[1] || clothingImageBase64,
            mimeType: clothingMimeType,
          },
        },
        { text: prompt },
      ],
    },
  });

  // Iterate through all parts to find the image part, as it may not be the first part returned.
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("Model failed to generate a try-on image.");
};

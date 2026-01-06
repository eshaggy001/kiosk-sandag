
import { GoogleGenAI, Type } from "@google/genai";
import { CartItem, Product } from "../types";

// Always initialize GoogleGenAI with a named parameter for the apiKey from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartRecommendations = async (cart: CartItem[], allProducts: Product[]) => {
  if (!process.env.API_KEY) return [];

  const cartNames = cart.map(item => item.name).join(', ');
  const productsList = allProducts.map(p => `${p.name} (${p.category})`).join(', ');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Given the following items already in a coffee shop kiosk cart: [${cartNames}], 
      suggest 2 additional products from this menu: [${productsList}] that would complement them well. 
      Return the names exactly as provided in the list.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["productName", "reason"]
          }
        }
      }
    });

    // Extract generated text using the .text property and trim for JSON parsing.
    const result = JSON.parse(response.text.trim());
    return result;
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
};

export const getVirtualBaristaHelp = async (query: string) => {
  if (!process.env.API_KEY) return "I'm sorry, I'm offline right now.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Virtual Barista for MegaCoffee. Answer this customer's question briefly and helpfully: "${query}"`,
      config: {
        systemInstruction: "You are a friendly and professional Virtual Barista for MegaCoffee. Keep responses under 30 words."
      }
    });
    // Access the text property directly from the response object.
    return response.text;
  } catch (error) {
    return "I'm having trouble connecting to my coffee knowledge. How can I help you otherwise?";
  }
};

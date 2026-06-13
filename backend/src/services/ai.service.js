import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// We simulate success if no key is provided just for presentation, but it expects GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

export const getTravelAdvice = async (destination, interest) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return `Simulated AI Advice: Welcome to ${destination}! For ${interest}, remember to be respectful of local customs. (Please add GEMINI_API_KEY for real advice).`;
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Act as an expert local travel guide. Provide cultural etiquette, travel tips, and recommendations for a tourist visiting ${destination} who is interested in ${interest}. Keep it concise and helpful.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to fetch AI advice');
  }
};

export const checkAllergies = async (foodName, allergies) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return `Simulated Allergy Check: The dish "${foodName}" might contain ${allergies}. Proceed with caution! (Please add GEMINI_API_KEY for real checking).`;
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `I am allergic to: ${allergies}. Does the dish or ingredient "${foodName}" typically contain these allergens? What should I watch out for?`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to fetch AI allergy check');
  }
};

export const analyzeForeignText = async (text, context) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return `Simulated Analysis: This text appears to be a ${context}. It means "${text}". (Please add GEMINI_API_KEY for real analysis).`;
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze this translated text: "${text}". The context is a ${context} (e.g. Menu, Street Sign, Document). Explain what it is, any cultural significance, or details a tourist should know.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze text');
  }
};

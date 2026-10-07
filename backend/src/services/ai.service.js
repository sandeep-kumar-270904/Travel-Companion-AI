import { GoogleGenerativeAI } from '@google/generative-ai';

const getGenAI = (userApiKey) => {
  const key = userApiKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
};

const executeWithFallback = async (genAI, prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    if (error.status === 503) {
      console.warn('Gemini 2.5 Flash returned 503. Retrying with gemini-2.5-pro...');
      try {
        const modelPro = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        const resultPro = await modelPro.generateContent(prompt);
        return resultPro.response.text();
      } catch (proError) {
        throw new Error('Google AI services are temporarily unavailable (503). Please try again later.');
      }
    }
    throw error;
  }
};

export const getTravelAdvice = async (destination, interest, userApiKey) => {
  try {
    const genAI = getGenAI(userApiKey);
    if (!genAI) {
      return `Simulated AI Advice: Welcome to ${destination}! For ${interest}, remember to be respectful of local customs. (Please add GEMINI_API_KEY for real advice).`;
    }
    const prompt = `Act as an expert local travel guide. Provide cultural etiquette, travel tips, and recommendations for a tourist visiting ${destination} who is interested in ${interest}. Keep it concise and helpful.`;
    return await executeWithFallback(genAI, prompt);
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error.message.includes('503')) return error.message;
    throw new Error('Failed to fetch AI advice');
  }
};

export const checkAllergies = async (foodName, allergies, userApiKey) => {
  try {
    const genAI = getGenAI(userApiKey);
    if (!genAI) {
      return `Simulated Allergy Check: The dish "${foodName}" might contain ${allergies}. Proceed with caution! (Please add GEMINI_API_KEY for real checking).`;
    }
    const prompt = `I am allergic to: ${allergies}. Does the dish or ingredient "${foodName}" typically contain these allergens? What should I watch out for?`;
    return await executeWithFallback(genAI, prompt);
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error.message.includes('503')) return error.message;
    throw new Error('Failed to fetch AI allergy check');
  }
};

export const analyzeForeignText = async (text, context, userApiKey) => {
  try {
    const genAI = getGenAI(userApiKey);
    if (!genAI) {
      return `Simulated Analysis: This text appears to be a ${context}. It means "${text}". (Please add GEMINI_API_KEY for real analysis).`;
    }
    const prompt = `Analyze this translated text: "${text}". The context is a ${context} (e.g. Menu, Street Sign, Document). Explain what it is, any cultural significance, or details a tourist should know.`;
    return await executeWithFallback(genAI, prompt);
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error.message.includes('503')) return error.message;
    throw new Error('Failed to analyze text');
  }
};

export const generateItinerary = async (destination, days, userApiKey) => {
  try {
    const genAI = getGenAI(userApiKey);
    if (!genAI) {
      return `Simulated Itinerary for ${destination}: Day 1: Explore downtown. Day 2: Visit museums. Day 3: Relax at a park. (Please add GEMINI_API_KEY for a real itinerary).`;
    }
    const prompt = `Create a ${days}-day travel itinerary for ${destination}. Format the response in clear Markdown with headings for each day. Include morning, afternoon, and evening suggestions. Suggest specific famous landmarks, local foods, and practical travel tips. Make it engaging and easy to read.`;
    return await executeWithFallback(genAI, prompt);
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error.message.includes('503')) return error.message;
    throw new Error('Failed to generate itinerary');
  }
};

export const chatWithCompanion = async (companionProfile, message, chatHistory, userApiKey) => {
  try {
    const genAI = getGenAI(userApiKey);
    if (!genAI) {
      return `[Simulated Companion]: That's so cool! I'd love to chat more about ${companionProfile.destination}, but I need a Gemini API Key to really come alive.`;
    }
    
    const historyContext = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    const prompt = `
You are roleplaying as a traveler named ${companionProfile.name}.
You are planning a trip to ${companionProfile.destination} from ${companionProfile.dates}.
Your interests are: ${companionProfile.interests.join(', ')}.

A user is reaching out to you to potentially travel together or meet up.
Respond naturally, friendly, and enthusiastically, but keep it brief like a text message (1-2 sentences max). 
Stay in character. Do not break character. Do not say you are an AI.

Chat History:
${historyContext}
User: ${message}
${companionProfile.name}:`;

    return await executeWithFallback(genAI, prompt);
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error.message.includes('503')) return error.message;
    throw new Error('Failed to chat with companion');
  }
};

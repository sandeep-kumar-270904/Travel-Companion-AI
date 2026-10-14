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

import axios from 'axios';

const WMO_CODE_MAP = {
  0: { label: "Sunny", icon: "☀️" },
  1: { label: "Mainly Clear", icon: "🌤️" },
  2: { label: "Partly Cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Depositing Rime Fog", icon: "🌫️" },
  51: { label: "Light Drizzle", icon: "🌦️" },
  53: { label: "Moderate Drizzle", icon: "🌦️" },
  55: { label: "Dense Drizzle", icon: "🌧️" },
  61: { label: "Slight Rain", icon: "🌦️" },
  63: { label: "Moderate Rain", icon: "🌧️" },
  65: { label: "Heavy Rain", icon: "⛈️" },
  71: { label: "Slight Snow", icon: "🌨️" },
  73: { label: "Moderate Snow", icon: "🌨️" },
  75: { label: "Heavy Snow", icon: "❄️" },
  80: { label: "Rain Showers", icon: "🌦️" },
  81: { label: "Moderate Showers", icon: "🌧️" },
  82: { label: "Violent Showers", icon: "⛈️" },
  95: { label: "Thunderstorm", icon: "⚡" },
  96: { label: "Thunderstorm with Hail", icon: "⛈️" }
};

export const fetchDestinationWeather = async (destination) => {
  try {
    const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`, { timeout: 4000 });
    if (!geoRes.data?.results?.[0]) return null;
    const { latitude, longitude, name, country } = geoRes.data.results[0];

    const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`, { timeout: 4000 });
    const daily = weatherRes.data?.daily;
    if (!daily || !daily.time) return null;

    const forecast = daily.time.slice(0, 3).map((date, idx) => {
      const code = daily.weathercode ? daily.weathercode[idx] : 0;
      const info = WMO_CODE_MAP[code] || { label: "Partly Cloudy", icon: "⛅" };
      return {
        date,
        day: `Day ${idx + 1}`,
        maxTemp: Math.round(daily.temperature_2m_max[idx]),
        minTemp: Math.round(daily.temperature_2m_min[idx]),
        rainProb: daily.precipitation_probability_max ? daily.precipitation_probability_max[idx] : 0,
        condition: info.label,
        icon: info.icon
      };
    });

    return { city: name, country, forecast };
  } catch (err) {
    console.warn("Open-Meteo weather fetch skipped/failed:", err.message);
    return null;
  }
};

export const generateItinerary = async (destination, days, userApiKey) => {
  try {
    const weatherData = await fetchDestinationWeather(destination);
    let weatherContext = "";
    if (weatherData && weatherData.forecast?.length > 0) {
      weatherContext = `Real-time Weather Forecast for ${weatherData.city}:\n` +
        weatherData.forecast.map(f => `- ${f.day} (${f.date}): ${f.condition} ${f.icon}, High: ${f.maxTemp}°C, Low: ${f.minTemp}°C, Rain Chance: ${f.rainProb}%`).join('\n') +
        `\nAdapt the itinerary according to the forecast (e.g. prioritize museums, covered markets, and indoor cultural spaces on rainy days, and outdoor parks, viewpoints, and walking tours on clear/sunny days).\n`;
    }

    const genAI = getGenAI(userApiKey);
    if (!genAI) {
      return {
        itinerary: `Simulated Itinerary for ${destination}:\n\n## Day 1: City Highlights & Culture\n- **Morning:** Visit prominent central landmarks and local cafes.\n- **Afternoon:** Explore local art and historical museums.\n- **Evening:** Dine at a traditional street market.\n\n## Day 2: Architecture & Hidden Alleys\n- **Morning:** Walking tour around historic quarters.\n- **Afternoon:** Scenic viewpoint and park stroll.\n- **Evening:** Authentic local dinner.\n\n## Day 3: Modern Vibe & Sunset Views\n- **Morning:** Visit vibrant shopping and modern arts district.\n- **Afternoon:** Local culinary workshop or tea/coffee tasting.\n- **Evening:** Farewell dinner with panoramic skyline views.\n\n*(Add your Google Gemini API Key for fully autonomous personalized itineraries)*`,
        weather: weatherData?.forecast || []
      };
    }

    const prompt = `Create a realistic ${days}-day travel itinerary for ${destination}.
${weatherContext}
Format the response in clean Markdown with clear headings for each day (e.g. ## Day 1: [Theme]).
Structure each day with Morning, Afternoon, and Evening recommendations that are geographically sensible and clustered together to avoid transit fatigue.
Highlight specific authentic foods to try and practical local etiquette tips. Make it engaging, helpful, and realistic.`;

    const itinerary = await executeWithFallback(genAI, prompt);
    return {
      itinerary,
      weather: weatherData?.forecast || []
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error.message.includes('503')) return { itinerary: error.message, weather: [] };
    throw new Error('Failed to generate itinerary');
  }
};

export const analyzeMenuStructured = async (text, userApiKey) => {
  try {
    const genAI = getGenAI(userApiKey);
    if (!genAI) {
      return [
        {
          name: "Sample Regional Specialty",
          originalName: text.slice(0, 30),
          description: "Authentic local specialty prepared with regional spices and seasonal ingredients.",
          flavorProfile: "Rich & Savory",
          spiceLevel: "Mild",
          hiddenAllergens: ["Soy", "Sesame"],
          dietaryTags: ["Authentic Specialty"]
        }
      ];
    }
    const prompt = `Analyze this foreign menu or food description:
"${text}"

Extract the culinary items and return a valid JSON array of objects with the exact schema:
[
  {
    "name": "Dish Name (English)",
    "originalName": "Original Native Script (if recognizable)",
    "description": "Brief description of ingredients and cooking style",
    "flavorProfile": "e.g. Savory, Spicy, Sweet, Umami, Tangy",
    "spiceLevel": "None | Mild | Medium | High",
    "hiddenAllergens": ["List any hidden allergens such as peanut oil, fish sauce, dairy, lard, gluten, eggs, sesame"],
    "dietaryTags": ["Vegetarian", "Vegan", "Halal", "Gluten-Free", "Contains Pork", etc.]
  }
]
Return ONLY raw JSON array. No markdown code blocks, no other text.`;

    const raw = await executeWithFallback(genAI, prompt);
    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '').trim();
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Menu Analysis Error:', error);
    return [
      {
        name: "Identified Dish",
        originalName: "",
        description: text,
        flavorProfile: "Authentic Local Flavor",
        spiceLevel: "Mild",
        hiddenAllergens: [],
        dietaryTags: ["Local Dish"]
      }
    ];
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

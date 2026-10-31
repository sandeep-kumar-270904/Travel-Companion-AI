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
import { ELECTRICAL_STANDARDS_DATABASE } from '../data/travelStandardsData.js';

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


export const generateSmartPackingList = async (destination, durationDays = 5, tripType = 'leisure', userApiKey) => {
  try {
    const weatherData = await fetchDestinationWeather(destination);
    
    // Match destination to electrical standards
    const destLower = destination.toLowerCase();
    let electricalInfo = null;
    for (const key of Object.keys(ELECTRICAL_STANDARDS_DATABASE)) {
      if (destLower.includes(key.replace('_', ' ')) || (weatherData?.country && weatherData.country.toLowerCase().includes(key.replace('_', ' ')))) {
        electricalInfo = ELECTRICAL_STANDARDS_DATABASE[key];
        break;
      }
    }
    if (!electricalInfo) {
      electricalInfo = {
        country: destination,
        plugTypes: ["Universal / Type C or A"],
        voltage: "100V - 240V",
        frequency: "50/60Hz",
        details: "Universal multi-country plug adapter recommended.",
        culturalDressCode: "Pack breathable layers and respectful modest clothing for historical sites."
      };
    }

    const avgMaxTemp = weatherData?.forecast?.length
      ? Math.round(weatherData.forecast.reduce((a, c) => a + c.maxTemp, 0) / weatherData.forecast.length)
      : 22;
    const maxRainProb = weatherData?.forecast?.length
      ? Math.max(...weatherData.forecast.map(f => f.rainProb))
      : 20;

    const genAI = getGenAI(userApiKey);
    if (genAI) {
      const prompt = `Create an intelligent, categorized packing checklist for a ${durationDays}-day ${tripType} trip to ${destination}.
Weather Forecast: Avg High: ${avgMaxTemp}°C, Max Rain Chance: ${maxRainProb}%.
Electrical Info: Plugs ${electricalInfo.plugTypes.join(', ')}, ${electricalInfo.voltage}.
Cultural Notes: ${electricalInfo.culturalDressCode}.

Return ONLY a valid JSON object matching this schema:
{
  "categories": [
    {
      "name": "Category Name (e.g. 🛂 Documents & Money, 🔌 Electronics & Adapters, 👕 Weather-Smart Clothing, 💊 Meds & Toiletries, 🎒 Daily Transit Bag)",
      "items": [
        {
          "name": "Item Name",
          "quantity": "e.g. 1, 5 pairs, etc.",
          "essential": true,
          "tip": "Short contextual reason"
        }
      ]
    }
  ],
  "specialRecommendations": [
    "Specific tip 1 based on local weather/rules",
    "Specific tip 2"
  ]
}
Return ONLY raw JSON, no markdown codeblocks, no explanation.`;

      const raw = await executeWithFallback(genAI, prompt);
      let cleaned = raw.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '').trim();
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        success: true,
        destination,
        durationDays,
        tripType,
        weather: weatherData?.forecast || [],
        electrical: electricalInfo,
        categories: parsed.categories || [],
        specialRecommendations: parsed.specialRecommendations || []
      };
    }

    // Curated Intelligent Fallback Generator
    const clothingItems = [
      { name: "Underwear & Base Socks", quantity: `${Number(durationDays) + 2} pairs`, essential: true, tip: "Quick-dry or merino wool" },
      { name: "Breathable Tops / Shirts", quantity: `${durationDays} shirts`, essential: true, tip: "Layerable fabrics" },
      { name: "Comfortable Walking Shoes", quantity: "1 pair (broken in)", essential: true, tip: "Crucial for cobblestones & 15k+ daily steps" },
      { name: "Pants / Trousers / Bottoms", quantity: `${Math.min(4, Math.ceil(durationDays / 2))} pairs`, essential: true, tip: "Include 1 conservative pair covering knees for temples/churches" }
    ];

    if (maxRainProb > 30) {
      clothingItems.push({ name: "Windproof Compact Umbrella / Rain Shell", quantity: "1", essential: true, tip: `Weather alert: ${maxRainProb}% rain probability forecast` });
    }
    if (avgMaxTemp < 15) {
      clothingItems.push(
        { name: "Insulated Jacket or Packable Down", quantity: "1", essential: true, tip: `Chilly weather: highs around ${avgMaxTemp}°C` },
        { name: "Warm Scarf & Beanie", quantity: "1 set", essential: false, tip: "Evening chill protection" }
      );
    } else if (avgMaxTemp > 25) {
      clothingItems.push(
        { name: "UV Sunglasses & Sun Hat", quantity: "1 each", essential: true, tip: `Warm weather: highs around ${avgMaxTemp}°C` },
        { name: "High-SPF Sunscreen (TSA travel size)", quantity: "1", essential: true, tip: "Carry in daypack" }
      );
    }

    if (tripType === 'business') {
      clothingItems.push(
        { name: "Business Suit / Blazer", quantity: "1-2", essential: true, tip: "Wrinkle-resistant fabric" },
        { name: "Formal Dress Shoes", quantity: "1 pair", essential: true, tip: "Polished and comfortable" }
      );
    } else if (tripType === 'hiking') {
      clothingItems.push(
        { name: "Sturdy Trail Shoes / Hiking Boots", quantity: "1 pair", essential: true, tip: "High-traction grip" },
        { name: "Hydration Flask / Water Bladder", quantity: "1", essential: true, tip: "Stay hydrated on trails" }
      );
    }

    return {
      success: true,
      destination,
      durationDays,
      tripType,
      weather: weatherData?.forecast || [],
      electrical: electricalInfo,
      categories: [
        {
          name: "🛂 Documents, Money & Entry",
          items: [
            { name: "Passport (valid 6+ months past return)", quantity: "1", essential: true, tip: "Keep physical and digital photo backup" },
            { name: "Travel Insurance Policy Card", quantity: "1", essential: true, tip: "24/7 medical hotline saved" },
            { name: "Credit/Debit Cards (No Foreign Tx Fee)", quantity: "2 cards", essential: true, tip: "Inform bank of international dates" },
            { name: "Local Cash Currency", quantity: "$100-$200 equivalent", essential: true, tip: "Small bills for street vendors and taxis" },
            { name: "Flight & Hotel Confirmation PDFs", quantity: "Offline copies", essential: true, tip: "Saved in Document Vault" }
          ]
        },
        {
          name: "🔌 Electronics & Power Adapters",
          items: [
            { name: `Travel Plug Adapter (${electricalInfo.plugTypes.join(' / ')})`, quantity: "1-2", essential: true, tip: `${destination} uses ${electricalInfo.voltage} sockets` },
            { name: "High-Capacity Power Bank (10,000–20,000 mAh)", quantity: "1 (Carry-on only)", essential: true, tip: "Navigation and camera drain phone quickly" },
            { name: "Phone Charging Cables (Durable Braided)", quantity: "2 cables", essential: true, tip: "Keep 1 in hotel, 1 in daypack" },
            { name: "Noise-Cancelling Headphones / Earplugs", quantity: "1", essential: false, tip: "Vital for flights, trains, and noisy hostels" }
          ]
        },
        {
          name: "👕 Weather-Smart Clothing",
          items: clothingItems
        },
        {
          name: "💊 Health, Toiletries & First-Aid",
          items: [
            { name: "Prescription Medications (in original bottles)", quantity: "Trip duration + 3 days", essential: true, tip: "Keep in carry-on bag, never checked" },
            { name: "Travel First-Aid Kit (Pain relief, Band-Aids, Anti-diarrheal)", quantity: "1 small pouch", essential: true, tip: "Hard to buy specific brands in foreign pharmacies" },
            { name: "Electrolyte Hydration Packets", quantity: "3-5 packs", essential: false, tip: "Recovery from flights and long walking days" },
            { name: "Travel-size Toothbrush & Solid Toiletries", quantity: "1 kit", essential: true, tip: "Compliant with 100ml / 3-1-1 liquids rule" }
          ]
        },
        {
          name: "🎒 Daypack & Transit Gear",
          items: [
            { name: "Packable Lightweight Daypack (15-20L)", quantity: "1", essential: true, tip: "Holds water, jacket, and souvenir purchases" },
            { name: "RFID-Blocking Neck Pouch or Money Belt", quantity: "1", essential: false, tip: "Deters crowded transit pickpockets" },
            { name: "Wet Wipes & Pocket Tissues", quantity: "2 travel packs", essential: true, tip: "Public restrooms often lack napkins" }
          ]
        }
      ],
      specialRecommendations: [
        `Cultural Etiquette: ${electricalInfo.culturalDressCode}`,
        `Electrical Notice: Outlets in ${destination} are ${electricalInfo.voltage}. Dual-voltage chargers work without a transformer.`
      ]
    };
  } catch (error) {
    console.error('Packing checklist error:', error);
    throw new Error('Failed to generate packing checklist');
  }
};

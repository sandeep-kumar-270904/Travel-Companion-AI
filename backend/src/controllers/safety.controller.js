import { CITY_SCAMS_DATABASE, EMERGENCY_NUMBERS_DATABASE } from '../data/scamsData.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const getGenAI = (userApiKey) => {
  const key = userApiKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
};

export const getScams = async (req, res, next) => {
  try {
    const { city = 'rome', apiKey } = req.query;
    const normalized = city.toLowerCase().trim().replace(/\s+/g, '_');

    // 1. Check curated database
    if (CITY_SCAMS_DATABASE[normalized]) {
      return res.json({
        success: true,
        source: 'curated',
        city,
        scams: CITY_SCAMS_DATABASE[normalized]
      });
    }

    // 2. Check partial matches
    for (const key of Object.keys(CITY_SCAMS_DATABASE)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return res.json({
          success: true,
          source: 'curated',
          city: key,
          scams: CITY_SCAMS_DATABASE[key]
        });
      }
    }

    // 3. Fallback to Gemini 2.5
    const genAI = getGenAI(apiKey);
    if (!genAI) {
      return res.json({
        success: true,
        source: 'fallback',
        city,
        scams: [
          {
            title: `Taxi Meter & Overcharge Alerts in ${city}`,
            hotspot: "Airports and Train Stations",
            severity: "Common",
            howItWorks: "Unlicensed drivers solicit fares or refuse to engage the meter, claiming flat rates higher than legal tariffs.",
            avoidance: "Always use official taxi queues or rideshare apps (Uber/Bolt/Grab) with upfront pricing."
          },
          {
            title: `Pickpocketing in Crowded Transit`,
            hotspot: "Central Metro Hubs & Tourist Attractions",
            severity: "High Frequency",
            howItWorks: "Groups create artificial bottlenecks or bumps while an accomplice unzips backpacks.",
            avoidance: "Wear backpacks on your front in subways and keep phones tethered or in zipped internal pockets."
          }
        ]
      });
    }

    const prompt = `You are an international travel security expert.
Provide the top 3 most prevalent tourist scams or safety traps in ${city}.
Return a strict JSON array with this schema:
[
  {
    "title": "Name of the scam",
    "hotspot": "Specific landmark, neighborhood, or transit hub where it happens",
    "severity": "Low | Moderate | High Frequency | High Cost",
    "howItWorks": "1-2 sentences on how tourists are targeted",
    "avoidance": "Actionable, concrete tip to avoid falling for it"
  }
]
Return ONLY raw JSON array.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    if (text.startsWith('```')) text = text.replace(/```/g, '').trim();

    const scams = JSON.parse(text);
    res.json({ success: true, source: 'ai', city, scams });
  } catch (error) {
    console.error("Scam radar error:", error);
    next(error);
  }
};

export const getEmergency = (req, res) => {
  const { country = 'japan' } = req.query;
  const normalized = country.toLowerCase().trim().replace(/\s+/g, '_');

  const match = EMERGENCY_NUMBERS_DATABASE[normalized] || EMERGENCY_NUMBERS_DATABASE.japan;
  res.json({
    success: true,
    data: match,
    availableCountries: Object.keys(EMERGENCY_NUMBERS_DATABASE)
  });
};

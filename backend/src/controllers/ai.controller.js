import * as aiService from '../services/ai.service.js';

export const travelAdvice = async (req, res, next) => {
  try {
    const { destination, interest, apiKey } = req.body;
    if (!destination) return res.status(400).json({ error: 'Destination is required' });
    const advice = await aiService.getTravelAdvice(destination, interest || 'general sightseeing', apiKey);
    res.json({ advice });
  } catch (error) {
    next(error);
  }
};

export const checkAllergies = async (req, res, next) => {
  try {
    const { foodName, allergies, apiKey } = req.body;
    if (!foodName || !allergies) return res.status(400).json({ error: 'Food name and allergies are required' });
    const result = await aiService.checkAllergies(foodName, allergies, apiKey);
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

export const analyzeText = async (req, res, next) => {
  try {
    const { text, context, apiKey } = req.body;
    if (!text || !context) {
      return res.status(400).json({ error: 'Text and context are required' });
    }
    const analysis = await aiService.analyzeForeignText(text, context, apiKey);
    res.json({ analysis });
  } catch (error) {
    next(error);
  }
};

export const generateItinerary = async (req, res, next) => {
  try {
    const { destination, days = 3, apiKey } = req.body;
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }
    const itinerary = await aiService.generateItinerary(destination, days, apiKey);
    res.json({ itinerary });
  } catch (error) {
    next(error);
  }
};

export const chatCompanion = async (req, res, next) => {
  try {
    const { companionProfile, message, chatHistory = [], apiKey } = req.body;
    if (!companionProfile || !message) {
      return res.status(400).json({ error: 'Companion profile and message are required' });
    }
    const reply = await aiService.chatWithCompanion(companionProfile, message, chatHistory, apiKey);
    res.json({ reply });
  } catch (error) {
    next(error);
  }
};

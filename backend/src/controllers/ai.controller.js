import * as aiService from '../services/ai.service.js';

export const travelAdvice = async (req, res, next) => {
  try {
    const { destination, interest } = req.body;
    if (!destination) return res.status(400).json({ error: 'Destination is required' });
    const advice = await aiService.getTravelAdvice(destination, interest || 'general sightseeing');
    res.json({ advice });
  } catch (error) {
    next(error);
  }
};

export const checkAllergies = async (req, res, next) => {
  try {
    const { foodName, allergies } = req.body;
    if (!foodName || !allergies) return res.status(400).json({ error: 'Food name and allergies are required' });
    const result = await aiService.checkAllergies(foodName, allergies);
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

export const analyzeText = async (req, res, next) => {
  try {
    const { text, context } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const analysis = await aiService.analyzeForeignText(text, context || 'general sign');
    res.json({ analysis });
  } catch (error) {
    next(error);
  }
};

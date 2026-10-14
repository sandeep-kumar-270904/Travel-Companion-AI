import express from 'express';
import { travelAdvice, checkAllergies, analyzeText, generateItinerary, chatCompanion, analyzeMenu } from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/travel-advice', travelAdvice);
router.post('/allergy-check', checkAllergies);
router.post('/analyze-text', analyzeText);
router.post('/analyze-menu', analyzeMenu);
router.post('/itinerary', generateItinerary);
router.post('/companion-chat', chatCompanion);

export default router;

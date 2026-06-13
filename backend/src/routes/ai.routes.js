import express from 'express';
import { travelAdvice, checkAllergies, analyzeText } from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/travel-advice', travelAdvice);
router.post('/allergy-check', checkAllergies);
router.post('/analyze-text', analyzeText);

export default router;

import express from 'express';
import { getScams, getEmergency, getTippingGuide } from '../controllers/safety.controller.js';

const router = express.Router();

router.get('/scams', getScams);
router.get('/emergency', getEmergency);
router.get('/tipping', getTippingGuide);

export default router;

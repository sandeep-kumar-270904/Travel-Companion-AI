import express from 'express';
import { getScams, getEmergency } from '../controllers/safety.controller.js';

const router = express.Router();

router.get('/scams', getScams);
router.get('/emergency', getEmergency);

export default router;

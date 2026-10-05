import express from 'express';
import { getCompanions, createCompanion } from '../controllers/companion.controller.js';

const router = express.Router();

router.get('/', getCompanions);
router.post('/', createCompanion);

export default router;

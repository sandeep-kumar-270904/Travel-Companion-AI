import express from 'express';
import { getAll, getByCategory, getAudio } from '../controllers/phrase.controller.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:category', getByCategory);
router.get('/audio/:filename', getAudio);

export default router;

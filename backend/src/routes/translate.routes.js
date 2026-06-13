import express from 'express';
import { translateText, textToSpeech } from '../controllers/translate.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Optional auth for saving history
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.post('/', optionalAuth, translateText);
router.post('/speak', textToSpeech);

export default router;

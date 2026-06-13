import express from 'express';
import { translateText, textToSpeech, speechToText } from '../controllers/translate.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Optional auth for saving history
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.post('/', optionalAuth, translateText);
router.post('/speak', textToSpeech);
router.post('/listen', upload.single('audio'), speechToText);

export default router;

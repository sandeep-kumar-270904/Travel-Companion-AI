import * as translateService from '../services/translate.service.js';
import * as userService from '../services/user.service.js';
import { z } from 'zod';

const translateSchema = z.object({
  text: z.string().min(1),
  fromLang: z.string().min(2),
  toLang: z.string().min(2),
});

const ttsSchema = z.object({
  text: z.string().min(1),
  lang: z.string().min(2),
});

export const translateText = async (req, res, next) => {
  try {
    const { text, fromLang, toLang } = translateSchema.parse(req.body);
    const result = await translateService.translateText(text, fromLang, toLang);
    
    // Save to history if user is authenticated
    if (req.user) {
      await userService.addTranslationHistory(req.user._id, {
        originalText: text,
        translatedText: result.translatedText,
        fromLang: result.detectedSourceLanguage === 'auto' ? result.detectedSourceLanguage : fromLang,
        toLang,
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const textToSpeech = async (req, res, next) => {
  try {
    const { text, lang } = ttsSchema.parse(req.body);
    const audio = await translateService.generateSpeech(text, lang);
    res.json({ audio });
  } catch (error) {
    next(error);
  }
};

export const speechToText = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }
    const text = await translateService.recognizeSpeech(req.file.buffer);
    res.json({ text });
  } catch (error) {
    next(error);
  }
};

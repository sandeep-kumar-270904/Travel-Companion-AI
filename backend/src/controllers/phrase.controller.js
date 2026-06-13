import * as phraseService from '../services/phrase.service.js';
import fs from 'fs';

export const getAll = async (req, res, next) => {
  try {
    const phrases = await phraseService.getAllPhrases();
    res.json(phrases);
  } catch (error) {
    next(error);
  }
};

export const getByCategory = async (req, res, next) => {
  try {
    const phrases = await phraseService.getPhrasesByCategory(req.params.category);
    res.json(phrases);
  } catch (error) {
    next(error);
  }
};

export const getAudio = async (req, res, next) => {
  try {
    const audioPath = phraseService.getAudioFilePath(req.params.filename);
    if (fs.existsSync(audioPath)) {
      res.sendFile(audioPath);
    } else {
      res.status(404).json({ error: 'Audio file not found' });
    }
  } catch (error) {
    next(error);
  }
};

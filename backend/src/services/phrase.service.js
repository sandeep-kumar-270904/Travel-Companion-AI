import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const phrasesPath = path.join(__dirname, '../../data/phrases.json');
const audioDir = path.join(__dirname, '../../data/audio');

export const getAllPhrases = async () => {
  const data = await fs.readFile(phrasesPath, 'utf8');
  return JSON.parse(data);
};

export const getPhrasesByCategory = async (category) => {
  const phrases = await getAllPhrases();
  if (!phrases[category]) {
    const err = new Error(`Category '${category}' not found`);
    err.statusCode = 404;
    throw err;
  }
  return phrases[category];
};

export const getAudioFilePath = (filename) => {
  return path.join(audioDir, filename);
};

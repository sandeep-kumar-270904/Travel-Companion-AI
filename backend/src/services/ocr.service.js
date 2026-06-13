import Tesseract from 'tesseract.js';
import logger from '../config/logger.js';

export const extractTextFromBuffer = async (imageBuffer, lang = 'eng') => {
  try {
    const result = await Tesseract.recognize(imageBuffer, lang);
    return result.data.text;
  } catch (error) {
    logger.error('Tesseract OCR error:', error);
    throw new Error('OCR text extraction failed');
  }
};

import * as ocrService from '../services/ocr.service.js';

export const processImage = async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No image file uploaded');
      err.statusCode = 400;
      throw err;
    }

    // Default language is English, but can be passed in body
    const lang = req.body.lang || 'eng';
    
    // Process image buffer in memory
    const extractedText = await ocrService.extractTextFromBuffer(req.file.buffer, lang);
    
    res.json({ text: extractedText });
  } catch (error) {
    next(error);
  }
};

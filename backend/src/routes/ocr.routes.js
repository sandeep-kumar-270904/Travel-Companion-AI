import express from 'express';
import { processImage } from '../controllers/ocr.controller.js';
import { upload, validateImageType } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/upload', upload.single('file'), validateImageType, processImage);

export default router;

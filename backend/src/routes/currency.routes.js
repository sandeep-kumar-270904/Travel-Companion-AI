import express from 'express';
import { convert } from '../controllers/currency.controller.js';

const router = express.Router();

router.post('/convert', convert);

export default router;

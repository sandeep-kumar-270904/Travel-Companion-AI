import express from 'express';
import { getExpenses, createExpense, deleteExpense, scanReceipt } from '../controllers/expense.controller.js';

const router = express.Router();

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);
router.post('/scan-receipt', scanReceipt);

export default router;

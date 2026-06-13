import * as currencyService from '../services/currency.service.js';
import { z } from 'zod';

const convertSchema = z.object({
  from: z.string().min(2),
  to: z.string().min(2),
  amount: z.number().positive()
});

export const convert = async (req, res, next) => {
  try {
    const { from, to, amount } = convertSchema.parse(req.body);
    const result = await currencyService.convertCurrency(from, to, amount);
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

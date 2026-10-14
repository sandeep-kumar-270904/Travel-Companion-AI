import { dbQuery, dbRun } from '../config/sqlite.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const getGenAI = (userApiKey) => {
  const key = userApiKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
};

export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await dbQuery("SELECT * FROM expenses ORDER BY id DESC");
    
    // Calculate category summary and total
    let totalHome = 0;
    const categoryTotals = {};

    for (const exp of expenses) {
      totalHome += (exp.converted_amount || 0);
      const cat = exp.category || 'General';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (exp.converted_amount || 0);
    }

    res.json({
      success: true,
      expenses,
      totalHome: Math.round(totalHome * 100) / 100,
      categoryTotals
    });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const {
      title,
      category = 'General',
      foreign_amount,
      foreign_currency = 'USD',
      converted_amount,
      home_currency = 'USD',
      date = new Date().toISOString().split('T')[0],
      notes = ''
    } = req.body;

    if (!title || foreign_amount === undefined) {
      return res.status(400).json({ error: 'Title and amount are required' });
    }

    const numForeign = parseFloat(foreign_amount);
    const numConverted = converted_amount ? parseFloat(converted_amount) : numForeign;

    const result = await dbRun(
      `INSERT INTO expenses (title, category, foreign_amount, foreign_currency, converted_amount, home_currency, date, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category, numForeign, foreign_currency.toUpperCase(), numConverted, home_currency.toUpperCase(), date, notes]
    );

    const newExpense = {
      id: result.id,
      title,
      category,
      foreign_amount: numForeign,
      foreign_currency: foreign_currency.toUpperCase(),
      converted_amount: numConverted,
      home_currency: home_currency.toUpperCase(),
      date,
      notes
    };

    res.status(201).json({ success: true, expense: newExpense });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    await dbRun("DELETE FROM expenses WHERE id = ?", [id]);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const scanReceipt = async (req, res, next) => {
  try {
    const { receiptText, apiKey, targetHomeCurrency = 'USD' } = req.body;
    if (!receiptText || !receiptText.trim()) {
      return res.status(400).json({ error: 'Receipt text or OCR transcription is required' });
    }

    const genAI = getGenAI(apiKey);
    if (!genAI) {
      // Regex heuristics fallback
      const amountMatch = receiptText.match(/(\d+[.,]\d{2})/);
      return res.json({
        success: true,
        extracted: {
          title: "Foreign Merchant",
          foreign_amount: amountMatch ? parseFloat(amountMatch[0].replace(',', '.')) : 25.00,
          foreign_currency: "EUR",
          category: "Dining",
          date: new Date().toISOString().split('T')[0],
          notes: "Scanned via OCR heuristics"
        }
      });
    }

    const prompt = `You are an expert foreign receipt parser for international travelers.
Analyze this raw receipt text or OCR snippet:
"""${receiptText}"""

Extract the key details and return a strict JSON object with this exact schema:
{
  "title": "Merchant / Restaurant / Store Name",
  "foreign_amount": 0.00 (numeric total paid),
  "foreign_currency": "3-letter ISO code e.g. JPY, EUR, THB, GBP, USD",
  "category": "Dining | Transport | Lodging | Activities | Shopping | Groceries",
  "date": "YYYY-MM-DD (or current date if not visible)",
  "notes": "Short summary of main line items or purchase"
}
Return ONLY valid JSON. No markdown backticks.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    if (text.startsWith('```')) text = text.replace(/```/g, '').trim();

    const parsed = JSON.parse(text);
    res.json({ success: true, extracted: parsed });
  } catch (error) {
    console.error("Scan receipt error:", error);
    res.status(500).json({ error: "Failed to parse receipt. Please verify receipt text." });
  }
};

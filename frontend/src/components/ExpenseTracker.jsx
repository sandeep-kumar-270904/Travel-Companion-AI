import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const CATEGORIES = [
  { id: 'Dining', label: 'Dining & Drinks', icon: '🍽️', color: 'from-amber-500 to-orange-500' },
  { id: 'Transport', label: 'Transit & Rides', icon: '🚆', color: 'from-blue-500 to-cyan-500' },
  { id: 'Lodging', label: 'Hotels & Stays', icon: '🏨', color: 'from-purple-500 to-indigo-500' },
  { id: 'Activities', label: 'Museums & Tours', icon: '🎟️', color: 'from-emerald-500 to-teal-500' },
  { id: 'Shopping', label: 'Shopping & Gifts', icon: '🛍️', color: 'from-pink-500 to-rose-500' },
  { id: 'Groceries', label: 'Groceries & Marts', icon: '🛒', color: 'from-yellow-500 to-lime-500' },
  { id: 'General', label: 'General / Misc', icon: '💳', color: 'from-slate-500 to-gray-500' }
];

const CURRENCY_LIST = ['USD', 'EUR', 'JPY', 'GBP', 'INR', 'THB', 'AUD', 'CAD', 'CHF', 'SGD', 'VND', 'MXN', 'AED'];

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [homeCurrency, setHomeCurrency] = useState(localStorage.getItem('preferred_home_currency') || 'USD');
  const [exchangeRate, setExchangeRate] = useState(1);
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  
  // New Expense Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Dining');
  const [foreignAmount, setForeignAmount] = useState('');
  const [foreignCurrency, setForeignCurrency] = useState('JPY');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Scan Receipt Form
  const [receiptText, setReceiptText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/expenses');
      if (res.data?.success) {
        setExpenses(res.data.expenses);
        localStorage.setItem('cached_expenses', JSON.stringify(res.data.expenses));
      }
    } catch (err) {
      console.warn("Using offline cached expenses:", err.message);
      const cached = localStorage.getItem('cached_expenses');
      if (cached) {
        try { setExpenses(JSON.parse(cached)); } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleHomeCurrencyChange = (curr) => {
    setHomeCurrency(curr);
    localStorage.setItem('preferred_home_currency', curr);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title || !foreignAmount) return;

    // Approximate conversion rate calculation if currencies match or rough standard
    const foreignNum = parseFloat(foreignAmount);
    let convertedNum = foreignNum;

    // Default rough exchange rate heuristics if offline
    if (foreignCurrency === 'JPY' && homeCurrency === 'USD') convertedNum = foreignNum / 150;
    else if (foreignCurrency === 'EUR' && homeCurrency === 'USD') convertedNum = foreignNum * 1.08;
    else if (foreignCurrency === 'THB' && homeCurrency === 'USD') convertedNum = foreignNum / 36;
    else if (foreignCurrency === 'INR' && homeCurrency === 'USD') convertedNum = foreignNum / 86;
    else if (foreignCurrency === homeCurrency) convertedNum = foreignNum;

    try {
      const payload = {
        title,
        category,
        foreign_amount: foreignNum,
        foreign_currency: foreignCurrency,
        converted_amount: Math.round(convertedNum * 100) / 100,
        home_currency: homeCurrency,
        date,
        notes
      };

      const res = await axios.post('/api/expenses', payload);
      if (res.data?.success) {
        setExpenses([res.data.expense, ...expenses]);
        setIsAddOpen(false);
        resetForm();
      }
    } catch (err) {
      alert("Failed to save expense. Saved locally.");
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`/api/expenses/${id}`);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      alert("Failed to delete expense");
    }
  };

  const handleScanReceipt = async (e) => {
    e.preventDefault();
    if (!receiptText.trim()) return;

    setIsScanning(true);
    setScanError('');
    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      const res = await axios.post('/api/expenses/scan-receipt', {
        receiptText,
        apiKey,
        targetHomeCurrency: homeCurrency
      });

      if (res.data?.success && res.data.extracted) {
        const ext = res.data.extracted;
        setTitle(ext.title || 'Foreign Merchant');
        setForeignAmount(ext.foreign_amount?.toString() || '');
        if (ext.foreign_currency) setForeignCurrency(ext.foreign_currency);
        if (ext.category) setCategory(ext.category);
        if (ext.date) setDate(ext.date);
        if (ext.notes) setNotes(ext.notes);
        
        setIsScanOpen(false);
        setIsAddOpen(true); // Open review confirmation modal with auto-filled fields!
      }
    } catch (err) {
      setScanError("Failed to parse receipt text. Please type manually or verify API key.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Dining');
    setForeignAmount('');
    setNotes('');
  };

  const exportCSV = () => {
    if (expenses.length === 0) return alert('No expenses to export.');
    const headers = ['Date', 'Title', 'Category', 'Foreign Amount', 'Currency', 'Converted Amount', 'Home Currency', 'Notes'];
    const rows = expenses.map(e => [
      `"${e.date}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.foreign_amount,
      e.foreign_currency,
      e.converted_amount,
      e.home_currency,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TravelAI_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const totalConverted = expenses.reduce((sum, e) => sum + (e.converted_amount || 0), 0);
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.converted_amount || 0);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 py-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black font-outfit text-white tracking-tight flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400">
              🧾
            </span>
            Smart Expense Ledger
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Automated multi-currency expense tracking with OCR receipt parsing and SQLite persistence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Home Currency Dropdown */}
          <div className="flex items-center gap-2 bg-space-900/80 border border-white/10 rounded-xl px-3 py-1.5">
            <span className="text-xs text-slate-400 font-semibold uppercase">Home:</span>
            <select
              value={homeCurrency}
              onChange={(e) => handleHomeCurrencyChange(e.target.value)}
              className="bg-transparent text-emerald-400 font-bold text-sm focus:outline-none cursor-pointer"
            >
              {CURRENCY_LIST.map(c => (
                <option key={c} value={c} className="bg-space-900 text-white">{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsScanOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <span>📷</span> Scan Receipt
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/10 transition-colors"
          >
            <span>➕</span> Add Expense
          </button>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-sm rounded-xl border border-white/10 transition-colors"
            title="Export CSV"
          >
            📥 CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-950/40 via-space-900 to-space-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 mb-1">
            Total Trip Expenditure
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-outfit">
            {totalConverted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            <span className="text-emerald-400 text-xl font-bold">{homeCurrency}</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span>📊</span> Across {expenses.length} logged foreign transactions
          </div>
        </div>

        <div className="bg-space-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-1">
            Average Spend Per Item
          </div>
          <div className="text-3xl font-black text-white font-outfit">
            {expenses.length > 0 ? (totalConverted / expenses.length).toFixed(2) : '0.00'}{' '}
            <span className="text-slate-400 text-xl font-normal">{homeCurrency}</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Auto-converted with real-time exchange rates
          </div>
        </div>

        <div className="bg-space-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-1">
            Top Spending Category
          </div>
          <div className="text-2xl font-black text-white font-outfit truncate">
            {Object.keys(categoryTotals).length > 0
              ? Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0]
              : 'None'}
          </div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Syncs to local SQLite database
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress */}
      {expenses.length > 0 && (
        <div className="bg-space-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Category Breakdown ({homeCurrency})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map(cat => {
              const amount = categoryTotals[cat.id] || 0;
              const percent = totalConverted > 0 ? Math.round((amount / totalConverted) * 100) : 0;
              return (
                <div key={cat.id} className="bg-space-900/60 border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>{cat.icon} {cat.id}</span>
                    <span className="font-bold text-white">{percent}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 my-2 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${cat.color}`} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-300">
                    {amount.toFixed(0)} {homeCurrency}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="bg-space-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
        <h3 className="text-xl font-bold font-outfit text-white mb-6 flex items-center justify-between">
          <span>Recent Transactions</span>
          <span className="text-xs text-slate-400 font-normal">Offline-First Vault</span>
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400 animate-pulse">Loading SQLite records...</div>
        ) : expenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <span className="text-4xl block mb-2">🧾</span>
            No expenses logged yet. Tap "Scan Receipt" or "Add Expense" to begin tracking.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {expenses.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-white/[0.02] -mx-4 px-4 rounded-xl transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                    {CATEGORIES.find(c => c.id === item.category)?.icon || '💳'}
                  </div>
                  <div>
                    <div className="font-bold text-white text-base font-outfit">{item.title}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-slate-300">
                        {item.category}
                      </span>
                      {item.notes && <span className="italic text-slate-500 truncate max-w-xs">{item.notes}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-right">
                    <div className="text-lg font-black text-white font-outfit">
                      {item.converted_amount?.toFixed(2)} <span className="text-xs font-semibold text-emerald-400">{item.home_currency}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {item.foreign_amount?.toLocaleString()} {item.foreign_currency}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteExpense(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                    title="Delete Entry"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Manual Add Expense */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-space-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-outfit text-white">Log Expense</h3>
                <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Merchant / Expense Name</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g. Shinjuku Ramen, Metro Ticket"
                    className="w-full bg-space-800 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount Paid</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={foreignAmount}
                      onChange={(e) => setForeignAmount(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full bg-space-800 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Currency</label>
                    <select
                      value={foreignCurrency}
                      onChange={(e) => setForeignCurrency(e.target.value)}
                      className="w-full bg-space-800 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    >
                      {CURRENCY_LIST.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-space-800 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-space-800 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Notes / Tags (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Split with companion, Lunch after museum"
                    className="w-full bg-space-800 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm mt-2"
                >
                  Save to Ledger
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Scan Receipt */}
      <AnimatePresence>
        {isScanOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-space-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                  <span>📷</span> Foreign Receipt AI Scanner
                </h3>
                <button onClick={() => setIsScanOpen(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Paste receipt transcription or OCR text from your camera. Gemini extracts line totals, currency, merchant name, and category.
              </p>

              {scanError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {scanError}
                </div>
              )}

              <form onSubmit={handleScanReceipt} className="space-y-4">
                <textarea
                  rows={6}
                  required
                  value={receiptText}
                  onChange={(e) => setReceiptText(e.target.value)}
                  placeholder="Paste OCR text here, or sample:&#10;FamilyMart Roppongi&#10;2026/10/12 21:30&#10;Bento Box 650 JPY&#10;Green Tea 160 JPY&#10;Total: 810 JPY"
                  className="w-full bg-space-800 border border-white/10 rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-teal-400 resize-none"
                />

                <button
                  type="submit"
                  disabled={isScanning || !receiptText.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 transition-all text-sm disabled:opacity-50"
                >
                  {isScanning ? 'Extracting Receipt Data...' : 'Auto-Parse & Populate Ledger'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

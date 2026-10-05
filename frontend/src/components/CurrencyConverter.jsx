import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CurrencyConverterPage = () => {
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currencyList, setCurrencyList] = useState([]);

  useEffect(() => {
    // Fetch all available currencies
    fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json')
      .then(res => res.json())
      .then(data => {
        const list = Object.keys(data).map(code => ({
          code: code.toUpperCase(),
          name: data[code]
        })).sort((a, b) => a.code.localeCompare(b.code));
        setCurrencyList(list);
      })
      .catch(err => console.error("Failed to load currencies", err));
  }, []);

  useEffect(() => {
    setResult(null);
    setError('');
  }, [from, to, amount]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
  };

  const convert = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/currency/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, amount })
      });
      const data = await res.json();
      if (data.result !== undefined) {
        setResult(data.result);
      } else {
        setError('Conversion failed.');
      }
    } catch (err) {
      setError('Error fetching conversion rate.');
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">Live Exchange</h1>
        <p className="text-slate-400">Real-time market rates instantly.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-50" />
        
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-1/2">
              <input
                type="number"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-space-800 border border-white/10 rounded-xl px-4 py-4 text-white font-mono text-lg focus:outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">AMT</span>
            </div>
            
            <div className="flex items-center w-full sm:w-1/2 gap-2">
              <select 
                value={from} 
                onChange={e => setFrom(e.target.value)} 
                className="bg-space-800 border border-white/10 rounded-xl px-2 py-4 text-white w-full appearance-none focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-colors text-sm"
              >
                {currencyList.map(cur => <option key={cur.code} value={cur.code}>{cur.code} - {cur.name}</option>)}
              </select>
              
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSwap}
                className="text-emerald-400 flex-shrink-0 p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors cursor-pointer"
                title="Swap Currencies"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </motion.button>

              <select 
                value={to} 
                onChange={e => setTo(e.target.value)} 
                className="bg-space-800 border border-white/10 rounded-xl px-2 py-4 text-white w-full appearance-none focus:outline-none focus:border-cyan-500/50 cursor-pointer transition-colors text-sm"
              >
                {currencyList.map(cur => <option key={cur.code} value={cur.code}>{cur.code} - {cur.name}</option>)}
              </select>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={convert}
            disabled={loading || !amount}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold py-4 rounded-xl shadow-glow-cyan hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Fetching Rates...' : 'Convert Currency'}
          </motion.button>

          {result !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center"
            >
              <div className="text-sm text-emerald-400/80 mb-1 uppercase tracking-wider font-semibold">Converted Amount</div>
              <div className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                <span className="text-emerald-400">{amount} {from}</span>
                <span className="text-slate-500 text-xl">=</span>
                <span>{result.toLocaleString(undefined, { maximumFractionDigits: 2 })} {to}</span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-400 mt-2 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </motion.div>
          )}
        </div>
      </div>
      <div className="mt-6 text-xs text-slate-500 text-center uppercase tracking-wider font-medium">Powered by exchangerate.host</div>
    </motion.div>
  );
};

export default CurrencyConverterPage;

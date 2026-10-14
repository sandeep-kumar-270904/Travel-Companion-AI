import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ChefAllergyPass from './ChefAllergyPass';

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [dishes, setDishes] = useState([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(!localStorage.getItem('gemini_api_key'));

  // Forms
  const [menuText, setMenuText] = useState('');
  const [foodName, setFoodName] = useState('');
  const [allergies, setAllergies] = useState('');
  const [destination, setDestination] = useState('');
  const [interest, setInterest] = useState('');

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    if (key) setIsSettingsOpen(false);
  };

  const handleAnalyzeMenu = async (e) => {
    e.preventDefault();
    if (!menuText) return;
    setLoading(true);
    setResult('');
    setDishes([]);
    try {
      const res = await axios.post('/api/ai/analyze-menu', { text: menuText, apiKey });
      if (res.data?.dishes && Array.isArray(res.data.dishes)) {
        setDishes(res.data.dishes);
      } else {
        setResult(res.data.analysis || 'Analysis complete.');
      }
    } catch (err) {
      // Fallback to general analyze-text
      try {
        const fallbackRes = await axios.post('/api/ai/analyze-text', { text: menuText, context: 'Menu', apiKey });
        setResult(fallbackRes.data.analysis);
      } catch (e2) {
        setResult('Failed to analyze menu. Please verify your Gemini API key or internet connection.');
      }
    }
    setLoading(false);
  };

  const handleAllergyCheck = async (e) => {
    e.preventDefault();
    if (!foodName || !allergies) return;
    setLoading(true);
    setResult('');
    setDishes([]);
    try {
      const res = await axios.post('/api/ai/allergy-check', { foodName, allergies, apiKey });
      setResult(res.data.result);
    } catch (err) {
      setResult('Failed to check allergies. Did you provide a valid API key?');
    }
    setLoading(false);
  };

  const handleTravelAdvice = async (e) => {
    e.preventDefault();
    if (!destination) return;
    setLoading(true);
    setResult('');
    setDishes([]);
    try {
      const res = await axios.post('/api/ai/travel-advice', { destination, interest, apiKey });
      setResult(res.data.advice);
    } catch (err) {
      setResult('Failed to get travel advice. Did you provide a valid API key?');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'menu', label: 'Menu Explainer', icon: '🍽️' },
    { id: 'allergy', label: 'Allergy Check', icon: '🛡️' },
    { id: 'chefpass', label: 'Chef Allergy Pass', icon: '📇' },
    { id: 'advice', label: 'Cultural Advice', icon: '🗺️' }
  ];

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 relative z-10"
    >
      <div className="text-center mb-10">
        <h2 className="font-outfit text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-500 tracking-tight mb-2">AI Travel Assistant</h2>
        <p className="font-inter text-slate-400">Intelligent insights powered by Google Gemini.</p>
        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="mt-4 text-xs text-neon-cyan hover:text-white underline decoration-neon-cyan/30 underline-offset-4 transition-colors"
        >
          {isSettingsOpen ? 'Hide API Settings' : 'Configure API Key'}
        </button>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl max-w-2xl mx-auto">
              <h3 className="text-orange-400 font-bold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Setup Required
              </h3>
              <p className="text-slate-300 text-sm mb-4">
                To use the AI Assistant, you need a free Google Gemini API Key. Get one from Google AI Studio, paste it below, and you're good to go!
              </p>
              <div className="flex gap-3">
                <input 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your Gemini API Key here..."
                  className="flex-1 bg-space-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none text-sm"
                />
                <button 
                  onClick={() => saveApiKey(apiKey)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors text-sm"
                >
                  Save Key
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 z-0 pointer-events-none" />
        
        {/* Navigation Tabs */}
        <div className="relative z-10 border-b border-white/10 bg-space-900/40 p-2">
          <nav className="flex space-x-2" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setResult(''); }}
                className={`relative flex-1 py-4 px-2 text-center rounded-2xl font-outfit font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-white shadow-glow-cyan bg-white/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-white/5 border border-neon-cyan/30 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <span className="text-xl">{tab.icon}</span>
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Form Content Area */}
        <div className="p-6 sm:p-10 min-h-[400px] relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === 'menu' && (
              <motion.form 
                key="menu"
                variants={tabVariants}
                initial="hidden" animate="visible" exit="exit"
                onSubmit={handleAnalyzeMenu} 
                className="space-y-6 max-w-xl mx-auto"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Foreign Menu Text</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-space-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all shadow-glass-inset resize-none font-inter"
                    placeholder="E.g. Gnocchi al Pesto..."
                    value={menuText}
                    onChange={(e) => setMenuText(e.target.value)}
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading || !menuText.trim()}
                  className="w-full py-4 rounded-2xl font-outfit font-bold text-white bg-gradient-to-r from-neon-cyan to-blue-600 hover:shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Analyzing...' : 'Explain Menu'}
                </motion.button>
              </motion.form>
            )}

            {activeTab === 'allergy' && (
              <motion.form 
                key="allergy"
                variants={tabVariants}
                initial="hidden" animate="visible" exit="exit"
                onSubmit={handleAllergyCheck} 
                className="space-y-6 max-w-xl mx-auto"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Food / Dish Name</label>
                  <input 
                    type="text"
                    className="w-full bg-space-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all shadow-glass-inset font-inter"
                    placeholder="E.g. Pad Thai"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Allergies</label>
                  <input 
                    type="text"
                    className="w-full bg-space-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all shadow-glass-inset font-inter"
                    placeholder="E.g. Peanuts, Shellfish"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading || !foodName.trim() || !allergies.trim()}
                  className="w-full py-4 rounded-2xl font-outfit font-bold text-white bg-gradient-to-r from-neon-cyan to-blue-600 hover:shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Checking...' : 'Check Safety'}
                </motion.button>
              </motion.form>
            )}

            {activeTab === 'advice' && (
              <motion.form 
                key="advice"
                variants={tabVariants}
                initial="hidden" animate="visible" exit="exit"
                onSubmit={handleTravelAdvice} 
                className="space-y-6 max-w-xl mx-auto"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Destination</label>
                  <input 
                    type="text"
                    className="w-full bg-space-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all shadow-glass-inset font-inter"
                    placeholder="E.g. Tokyo, Japan"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Interest</label>
                  <input 
                    type="text"
                    className="w-full bg-space-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all shadow-glass-inset font-inter"
                    placeholder="E.g. Dining etiquette, Public transport"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading || !destination.trim() || !interest.trim()}
                  className="w-full py-4 rounded-2xl font-outfit font-bold text-white bg-gradient-to-r from-neon-cyan to-blue-600 hover:shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Get Advice'}
                </motion.button>
              </motion.form>
            )}

            {activeTab === 'chefpass' && (
              <motion.div
                key="chefpass"
                variants={tabVariants}
                initial="hidden" animate="visible" exit="exit"
              >
                <ChefAllergyPass />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Structured Dishes Results Area (For Menu Explainer) */}
          {dishes && dishes.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 space-y-4 max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-lg font-bold text-neon-cyan flex items-center gap-2">
                  <span>🍽️</span> Identified Dishes ({dishes.length})
                </h3>
                <span className="text-xs text-slate-400">Allergen & Flavor Analysis</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {dishes.map((dish, idx) => (
                  <div key={idx} className="bg-space-900/80 border border-white/10 rounded-2xl p-5 shadow-glass-inset">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                          {dish.name}
                          {dish.originalName && (
                            <span className="text-sm font-medium text-purple-300 font-mono">({dish.originalName})</span>
                          )}
                        </h4>
                        <p className="text-sm text-slate-300 mt-1 leading-relaxed">{dish.description}</p>
                      </div>
                      {dish.spiceLevel && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold rounded-full self-start">
                          🌶️ {dish.spiceLevel} Spice
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                      {dish.flavorProfile && (
                        <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">
                          Taste: <strong className="text-slate-200">{dish.flavorProfile}</strong>
                        </span>
                      )}
                      {dish.hiddenAllergens && dish.hiddenAllergens.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-rose-400 font-semibold">⚠️ Allergens:</span>
                          {dish.hiddenAllergens.map((alg, aIdx) => (
                            <span key={aIdx} className="text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-md font-medium">
                              {alg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Plain Text Results Area */}
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 max-w-2xl mx-auto"
            >
              <div className="bg-space-900/80 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-glass-inset relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-neon-cyan" />
                <h3 className="text-sm font-outfit font-bold text-neon-cyan uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI Insights
                </h3>
                <div className="text-base sm:text-lg text-slate-300 whitespace-pre-wrap leading-relaxed font-inter">
                  {result}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

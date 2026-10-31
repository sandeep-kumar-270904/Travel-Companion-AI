import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_DESTINATIONS = [
  { name: 'Tokyo, Japan', flag: '🇯🇵', type: 'leisure' },
  { name: 'Paris, France', flag: '🇫🇷', type: 'leisure' },
  { name: 'Rome, Italy', flag: '🇮🇹', type: 'cultural' },
  { name: 'Bangkok, Thailand', flag: '🇹🇭', type: 'tropical' },
  { name: 'New York, USA', flag: '🇺🇸', type: 'business' },
  { name: 'London, UK', flag: '🇬🇧', type: 'leisure' },
];

export default function PackingAssistant() {
  const [destination, setDestination] = useState('Tokyo, Japan');
  const [durationDays, setDurationDays] = useState(5);
  const [tripType, setTripType] = useState('leisure');
  const [loading, setLoading] = useState(false);
  const [checklistData, setChecklistData] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [newItemName, setNewItemName] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);

  // Load cached checklist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('travel_packing_checklist');
      if (saved) {
        const parsed = JSON.parse(saved);
        setChecklistData(parsed.checklistData);
        setCheckedItems(parsed.checkedItems || {});
        if (parsed.destination) setDestination(parsed.destination);
      }
    } catch (err) {
      console.warn("Failed to read cached packing checklist", err);
    }
  }, []);

  // Auto-save changes to localStorage
  useEffect(() => {
    if (checklistData) {
      localStorage.setItem('travel_packing_checklist', JSON.stringify({
        checklistData,
        checkedItems,
        destination
      }));
    }
  }, [checklistData, checkedItems, destination]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!destination.trim()) return;

    setLoading(true);
    try {
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      const response = await fetch('/api/ai/packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          days: durationDays,
          tripType,
          apiKey
        })
      });
      const data = await response.json();
      if (data.success) {
        setChecklistData(data);
        setActiveCategoryIndex(0);
      }
    } catch (err) {
      console.error("Failed to generate packing list", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (categoryName, itemName) => {
    const key = `${categoryName}__${itemName}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAddCustomItem = (categoryName) => {
    if (!newItemName.trim() || !checklistData) return;
    const updatedCategories = checklistData.categories.map(cat => {
      if (cat.name === categoryName) {
        return {
          ...cat,
          items: [
            ...cat.items,
            { name: newItemName.trim(), quantity: '1', essential: false, tip: 'Custom traveler item' }
          ]
        };
      }
      return cat;
    });

    setChecklistData({
      ...checklistData,
      categories: updatedCategories
    });
    setNewItemName('');
  };

  const calculateProgress = () => {
    if (!checklistData || !checklistData.categories) return { total: 0, packed: 0, pct: 0 };
    let total = 0;
    let packed = 0;
    checklistData.categories.forEach(cat => {
      cat.items.forEach(item => {
        total++;
        if (checkedItems[`${cat.name}__${item.name}`]) packed++;
      });
    });
    const pct = total === 0 ? 0 : Math.round((packed / total) * 100);
    return { total, packed, pct };
  };

  const copyAsText = () => {
    if (!checklistData) return;
    let text = `🧳 Packing Checklist for ${destination} (${durationDays} Days, ${tripType})\n\n`;
    checklistData.categories.forEach(cat => {
      text += `## ${cat.name}\n`;
      cat.items.forEach(item => {
        const isDone = checkedItems[`${cat.name}__${item.name}`];
        text += `${isDone ? '[x]' : '[ ]'} ${item.name} (${item.quantity}) - ${item.tip}\n`;
      });
      text += '\n';
    });
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const stats = calculateProgress();

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header Banner */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
          <span>🌦️</span> Meteorological & Voltage-Aware
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-500 mb-3 tracking-tight font-outfit">
          Smart Packing Assistant
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Tailored checklists conditioned on real-time weather forecasts, destination power outlet standards, and cultural dress etiquette.
        </p>
      </div>

      {/* Input Form & Hub Chips */}
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Destination Input */}
            <div className="md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-outfit">
                Destination City / Country
              </label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="e.g. Tokyo, Rome, Paris"
                className="w-full bg-space-900/80 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-sm font-medium transition-all"
                required
              />
            </div>

            {/* Duration Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-outfit">
                Trip Duration (Days)
              </label>
              <select
                value={durationDays}
                onChange={e => setDurationDays(Number(e.target.value))}
                className="w-full bg-space-900/80 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 text-sm font-medium transition-all cursor-pointer"
              >
                <option value={3}>Weekend Getaway (3 Days)</option>
                <option value={5}>Short Trip (5 Days)</option>
                <option value={7}>Full Week (7 Days)</option>
                <option value={10}>Extended Exploration (10 Days)</option>
                <option value={14}>Two Weeks Adventure (14 Days)</option>
              </select>
            </div>

            {/* Trip Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-outfit">
                Trip Style
              </label>
              <select
                value={tripType}
                onChange={e => setTripType(e.target.value)}
                className="w-full bg-space-900/80 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 text-sm font-medium transition-all cursor-pointer"
              >
                <option value="leisure">City Sightseeing & Culture</option>
                <option value="business">Business & Conferences</option>
                <option value="hiking">Hiking, Outdoors & Nature</option>
                <option value="beach">Beach, Island & Warm Weather</option>
              </select>
            </div>
          </div>

          {/* Quick Hub Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
            <span className="text-xs text-slate-500 font-semibold mr-1">Quick Hubs:</span>
            {PRESET_DESTINATIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setDestination(preset.name); setTripType(preset.type); }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{preset.flag}</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading || !destination.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-space-900 font-outfit font-black text-base shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-space-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Analyzing Forecast & Electrical Standards...</span>
              </>
            ) : (
              <>
                <span>⚡ Generate Smart Packing List</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generated Results Area */}
      {checklistData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Weather & Electrical Standards Telemetry Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Live Meteorological Forecast Card */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-outfit flex items-center gap-1.5">
                  <span>🌦️</span> Open-Meteo Weather Synced
                </span>
                <span className="text-[11px] text-slate-400">{destination}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {checklistData.weather && checklistData.weather.length > 0 ? (
                  checklistData.weather.slice(0, 3).map((w, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-space-900/60 border border-white/5 text-center">
                      <div className="text-2xl mb-1">{w.icon}</div>
                      <div className="text-xs font-bold text-white">{w.maxTemp}°C <span className="text-slate-400 text-[10px]">/ {w.minTemp}°C</span></div>
                      <div className="text-[10px] text-cyan-300 font-semibold mt-0.5">{w.rainProb}% Rain</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{w.condition}</div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-xs text-slate-400 py-3 text-center">
                    Mild travel climate forecast (~22°C average).
                  </div>
                )}
              </div>
            </div>

            {/* Electrical & Cultural Standards Card */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-outfit flex items-center gap-1.5">
                  <span>🔌</span> Power Outlets & Standards
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {checklistData.electrical?.voltage} · {checklistData.electrical?.frequency || '50Hz'}
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-300 font-medium">Socket Sockets:</span>
                  {checklistData.electrical?.plugTypes?.map((plug, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                      {plug}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {checklistData.electrical?.details}
                </p>
                {checklistData.electrical?.culturalDressCode && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                    <span className="text-sm">⚠️</span>
                    <span><strong>Cultural Dress Etiquette:</strong> {checklistData.electrical.culturalDressCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Packing Progress & Action Bar */}
          <div className="p-5 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-300 font-outfit">PACKING COMPLETION</span>
                <span className="text-emerald-400 font-mono">{stats.packed} / {stats.total} items ({stats.pct}%)</span>
              </div>
              <div className="w-full h-3 bg-space-900 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.pct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAsText}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{copyStatus ? '✓ Copied!' : '📋 Copy Text'}</span>
              </button>
              <span className="text-xs px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1">
                <span>💾</span> Offline Vault Synced
              </span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            {checklistData.categories.map((cat, idx) => {
              const catPacked = cat.items.filter(item => checkedItems[`${cat.name}__${item.name}`]).length;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveCategoryIndex(idx)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    activeCategoryIndex === idx
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-space-900 shadow-glow-cyan'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategoryIndex === idx ? 'bg-space-900/30 text-space-900' : 'bg-white/10 text-slate-300'}`}>
                    {catPacked}/{cat.items.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Category Items List */}
          {checklistData.categories[activeCategoryIndex] && (
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                  {checklistData.categories[activeCategoryIndex].name}
                </h3>
                <span className="text-xs text-slate-400">
                  Tap item to mark as packed
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {checklistData.categories[activeCategoryIndex].items.map((item, itemIdx) => {
                  const key = `${checklistData.categories[activeCategoryIndex].name}__${item.name}`;
                  const isChecked = !!checkedItems[key];

                  return (
                    <motion.div
                      key={itemIdx}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => toggleItem(checklistData.categories[activeCategoryIndex].name, item.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-400 opacity-70'
                          : 'bg-white/[0.03] border-white/10 hover:border-emerald-500/30 text-white'
                      }`}
                    >
                      {/* Custom Checkbox */}
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-400 text-space-900'
                          : 'border-white/30 bg-white/5'
                      }`}>
                        {isChecked && <span className="font-bold text-xs">✓</span>}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-semibold truncate ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                            {item.name}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono flex-shrink-0">
                            {item.quantity}
                          </span>
                        </div>
                        {item.tip && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {item.tip}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Add Custom Item Input */}
              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <input
                  type="text"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder={`Add custom item to ${checklistData.categories[activeCategoryIndex].name}...`}
                  className="flex-1 bg-space-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomItem(checklistData.categories[activeCategoryIndex].name);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomItem(checklistData.categories[activeCategoryIndex].name)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COUNTRIES = [
  { id: 'japan', name: 'Japan', flag: '🇯🇵', currency: 'JPY', rateToUSD: 0.0065 },
  { id: 'united_states', name: 'United States', flag: '🇺🇸', currency: 'USD', rateToUSD: 1.0 },
  { id: 'france', name: 'France', flag: '🇫🇷', currency: 'EUR', rateToUSD: 1.09 },
  { id: 'italy', name: 'Italy', flag: '🇮🇹', currency: 'EUR', rateToUSD: 1.09 },
  { id: 'united_kingdom', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', rateToUSD: 1.28 },
  { id: 'spain', name: 'Spain', flag: '🇪🇸', currency: 'EUR', rateToUSD: 1.09 },
  { id: 'germany', name: 'Germany', flag: '🇩🇪', currency: 'EUR', rateToUSD: 1.09 },
  { id: 'thailand', name: 'Thailand', flag: '🇹🇭', currency: 'THB', rateToUSD: 0.027 },
];

export default function TippingGuide() {
  const [selectedCountry, setSelectedCountry] = useState('japan');
  const [tippingData, setTippingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'etiquette'

  // Calculator State
  const [billAmount, setBillAmount] = useState(6000);
  const [tipPercentage, setTipPercentage] = useState(0);
  const [numPeople, setNumPeople] = useState(2);
  const [roundUp, setRoundUp] = useState(false);
  const [shareStatus, setShareStatus] = useState(false);

  const fetchTippingInfo = async (countryId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/safety/tipping?country=${countryId}`);
      const json = await res.json();
      if (json.success) {
        setTippingData(json.data);
        // Set default tip based on culture
        if (json.data.culture === 'insulting') {
          setTipPercentage(0);
        } else if (json.data.culture === 'customary') {
          setTipPercentage(18);
        } else if (json.data.culture === 'service_included') {
          setTipPercentage(5);
        } else {
          setTipPercentage(10);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch tipping guide", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTippingInfo(selectedCountry);
    // Set typical realistic test bills for currency
    if (selectedCountry === 'japan') setBillAmount(6500);
    else if (selectedCountry === 'thailand') setBillAmount(850);
    else if (selectedCountry === 'united_states') setBillAmount(85);
    else if (selectedCountry === 'united_kingdom') setBillAmount(65);
    else setBillAmount(55);
  }, [selectedCountry]);

  const activeCountryObj = COUNTRIES.find(c => c.id === selectedCountry) || COUNTRIES[0];

  // Calculation logic
  const calculateTotals = () => {
    const rawBill = parseFloat(billAmount) || 0;
    const rawTip = (rawBill * (tipPercentage / 100));
    let totalWithTip = rawBill + rawTip;

    if (roundUp) {
      if (activeCountryObj.currency === 'JPY' || activeCountryObj.currency === 'THB') {
        totalWithTip = Math.ceil(totalWithTip / 100) * 100;
      } else {
        totalWithTip = Math.ceil(totalWithTip);
      }
    }

    const finalTip = Math.max(0, totalWithTip - rawBill);
    const people = Math.max(1, parseInt(numPeople) || 1);
    const perPerson = totalWithTip / people;

    // USD estimate
    const perPersonUSD = (perPerson * activeCountryObj.rateToUSD).toFixed(2);
    const totalUSD = (totalWithTip * activeCountryObj.rateToUSD).toFixed(2);

    return {
      rawBill,
      finalTip,
      totalWithTip,
      perPerson,
      people,
      perPersonUSD,
      totalUSD
    };
  };

  const totals = calculateTotals();

  const handleSpeakPhrase = (text) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleShareSplit = () => {
    const text = `🍽️ Meal Split in ${activeCountryObj.name} (${activeCountryObj.flag})\n` +
      `Bill: ${activeCountryObj.currency} ${totals.rawBill.toLocaleString()}\n` +
      `Tip (${tipPercentage}%): ${activeCountryObj.currency} ${totals.finalTip.toLocaleString()}\n` +
      `Total: ${activeCountryObj.currency} ${totals.totalWithTip.toLocaleString()} (~$${totals.totalUSD} USD)\n\n` +
      `👥 Split between ${totals.people} people:\n` +
      `👉 ${activeCountryObj.currency} ${totals.perPerson.toLocaleString()} per person (~$${totals.perPersonUSD} USD)`;

    navigator.clipboard.writeText(text);
    setShareStatus(true);
    setTimeout(() => setShareStatus(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header Banner */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
          <span>🍽️</span> International Dining Protocol & Bill Splitter
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 mb-3 tracking-tight font-outfit">
          Global Tipping & Etiquette
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Avoid embarrassing international tipping blunders. Instant cultural rules, bill phrase pronunciations, and currency-converted group bill splitting.
        </p>
      </div>

      {/* Country Selection Chips */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4 mb-6">
        {COUNTRIES.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCountry(c.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              selectedCountry === c.id
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-space-900 shadow-glow-amber scale-105'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <span className="text-lg">{c.flag}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Main Two-Column Cockpit */}
      {tippingData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Bill Splitter (7 cols) */}
          <div className="lg:col-span-7 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase font-outfit">Interactive Splitter</span>
                <h2 className="font-outfit text-2xl font-black text-white flex items-center gap-2">
                  <span>{activeCountryObj.flag}</span>
                  <span>{activeCountryObj.name} Dining Bill</span>
                </h2>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-xl bg-white/10 text-slate-200 font-mono font-bold">
                {activeCountryObj.currency}
              </span>
            </div>

            {/* Bill Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-outfit">
                Total Bill Amount ({activeCountryObj.currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={billAmount}
                  onChange={e => setBillAmount(e.target.value)}
                  className="w-full bg-space-900/80 border border-white/15 rounded-2xl px-5 py-4 text-2xl font-bold font-mono text-white focus:outline-none focus:border-amber-400 transition-all"
                  placeholder="0.00"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-mono font-bold">
                  {activeCountryObj.currency}
                </span>
              </div>
            </div>

            {/* Tip Percentage Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-outfit">
                  Tip Percentage
                </label>
                <span className="text-xs text-amber-400 font-bold font-mono">{tipPercentage}% Tip</span>
              </div>

              {tippingData.culture === 'insulting' && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-3 flex items-center gap-2">
                  <span>🚫</span>
                  <span><strong>Cultural Notice:</strong> In {activeCountryObj.name}, tipping is considered confusing or insulting. 0% is standard.</span>
                </div>
              )}

              <div className="grid grid-cols-5 gap-2">
                {[0, 5, 10, 15, 18, 20].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTipPercentage(pct)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tipPercentage === pct
                        ? 'bg-amber-400 text-space-900 font-black shadow-glow-amber'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Number of People & Round Up Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-outfit">
                  Split Between (People)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                    className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-lg border border-white/10 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={numPeople}
                    onChange={e => setNumPeople(parseInt(e.target.value) || 1)}
                    className="w-full bg-space-900/80 border border-white/15 rounded-xl py-2.5 text-center text-lg font-bold font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setNumPeople(numPeople + 1)}
                    className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-lg border border-white/10 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-outfit">
                  Convenience Rounding
                </label>
                <button
                  type="button"
                  onClick={() => setRoundUp(!roundUp)}
                  className={`w-full py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    roundUp
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{roundUp ? '✓ Rounded Up' : 'Exact Digits'}</span>
                </button>
              </div>
            </div>

            {/* Split Telemetry Summary Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-space-900 to-space-900 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-sm">
                <span className="text-slate-400">Tip Amount ({tipPercentage}%):</span>
                <span className="font-mono font-bold text-white">
                  {activeCountryObj.currency} {totals.finalTip.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-sm">
                <span className="text-slate-400">Total with Tip:</span>
                <span className="font-mono font-bold text-white">
                  {activeCountryObj.currency} {totals.totalWithTip.toLocaleString()}
                  <span className="text-xs text-slate-400 font-normal ml-2">(~${totals.totalUSD} USD)</span>
                </span>
              </div>

              {/* Huge Per-Person Share Callout */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-outfit">
                    Per Person Share ({totals.people} {totals.people === 1 ? 'person' : 'people'})
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                    {activeCountryObj.currency} {totals.perPerson.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    ≈ ${totals.perPersonUSD} USD equivalent
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleShareSplit}
                  className="px-6 py-3.5 rounded-xl bg-amber-400 text-space-900 font-outfit font-black text-xs sm:text-sm shadow-glow-amber hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                >
                  <span>{shareStatus ? '✓ Copied Message!' : '📋 Share Split'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Local Tipping Etiquette & Bill Phrases (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Status & Overview Card */}
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase font-outfit">Cultural Standard</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-amber-300 font-mono">
                  {tippingData.statusBadge}
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed font-inter">
                {tippingData.overview}
              </p>

              {/* Cultural Warning Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-300">
                  <span>💡</span> Traveler Insider Rule:
                </div>
                {tippingData.culturalCaveat}
              </div>
            </div>

            {/* Breakdown by Service */}
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-3.5">
              <h3 className="font-outfit text-base font-bold text-white pb-2 border-b border-white/10 flex items-center gap-2">
                <span>📍</span> Scenario-by-Scenario Guide
              </h3>

              <div className="text-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-base">🍽️</span>
                  <div>
                    <span className="font-bold text-white">Restaurants:</span>
                    <p className="text-slate-300 mt-0.5">{tippingData.restaurants}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-base">🚕</span>
                  <div>
                    <span className="font-bold text-white">Taxis:</span>
                    <p className="text-slate-300 mt-0.5">{tippingData.taxis}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-base">☕</span>
                  <div>
                    <span className="font-bold text-white">Cafes & Fast Casual:</span>
                    <p className="text-slate-300 mt-0.5">{tippingData.cafes}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-base">🏨</span>
                  <div>
                    <span className="font-bold text-white">Hotels & Bellhops:</span>
                    <p className="text-slate-300 mt-0.5">{tippingData.hotels}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-base">🍸</span>
                  <div>
                    <span className="font-bold text-white">Bars & Pubs:</span>
                    <p className="text-slate-300 mt-0.5">{tippingData.bars}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ask for the Bill Phrase Card */}
            <div className="bg-gradient-to-br from-space-900 to-space-950 border border-white/10 rounded-3xl p-6 shadow-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase font-outfit block mb-1">
                How to Ask for the Bill
              </span>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <div className="text-xl font-black text-white font-outfit">
                    {tippingData.billNative}
                  </div>
                  <div className="text-xs text-amber-300 font-mono mt-0.5">
                    "{tippingData.billPronunciation}"
                  </div>
                </div>

                <button
                  onClick={() => handleSpeakPhrase(tippingData.billNative)}
                  className="p-3.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-all cursor-pointer shadow-glow-amber"
                  title="Listen to native pronunciation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

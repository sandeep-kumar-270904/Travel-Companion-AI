import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
];

const DESTINATIONS = [
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', code: 'HND/NRT', timezone: 'Asia/Tokyo', lang: 'ja', flag: '🇯🇵', currency: '1 USD ≈ 153.2 JPY', weather: '21°C ☀️ Clear' },
  { id: 'paris', name: 'Paris', country: 'France', code: 'CDG', timezone: 'Europe/Paris', lang: 'fr', flag: '🇫🇷', currency: '1 USD ≈ 0.92 EUR', weather: '18°C ⛅ Mild' },
  { id: 'rome', name: 'Rome', country: 'Italy', code: 'FCO', timezone: 'Europe/Rome', lang: 'it', flag: '🇮🇹', currency: '1 USD ≈ 0.92 EUR', weather: '22°C ☀️ Sunny' },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', code: 'BKK', timezone: 'Asia/Bangkok', lang: 'th', flag: '🇹🇭', currency: '1 USD ≈ 36.8 THB', weather: '31°C 🌧️ Tropical' },
  { id: 'newyork', name: 'New York', country: 'USA', code: 'JFK', timezone: 'America/New_York', lang: 'en', flag: '🇺🇸', currency: '1 USD = 1.00 USD', weather: '19°C 🌤️ Breezy' },
  { id: 'london', name: 'London', country: 'UK', code: 'LHR', timezone: 'Europe/London', lang: 'en', flag: '🇬🇧', currency: '1 USD ≈ 0.78 GBP', weather: '16°C 🌦️ Drizzle' },
];

const QUICK_PHRASES = {
  urgent: [
    { text: 'I need urgent medical help', icon: '🩺' },
    { text: 'I have a severe food allergy', icon: '⚠️' },
    { text: 'Where is the nearest police station?', icon: '🚨' },
    { text: 'Please call an ambulance immediately', icon: '🚑' },
  ],
  transit: [
    { text: 'Please take me to the airport', icon: '✈️' },
    { text: 'How much to the city center?', icon: '🚕' },
    { text: 'Please turn on the taxi meter', icon: '📟' },
    { text: 'Which platform for central station?', icon: '🚆' },
  ],
  dining: [
    { text: 'Do you have an English menu?', icon: '📖' },
    { text: 'Does this dish contain peanuts or lard?', icon: '🥜' },
    { text: 'Bottled water please, no ice', icon: '💧' },
    { text: 'The check please, separate bills', icon: '💳' },
  ],
  lodging: [
    { text: 'Can I store my luggage before check-in?', icon: '🧳' },
    { text: 'What is the Wi-Fi network and password?', icon: '📶' },
    { text: 'Can you call a taxi for tomorrow morning?', icon: '⏰' },
    { text: 'The air conditioning is not working', icon: '❄️' },
  ],
};

const GlassCard = ({ children, className, glowColor }) => (
  <div className={`flex-1 relative group ${className}`}>
    <div className="w-full h-full flex flex-col glass-panel rounded-3xl overflow-hidden relative border border-white/10 hover:border-white/20 transition-all duration-300 shadow-2xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      {children}
    </div>
  </div>
);

export default function Home({ onNavigate }) {
  const [fromText, setFromText] = useState('');
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('ja');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState('');
  const [conversationDirection, setConversationDirection] = useState('userToOther');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [history, setHistory] = useState([]);

  // Next-Level HUD and Action States
  const [activeDest, setActiveDest] = useState(DESTINATIONS[0]);
  const [activePhraseTab, setActivePhraseTab] = useState('urgent');
  const [destTime, setDestTime] = useState('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [copiedState, setCopiedState] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const getSpeechLang = () => conversationDirection === 'userToOther' ? fromLang : toLang;
  const getTranslateFromLang = () => conversationDirection === 'userToOther' ? fromLang : toLang;
  const getTranslateToLang = () => conversationDirection === 'userToOther' ? toLang : fromLang;

  // Real-time local destination clock
  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: activeDest.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date());
        setDestTime(timeStr);
      } catch {
        setDestTime('--:--');
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, [activeDest]);

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (transcript) setFromText(transcript);
  }, [transcript]);

  // When changing destination, adapt target language automatically
  const handleSelectDestination = (dest) => {
    setActiveDest(dest);
    if (dest.lang !== fromLang) {
      setToLang(dest.lang);
    }
  };

  const handleTranslate = async (overrideText) => {
    const textToProcess = (typeof overrideText === 'string' ? overrideText : fromText).trim();
    if (!textToProcess) return;

    setLoading(true);
    setError('');
    setTranslatedText('');

    try {
      const res = await axios.post('/api/translate', {
        text: textToProcess,
        fromLang: getTranslateFromLang(),
        toLang: getTranslateToLang(),
      });
      const translated = res.data.translatedText;
      setTranslatedText(translated);

      const newHistory = [{
        original: textToProcess,
        translated: translated,
        fromLang: getTranslateFromLang(),
        toLang: getTranslateToLang(),
        date: new Date().toISOString()
      }, ...history.filter(h => h.original !== textToProcess)].slice(0, 20);

      setHistory(newHistory);
      localStorage.setItem('dashboard_history', JSON.stringify(newHistory));
    } catch {
      setError('Translation failed. Please verify network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPhrase = (phrase) => {
    setFromText(phrase);
    handleTranslate(phrase);
  };

  const handleSpeak = (customText, customLang) => {
    const text = (customText || translatedText).trim();
    if (!text) return;

    setTtsLoading(true);
    setTtsError('');

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any pending utterances
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speechRate;

        const targetCode = customLang || getTranslateToLang();

        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          let voice = voices.find(v => v.lang.toLowerCase().startsWith(targetCode));
          if (!voice) voice = voices.find(v => v.lang.toLowerCase().includes('en'));
          if (voice) utterance.voice = voice;
          window.speechSynthesis.speak(utterance);
        };

        if (!window.speechSynthesis.getVoices().length) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        } else {
          loadVoices();
        }
      } else {
        setTtsError('Speech synthesis not supported in this browser.');
      }
    } catch {
      setTtsError('Failed to play audio.');
    } finally {
      setTtsLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('dashboard_history');
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="max-w-6xl mx-auto px-2 sm:px-4 pb-16"
    >
      {/* 1. Next-Level Atmospheric Destination HUD (Cockpit Bar) */}
      <motion.div
        variants={panelVariants}
        className="mb-8 p-4 sm:p-5 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-neon-cyan/10 via-glowing-purple/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          
          {/* Left: Active Destination Selector */}
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl filter drop-shadow">{activeDest.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neon-cyan tracking-wider uppercase font-outfit">Active Travel Hub</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">{activeDest.code}</span>
              </div>
              <h1 className="font-outfit text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                {activeDest.name}, {activeDest.country}
              </h1>
            </div>
          </div>

          {/* Middle: Live Destination Telemetry (Time, Weather, Currency) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-900/60 border border-white/10 text-slate-300 backdrop-blur-md">
              <span className="text-slate-400">🕒 Local:</span>
              <span className="font-mono font-bold text-white">{destTime || '12:00'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-900/60 border border-white/10 text-slate-300 backdrop-blur-md">
              <span className="font-bold text-neon-cyan">{activeDest.weather}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-space-900/60 border border-emerald-500/20 text-emerald-300 backdrop-blur-md">
              <span className="font-mono font-semibold">{activeDest.currency}</span>
            </div>
          </div>

          {/* Right: Quick Switch Hub Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide w-full lg:w-auto pt-2 lg:pt-0">
            <span className="text-[11px] text-slate-500 font-semibold uppercase mr-1 hidden sm:inline">Hubs:</span>
            {DESTINATIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => handleSelectDestination(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeDest.id === d.id
                    ? 'bg-neon-cyan text-space-900 shadow-glow-cyan scale-105'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{d.flag}</span>
                <span>{d.name}</span>
              </button>
            ))}
          </div>

        </div>
      </motion.div>

      {/* 2. Autonomous Travel Concierge Pillars (Quick Navigation with Live Telemetry) */}
      <motion.div variants={panelVariants} className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Smart Itinerary', sub: 'Weather + .ICS Sync', badge: '⛅ Open-Meteo', icon: '🌦️', tab: 'localguide', color: 'from-purple-500/20 via-space-900 to-space-900', border: 'hover:border-purple-500/50', text: 'text-purple-300' },
          { label: 'Chef Allergy Pass', sub: '12-Lang Emergency', badge: '📇 12 Scripts', icon: '📇', tab: 'ai', color: 'from-rose-500/20 via-space-900 to-space-900', border: 'hover:border-rose-500/50', text: 'text-rose-300' },
          { label: 'Receipt Ledger', sub: 'Multi-Currency OCR', badge: '💳 Multi-Currency', icon: '🧾', tab: 'expenses', color: 'from-emerald-500/20 via-space-900 to-space-900', border: 'hover:border-emerald-500/50', text: 'text-emerald-300' },
          { label: 'Scam Radar & SOS', sub: 'Tourist Trap Defense', badge: '🚨 Shield Active', icon: '🚨', tab: 'emergency', color: 'from-amber-500/20 via-space-900 to-space-900', border: 'hover:border-amber-500/50', text: 'text-amber-300' }
        ].map((item, idx) => (
          <motion.button
            key={idx}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => onNavigate && onNavigate(item.tab)}
            className={`p-4 rounded-3xl bg-gradient-to-br ${item.color} border border-white/10 ${item.border} text-left transition-all shadow-xl backdrop-blur-xl group cursor-pointer relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono tracking-tight">{item.badge}</span>
            </div>
            <div className={`font-bold font-outfit text-sm sm:text-base ${item.text} flex items-center justify-between`}>
              <span>{item.label}</span>
              <span className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">{item.sub}</div>
          </motion.button>
        ))}
      </motion.div>

      {/* 3. Fast-Action Quick Phrases Chips (Instant Tap-to-Translate) */}
      <motion.div variants={panelVariants} className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-outfit font-bold text-white flex items-center gap-1.5">
              <span>⚡</span> Fast-Action Travel Phrases
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">— tap to translate immediately</span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {[
              { id: 'urgent', label: '🚨 Urgent' },
              { id: 'transit', label: '🚕 Transit' },
              { id: 'dining', label: '🍜 Dining' },
              { id: 'lodging', label: '🏨 Hotel' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePhraseTab(tab.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activePhraseTab === tab.id
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Phrase Chips Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {QUICK_PHRASES[activePhraseTab].map((p, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickPhrase(p.text)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-neon-cyan/40 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
            >
              <span className="text-lg group-hover:scale-125 transition-transform duration-200">{p.icon}</span>
              <span className="text-xs font-medium text-slate-300 group-hover:text-white line-clamp-1">{p.text}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 4. Main Bilingual Translation Engine with Spring Tilt Cards */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-center relative mb-10">
        
        {/* Left Side: Input Panel */}
        <motion.div variants={panelVariants} className="flex-1 flex w-full">
          <GlassCard glowColor="from-neon-cyan/15 to-transparent" className={`w-full transition-all duration-300 ${isInputFocused ? 'shadow-glow-cyan border-neon-cyan/50' : 'hover:border-neon-cyan/30 shadow-2xl'}`}>
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-space-900/50 flex justify-between items-center relative z-10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f3ff]" />
                <h3 className="font-outfit text-base font-bold text-white">
                  {conversationDirection === 'userToOther' ? 'You (Input)' : 'Other Person (Input)'}
                </h3>
              </div>
              <select
                className="bg-space-800/90 border border-white/15 text-slate-200 text-xs sm:text-sm rounded-xl focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan block w-36 p-2 transition-all shadow-glass-inset cursor-pointer font-medium"
                value={conversationDirection === 'userToOther' ? fromLang : toLang}
                onChange={e => conversationDirection === 'userToOther' ? setFromLang(e.target.value) : setToLang(e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Textarea Area */}
            <div className="p-6 flex-1 flex flex-col relative z-10 bg-space-900/30">
              <textarea
                className="w-full h-40 bg-transparent border-0 resize-none focus:ring-0 p-2 sm:text-xl text-white placeholder-slate-500 transition-colors font-inter"
                placeholder={conversationDirection === 'userToOther' ? 'Type travel phrase or tap microphone...' : 'Other person speaks or types here...'}
                value={fromText}
                onChange={e => setFromText(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              />

              {/* Dynamic Sound Waveform during Speech Recognition */}
              <AnimatePresence>
                {listening && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 flex items-center justify-between px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/30"
                  >
                    <div className="flex items-center gap-1.5 h-5">
                      {[0.2, 0.5, 0.8, 0.4, 0.7, 0.3].map((delay, i) => (
                        <motion.span
                          key={i}
                          animate={{ scaleY: [0.3, 1.8, 0.3] }}
                          transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, delay: delay * 0.15, ease: 'easeInOut' }}
                          className="w-1 bg-gradient-to-t from-red-500 to-amber-400 rounded-full h-3 origin-center"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-red-400 font-bold tracking-wide">
                      Listening in {LANGUAGES.find(l => l.code === getSpeechLang())?.name || 'Voice'}...
                    </span>
                    <button
                      onClick={() => SpeechRecognition.stopListening()}
                      className="text-[11px] text-red-300 underline font-semibold hover:text-white"
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Bottom Actions */}
              <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all ${
                      listening
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white hover:border-neon-cyan/50 hover:shadow-glow-cyan'
                    } disabled:opacity-50 cursor-pointer`}
                    type="button"
                    onClick={() => {
                      if (!listening) {
                        resetTranscript();
                        SpeechRecognition.startListening({ continuous: false, language: getSpeechLang() });
                      } else {
                        SpeechRecognition.stopListening();
                      }
                    }}
                    disabled={!browserSupportsSpeechRecognition}
                    title="Speak using microphone"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </motion.button>
                  {fromText && (
                    <button
                      onClick={() => { setFromText(''); setTranslatedText(''); }}
                      className="text-xs text-slate-500 hover:text-slate-300 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-7 py-3 text-sm font-bold rounded-xl shadow-glow-cyan text-space-900 bg-gradient-to-r from-neon-cyan to-[#00d4ff] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
                  onClick={() => handleTranslate()}
                  disabled={loading || !fromText.trim()}
                >
                  {loading ? 'Translating...' : 'Translate ➔'}
                </motion.button>
              </div>

              {!browserSupportsSpeechRecognition && (
                <p className="text-xs text-red-400 mt-2">Speech recognition not supported in this browser.</p>
              )}
              {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            </div>
          </GlassCard>
        </motion.div>

        {/* Swap Button */}
        <motion.div variants={panelVariants} className="flex items-center justify-center -my-4 lg:my-0 lg:-mx-5 z-20 relative">
          <motion.button
            whileHover={{ scale: 1.15, rotate: 180 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-space-900/90 backdrop-blur-2xl rounded-full p-4 shadow-glow-purple border-2 border-glowing-purple/50 text-glowing-purple hover:text-white hover:bg-glowing-purple/30 transition-all focus:outline-none z-30 relative cursor-pointer"
            onClick={() => setConversationDirection(conversationDirection === 'userToOther' ? 'otherToUser' : 'userToOther')}
            title="Swap Conversation Direction"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform lg:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Right Side: Output Panel */}
        <motion.div variants={panelVariants} className="flex-1 flex w-full">
          <GlassCard glowColor="from-glowing-purple/15 to-transparent" className="w-full hover:border-glowing-purple/30 shadow-2xl transition-all duration-300">
            
            {/* Header */}
            <div className="relative z-10 px-6 py-4 border-b border-white/10 bg-space-900/50 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-glowing-purple shadow-[0_0_8px_#b535f6]" />
                <h3 className="font-outfit text-base font-bold text-white">
                  {conversationDirection === 'userToOther' ? 'Other Person (Output)' : 'You (Output)'}
                </h3>
              </div>
              <select
                className="bg-space-800/90 border border-white/15 text-slate-200 text-xs sm:text-sm rounded-xl focus:ring-1 focus:ring-glowing-purple focus:border-glowing-purple block w-36 p-2 transition-all shadow-glass-inset cursor-pointer font-medium"
                value={conversationDirection === 'userToOther' ? toLang : fromLang}
                onChange={e => conversationDirection === 'userToOther' ? setToLang(e.target.value) : setFromLang(e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Translated Output Content */}
            <div className="relative z-10 p-6 flex-1 flex flex-col bg-space-900/30">
              <div className="flex-1 min-h-[160px] p-2">
                <AnimatePresence mode="wait">
                  {translatedText ? (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <p className="sm:text-2xl text-white font-bold whitespace-pre-wrap leading-relaxed tracking-wide font-outfit">
                        {translatedText}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.p 
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-slate-500 italic sm:text-lg font-light pt-4"
                    >
                      Translated words and phonetic guidance appear here...
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Bottom Actions */}
              <div className="mt-auto pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                
                {/* Secondary Actions: Show to Local & Copy */}
                <div className="flex items-center gap-2">
                  {translatedText && (
                    <>
                      {/* Show to Local Fullscreen Mode */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFullscreen(true)}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-bold text-neon-cyan flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Open large high-contrast display for taxi drivers or waiters"
                      >
                        <span>🔍</span>
                        <span>Show to Local</span>
                      </motion.button>

                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(translatedText)}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        {copiedState ? '✓ Copied!' : 'Copy'}
                      </button>

                      {/* Speech Rate Toggle */}
                      <button
                        onClick={() => setSpeechRate(speechRate === 1.0 ? 0.75 : 1.0)}
                        className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400 hover:text-white"
                        title="Toggle Audio Speed"
                      >
                        {speechRate}x
                      </button>
                    </>
                  )}
                </div>

                {/* Primary Audio Speak Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-5 py-2.5 border border-white/10 shadow-glass-inset text-sm font-bold rounded-xl text-slate-200 bg-white/5 hover:bg-white/10 hover:border-glowing-purple/50 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed gap-2 cursor-pointer ml-auto"
                  onClick={() => handleSpeak()}
                  disabled={ttsLoading || !translatedText}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-glowing-purple" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                  <span>{ttsLoading ? 'Playing...' : 'Listen Audio'}</span>
                </motion.button>
              </div>

              {ttsError && <p className="text-xs text-red-400 mt-2">{ttsError}</p>}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* 5. "Show to Local / Taxi Driver" High-Contrast Fullscreen Modal */}
      <AnimatePresence>
        {showFullscreen && translatedText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/90 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-space-900 border-2 border-neon-cyan/40 rounded-3xl p-6 sm:p-10 shadow-[0_0_60px_rgba(0,243,255,0.2)] text-center relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <span className="text-xs font-bold text-neon-cyan uppercase tracking-widest font-mono">
                  Show This Screen Directly to Local Staff / Driver
                </span>
                <button
                  onClick={() => setShowFullscreen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Target Translation in Massive High-Contrast Font */}
              <p className="text-3xl sm:text-5xl font-black text-white leading-tight font-outfit mb-6 select-all">
                {translatedText}
              </p>

              {/* Original Query Context */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-sm mb-8 inline-block max-w-lg">
                <span className="text-slate-500 font-semibold mr-1.5">Original:</span>
                "{fromText}"
              </div>

              {/* Big Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSpeak()}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-neon-cyan to-blue-500 text-space-900 font-outfit font-black text-lg shadow-glow-cyan flex items-center gap-2 cursor-pointer"
                >
                  <span>🔊</span>
                  <span>Play Loud Audio</span>
                </motion.button>
                <button
                  onClick={() => setShowFullscreen(false)}
                  className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base transition-all cursor-pointer"
                >
                  Done (Dismiss)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Recent Translation Vault with Audio Replay & 1-Tap Copy */}
      {history.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative z-10"
        >
          <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 className="font-outfit text-base font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Translations Vault ({history.length})
            </h3>
            <button
              onClick={clearHistory}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors font-medium cursor-pointer"
            >
              Clear Vault
            </button>
          </div>
          <ul className="divide-y divide-white/5 max-h-[360px] overflow-y-auto custom-scrollbar">
            {history.map((item, i) => (
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                key={i} 
                className="px-6 py-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>{LANGUAGES.find(l => l.code === item.fromLang)?.flag} {item.fromLang}</span>
                    <span>➔</span>
                    <span className="text-neon-cyan">{LANGUAGES.find(l => l.code === item.toLang)?.flag} {item.toLang}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-400 mb-0.5">{item.original}</p>
                  <p className="text-base text-white font-bold">{item.translated}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleSpeak(item.translated, item.toLang)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-glowing-purple transition-all cursor-pointer"
                    title="Play Audio"
                  >
                    🔊
                  </button>
                  <button
                    onClick={() => handleCopy(item.translated)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Copy Translation"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => { setFromText(item.original); setTranslatedText(item.translated); }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neon-cyan transition-all cursor-pointer text-xs font-semibold"
                    title="Load into translator"
                  >
                    Load ➔
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
];

const TiltCard = ({ children, className, glowColor }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Rotate between -5 and 5 degrees based on mouse position
  const rotateX = useTransform(y, [-200, 200], [5, -5]);
  const rotateY = useTransform(x, [-200, 200], [-5, 5]);

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    // Calculate distance from center of the card
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ perspective: 1200 }}
      className={`flex-1 relative group ${className}`}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouse}
        onMouseLeave={handleMouseLeave}
        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.5 }}
        className="w-full h-full flex flex-col glass-panel rounded-3xl overflow-hidden relative border border-white/10 transition-shadow duration-300"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
        {children}
      </motion.div>
    </motion.div>
  );
};

export default function Home() {
  const [fromText, setFromText] = useState('');
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('hi');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState('');
  const [conversationDirection, setConversationDirection] = useState('userToOther');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [history, setHistory] = useState([]);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const getSpeechLang = () => conversationDirection === 'userToOther' ? fromLang : toLang;
  const getTranslateFromLang = () => conversationDirection === 'userToOther' ? fromLang : toLang;
  const getTranslateToLang = () => conversationDirection === 'userToOther' ? toLang : fromLang;

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (transcript) setFromText(transcript);
  }, [transcript]);

  const handleTranslate = async () => {
    if (!fromText.trim()) return;
    setLoading(true);
    setError('');
    setTranslatedText('');
    try {
      const res = await axios.post('/api/translate', {
        text: fromText,
        fromLang: getTranslateFromLang(),
        toLang: getTranslateToLang(),
      });
      const translated = res.data.translatedText;
      setTranslatedText(translated);
      
      const newHistory = [{
        original: fromText,
        translated: translated,
        fromLang: getTranslateFromLang(),
        toLang: getTranslateToLang(),
        date: new Date().toISOString()
      }, ...history].slice(0, 20); // Keep last 20
      
      setHistory(newHistory);
      localStorage.setItem('dashboard_history', JSON.stringify(newHistory));
      
    } catch {
      setError('Translation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = () => {
    if (!translatedText.trim()) return;
    setTtsLoading(true);
    setTtsError('');
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(translatedText);

        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          let voice;
          switch(getTranslateToLang()){
            case 'hi': voice = voices.find(v => v.lang.includes('hi')); break;
            case 'es': voice = voices.find(v => v.lang.includes('es')); break;
            case 'fr': voice = voices.find(v => v.lang.includes('fr')); break;
            case 'de': voice = voices.find(v => v.lang.includes('de')); break;
            case 'zh': voice = voices.find(v => v.lang.includes('zh')); break;
            case 'ar': voice = voices.find(v => v.lang.includes('ar')); break;
            default: voice = voices.find(v => v.lang.includes('en'));
          }
          if (voice) utterance.voice = voice;
          window.speechSynthesis.speak(utterance);
        };

        if (!window.speechSynthesis.getVoices().length) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        } else loadVoices();
      } else setTtsError('Speech synthesis not supported.');
    } catch {
      setTtsError('Failed to speak.');
    } finally {
      setTtsLoading(false);
    }
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
      className="max-w-5xl mx-auto"
    >
      <motion.div variants={panelVariants} className="mb-10 text-center">
        <h2 className="font-outfit text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-400 tracking-tight mb-3 drop-shadow-sm">Translation Dashboard</h2>
        <p className="font-inter text-slate-400 text-lg">Fast, accurate text and speech translation powered by AI.</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center relative">
        
        {/* Left Side: Input */}
        <motion.div variants={panelVariants} className="flex-1 flex w-full">
          <TiltCard glowColor="from-neon-cyan/10 to-transparent" className={`w-full transition-all duration-300 ${isInputFocused ? 'shadow-glow-cyan scale-[1.02] border-neon-cyan/50' : 'hover:border-neon-cyan/30 shadow-2xl'}`}>
            <div className="px-6 py-5 border-b border-white/10 bg-space-900/40 flex justify-between items-center relative z-10 backdrop-blur-md">
              <h3 className="font-outfit text-lg font-semibold text-slate-200">
                {conversationDirection === 'userToOther' ? 'You (Input)' : 'Other Person (Input)'}
              </h3>
              <select
                className="bg-space-800/80 border border-white/10 text-slate-200 text-sm rounded-xl focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan block w-32 p-2.5 transition-all shadow-glass-inset cursor-pointer font-medium"
                value={conversationDirection === 'userToOther' ? fromLang : toLang}
                onChange={e => conversationDirection === 'userToOther' ? setFromLang(e.target.value) : setToLang(e.target.value)}
              >
                {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
              </select>
            </div>
            
            <div className="p-6 flex-1 flex flex-col relative z-10 bg-space-900/20">
              <textarea
                className="w-full h-40 bg-transparent border-0 resize-none focus:ring-0 p-2 sm:text-xl text-white placeholder-slate-600 transition-colors font-inter"
                placeholder={conversationDirection === 'userToOther' ? 'Type or speak here...' : 'Other person types or speaks...'}
                value={fromText}
                onChange={e => setFromText(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              />
              
              <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all ${listening ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white hover:border-neon-cyan/50 hover:shadow-glow-cyan'} disabled:opacity-50`}
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
                    title="Speak"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </motion.button>
                  {listening && <span className="text-sm text-red-400 font-semibold tracking-wide animate-pulse">Listening...</span>}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-3 text-base font-bold rounded-xl shadow-glow-cyan text-space-900 bg-gradient-to-r from-neon-cyan to-[#00d4ff] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  onClick={handleTranslate}
                  disabled={loading || !fromText.trim()}
                >
                  {loading ? 'Translating...' : 'Translate'}
                </motion.button>
              </div>
              {!browserSupportsSpeechRecognition && (
                <p className="text-xs text-red-400 mt-3">Speech recognition not supported in this browser.</p>
              )}
              {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
            </div>
          </TiltCard>
        </motion.div>

        {/* Swap Button */}
        <motion.div variants={panelVariants} className="flex items-center justify-center -my-6 lg:my-0 lg:-mx-6 z-20 relative">
          <motion.button
            whileHover={{ scale: 1.15, rotate: 180 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-space-900 backdrop-blur-xl rounded-full p-5 shadow-glow-purple border-2 border-glowing-purple/50 text-glowing-purple hover:text-white hover:bg-glowing-purple/20 transition-all focus:outline-none z-30 relative"
            onClick={() => setConversationDirection(conversationDirection === 'userToOther' ? 'otherToUser' : 'userToOther')}
            title="Swap Direction"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform lg:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Right Side: Output */}
        <motion.div variants={panelVariants} className="flex-1 flex w-full">
          <TiltCard glowColor="from-glowing-purple/10 to-transparent" className="w-full hover:border-glowing-purple/30 shadow-2xl transition-all duration-300">
            <div className="relative z-10 px-6 py-5 border-b border-white/10 bg-space-900/40 flex justify-between items-center backdrop-blur-md">
              <h3 className="font-outfit text-lg font-semibold text-slate-200">
                {conversationDirection === 'userToOther' ? 'Other Person (Output)' : 'You (Output)'}
              </h3>
              <select
                className="bg-space-800/80 border border-white/10 text-slate-200 text-sm rounded-xl focus:ring-1 focus:ring-glowing-purple focus:border-glowing-purple block w-32 p-2.5 transition-all shadow-glass-inset cursor-pointer font-medium"
                value={conversationDirection === 'userToOther' ? toLang : fromLang}
                onChange={e => conversationDirection === 'userToOther' ? setToLang(e.target.value) : setFromLang(e.target.value)}
              >
                {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
              </select>
            </div>
            
            <div className="relative z-10 p-6 flex-1 flex flex-col bg-space-900/20">
              <div className="flex-1 min-h-[160px] p-2">
                <AnimatePresence mode="wait">
                  {translatedText ? (
                    <motion.p 
                      key="text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="sm:text-2xl text-white font-semibold whitespace-pre-wrap leading-relaxed tracking-wide"
                    >
                      {translatedText}
                    </motion.p>
                  ) : (
                    <motion.p 
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-slate-600 italic sm:text-xl font-light"
                    >
                      Translation will appear here...
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-6 py-3 border border-white/10 shadow-glass-inset text-base font-bold rounded-xl text-slate-200 bg-white/5 hover:bg-white/10 hover:border-glowing-purple/50 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed gap-3"
                  onClick={handleSpeak}
                  disabled={ttsLoading || !translatedText}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-glowing-purple" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                  {ttsLoading ? 'Speaking...' : 'Listen to Audio'}
                </motion.button>
              </div>
              {ttsError && <p className="text-xs text-red-400 mt-3">{ttsError}</p>}
            </div>
          </TiltCard>
        </motion.div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative z-10"
        >
          <div className="px-6 py-4 border-b border-white/5 bg-white/5">
            <h3 className="font-outfit text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Translations
            </h3>
          </div>
          <ul className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
            {history.map((item, i) => (
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={i} 
                className="px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      <span>{item.fromLang}</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span>{item.toLang}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">{item.original}</p>
                    <p className="text-base text-neon-cyan font-medium">{item.translated}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ja', name: 'Japanese' },
];

export default function VoiceTranslator() {
  const [loading, setLoading] = useState(false);
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('hi');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Reference to keep track of the last processed transcript to avoid duplicate processing
  const lastProcessedTranscript = useRef('');

  useEffect(() => {
    // If listening stopped and we have a new transcript, process it automatically
    if (!listening && transcript && transcript !== lastProcessedTranscript.current) {
      lastProcessedTranscript.current = transcript;
      processTranslation(transcript);
    }
  }, [listening, transcript]);

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setError('');
      SpeechRecognition.startListening({ continuous: true, language: fromLang });
    }
  };

  const processTranslation = async (textToTranslate) => {
    if (!textToTranslate.trim()) return;
    setLoading(true);
    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      
      // 1. Translate text
      const transRes = await axios.post('/api/translate', {
        text: textToTranslate,
        fromLang: fromLang,
        toLang,
        apiKey
      });
      const translatedText = transRes.data.translatedText;
      const detectedLang = transRes.data.detectedSourceLanguage;

      // 2. Text to Speech (Browser native is faster and free, falling back to API if needed)
      speakTranslatedText(translatedText, toLang);

      setHistory(prev => [{ originalText: textToTranslate, translatedText, detectedLang }, ...prev]);
    } catch (err) {
      console.error('Voice translation failed', err);
      setError('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const speakTranslatedText = (text, lang) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(lang));
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
      };

      if (!window.speechSynthesis.getVoices().length) {
        window.speechSynthesis.onvoiceschanged = setVoice;
      } else {
        setVoice();
      }
    } else {
      // Fallback to backend TTS if browser doesn't support it
      axios.post('/api/translate/speak', { text, lang })
        .then(res => {
          if (res.data.audio) {
            const audio = new Audio(res.data.audio);
            audio.play();
          }
        })
        .catch(console.error);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-red-400 bg-red-500/10 px-6 py-4 rounded-2xl border border-red-500/20">
          <p className="text-lg font-bold mb-2">Browser Not Supported</p>
          <p>Your browser does not support the Web Speech API required for Voice Translation.</p>
          <p className="mt-2 text-sm text-slate-400">Please try using Google Chrome.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 relative z-10"
    >
      <div className="text-center mb-8">
        <h2 className="font-outfit text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-500 tracking-tight mb-2">Real-Time Voice</h2>
        <p className="font-inter text-slate-400">Speak naturally and hear the translation instantly.</p>
      </div>
      
      {/* Main Translation Interface */}
      <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 mb-12">
          {/* Source Language */}
          <div className="flex-1 w-full bg-space-900/50 rounded-2xl p-4 border border-white/10 shadow-glass-inset">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">You Speak</label>
            <select 
              className="w-full bg-transparent text-white text-lg font-medium focus:outline-none appearance-none cursor-pointer"
              value={fromLang}
              onChange={(e) => setFromLang(e.target.value)}
            >
              <option value="en">English</option>
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Direction Icon */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neon-cyan shadow-glow-cyan">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

          {/* Target Language */}
          <div className="flex-1 w-full bg-space-900/50 rounded-2xl p-4 border border-white/10 shadow-glass-inset">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">They Hear</label>
            <select 
              className="w-full bg-transparent text-white text-lg font-medium focus:outline-none appearance-none cursor-pointer"
              value={toLang}
              onChange={(e) => setToLang(e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Microphone Button Area */}
        <div className="flex flex-col items-center justify-center relative z-10 py-8">
          <div className="relative group">
            {listening && (
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-neon-cyan/30 rounded-full blur-xl pointer-events-none"
              />
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              disabled={loading}
              className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-2xl ${
                listening 
                  ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.4)]' 
                  : 'bg-gradient-to-b from-neon-cyan/20 to-blue-500/20 border-neon-cyan/50 text-neon-cyan hover:shadow-glow-cyan'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {listening ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                )}
              </svg>
            </motion.button>
          </div>
          
          <p className="mt-8 text-lg font-outfit text-slate-300 tracking-wide font-medium">
            {loading ? 'Processing...' : listening ? 'Tap to stop' : 'Tap to start speaking'}
          </p>

          <div className="mt-8 min-h-[60px] max-w-xl mx-auto text-center w-full">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400">
                  {error}
                </motion.p>
              ) : transcript ? (
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-2xl font-inter text-white font-light italic">
                  "{transcript}"
                </motion.p>
              ) : (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-slate-500 font-inter">
                  Your speech will appear here...
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* History Area */}
      {history.length > 0 && (
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden relative z-10">
          <div className="px-6 py-4 border-b border-white/5 bg-white/5">
            <h3 className="font-outfit text-lg font-semibold text-white">Recent Translations</h3>
          </div>
          <ul className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
            {history.map((item, i) => (
              <motion.li 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="px-6 py-5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-400 mb-1">{item.originalText}</p>
                    <p className="text-lg text-neon-cyan font-medium">{item.translatedText}</p>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    <button
                      onClick={() => speakTranslatedText(item.translatedText, toLang)}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/10"
                      title="Play Translation"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.898a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

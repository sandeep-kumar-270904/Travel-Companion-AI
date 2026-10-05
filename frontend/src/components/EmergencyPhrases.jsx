import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const EmergencyPhrases = () => {
  const [phrases, setPhrases] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('emergency');
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);

  const categories = Object.keys(phrases).length > 0 ? Object.keys(phrases) : ['emergency', 'travel'];
  const languages = ['english', 'hindi', 'telugu', 'spanish'];

  useEffect(() => {
    const fetchPhrases = async () => {
      try {
        setLoading(true);
        // Using offline emergency data directly for robustness in emergency situations
        setPhrases({
          emergency: [
            { english: "Call the police!", hindi: "पुलिस को बुलाओ!", telugu: "పోలీసులను పిలవండి!", spanish: "¡Llama a la policía!" },
            { english: "I need help.", hindi: "मुझे मदद चाहिए।", telugu: "నాకు సహాయం కావాలి.", spanish: "Necesito ayuda." }
          ],
          medical: [
            { english: "Where is the hospital?", hindi: "अस्पताल कहाँ है?", telugu: "ఆసుపత్రి ఎక్కడ ఉంది?", spanish: "¿Dónde está el hospital?" },
            { english: "I need a doctor.", hindi: "मुझे डॉक्टर की जरूरत है।", telugu: "నాకు డాక్టర్ కావాలి.", spanish: "Necesito un médico." },
            { english: "It hurts here.", hindi: "यहाँ दर्द हो रहा है।", telugu: "ఇక్కడ నొప్పిగా ఉంది.", spanish: "Me duele aquí." }
          ],
          police: [
            { english: "I have been robbed.", hindi: "मुझे लूट लिया गया है।", telugu: "నన్ను దోచుకున్నారు.", spanish: "Me han robado." },
            { english: "I lost my passport.", hindi: "मेरा पासपोर्ट खो गया है।", telugu: "నా పాస్‌పోర్ట్ పోయింది.", spanish: "He perdido mi pasaporte." }
          ],
          transport: [
            { english: "Where is the embassy?", hindi: "दूतावास कहाँ है?", telugu: "రాయబార కార్యాలయం ఎక్కడ ఉంది?", spanish: "¿Dónde está la embajada?" },
            { english: "I am lost.", hindi: "मैं खो गया हूँ।", telugu: "నేను తప్పిపోయాను.", spanish: "Estoy perdido." }
          ]
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchPhrases();
  }, []);

  const playAudio = (phrase) => {
    if (playingAudio) playingAudio.pause();

    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(phrase[selectedLanguage]);
        const voices = window.speechSynthesis.getVoices();
        let voice;
        switch (selectedLanguage) {
          case 'hindi': voice = voices.find(v => v.lang.includes('hi')); break;
          case 'spanish': voice = voices.find(v => v.lang.includes('es')); break;
          case 'telugu': voice = voices.find(v => v.lang.includes('te')); break;
          default: voice = voices.find(v => v.lang.includes('en'));
        }
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Audio error:', err);
    }
  };

  const [locationStatus, setLocationStatus] = useState('');
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }
    setLocationStatus('Getting location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setLocationStatus(`Location found!`);
        if (navigator.share) {
          navigator.share({
            title: 'Emergency: My Location',
            text: 'I have an emergency. Here is my current location:',
            url: mapLink
          }).catch(console.error);
        } else {
          // Fallback to clipboard
          navigator.clipboard.writeText(`Emergency! My location: ${mapLink}`);
          setLocationStatus('Link copied to clipboard!');
        }
      },
      (error) => {
        setLocationStatus('Unable to retrieve your location');
      }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-red-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">Emergency Kit</h1>
        <p className="text-slate-400">Critical phrases when you need them most.</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-2xl flex items-center gap-3">
          <span className="text-xl">⚠️</span> {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all capitalize ${
                  selectedCategory === cat 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                    : 'bg-white/5 text-slate-300 border border-transparent hover:bg-white/10'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Target Language</h2>
          <div className="flex flex-wrap gap-3">
            {languages.map(lang => (
              <motion.button
                key={lang}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  selectedLanguage === lang 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' 
                    : 'bg-white/5 text-slate-300 border border-transparent hover:bg-white/10'
                }`}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShareLocation}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.4)] border border-red-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Share My Location
        </motion.button>
      </div>
      {locationStatus && (
        <div className="text-center text-sm text-red-400 font-medium mb-4">{locationStatus}</div>
      )}

      <motion.div 
        layout
        className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-50" />
        
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {phrases[selectedCategory]?.map((phrase, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="group relative bg-space-800/80 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 rounded-2xl p-5 transition-all flex justify-between items-center"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="pl-4">
                  <p className="text-lg text-slate-400 mb-1">{phrase.english}</p>
                  <p className="text-2xl font-bold text-white">{phrase[selectedLanguage]}</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => playAudio(phrase)} 
                  className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)] ml-4 flex-shrink-0"
                >
                  <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmergencyPhrases;

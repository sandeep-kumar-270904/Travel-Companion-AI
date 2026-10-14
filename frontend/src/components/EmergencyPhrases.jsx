import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const EmergencyPhrases = () => {
  const [activeMainTab, setActiveMainTab] = useState('scams'); // 'scams' | 'emergency' | 'phrases'

  // Scam Radar State
  const [scamCity, setScamCity] = useState('rome');
  const [scams, setScams] = useState([]);
  const [scamsLoading, setScamsLoading] = useState(false);
  const [scamSearchInput, setScamSearchInput] = useState('');

  // Emergency SOS State
  const [emergencyCountry, setEmergencyCountry] = useState('japan');
  const [emergencyData, setEmergencyData] = useState(null);

  // Phrases State
  const [phrases, setPhrases] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('emergency');
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [playingAudio, setPlayingAudio] = useState(null);

  const languages = ['english', 'hindi', 'telugu', 'spanish'];

  // Fetch Scams
  const fetchScams = async (city) => {
    try {
      setScamsLoading(true);
      const apiKey = localStorage.getItem('gemini_api_key');
      const res = await axios.get(`/api/safety/scams?city=${encodeURIComponent(city)}&apiKey=${apiKey || ''}`);
      if (res.data?.success) {
        setScams(res.data.scams);
      }
    } catch (err) {
      console.warn("Failed to fetch scams:", err.message);
    } finally {
      setScamsLoading(false);
    }
  };

  // Fetch Emergency Numbers
  const fetchEmergency = async (country) => {
    try {
      const res = await axios.get(`/api/safety/emergency?country=${encodeURIComponent(country)}`);
      if (res.data?.success) {
        setEmergencyData(res.data.data);
      }
    } catch (err) {
      console.warn("Failed to fetch emergency data:", err.message);
    }
  };

  useEffect(() => {
    fetchScams(scamCity);
    fetchEmergency(emergencyCountry);

    // Initial Emergency Phrases
    setPhrases({
      emergency: [
        { english: "Call the police immediately!", hindi: "तुरंत पुलिस को बुलाओ!", telugu: "వెంటనే పోలీసులను పిలవండి!", spanish: "¡Llama a la policía de inmediato!" },
        { english: "I need urgent help.", hindi: "मुझे तत्काल मदद चाहिए।", telugu: "నాకు అత్యవసర సహాయం కావాలి.", spanish: "Necesito ayuda urgente." }
      ],
      medical: [
        { english: "Where is the nearest hospital?", hindi: "निकटतम अस्पताल कहाँ है?", telugu: "సమీప ఆసుపత్రి ఎక్కడ ఉంది?", spanish: "¿Dónde está el hospital más cercano?" },
        { english: "I need an ambulance.", hindi: "मुझे एम्बुलेंस चाहिए।", telugu: "నాకు అంబులెన్స్ కావాలి.", spanish: "Necesito una ambulancia." },
        { english: "I am having severe allergic shock.", hindi: "मुझे गंभीर एलर्जी का दौरा पड़ा है।", telugu: "నాకు తీవ్రమైన అలర్జీ వచ్చింది.", spanish: "Tengo un shock alérgico grave." }
      ],
      police: [
        { english: "I have been robbed.", hindi: "मुझे लूट लिया गया है।", telugu: "నన్ను దోచుకున్నారు.", spanish: "Me han robado." },
        { english: "I lost my passport and wallet.", hindi: "मेरा पासपोर्ट और बटुआ खो गया है।", telugu: "నా పాస్‌పోర్ట్ మరియు వాలెట్ పోయాయి.", spanish: "He perdido mi pasaporte y billetera." }
      ],
      transport: [
        { english: "Where is my embassy located?", hindi: "मेरा दूतावास कहाँ स्थित है?", telugu: "నా రాయబార కార్యాలయం ఎక్కడ ఉంది?", spanish: "¿Dónde está ubicada mi embajada?" },
        { english: "I am lost, please direct me to the station.", hindi: "मैं खो गया हूँ, कृपया मुझे स्टेशन का रास्ता बताएं।", telugu: "నేను తప్పిపోయాను, దయచేసి స్టేషన్‌కు దారి చూపండి.", spanish: "Estoy perdido, por favor indíqueme cómo llegar a la estación." }
      ]
    });
  }, []);

  const handleCitySearch = (e) => {
    e.preventDefault();
    if (!scamSearchInput.trim()) return;
    setScamCity(scamSearchInput.trim());
    fetchScams(scamSearchInput.trim());
  };

  const handleCountryChange = (c) => {
    setEmergencyCountry(c);
    fetchEmergency(c);
  };

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 py-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h2 className="text-3xl sm:text-4xl font-black font-outfit text-white tracking-tight flex items-center justify-center gap-3">
          <span className="p-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl">
            🚨
          </span>
          Travel Safety & Scam Radar
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Curated scam defense, dial-ready emergency contacts, and multilingual SOS phrases.
        </p>

        {/* Tab Controls */}
        <div className="flex justify-center mt-6">
          <div className="bg-space-900/80 border border-white/10 p-1.5 rounded-2xl flex gap-1">
            <button
              onClick={() => setActiveMainTab('scams')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeMainTab === 'scams'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🚨 Tourist Scam Radar
            </button>
            <button
              onClick={() => setActiveMainTab('emergency')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeMainTab === 'emergency'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📞 1-Tap SOS & Embassies
            </button>
            <button
              onClick={() => setActiveMainTab('phrases')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeMainTab === 'phrases'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🗣️ Audio SOS Phrases
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Tourist Scam Radar */}
      {activeMainTab === 'scams' && (
        <div className="space-y-6">
          {/* City Selector & Search Bar */}
          <div className="bg-space-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Popular Destinations:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Rome', 'Paris', 'Bangkok', 'Tokyo', 'Barcelona', 'New York'].map(city => (
                  <button
                    key={city}
                    onClick={() => {
                      setScamCity(city.toLowerCase());
                      fetchScams(city.toLowerCase());
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      scamCity.toLowerCase() === city.toLowerCase()
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCitySearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search any global city..."
                value={scamSearchInput}
                onChange={(e) => setScamSearchInput(e.target.value)}
                className="bg-space-900 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Inspect
              </button>
            </form>
          </div>

          {/* Scam Cards Grid */}
          {scamsLoading ? (
            <div className="py-16 text-center text-slate-400 animate-pulse">
              Scanning safety intelligence for {scamCity}...
            </div>
          ) : scams.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              No reported high-frequency scams for this city yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scams.map((scam, idx) => (
                <div
                  key={idx}
                  className="bg-space-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-rose-500/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {scam.severity || 'Tourist Trap'}
                      </span>
                      <span className="text-xs text-slate-400 truncate max-w-[150px]">
                        📍 {scam.hotspot}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 font-outfit">
                      {scam.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      {scam.howItWorks}
                    </p>
                  </div>

                  <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-4 mt-2">
                    <div className="text-[11px] uppercase font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <span>🛡️</span> Prevention Tactic
                    </div>
                    <p className="text-xs text-slate-200 leading-normal">
                      {scam.avoidance}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 1-Tap SOS Numbers & Embassies */}
      {activeMainTab === 'emergency' && (
        <div className="space-y-6">
          {/* Country Selection */}
          <div className="bg-space-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-2">
                Select Your Current Country:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'japan', label: '🇯🇵 Japan' },
                  { id: 'france', label: '🇫🇷 France' },
                  { id: 'italy', label: '🇮🇹 Italy' },
                  { id: 'thailand', label: '🇹🇭 Thailand' },
                  { id: 'spain', label: '🇪🇸 Spain' },
                  { id: 'united_states', label: '🇺🇸 United States' },
                  { id: 'india', label: '🇮🇳 India' }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleCountryChange(c.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      emergencyCountry === c.id
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {emergencyData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emergency Dial Numbers */}
              <div className="bg-space-800/80 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold font-outfit text-white mb-4 flex items-center gap-2">
                  <span>🚨</span> Direct Emergency Services ({emergencyData.country})
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Tap any number on mobile to dial immediately without typing.
                </p>

                <div className="space-y-3">
                  <a
                    href={`tel:${emergencyData.police}`}
                    className="flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👮</span>
                      <div>
                        <div className="text-white font-bold text-sm">Police (Emergency)</div>
                        <div className="text-xs text-slate-400">Immediate local police dispatch</div>
                      </div>
                    </div>
                    <span className="text-lg font-black font-mono text-rose-400 group-hover:scale-105 transition-transform">
                      {emergencyData.police} 📞
                    </span>
                  </a>

                  <a
                    href={`tel:${emergencyData.ambulance}`}
                    className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🚑</span>
                      <div>
                        <div className="text-white font-bold text-sm">Ambulance / Paramedics</div>
                        <div className="text-xs text-slate-400">Medical emergency response</div>
                      </div>
                    </div>
                    <span className="text-lg font-black font-mono text-red-400 group-hover:scale-105 transition-transform">
                      {emergencyData.ambulance} 📞
                    </span>
                  </a>

                  <a
                    href={`tel:${emergencyData.fire}`}
                    className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🚒</span>
                      <div>
                        <div className="text-white font-bold text-sm">Fire Department</div>
                        <div className="text-xs text-slate-400">Rescue and fire services</div>
                      </div>
                    </div>
                    <span className="text-lg font-black font-mono text-orange-400 group-hover:scale-105 transition-transform">
                      {emergencyData.fire} 📞
                    </span>
                  </a>

                  {emergencyData.touristHelpline && (
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌐</span>
                        <div>
                          <div className="text-white font-bold text-sm">Tourist Helpline</div>
                          <div className="text-xs text-slate-400">Multilingual consultation</div>
                        </div>
                      </div>
                      <span className="text-sm font-bold font-mono text-neon-cyan">
                        {emergencyData.touristHelpline}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Embassy Directory */}
              <div className="bg-space-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
                <h3 className="text-xl font-bold font-outfit text-white mb-4 flex items-center gap-2">
                  <span>🏛️</span> Diplomatic Embassies & Consulates
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Official consular representation for lost passports and citizen emergencies.
                </p>

                <div className="space-y-3">
                  {emergencyData.embassies?.map((emb, idx) => (
                    <div key={idx} className="p-4 bg-space-900/60 border border-white/5 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold text-sm">{emb.name}</div>
                        <div className="text-xs text-slate-400">Citizen consular services</div>
                      </div>
                      <a
                        href={`tel:${emb.phone}`}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-mono font-bold transition-colors"
                      >
                        {emb.phone} 📞
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Audio SOS Phrases */}
      {activeMainTab === 'phrases' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-space-800/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
            {/* Category selection */}
            <div className="flex flex-wrap gap-2">
              {['emergency', 'medical', 'police', 'transport'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all ${
                    selectedCategory === cat
                      ? 'bg-rose-500 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Language Selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Target Voice:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-space-900 border border-white/10 text-white rounded-xl px-3 py-1.5 text-xs font-bold capitalize focus:outline-none"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {phrases[selectedCategory]?.map((phrase, idx) => (
              <div
                key={idx}
                className="bg-space-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-white font-bold text-base">{phrase.english}</div>
                  <div className="text-rose-400 font-semibold text-sm mt-1">
                    {phrase[selectedLanguage] || phrase.english}
                  </div>
                </div>

                <button
                  onClick={() => playAudio(phrase)}
                  className="p-3 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl transition-all"
                  title="Speak Aloud"
                >
                  🔊
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyPhrases;

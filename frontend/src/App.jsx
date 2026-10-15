import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import Home from './components/Home';
import ARTranslator from './components/ARTranslator';
import VoiceTranslator from './components/VoiceTranslator';
import TranslationHistory from './components/TranslationHistory';
import AIAssistant from './components/AIAssistant';
import EmergencyPhrases from './components/EmergencyPhrases';
import Phrasebook from './components/Phrasebook';
import CurrencyConverterPage from './components/CurrencyConverter';
import Landing from './components/Landing';
import LocalGuide from './components/LocalGuide';
import TravelCompanions from './components/TravelCompanions';
import ExpenseTracker from './components/ExpenseTracker';

function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on tab switch
  }, [activeTab]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { id: 'home', label: 'Dashboard' },
    { id: 'ai', label: 'AI Assistant' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'localguide', label: 'Local Guide' },
    { id: 'companions', label: 'Companions' },
    { id: 'emergency', label: 'Safety & SOS' },
    { id: 'voice', label: 'Voice' },
    { id: 'camera', label: 'Camera' },
    { id: 'currency', label: 'Currency' },
    { id: 'phrasebook', label: 'Phrasebook' },
    { id: 'history', label: 'History' }
  ];

  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <div className="min-h-screen font-inter text-slate-200 selection:bg-indigo-500/30 overflow-x-hidden overflow-y-auto relative bg-[#070a11]">
      {/* High-Performance Pure CSS Ambient Space Mesh (0% CPU / 0% GPU load) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-transparent blur-[120px]" />
        <div className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-cyan-500/15 via-blue-600/10 to-transparent blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-purple-800/15 via-indigo-900/10 to-transparent blur-[140px]" />
      </div>

      {/* Top Navbar */}
      {activeTab !== 'landing' && (
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-space-900/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6 overflow-hidden flex-1">
              <div className="flex-shrink-0 flex items-center mr-2">
                <span className="font-outfit text-2xl font-black tracking-tight text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-glowing-purple shadow-glow-cyan flex items-center justify-center">
                    <span className="w-3 h-3 bg-white rounded-full"></span>
                  </div>
                  TravelAI
                </span>
              </div>
              <div className="hidden sm:-my-px sm:flex sm:space-x-1 sm:overflow-x-auto scrollbar-hide items-center">
                {navItems.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative inline-flex items-center px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-300 rounded-xl whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-white bg-white/10 shadow-glass-inset'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-blue-500/20 border border-neon-cyan/30 rounded-xl -z-10 shadow-glow-cyan"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Offline/Online Live Status Pill */}
            <div className="flex-shrink-0 ml-4 flex items-center gap-2">
              <div 
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  isOnline 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                }`}
                title={isOnline ? 'Online: Live LLM and public APIs connected' : 'Offline Mode: Using local SQLite & cached vault for subways/flights'}
              >
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="hidden md:inline">{isOnline ? 'Online' : 'Offline Vault'}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Navigation */}
        <div className="sm:hidden border-t border-white/5 overflow-x-auto scrollbar-hide bg-space-900/60 backdrop-blur-2xl">
          <div className="flex space-x-2 px-4 py-3">
            {navItems.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-neon-cyan/20 to-blue-500/20 text-neon-cyan border border-neon-cyan/30 shadow-glow-cyan'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {activeTab === 'landing' && <Landing onEnter={() => setActiveTab('home')} />}
            {activeTab === 'home' && <Home onNavigate={setActiveTab} />}
            {activeTab === 'ai' && <AIAssistant />}
            {activeTab === 'expenses' && <ExpenseTracker />}
            {activeTab === 'voice' && <VoiceTranslator />}
            {activeTab === 'camera' && <ARTranslator />}
            {activeTab === 'history' && <TranslationHistory />}
            {activeTab === 'emergency' && <EmergencyPhrases />}
            {activeTab === 'phrasebook' && <Phrasebook />}
            {activeTab === 'currency' && <CurrencyConverterPage />}
            {activeTab === 'localguide' && <LocalGuide />}
            {activeTab === 'companions' && <TravelCompanions />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import HALO from 'vanta/dist/vanta.halo.min';
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

function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on tab switch
  }, [activeTab]);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(HALO({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        baseColor: 0x111827,
        backgroundColor: 0x070a11,
        amplitudeFactor: 1.5,
        size: 1.5,
        xOffset: 0.1,
        yOffset: 0.1,
      }));
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const navItems = [
    { id: 'home', label: 'Dashboard' },
    { id: 'ai', label: 'AI Assistant' },
    { id: 'voice', label: 'Voice' },
    { id: 'camera', label: 'Camera' },
    { id: 'history', label: 'History' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'phrasebook', label: 'Phrasebook' },
    { id: 'currency', label: 'Currency' },
    { id: 'localguide', label: 'Local Guide' },
    { id: 'companions', label: 'Companions' }
  ];

  const pageVariants = {
    initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, filter: 'blur(10px)', transition: { duration: 0.3, ease: 'easeIn' } }
  };

  return (
    <div ref={vantaRef} className="min-h-screen font-inter text-slate-200 selection:bg-indigo-500/30 overflow-x-hidden overflow-y-auto relative">
      {/* Top Navbar */}
      {activeTab !== 'landing' && (
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-space-900/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex w-full">
              <div className="flex-shrink-0 flex items-center mr-8">
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
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl ${
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
            {activeTab === 'home' && <Home />}
            {activeTab === 'ai' && <AIAssistant />}
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

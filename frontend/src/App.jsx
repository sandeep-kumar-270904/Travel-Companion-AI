import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import ARTranslator from './components/ARTranslator';
import VoiceTranslator from './components/VoiceTranslator';
import TranslationHistory from './components/TranslationHistory';
import EmergencyPhrases from './components/EmergencyPhrases';
import Phrasebook from './components/Phrasebook';
import CurrencyConverterPage from './components/CurrencyConverter';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on tab switch
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-100 pb-16 md:pb-0">
      <nav className="bg-blue-600 text-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex space-x-2 overflow-x-auto whitespace-nowrap">
          {['home', 'voice', 'camera', 'history', 'emergency', 'phrasebook', 'currency'].map(tab => (
            <button
              key={tab}
              className={`px-3 py-1 rounded transition-colors ${activeTab === tab ? 'bg-white text-blue-600 font-semibold' : 'hover:bg-blue-500'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'currency' ? 'Currency Converter' 
                : tab === 'voice' ? 'Voice Translator'
                : tab === 'camera' ? 'Camera Translator'
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <div className="container mx-auto p-4">
        {activeTab === 'home' && <Home />}
        {activeTab === 'voice' && <VoiceTranslator />}
        {activeTab === 'camera' && <ARTranslator />}
        {activeTab === 'history' && <TranslationHistory />}
        {activeTab === 'emergency' && <EmergencyPhrases />}
        {activeTab === 'phrasebook' && <Phrasebook />}
        {activeTab === 'currency' && <CurrencyConverterPage />}
      </div>
    </div>
  );
}

export default App;

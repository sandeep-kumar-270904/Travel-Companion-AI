import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import ARTranslator from './components/ARTranslator';
import VoiceTranslator from './components/VoiceTranslator';
import TranslationHistory from './components/TranslationHistory';
import AIAssistant from './components/AIAssistant';
import EmergencyPhrases from './components/EmergencyPhrases';
import Phrasebook from './components/Phrasebook';
import CurrencyConverterPage from './components/CurrencyConverter';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on tab switch
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0 font-sans text-gray-800">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex space-x-2 overflow-x-auto whitespace-nowrap scrollbar-hide items-center">
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mr-6 pr-6 border-r border-gray-200">
            TravelAI
          </div>
          {['home', 'ai', 'voice', 'camera', 'history', 'emergency', 'phrasebook', 'currency'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'currency' ? 'Currency Converter' 
                : tab === 'voice' ? 'Voice Translator'
                : tab === 'camera' ? 'Camera Translator'
                : tab === 'ai' ? '✨ AI Assistant'
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <div className="container mx-auto p-4 pt-8 animate-fadeIn">
        {activeTab === 'home' && <Home />}
        {activeTab === 'ai' && <AIAssistant />}
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

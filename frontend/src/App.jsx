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

  const navItems = [
    { id: 'home', label: 'Dashboard' },
    { id: 'ai', label: 'AI Assistant' },
    { id: 'voice', label: 'Voice Translator' },
    { id: 'camera', label: 'Camera Translator' },
    { id: 'history', label: 'History' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'phrasebook', label: 'Phrasebook' },
    { id: 'currency', label: 'Currency' }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-slate-900 tracking-tight">TravelAI<span className="text-indigo-600">.</span></span>
              </div>
              <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
                {navItems.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Navigation (Scrollable) */}
        <div className="sm:hidden border-t border-gray-100 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-4 px-4 py-3">
            {navItems.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
        {activeTab === 'home' && <Home />}
        {activeTab === 'ai' && <AIAssistant />}
        {activeTab === 'voice' && <VoiceTranslator />}
        {activeTab === 'camera' && <ARTranslator />}
        {activeTab === 'history' && <TranslationHistory />}
        {activeTab === 'emergency' && <EmergencyPhrases />}
        {activeTab === 'phrasebook' && <Phrasebook />}
        {activeTab === 'currency' && <CurrencyConverterPage />}
      </main>
    </div>
  );
}

export default App;

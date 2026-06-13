import React, { useState } from 'react';
import axios from 'axios';

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  // Forms
  const [menuText, setMenuText] = useState('');
  const [foodName, setFoodName] = useState('');
  const [allergies, setAllergies] = useState('');
  const [destination, setDestination] = useState('');
  const [interest, setInterest] = useState('');

  const handleAnalyzeMenu = async (e) => {
    e.preventDefault();
    if (!menuText) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/ai/analyze-text', { text: menuText, context: 'Menu' });
      setResult(res.data.analysis);
    } catch (err) {
      setResult('Failed to analyze menu.');
    }
    setLoading(false);
  };

  const handleAllergyCheck = async (e) => {
    e.preventDefault();
    if (!foodName || !allergies) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/ai/allergy-check', { foodName, allergies });
      setResult(res.data.result);
    } catch (err) {
      setResult('Failed to check allergies.');
    }
    setLoading(false);
  };

  const handleTravelAdvice = async (e) => {
    e.preventDefault();
    if (!destination) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/ai/travel-advice', { destination, interest });
      setResult(res.data.advice);
    } catch (err) {
      setResult('Failed to get travel advice.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">AI Assistant</h2>
        <p className="mt-2 text-sm text-gray-500">Intelligent travel insights powered by Google Gemini.</p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            {['menu', 'allergy', 'advice'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setResult(''); }}
                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'menu' && 'Menu Explainer'}
                {tab === 'allergy' && 'Allergy Check'}
                {tab === 'advice' && 'Cultural Advice'}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-4 py-6 sm:px-6 lg:px-8 min-h-[300px]">
          {activeTab === 'menu' && (
            <form onSubmit={handleAnalyzeMenu} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Foreign Menu Text</label>
                <div className="mt-1">
                  <textarea 
                    rows={4}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="E.g. Gnocchi al Pesto..."
                    value={menuText}
                    onChange={(e) => setMenuText(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Analyzing...' : 'Explain Menu'}
              </button>
            </form>
          )}

          {activeTab === 'allergy' && (
            <form onSubmit={handleAllergyCheck} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Food / Dish Name</label>
                <div className="mt-1">
                  <input 
                    type="text"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="E.g. Pad Thai"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Your Allergies</label>
                <div className="mt-1">
                  <input 
                    type="text"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="E.g. Peanuts, Shellfish"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Checking...' : 'Check Safety'}
              </button>
            </form>
          )}

          {activeTab === 'advice' && (
            <form onSubmit={handleTravelAdvice} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Destination</label>
                <div className="mt-1">
                  <input 
                    type="text"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="E.g. Tokyo, Japan"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Main Interest</label>
                <div className="mt-1">
                  <input 
                    type="text"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="E.g. Dining etiquette, Public transport"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Generating...' : 'Get Advice'}
              </button>
            </form>
          )}

          {result && (
            <div className="mt-8 bg-gray-50 p-6 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">AI Response</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

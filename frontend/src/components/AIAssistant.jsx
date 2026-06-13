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
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">AI Travel Assistant</h2>
        <p className="text-gray-500">Powered by Google Gemini</p>
      </div>

      <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="flex border-b">
          {['menu', 'allergy', 'advice'].map(tab => (
            <button
              key={tab}
              className={`flex-1 py-4 font-semibold transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
              onClick={() => { setActiveTab(tab); setResult(''); }}
            >
              {tab === 'menu' && 'Menu Explainer'}
              {tab === 'allergy' && 'Allergy Check'}
              {tab === 'advice' && 'Cultural Advice'}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 min-h-[300px]">
          {activeTab === 'menu' && (
            <form onSubmit={handleAnalyzeMenu} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Foreign Menu Text</label>
                <textarea 
                  className="w-full border-gray-200 border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  rows="4"
                  placeholder="E.g. Gnocchi al Pesto..."
                  value={menuText}
                  onChange={(e) => setMenuText(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Explain Menu'}
              </button>
            </form>
          )}

          {activeTab === 'allergy' && (
            <form onSubmit={handleAllergyCheck} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Food / Dish Name</label>
                <input 
                  type="text"
                  className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow"
                  placeholder="E.g. Pad Thai"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Your Allergies</label>
                <input 
                  type="text"
                  className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow"
                  placeholder="E.g. Peanuts, Shellfish"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Safety'}
              </button>
            </form>
          )}

          {activeTab === 'advice' && (
            <form onSubmit={handleTravelAdvice} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Destination</label>
                <input 
                  type="text"
                  className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                  placeholder="E.g. Tokyo, Japan"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Main Interest</label>
                <input 
                  type="text"
                  className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                  placeholder="E.g. Dining etiquette, Public transport"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? 'Generating Advice...' : 'Get Advice'}
              </button>
            </form>
          )}

          {result && (
            <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-inner animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-800 mb-2">AI Response</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TravelCompanions() {
  const [companions, setCompanions] = useState([]);
  const [searchDest, setSearchDest] = useState('');
  
  // Modals state
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  // Chat state
  const [chatCompanion, setChatCompanion] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // New Trip Form State
  const [newTrip, setNewTrip] = useState({ destination: '', dates: '', interests: '', bio: '' });

  useEffect(() => {
    fetch('/api/companions')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCompanions(data.companions);
      })
      .catch(err => console.error("Failed to fetch companions:", err));
  }, []);

  const filteredCompanions = searchDest.trim() === '' 
    ? companions 
    : companions.filter(c => c.destination.toLowerCase().includes(searchDest.toLowerCase()));

  const handleAddTrip = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/companions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'You (Traveler)',
          ...newTrip,
          interests: newTrip.interests.split(',').map(i => i.trim())
        })
      });
      const data = await response.json();
      if (data.success) {
        setCompanions([data.companion, ...companions]);
      }
    } catch (err) {
      console.error("Failed to save trip:", err);
    }
    setShowAddTrip(false);
    setNewTrip({ destination: '', dates: '', interests: '', bio: '' });
  };

  const openChat = (companion) => {
    setChatCompanion(companion);
    setChatMessages([
      { id: Date.now(), sender: 'system', text: `You are now chatting with ${companion.name}. Say hi!` }
    ]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    const newMessages = [...chatMessages, { id: Date.now(), sender: 'You', text: userMessage }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsTyping(true);

    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      const response = await fetch('/api/ai/companion-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companionProfile: chatCompanion,
          message: userMessage,
          chatHistory: newMessages.filter(m => m.sender !== 'system'),
          apiKey
        })
      });
      const data = await response.json();
      setChatMessages([...newMessages, { id: Date.now(), sender: chatCompanion.name, text: data.reply || 'Sorry, I am offline.' }]);
    } catch (err) {
      setChatMessages([...newMessages, { id: Date.now(), sender: 'system', text: 'Error: Failed to connect to companion AI.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-500 mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]">
          Travel Companions
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
          Find like-minded travelers heading to the same destination. Connect, chat, and make memories together.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-12">
        <div className="w-full max-w-xl relative">
          <input
            type="text"
            value={searchDest}
            onChange={(e) => setSearchDest(e.target.value)}
            placeholder="Where are you heading? (e.g. Tokyo, Paris)"
            className="w-full bg-space-800 border border-white/10 rounded-2xl pl-6 pr-6 py-4 text-white focus:outline-none focus:border-neon-cyan shadow-glass-inset text-lg transition-colors"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddTrip(true)}
          className="px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)] whitespace-nowrap"
        >
          + Post My Trip
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCompanions.map((companion, index) => (
          <motion.div
            key={companion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-space-800/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-glass hover:shadow-[0_0_30px_rgba(45,212,191,0.15)] hover:border-neon-cyan/30 transition-all group flex flex-col"
          >
            <div className="flex items-center gap-4 mb-6 cursor-pointer" onClick={() => setSelectedProfile(companion)}>
              <div className="relative">
                <img src={companion.avatar} alt={companion.name} className="w-16 h-16 rounded-full object-cover border-2 border-neon-cyan/50 p-1 group-hover:border-neon-cyan transition-colors" />
                <div className="absolute -bottom-2 -right-2 bg-space-900 border border-neon-cyan text-neon-cyan text-xs font-bold px-2 py-1 rounded-lg">
                  {companion.match}%
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-neon-cyan transition-colors">{companion.name}</h3>
                <p className="text-neon-purple text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {companion.destination}
                </p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6 flex-1 cursor-pointer" onClick={() => setSelectedProfile(companion)}>
              <p className="text-slate-400 text-sm line-clamp-2 italic">"{companion.bio}"</p>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5 text-blue-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Travel Dates</p>
                  <p className="text-slate-300 text-sm">{companion.dates}</p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { e.stopPropagation(); openChat(companion); }}
              className="w-full py-3 bg-white/5 hover:bg-neon-cyan/20 border border-white/10 hover:border-neon-cyan/50 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Connect & Chat
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Add Trip Modal */}
      <AnimatePresence>
        {showAddTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-space-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-space-800 border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative"
            >
              <button onClick={() => setShowAddTrip(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-2xl font-bold text-white mb-6">Post Your Trip</h2>
              <form onSubmit={handleAddTrip} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Destination</label>
                  <input required value={newTrip.destination} onChange={e => setNewTrip({...newTrip, destination: e.target.value})} type="text" className="w-full bg-space-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-teal-400 focus:outline-none" placeholder="e.g. Rome, Italy" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Dates</label>
                  <input required value={newTrip.dates} onChange={e => setNewTrip({...newTrip, dates: e.target.value})} type="text" className="w-full bg-space-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-teal-400 focus:outline-none" placeholder="e.g. July 10 - July 20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Interests (comma separated)</label>
                  <input required value={newTrip.interests} onChange={e => setNewTrip({...newTrip, interests: e.target.value})} type="text" className="w-full bg-space-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-teal-400 focus:outline-none" placeholder="e.g. Food, Museums, Hiking" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Short Bio / Plan</label>
                  <textarea required value={newTrip.bio} onChange={e => setNewTrip({...newTrip, bio: e.target.value})} className="w-full bg-space-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-teal-400 focus:outline-none h-24 resize-none" placeholder="What are you looking to do?" />
                </div>
                <button type="submit" className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-space-900 font-bold rounded-xl transition-colors mt-4">Post Profile</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Details Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-space-900/80 backdrop-blur-sm" onClick={() => setSelectedProfile(null)}>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              onClick={e => e.stopPropagation()}
              className="bg-space-800 border border-white/10 rounded-3xl overflow-hidden w-full max-w-md shadow-2xl relative"
            >
              <div className="h-32 bg-gradient-to-r from-teal-500 to-blue-600 relative">
                <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 text-white hover:text-slate-200 bg-black/20 rounded-full p-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="px-8 pb-8 relative">
                <img src={selectedProfile.avatar} alt={selectedProfile.name} className="w-24 h-24 rounded-full border-4 border-space-800 absolute -top-12 left-8 object-cover" />
                <div className="mt-14 mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">{selectedProfile.name} <span className="bg-teal-500/20 text-teal-400 text-xs px-2 py-1 rounded-md">{selectedProfile.match}% Match</span></h2>
                  <p className="text-neon-purple flex items-center gap-1 font-medium mt-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    Heading to {selectedProfile.destination}
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl">"{selectedProfile.bio}"</p>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Dates</p>
                    <p className="text-white bg-space-900 py-2 px-4 rounded-lg inline-block">{selectedProfile.dates}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.interests.map(i => <span key={i} className="bg-white/10 text-slate-200 px-3 py-1 rounded-full text-sm">{i}</span>)}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedProfile(null); openChat(selectedProfile); }}
                  className="w-full py-4 mt-8 bg-neon-cyan hover:bg-teal-400 text-space-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Connect
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Drawer */}
      <AnimatePresence>
        {chatCompanion && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-[100dvh] w-full sm:w-96 bg-space-900 border-l border-white/10 z-[100] flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-white/10 bg-space-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={chatCompanion.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-teal-500" />
                <div>
                  <h3 className="text-white font-bold">{chatCompanion.name}</h3>
                  <p className="text-teal-400 text-xs">AI Simulated</p>
                </div>
              </div>
              <button onClick={() => setChatCompanion(null)} className="text-slate-400 hover:text-white p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-space-900 custom-scrollbar">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                  {msg.sender === 'system' ? (
                    <span className="text-xs text-slate-500 bg-space-800 px-3 py-1 rounded-full">{msg.text}</span>
                  ) : (
                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'You' ? 'bg-teal-500 text-space-900 rounded-tr-none' : 'bg-space-800 text-white rounded-tl-none border border-white/5'}`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-space-800 border border-white/5 p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-space-800 border-t border-white/10">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-space-900 border border-white/10 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
                />
                <button type="submit" disabled={!chatInput.trim() || isTyping} className="bg-teal-500 text-space-900 p-2 rounded-full disabled:opacity-50 hover:bg-teal-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

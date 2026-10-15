import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const featuresData = [
  {
    id: 'itinerary',
    title: 'Weather-Aware Itinerary Engine',
    description: 'Meteorologically conditioned travel planning. Open-Meteo weather forecasts dynamically adapt your schedule to rain or sunshine with 1-click .ics calendar export.',
    useCases: [
      'Scheduling indoor museums on rainy days',
      'Syncing directly to Apple or Google Calendar',
      'Geographically sensible walking routes'
    ],
    glowClass: 'hover:border-neon-cyan/50 hover:shadow-[0_0_40px_rgba(0,243,255,0.15)]',
    iconGlowClass: 'group-hover:border-neon-cyan/50 group-hover:shadow-[0_0_30px_rgba(0,243,255,0.3)] bg-neon-cyan/5 text-neon-cyan',
    textHoverClass: 'group-hover:text-neon-cyan',
    iconSvg: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 'chefpass',
    title: 'Bilingual Chef Allergy Pass',
    description: 'Emergency dietary protection abroad. Generates certified medical notices in 12 native scripts (Japanese, Thai, etc.) with phonetic pronunciation guides.',
    useCases: [
      'Warning chefs against cross-contamination',
      'Detecting secret fish sauces and peanut oils',
      'Showing emergency dietary cards on mobile'
    ],
    glowClass: 'hover:border-rose-400/50 hover:shadow-[0_0_40px_rgba(251,113,133,0.15)]',
    iconGlowClass: 'group-hover:border-rose-400/50 group-hover:shadow-[0_0_30px_rgba(251,113,133,0.3)] bg-rose-400/5 text-rose-400',
    textHoverClass: 'group-hover:text-rose-400',
    iconSvg: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    id: 'expenses',
    title: 'Foreign Receipt Ledger',
    description: 'Automated multi-currency expense tracker. Snap a photo of any foreign bill—Gemini OCR extracts line totals and auto-converts to your home currency in SQLite.',
    useCases: [
      'Auto-converting Yen or Baht to USD/EUR',
      'Tracking daily trip budgets and categories',
      'Exporting CSV files for expense reimbursement'
    ],
    glowClass: 'hover:border-emerald-400/50 hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]',
    iconGlowClass: 'group-hover:border-emerald-400/50 group-hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] bg-emerald-400/5 text-emerald-400',
    textHoverClass: 'group-hover:text-emerald-400',
    iconSvg: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    )
  },
  {
    id: 'scams',
    title: 'Tourist Scam Radar & SOS',
    description: 'Real-time defense against city tourist traps (Rome, Paris, Bangkok, Tokyo) plus dial-ready 1-tap emergency police, ambulance, and embassy phone numbers.',
    useCases: [
      'Recognizing fake tuk-tuk and bracelet scams',
      'One-tap dialling local emergency dispatch',
      'Locating nearest consular representation'
    ],
    glowClass: 'hover:border-amber-400/50 hover:shadow-[0_0_40px_rgba(251,191,36,0.15)]',
    iconGlowClass: 'group-hover:border-amber-400/50 group-hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] bg-amber-400/5 text-amber-400',
    textHoverClass: 'group-hover:text-amber-400',
    iconSvg: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  {
    id: 'voice',
    title: 'Voice-Assisted Translation',
    description: 'Conversational speech-to-text workflow across multiple languages with simulated offline fallback when internet connectivity drops.',
    useCases: [
      'Conversing smoothly with local vendors',
      'Getting directions from passersby',
      'Making friends in bustling night markets'
    ],
    glowClass: 'hover:border-glowing-purple/50 hover:shadow-[0_0_40px_rgba(181,53,246,0.15)]',
    iconGlowClass: 'group-hover:border-glowing-purple/50 group-hover:shadow-[0_0_30px_rgba(181,53,246,0.3)] bg-glowing-purple/5 text-glowing-purple',
    textHoverClass: 'group-hover:text-glowing-purple',
    iconSvg: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    )
  },
  {
    id: 'offline',
    title: 'Offline-First PWA Vault',
    description: 'Underground and flight mode ready. Saved itineraries, emergency cards, and SQLite expense logs remain fully accessible with zero cellular data.',
    useCases: [
      'Accessing itineraries deep in Tokyo metro',
      'Reviewing medical chef passes on flights',
      'Zero international data roaming anxiety'
    ],
    glowClass: 'hover:border-blue-400/50 hover:shadow-[0_0_40px_rgba(96,165,250,0.15)]',
    iconGlowClass: 'group-hover:border-blue-400/50 group-hover:shadow-[0_0_30px_rgba(96,165,250,0.3)] bg-blue-400/5 text-blue-400',
    textHoverClass: 'group-hover:text-blue-400',
    iconSvg: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (customDelay) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: customDelay, ease: "easeOut" }
  }),
  hover: {
    y: -8,
    scale: 1.02,
    transition: { type: "spring", stiffness: 350, damping: 22 }
  }
};

const FeatureCard = ({ feature, delay, isExpanded, onToggle }) => {
  return (
    <motion.div
      layout
      custom={isExpanded ? 0 : delay}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      whileHover={isExpanded ? undefined : "hover"}
      whileTap={{ scale: 0.99 }}
      onClick={onToggle}
      className={`group relative bg-white/[0.03] backdrop-blur-3xl border border-white/5 p-8 sm:p-10 rounded-[2rem] transition-colors duration-300 overflow-hidden cursor-pointer ${isExpanded ? 'bg-white/[0.08] shadow-2xl ' + feature.glowClass : 'hover:bg-white/[0.06] ' + feature.glowClass}`}
    >
      <div className={`absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
      
      <motion.div layout className="flex justify-between items-start">
        <div className={`relative z-10 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-glass-inset transition-all duration-500 ease-out ${isExpanded ? feature.iconGlowClass.replace('group-hover:', '') + ' scale-110' : 'group-hover:scale-110 ' + feature.iconGlowClass}`}>
          {feature.iconSvg}
        </div>
        <motion.div 
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-slate-500 bg-white/5 rounded-full p-2 hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>
      
      <motion.h3 layout className={`relative z-10 font-outfit text-2xl font-bold text-white mb-4 tracking-tight transition-colors duration-300 ${isExpanded ? feature.textHoverClass.replace('group-hover:', '') : feature.textHoverClass}`}>{feature.title}</motion.h3>
      <motion.p layout className={`relative z-10 font-inter leading-relaxed text-[1.05rem] font-light transition-colors ${isExpanded ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-200'}`}>
        {feature.description}
      </motion.p>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden relative z-10"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="pt-6 mt-6 border-t border-white/10"
            >
              <h4 className="text-sm font-outfit font-semibold text-slate-300 mb-4 tracking-wider uppercase">Perfect For:</h4>
              <ul className="space-y-3">
                {feature.useCases.map((uc, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex items-center gap-3 text-slate-300 font-inter text-base font-light"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    {uc}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Landing = ({ onEnter }) => {
  const [expandedCardId, setExpandedCardId] = useState(null);

  return (
    <div className="w-full relative min-h-screen z-10 flex flex-col font-inter overflow-hidden">
      
      {/* Animated Hero Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-glowing-purple/40 blur-[150px]"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.25, 0.1],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-neon-cyan/40 blur-[150px]"
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-screen px-4 text-center pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-10 shadow-glass-inset"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-cyan"></span>
            </span>
            <span className="text-xs font-semibold text-slate-300 tracking-[0.2em] uppercase font-outfit">Travel Reimagined</span>
          </motion.div>
          
          <h1 className="font-outfit text-5xl md:text-7xl lg:text-[6.5rem] leading-[1.05] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400 tracking-tight mb-8 drop-shadow-sm">
            Your Ultimate <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-blue-400 to-glowing-purple">
              AI Travel Companion
            </span>
          </h1>
          
          <p className="font-inter text-lg md:text-2xl text-slate-300 mb-14 max-w-3xl mx-auto leading-relaxed font-light drop-shadow">
            Break down language barriers instantly. Navigate foreign cities like a local. 
            Experience the world without the friction of communication.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnter}
            className="relative overflow-hidden group font-outfit px-12 py-5 rounded-full bg-white text-space-900 font-bold text-lg transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.6)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-glowing-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">Enter the Experience</span>
          </motion.button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 relative z-10">
        <div className="absolute inset-0 bg-space-800/40 backdrop-blur-3xl -z-10 border-t border-white/5" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="font-outfit text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">Unrivaled Capabilities</h2>
            <p className="font-inter text-xl text-slate-400 font-light">Everything you need to travel with absolute confidence.</p>
          </motion.div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {featuresData.map((feature, idx) => (
              <FeatureCard 
                key={feature.id}
                feature={feature}
                delay={0.1 * (idx + 1)}
                isExpanded={expandedCardId === feature.id}
                onToggle={() => setExpandedCardId(expandedCardId === feature.id ? null : feature.id)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 rounded-[3rem] p-12 md:p-24 backdrop-blur-2xl shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <h2 className="relative z-10 font-outfit text-4xl md:text-6xl font-black text-white mb-10 tracking-tight">Ready to explore the world?</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnter}
            className="relative z-10 font-outfit px-12 py-5 rounded-full bg-gradient-to-r from-neon-cyan to-blue-500 text-space-900 font-bold text-lg hover:shadow-[0_0_40px_rgba(0,243,255,0.4)] transition-all duration-300"
          >
            Launch Web App
          </motion.button>
        </motion.div>
      </section>
      
      {/* Small Footer */}
      <footer className="text-center py-10 text-slate-600 border-t border-white/5 font-inter text-sm relative z-10">
        <p>&copy; 2026 Travel Companion AI. Crafted for the modern explorer.</p>
      </footer>
    </div>
  );
};

export default Landing;

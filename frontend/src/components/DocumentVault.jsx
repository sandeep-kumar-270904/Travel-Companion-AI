import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_VAULT = {
  passport: {
    fullName: "Alex Morgan",
    passportNumber: "US984729104",
    nationality: "United States",
    expiryDate: "2029-08-14",
    dob: "1994-06-22"
  },
  insurance: {
    provider: "Allianz Global Travel Assistance",
    policyNumber: "ALZ-9938210-INT",
    emergencyPhone: "+1 804-673-1159",
    coverageType: "Comprehensive Medical & Evacuation",
    bloodType: "O+"
  },
  stay: {
    hotelName: "Hotel Gracery Shinjuku",
    nativeAddress: "〒160-8486 東京都新宿区歌舞伎町1-19-1 (ゴジラヘッドビル)",
    englishAddress: "1-19-1 Kabukicho, Shinjuku-ku, Tokyo 160-8486, Japan",
    bookingRef: "HG-8823190",
    phone: "+81 3-6833-1111",
    dates: "Oct 12 - Oct 20"
  },
  flight: {
    airline: "Japan Airlines (JAL)",
    flightNumber: "JL005",
    pnr: "W7K9LX",
    departure: "JFK Terminal 8 · 11:30 AM",
    arrival: "HND Terminal 3 · 3:20 PM (+1)"
  },
  emergencyContact: {
    name: "Elena Morgan",
    relationship: "Sister",
    phone: "+1 (555) 234-8899"
  }
};

export default function DocumentVault() {
  const [vault, setVault] = useState(DEFAULT_VAULT);
  const [privacyShield, setPrivacyShield] = useState(true);
  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'passport' | 'stay' | 'flight' | 'insurance'
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copySosStatus, setCopySosStatus] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('travel_document_vault');
      if (saved) {
        setVault(JSON.parse(saved));
      }
    } catch (err) {
      console.warn("Failed to load document vault", err);
    }
  }, []);

  const saveVault = (newVault) => {
    setVault(newVault);
    localStorage.setItem('travel_document_vault', JSON.stringify(newVault));
  };

  const maskValue = (val) => {
    if (!privacyShield) return val;
    if (!val || val.length <= 4) return '••••';
    return '••••••••' + val.slice(-4);
  };

  const copyEmergencySosCard = () => {
    const card = `🚨 TRAVEL EMERGENCY ASSISTANCE SUMMARY CARD\n\n` +
      `TRAVELER: ${vault.passport.fullName} (${vault.passport.nationality})\n` +
      `PASSPORT NO: ${vault.passport.passportNumber} (Exp: ${vault.passport.expiryDate})\n` +
      `BLOOD TYPE: ${vault.insurance.bloodType}\n\n` +
      `🏥 TRAVEL INSURANCE:\n` +
      `Provider: ${vault.insurance.provider}\n` +
      `Policy #: ${vault.insurance.policyNumber}\n` +
      `24/7 International Medical Hotline: ${vault.insurance.emergencyPhone}\n\n` +
      `🏨 CURRENT ACCOMMODATION:\n` +
      `${vault.stay.hotelName}\n` +
      `${vault.stay.englishAddress}\n` +
      `Phone: ${vault.stay.phone}\n\n` +
      `👥 EMERGENCY CONTACT (ICE):\n` +
      `${vault.emergencyContact.name} (${vault.emergencyContact.relationship}): ${vault.emergencyContact.phone}`;

    navigator.clipboard.writeText(card);
    setCopySosStatus(true);
    setTimeout(() => setCopySosStatus(false), 2500);
  };

  const exportBackupJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vault, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `travel-vault-backup-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        saveVault(parsed);
      } catch (err) {
        alert("Invalid vault backup file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header Banner */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
          <span>🛡️</span> Client-Side Encrypted Offline Vault
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 mb-3 tracking-tight font-outfit">
          Emergency Document Vault
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Crucial travel identifiers, insurance hotlines, and hotel addresses in native script—accessible in flight mode or deep underground.
        </p>
      </div>

      {/* Control Bar: Privacy Shield, SOS Summary, Backup */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-5 mb-8 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Privacy Shield Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPrivacyShield(!privacyShield)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
              privacyShield
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Mask sensitive passport & booking numbers to prevent shoulder-surfing"
          >
            <span>{privacyShield ? '🛡️ Privacy Shield: ON' : '👁️ Privacy Shield: OFF'}</span>
          </button>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {privacyShield ? 'Numbers masked in public transit' : 'Plain text visible'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copyEmergencySosCard}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-xs shadow-lg hover:shadow-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{copySosStatus ? '✓ Copied SOS Card!' : '📋 1-Tap SOS Card'}</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-all cursor-pointer"
          >
            {isEditing ? 'Done Editing' : '✏️ Edit Details'}
          </button>

          <button
            onClick={exportBackupJSON}
            className="px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            title="Download JSON Backup"
          >
            💾 Backup
          </button>

          <label className="px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer">
            📥 Restore
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Vault Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* 1. Passport & Identity */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🛂</span>
              <div>
                <h3 className="font-outfit text-lg font-black text-white">Passport & ID Details</h3>
                <span className="text-[11px] text-slate-400">Primary Travel Document</span>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-bold">
              VERIFIED
            </span>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 text-xs block font-outfit uppercase">Full Legal Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={vault.passport.fullName}
                  onChange={e => saveVault({ ...vault, passport: { ...vault.passport, fullName: e.target.value } })}
                  className="w-full bg-space-900 border border-white/20 rounded-xl px-3 py-1.5 text-white mt-1 text-sm font-bold"
                />
              ) : (
                <span className="font-bold text-white text-base">{vault.passport.fullName}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-xs block font-outfit uppercase">Passport Number</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={vault.passport.passportNumber}
                    onChange={e => saveVault({ ...vault, passport: { ...vault.passport, passportNumber: e.target.value } })}
                    className="w-full bg-space-900 border border-white/20 rounded-xl px-3 py-1.5 text-white mt-1 text-sm font-mono"
                  />
                ) : (
                  <span className="font-mono font-bold text-neon-cyan text-sm sm:text-base">
                    {maskValue(vault.passport.passportNumber)}
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-400 text-xs block font-outfit uppercase">Nationality</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={vault.passport.nationality}
                    onChange={e => saveVault({ ...vault, passport: { ...vault.passport, nationality: e.target.value } })}
                    className="w-full bg-space-900 border border-white/20 rounded-xl px-3 py-1.5 text-white mt-1 text-sm"
                  />
                ) : (
                  <span className="font-semibold text-slate-200">{vault.passport.nationality}</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-xs block font-outfit uppercase">Expiration Date</span>
              {isEditing ? (
                <input
                  type="date"
                  value={vault.passport.expiryDate}
                  onChange={e => saveVault({ ...vault, passport: { ...vault.passport, expiryDate: e.target.value } })}
                  className="w-full bg-space-900 border border-white/20 rounded-xl px-3 py-1.5 text-white mt-1 text-sm"
                />
              ) : (
                <span className="font-mono text-emerald-400 font-bold">{vault.passport.expiryDate}</span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Hotel & Accommodation with Native Script */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏨</span>
              <div>
                <h3 className="font-outfit text-lg font-black text-white">Hotel & Lodging</h3>
                <span className="text-[11px] text-slate-400">Lodging & Native Address</span>
              </div>
            </div>
            <button
              onClick={() => setShowDriverModal(true)}
              className="px-3 py-1.5 rounded-xl bg-neon-cyan text-space-900 text-xs font-black font-outfit shadow-glow-cyan hover:opacity-90 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>🚕</span>
              <span>Show to Driver</span>
            </button>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 text-xs block font-outfit uppercase">Hotel Property</span>
              {isEditing ? (
                <input
                  type="text"
                  value={vault.stay.hotelName}
                  onChange={e => saveVault({ ...vault, stay: { ...vault.stay, hotelName: e.target.value } })}
                  className="w-full bg-space-900 border border-white/20 rounded-xl px-3 py-1.5 text-white mt-1 text-sm font-bold"
                />
              ) : (
                <span className="font-bold text-white text-base">{vault.stay.hotelName}</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 text-xs block font-outfit uppercase">Native Script Address</span>
              {isEditing ? (
                <textarea
                  value={vault.stay.nativeAddress}
                  onChange={e => saveVault({ ...vault, stay: { ...vault.stay, nativeAddress: e.target.value } })}
                  rows={2}
                  className="w-full bg-space-900 border border-white/20 rounded-xl px-3 py-1.5 text-white mt-1 text-xs"
                />
              ) : (
                <p className="font-medium text-amber-300 font-outfit text-sm bg-white/5 p-2 rounded-xl border border-white/5">
                  {vault.stay.nativeAddress}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 uppercase font-bold">Booking Ref:</span>
                <span className="font-mono font-bold text-slate-300 ml-1.5">{maskValue(vault.stay.bookingRef)}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold">Direct Phone:</span>
                <a href={`tel:${vault.stay.phone}`} className="text-cyan-400 underline font-mono ml-1.5">{vault.stay.phone}</a>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Flight & Transit Voucher */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">✈️</span>
              <div>
                <h3 className="font-outfit text-lg font-black text-white">Flight & Transit Voucher</h3>
                <span className="text-[11px] text-slate-400">Boarding & PNR Pass</span>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono font-bold">
              {vault.flight.flightNumber}
            </span>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-xs block font-outfit uppercase">Airline</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={vault.flight.airline}
                    onChange={e => saveVault({ ...vault, flight: { ...vault.flight, airline: e.target.value } })}
                    className="w-full bg-space-900 border border-white/20 rounded-xl px-3 py-1.5 text-white mt-1 text-sm font-bold"
                  />
                ) : (
                  <span className="font-bold text-white">{vault.flight.airline}</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 text-xs block font-outfit uppercase">PNR / Booking Code</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={vault.flight.pnr}
                    onChange={e => saveVault({ ...vault, flight: { ...vault.flight, pnr: e.target.value } })}
                    className="w-full bg-space-900 border border-white/20 rounded-xl px-3 py-1.5 text-white mt-1 text-sm font-mono font-bold"
                  />
                ) : (
                  <span className="font-mono font-black text-neon-cyan text-base">
                    {maskValue(vault.flight.pnr)}
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-xs block font-outfit uppercase">Departure & Terminal</span>
              <p className="font-medium text-slate-200 mt-0.5">{vault.flight.departure}</p>
            </div>

            <div>
              <span className="text-slate-400 text-xs block font-outfit uppercase">Arrival & Terminal</span>
              <p className="font-medium text-slate-200 mt-0.5">{vault.flight.arrival}</p>
            </div>
          </div>
        </div>

        {/* 4. Travel Insurance & Emergency ICE */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🛡️</span>
              <div>
                <h3 className="font-outfit text-lg font-black text-white">Insurance & Emergency Line</h3>
                <span className="text-[11px] text-slate-400">24/7 Global Medical Assistance</span>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
              ACTIVE
            </span>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 text-xs block font-outfit uppercase">Policy Number</span>
              {isEditing ? (
                <input
                  type="text"
                  value={vault.insurance.policyNumber}
                  onChange={e => saveVault({ ...vault, insurance: { ...vault.insurance, policyNumber: e.target.value } })}
                  className="w-full bg-space-900 border border-white/20 rounded-xl px-3 py-1.5 text-white mt-1 text-sm font-mono font-bold"
                />
              ) : (
                <span className="font-mono font-black text-emerald-400 text-base">
                  {maskValue(vault.insurance.policyNumber)}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 text-xs block font-outfit uppercase">24/7 Emergency Medical Hotline</span>
              <a
                href={`tel:${vault.insurance.emergencyPhone}`}
                className="inline-flex items-center gap-1.5 text-red-400 font-mono font-black text-base hover:text-red-300 transition-colors mt-0.5"
              >
                <span>📞</span>
                <span>{vault.insurance.emergencyPhone}</span>
              </a>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">ICE Contact: </span>
                <span className="font-bold text-white">{vault.emergencyContact.name} ({vault.emergencyContact.relationship})</span>
              </div>
              <a href={`tel:${vault.emergencyContact.phone}`} className="text-cyan-400 font-mono font-bold">
                {vault.emergencyContact.phone}
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* "Show Hotel Address to Driver" Fullscreen High-Contrast Modal */}
      <AnimatePresence>
        {showDriverModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/95 backdrop-blur-3xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-space-900 border-2 border-amber-400/50 rounded-3xl p-6 sm:p-10 shadow-[0_0_80px_rgba(251,191,36,0.25)] text-center relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
                  Show Directly to Taxi Driver or Transit Police
                </span>
                <button
                  onClick={() => setShowDriverModal(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Hotel Destination:
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-outfit mb-6">
                {vault.stay.hotelName}
              </h2>

              {/* Native Script Address in Massive High-Contrast Typography */}
              <div className="p-6 sm:p-8 rounded-3xl bg-amber-400/10 border-2 border-amber-400/30 mb-8 select-all">
                <p className="text-2xl sm:text-4xl font-black text-amber-300 leading-relaxed font-outfit">
                  {vault.stay.nativeAddress}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-xs sm:text-sm mb-8 inline-block max-w-lg">
                <span className="text-slate-500 font-semibold mr-1.5">English Address:</span>
                "{vault.stay.englishAddress}"
              </div>

              <div className="flex items-center justify-center gap-4">
                <a
                  href={`tel:${vault.stay.phone}`}
                  className="px-8 py-4 rounded-2xl bg-amber-400 text-space-900 font-outfit font-black text-base shadow-glow-amber hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>📞</span>
                  <span>Call Hotel Front Desk</span>
                </a>
                <button
                  onClick={() => setShowDriverModal(false)}
                  className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

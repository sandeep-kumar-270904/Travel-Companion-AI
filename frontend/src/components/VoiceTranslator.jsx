import React, { useState, useRef } from 'react';
import axios from 'axios';

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
];

export default function VoiceTranslator() {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toLang, setToLang] = useState('hi');
  const [history, setHistory] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = processAudio;
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied or error occurred.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const processAudio = async () => {
    setLoading(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // 1. Speech to Text
      const sttRes = await axios.post('/api/translate/listen', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const originalText = sttRes.data.text;

      if (!originalText) {
        throw new Error('No speech detected');
      }

      // 2. Translate text
      const transRes = await axios.post('/api/translate', {
        text: originalText,
        fromLang: 'auto',
        toLang
      });
      const translatedText = transRes.data.translatedText;
      const detectedLang = transRes.data.detectedSourceLanguage;

      // 3. Text to Speech
      const ttsRes = await axios.post('/api/translate/speak', {
        text: translatedText,
        lang: toLang
      });

      if (ttsRes.data.audio) {
        const audio = new Audio(ttsRes.data.audio);
        audio.play();
      }

      setHistory(prev => [{ originalText, translatedText, detectedLang }, ...prev]);
    } catch (err) {
      console.error('Voice translation failed', err);
      alert('Voice translation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Voice Translator</h2>
        <p className="mt-2 text-sm text-gray-500">Real-time speech translation and playback.</p>
      </div>
      
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg mb-8 p-6">
        <div className="flex items-center gap-4 mb-8">
          <label className="text-sm font-medium text-gray-700">Translate to:</label>
          <select 
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={toLang}
            onChange={(e) => setToLang(e.target.value)}
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={loading}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? 'bg-red-100 text-red-600 ring-4 ring-red-500 animate-pulse' 
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 ring-1 ring-indigo-500/20 shadow-sm'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <p className="mt-6 text-sm text-gray-500 font-medium">
            {loading ? 'Processing...' : isRecording ? 'Listening...' : 'Hold to Speak'}
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
        </div>
        <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {history.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-gray-500">No recent translations</li>
          ) : (
            history.map((item, i) => (
              <li key={i} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.originalText}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Detected: {item.detectedLang}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-indigo-600">
                      {item.translatedText}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

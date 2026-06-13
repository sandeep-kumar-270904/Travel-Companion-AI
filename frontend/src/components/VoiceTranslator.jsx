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

      // 2. Translate text (Auto detect source)
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
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Voice-to-Voice Translator</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <label className="font-semibold text-gray-700">Translate to:</label>
          <select 
            className="border p-2 rounded-md flex-grow"
            value={toLang}
            onChange={(e) => setToLang(e.target.value)}
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-center">
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={loading}
            className={`w-32 h-32 rounded-full text-white font-bold text-lg flex items-center justify-center transition-all ${
              isRecording ? 'bg-red-500 animate-pulse scale-110 shadow-lg' : 'bg-blue-600 hover:bg-blue-700 shadow'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : isRecording ? 'Listening...' : 'Hold to Speak'}
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">Press and hold the button to record your speech.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Recent Translations</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center">No recent translations</p>
          ) : (
            history.map((item, i) => (
              <div key={i} className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-gray-800 font-medium">{item.originalText}</p>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    Detected: {item.detectedLang}
                  </span>
                </div>
                <p className="text-blue-700 font-semibold">{item.translatedText}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

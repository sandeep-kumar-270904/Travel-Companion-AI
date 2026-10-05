import React, { useRef, useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
];

export default function ARTranslator() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ocrText, setOcrText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [ocrWords, setOcrWords] = useState([]);
  const [translatedWords, setTranslatedWords] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fallbackImg, setFallbackImg] = useState(null);
  const [toLang, setToLang] = useState('en');
  const [capturedImg, setCapturedImg] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [uploadedImg, setUploadedImg] = useState(null);

  useEffect(() => {
    if (!fallbackImg) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => setError('Camera access denied. Please allow permissions.'));
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [fallbackImg]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError('');
    setUploadedImg(URL.createObjectURL(file));
    setCapturedImg(null);
    setFallbackImg(null);
    setBoxes([]);
    setOcrText('');
    setTranslatedText('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('/api/ocr/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.text) {
        setOcrText(res.data.text);
        const apiKey = localStorage.getItem('gemini_api_key');
        const tRes = await axios.post('/api/translate', {
          text: res.data.text,
          fromLang: 'auto',
          toLang,
          apiKey
        });
        setTranslatedText(tRes.data.translatedText);
      } else {
        setOcrText(res.data.message || 'No text extracted.');
        setTranslatedText('');
      }
    } catch (e) {
      setError('OCR or translation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setLoading(true);
    setError('');
    setCapturedImg(canvas.toDataURL('image/png'));
    try {
      const result = await Tesseract.recognize(canvas, 'eng');
      setOcrText(result.data.text);
      setOcrWords((result.data.words || []).map(word => word.text));
      const wordBoxes = (result.data.words || []).map(word => word.bbox);
      setBoxes(wordBoxes);
      if (result.data.text.trim()) {
        const apiKey = localStorage.getItem('gemini_api_key');
        const res = await axios.post('/api/translate', {
          text: result.data.text,
          fromLang: 'auto',
          toLang,
          apiKey
        });
        setTranslatedText(res.data.translatedText);
        setTranslatedWords(res.data.translatedText.split(' '));
      } else {
        setTranslatedText('');
        setTranslatedWords([]);
      }
    } catch (e) {
      setError('OCR or translation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFallback = async () => {
    setFallbackImg('./infosys.png');
    setLoading(true);
    setError('');
    try {
      const { data: { text } } = await Tesseract.recognize('/sample-menu.jpg', 'eng');
      setOcrText(text);
      if (text.trim()) {
        const apiKey = localStorage.getItem('gemini_api_key');
        const res = await axios.post('/api/translate', {
          text,
          fromLang: 'auto',
          toLang,
          apiKey
        });
        setTranslatedText(res.data.translatedText);
      } else {
        setTranslatedText('');
      }
    } catch (e) {
      setError('OCR or translation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-500 mb-2">AR Camera</h1>
        <p className="text-slate-400">Translate the world around you.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Target Language:</span>
            <select
              value={toLang}
              onChange={e => setToLang(e.target.value)}
              className="bg-space-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-cyan transition-colors"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            { (capturedImg || uploadedImg || fallbackImg) && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setCapturedImg(null); setUploadedImg(null); setFallbackImg(null); }} 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Reset Camera
              </motion.button>
            )}
          </div>
        </div>

        <div className="relative aspect-[3/4] sm:aspect-video bg-black/50 rounded-2xl overflow-hidden border border-white/10 shadow-glass-inset">
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-space-900/80 z-30">
              <div className="text-red-400 bg-red-500/10 px-6 py-3 rounded-2xl border border-red-500/20 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            </div>
          )}

          {translatedText && !boxes.length && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 right-4 bg-space-900/80 backdrop-blur-md text-white px-6 py-4 rounded-2xl text-lg z-20 border border-white/10 shadow-xl"
            >
              {translatedText}
            </motion.div>
          )}

          {fallbackImg ? (
            <img src={fallbackImg} alt="Sample" className="w-full h-full object-cover" />
          ) : uploadedImg ? (
            <div className="w-full h-full relative">
              <img src={uploadedImg} alt="Uploaded" className="w-full h-full object-contain" />
            </div>
          ) : capturedImg ? (
            <div className="w-full h-full relative">
              <img src={capturedImg} alt="Captured" className="w-full h-full object-cover" />
              {/* Removed buggy individual word boxes, relying on the unified overlay above */}
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          )}
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-space-900/60 backdrop-blur-sm z-20"
              >
                <div className="w-16 h-16 border-4 border-slate-700 border-t-neon-cyan rounded-full animate-spin shadow-glow-cyan"></div>
              </motion.div>
            )}
          </AnimatePresence>

          {!capturedImg && !uploadedImg && !fallbackImg && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
              <label className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer transition-colors border border-white/20">
                <span className="text-xl">📁</span>
                <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="hidden" />
              </label>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCapture}
                disabled={loading}
                className="w-20 h-20 bg-gradient-to-r from-neon-cyan to-blue-600 rounded-full flex items-center justify-center shadow-glow-cyan disabled:opacity-50 border-4 border-space-900"
              >
                <div className="w-14 h-14 border-2 border-white rounded-full"></div>
              </motion.button>
              
              <button 
                onClick={handleFallback} 
                className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer transition-colors border border-white/20 text-xl"
                title="Use Demo Image"
              >
                🖼️
              </button>
            </div>
          )}
        </div>

        {ocrText && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl"
          >
            <div className="mb-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Detected Text</div>
              <p className="text-slate-300">{ocrText}</p>
            </div>
            {translatedText && !boxes.length && (
              <div>
                <div className="text-xs text-neon-cyan uppercase tracking-wider mb-2 font-semibold">Translation</div>
                <p className="text-white text-lg font-medium">{translatedText}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
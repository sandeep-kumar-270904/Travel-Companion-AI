import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
];

export default function Home() {
  const [fromText, setFromText] = useState('');
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('hi');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState('');
  const [conversationDirection, setConversationDirection] = useState('userToOther');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const getSpeechLang = () => conversationDirection === 'userToOther' ? fromLang : toLang;
  const getTranslateFromLang = () => conversationDirection === 'userToOther' ? fromLang : toLang;
  const getTranslateToLang = () => conversationDirection === 'userToOther' ? toLang : fromLang;

  useEffect(() => {
    if (transcript) setFromText(transcript);
  }, [transcript]);

  const handleTranslate = async () => {
    if (!fromText.trim()) return;
    setLoading(true);
    setError('');
    setTranslatedText('');
    try {
      const res = await axios.post('/api/translate', {
        text: fromText,
        fromLang: getTranslateFromLang(),
        toLang: getTranslateToLang(),
      });
      setTranslatedText(res.data.translatedText);
    } catch {
      setError('Translation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = () => {
    if (!translatedText.trim()) return;
    setTtsLoading(true);
    setTtsError('');
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(translatedText);

        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          let voice;
          switch(getTranslateToLang()){
            case 'hi': voice = voices.find(v => v.lang.includes('hi')); break;
            case 'es': voice = voices.find(v => v.lang.includes('es')); break;
            case 'fr': voice = voices.find(v => v.lang.includes('fr')); break;
            case 'de': voice = voices.find(v => v.lang.includes('de')); break;
            case 'zh': voice = voices.find(v => v.lang.includes('zh')); break;
            case 'ar': voice = voices.find(v => v.lang.includes('ar')); break;
            default: voice = voices.find(v => v.lang.includes('en'));
          }
          if (voice) utterance.voice = voice;
          window.speechSynthesis.speak(utterance);
        };

        if (!window.speechSynthesis.getVoices().length) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        } else loadVoices();
      } else setTtsError('Speech synthesis not supported.');
    } catch {
      setTtsError('Failed to speak.');
    } finally {
      setTtsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
        <p className="mt-2 text-sm text-gray-500">Fast, accurate text and speech translation.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Input */}
        <div className="flex-1 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {conversationDirection === 'userToOther' ? 'You' : 'Other Person'}
            </h3>
            <select
              className="mt-1 block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={conversationDirection === 'userToOther' ? fromLang : toLang}
              onChange={e => conversationDirection === 'userToOther' ? setFromLang(e.target.value) : setToLang(e.target.value)}
            >
              {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
            </select>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <textarea
              className="w-full h-32 border-0 resize-none focus:ring-0 p-0 sm:text-lg text-gray-900 placeholder-gray-400"
              placeholder={conversationDirection === 'userToOther' ? 'Type or speak here...' : 'Other person types or speaks...'}
              value={fromText}
              onChange={e => setFromText(e.target.value)}
            />
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  className={`inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white ${listening ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`}
                  type="button"
                  onClick={() => {
                    if (!listening) {
                      resetTranscript();
                      SpeechRecognition.startListening({ continuous: false, language: getSpeechLang() });
                    } else {
                      SpeechRecognition.stopListening();
                    }
                  }}
                  disabled={!browserSupportsSpeechRecognition}
                  title="Speak"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                {listening && <span className="text-sm text-red-500 font-medium tracking-wide">Listening...</span>}
              </div>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                onClick={handleTranslate}
                disabled={loading || !fromText.trim()}
              >
                {loading ? 'Translating...' : 'Translate'}
              </button>
            </div>
            {!browserSupportsSpeechRecognition && (
              <p className="text-xs text-red-500 mt-2">Speech recognition not supported in this browser.</p>
            )}
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>
        </div>

        {/* Swap Button (Desktop) / Divider (Mobile) */}
        <div className="flex items-center justify-center -my-3 lg:my-0 lg:-mx-3 z-10 relative">
          <button
            className="bg-white rounded-full p-2 shadow-sm border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setConversationDirection(conversationDirection === 'userToOther' ? 'otherToUser' : 'userToOther')}
            title="Swap Direction"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform lg:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

        {/* Right Side: Output */}
        <div className="flex-1 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {conversationDirection === 'userToOther' ? 'Other Person' : 'You'}
            </h3>
            <select
              className="mt-1 block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={conversationDirection === 'userToOther' ? toLang : fromLang}
              onChange={e => conversationDirection === 'userToOther' ? setToLang(e.target.value) : setFromLang(e.target.value)}
            >
              {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
            </select>
          </div>
          <div className="p-4 flex-1 flex flex-col bg-indigo-50/30">
            <div className="flex-1 min-h-[128px]">
              {translatedText ? (
                <p className="sm:text-lg text-indigo-900 font-medium whitespace-pre-wrap">{translatedText}</p>
              ) : (
                <p className="text-gray-400 italic">Translation will appear here...</p>
              )}
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors gap-2"
                onClick={handleSpeak}
                disabled={ttsLoading || !translatedText}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
                {ttsLoading ? 'Speaking...' : 'Listen'}
              </button>
            </div>
            {ttsError && <p className="text-xs text-red-500 mt-2">{ttsError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

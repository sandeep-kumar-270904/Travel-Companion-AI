import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Phrasebook = () => {
  const [phrases, setPhrases] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('emergency');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [playingAudio, setPlayingAudio] = useState(null);

  const languages = ['english', 'hindi', 'telugu', 'spanish', 'french', 'german', 'chinese', 'japanese', 'italian'];
  const categories = ['greetings', 'directions', 'dining', 'shopping', 'emergency'];

  useEffect(() => {
    const fetchPhrases = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/phrases');
        setPhrases(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load phrases. Using offline fallback.');
        setPhrases({
          greetings: [
            { english: "Hello", hindi: "नमस्ते", telugu: "నమస్కారం", spanish: "Hola", french: "Bonjour", german: "Hallo", chinese: "你好", japanese: "こんにちは", italian: "Ciao" },
            { english: "Good morning", hindi: "सुप्रभात", telugu: "శుభోదయం", spanish: "Buenos días", french: "Bonjour", german: "Guten Morgen", chinese: "早上好", japanese: "おはようございます", italian: "Buongiorno" },
            { english: "How are you?", hindi: "आप कैसे हैं?", telugu: "మీరు ఎలా ఉన్నారు?", spanish: "¿Cómo estás?", french: "Comment allez-vous?", german: "Wie geht es dir?", chinese: "你好吗？", japanese: "お元気ですか？", italian: "Come stai?" },
            { english: "Thank you", hindi: "धन्यवाद", telugu: "ధన్యవాదాలు", spanish: "Gracias", french: "Merci", german: "Danke", chinese: "谢谢", japanese: "ありがとう", italian: "Grazie" }
          ],
          directions: [
            { english: "Where is the restroom?", hindi: "शौचालय कहाँ है?", telugu: "మరుగుదొడ్డి ఎక్కడ ఉంది?", spanish: "¿Dónde está el baño?", french: "Où sont les toilettes?", german: "Wo ist die Toilette?", chinese: "洗手间在哪里？", japanese: "トイレはどこですか？", italian: "Dov'è il bagno?" },
            { english: "How do I get to the train station?", hindi: "मैं रेलवे स्टेशन कैसे जा सकता हूँ?", telugu: "నేను రైల్వే స్టేషన్‌కు ఎలా వెళ్లాలి?", spanish: "¿Cómo llego a la estación de tren?", french: "Comment aller à la gare?", german: "Wie komme ich zum Bahnhof?", chinese: "我怎么去火车站？", japanese: "駅への行き方を教えてください。", italian: "Come arrivo alla stazione dei treni?" },
            { english: "Turn left", hindi: "बाएं मुड़ें", telugu: "ఎడమ వైపుకు తిరగండి", spanish: "Gira a la izquierda", french: "Tournez à gauche", german: "Biegen Sie links ab", chinese: "向左转", japanese: "左に曲がる", italian: "Gira a sinistra" },
            { english: "Turn right", hindi: "दाएं मुड़ें", telugu: "కుడి వైపుకు తిరగండి", spanish: "Gira a la derecha", french: "Tournez à droite", german: "Biegen Sie rechts ab", chinese: "向右转", japanese: "右に曲がる", italian: "Gira a destra" }
          ],
          dining: [
            { english: "A table for two, please", hindi: "कृपया दो लोगों के लिए एक टेबल", telugu: "దయచేసి ఇద్దరికి ఒక టేబుల్", spanish: "Una mesa para dos, por favor", french: "Une table pour deux, s'il vous plaît", german: "Einen Tisch für zwei, bitte", chinese: "请安排两人的桌子", japanese: "2人用のテーブルをお願いします", italian: "Un tavolo per due, per favore" },
            { english: "Can I have the menu?", hindi: "क्या मुझे मेनू मिल सकता है?", telugu: "నేను మెను పొందవచ్చా?", spanish: "¿Puedo ver el menú?", french: "Puis-je avoir le menu?", german: "Kann ich die Speisekarte haben?", chinese: "可以给我菜单吗？", japanese: "メニューをもらえますか？", italian: "Posso avere il menu?" },
            { english: "The bill, please", hindi: "कृपया बिल लाएं", telugu: "దయచేసి బిల్లు ఇవ్వండి", spanish: "La cuenta, por favor", french: "L'addition, s'il vous plaît", german: "Die Rechnung, bitte", chinese: "请结账", japanese: "お会計をお願いします", italian: "Il conto, per favore" },
            { english: "I am vegetarian", hindi: "मैं शाकाहारी हूँ", telugu: "నేను శాకాహారిని", spanish: "Soy vegetariano", french: "Je suis végétarien", german: "Ich bin Vegetarier", chinese: "我吃素", japanese: "私はベジタリアンです", italian: "Sono vegetariano" }
          ],
          shopping: [
            { english: "How much does this cost?", hindi: "यह कितने का है?", telugu: "ఇది ఎంత ఖరీదు?", spanish: "¿Cuánto cuesta esto?", french: "Combien ça coûte?", german: "Wie viel kostet das?", chinese: "这个多少钱？", japanese: "これはいくらですか？", italian: "Quanto costa questo?" },
            { english: "Can you give me a discount?", hindi: "क्या आप मुझे कुछ छूट दे सकते हैं?", telugu: "మీరు నాకు డిస్కౌంట్ ఇవ్వగలరా?", spanish: "¿Me puede hacer un descuento?", french: "Pouvez-vous me faire une réduction?", german: "Können Sie mir einen Rabatt geben?", chinese: "能给我打个折吗？", japanese: "割引してもらえますか？", italian: "Può farmi uno sconto?" },
            { english: "Do you accept credit cards?", hindi: "क्या आप क्रेडिट कार्ड स्वीकार करते हैं?", telugu: "మీరు క్రెడిట్ కార్డులను అంగీకరిస్తారా?", spanish: "¿Aceptan tarjetas de crédito?", french: "Acceptez-vous les cartes de crédit?", german: "Akzeptieren Sie Kreditkarten?", chinese: "你们接受信用卡吗？", japanese: "クレジットカードは使えますか？", italian: "Accettate carte di credito?" }
          ],
          emergency: [
            { english: "Call the police!", hindi: "पुलिस को बुलाओ!", telugu: "పోలీసులను పిలవండి!", spanish: "¡Llama a la policía!", french: "Appelez la police!", german: "Rufen Sie die Polizei!", chinese: "报警！", japanese: "警察を呼んで！", italian: "Chiama la polizia!" },
            { english: "I need a doctor.", hindi: "मुझे डॉक्टर की जरूरत है।", telugu: "నాకు డాక్టర్ కావాలి.", spanish: "Necesito un médico.", french: "J'ai besoin d'un médecin.", german: "Ich brauche einen Arzt.", chinese: "我需要医生。", japanese: "医者が必要です。", italian: "Ho bisogno di un medico." },
            { english: "I lost my passport.", hindi: "मेरा पासपोर्ट खो गया है।", telugu: "నా పాస్‌పోర్ట్ పోయింది.", spanish: "He perdido mi pasaporte.", french: "J'ai perdu mon passeport.", german: "Ich habe meinen Pass verloren.", chinese: "我护照丢了。", japanese: "パスポートを紛失しました。", italian: "Ho perso il passaporto." }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPhrases();
  }, []);

  useEffect(() => {
    if (phrases && Object.keys(phrases).length) {
      localStorage.setItem('phrasebook', JSON.stringify(phrases));
    }
  }, [phrases]);

  const playAudio = (phrase) => {
    if (playingAudio) playingAudio.pause();

    try {
      const audio = new Audio(`/api/phrases/audio/${phrase.audio || ''}`);
      audio.onerror = () => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(phrase[selectedLanguage]);
          const voices = window.speechSynthesis.getVoices();
          let voice;
          switch (selectedLanguage) {
            case 'hindi': voice = voices.find(v => v.lang.includes('hi')); break;
            case 'spanish': voice = voices.find(v => v.lang.includes('es')); break;
            case 'telugu': voice = voices.find(v => v.lang.includes('te')); break;
            default: voice = voices.find(v => v.lang.includes('en'));
          }
          if (voice) utterance.voice = voice;
          window.speechSynthesis.speak(utterance);
        }
      };
      audio.onended = () => setPlayingAudio(null);
      setPlayingAudio(audio);
      audio.play();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-neon-cyan animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-glowing-purple mb-2">Offline Phrasebook</h1>
        <p className="text-slate-400">Essential translations, always available.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Select Target Language</h2>
          <div className="flex flex-wrap gap-3">
            {languages.map(lang => (
              <motion.button 
                key={lang}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  selectedLanguage === lang 
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-glow-cyan' 
                    : 'bg-white/5 text-slate-300 border border-transparent hover:bg-white/10'
                }`}
              >
                {lang.charAt(0).toUpperCase()+lang.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Select Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <motion.button 
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all capitalize ${
                  selectedCategory === cat 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' 
                    : 'bg-white/5 text-slate-300 border border-transparent hover:bg-white/10'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <motion.div 
        layout
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm">📚</span>
            </div>
            {selectedCategory} Phrases
          </h2>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {phrases[selectedCategory]?.map((phrase, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative bg-space-800/50 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all flex justify-between items-center overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-cyan to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="pl-4">
                  <p className="text-xl font-semibold text-white mb-1">{phrase[selectedLanguage]}</p>
                  <p className="text-sm text-slate-400">{selectedLanguage !== 'english' ? phrase.english : ''}</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => playAudio(phrase)} 
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-transparent hover:border-indigo-500/30 transition-colors ml-4 flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h4l5 5V3l-5 5H7a2 2 0 00-2 2z" />
                  </svg>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Phrasebook;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ALLERGEN_OPTIONS = [
  { id: 'peanuts', label: 'Peanuts', icon: '🥜', translations: {
    ja: 'ピーナッツ / 落花生 (Peanuts)',
    th: 'ถั่วลิสง (Peanuts)',
    vi: 'Đậu phộng / Lạc (Peanuts)',
    zh: '花生 (Peanuts)',
    ko: '땅콩 (Peanuts)',
    es: 'Cacahuetes / Maní (Peanuts)',
    fr: 'Arachides / Cacahuètes (Peanuts)',
    it: 'Arachidi (Peanuts)',
    de: 'Erdnüsse (Peanuts)',
    ar: 'الفول السوداني (Peanuts)',
    hi: 'मूंगफली (Peanuts)',
    tr: 'Yer fıstığı (Peanuts)'
  }},
  { id: 'treenuts', label: 'Tree Nuts (Walnut/Cashew/Almond)', icon: '🌰', translations: {
    ja: 'ナッツ類 (くるみ、カシューナッツ、アーモンド)',
    th: 'ถั่วเปลือกแข็ง (วอลนัท มะม่วงหิมพานต์ อัลมอนด์)',
    vi: 'Các loại hạt (Óc chó, Điều, Hạnh nhân)',
    zh: '坚果类 (核桃、腰果、杏仁)',
    ko: '견과류 (호두, 캐슈넛, 아몬드)',
    es: 'Frutos secos (Nueces, Anacardos, Almendras)',
    fr: 'Fruits à coque (Noix, Cajou, Amandes)',
    it: 'Frutta a guscio (Noci, Anacardi, Mandorle)',
    de: 'Schalenfrüchte (Walnüsse, Cashews, Mandeln)',
    ar: 'المكسرات (الجوز، الكاجو، اللوز)',
    hi: 'मेवे (अखरोट, काजू, बादाम)',
    tr: 'Ağaç fıstığı / Kuruyemiş'
  }},
  { id: 'shellfish', label: 'Shellfish & Crustaceans', icon: '🦐', translations: {
    ja: '甲殻類 (エビ、カニ) 及び 貝類',
    th: 'กุ้ง ปู และสัตว์น้ำมีเปลือก',
    vi: 'Tôm, Cua và Động vật có vỏ',
    zh: '甲壳类水产 (虾、蟹、贝类)',
    ko: '갑각류 (새우, 게, 조개류)',
    es: 'Mariscos y Crustáceos (Camarones, Cangrejos)',
    fr: 'Crustacés et Fruits de mer (Crevettes, Crabes)',
    it: 'Crostacei e Frutti di mare',
    de: 'Krebstiere und Schalentiere',
    ar: 'المأكولات البحرية والقشريات (الجمبري والسرطان)',
    hi: 'झींगा, केकड़ा और समुद्री सीप',
    tr: 'Kabuklu deniz ürünleri'
  }},
  { id: 'fish', label: 'Fish & Fish Sauce', icon: '🐟', translations: {
    ja: '魚及び魚介エキス (だし・魚醤)',
    th: 'ปลา และน้ำปลา (Fish & Fish Sauce)',
    vi: 'Cá và Nước mắm (Fish & Fish Sauce)',
    zh: '鱼类及鱼露/鱼汤',
    ko: '생선 및 어간장/다시',
    es: 'Pescado y Salsa de pescado',
    fr: 'Poisson et Sauce de poisson',
    it: 'Pesce e Salsa di pesce',
    de: 'Fisch und Fischsauce',
    ar: 'الأسماك وصلصة السمك',
    hi: 'मछली और मछली सॉस',
    tr: 'Balık ve Balık sosu'
  }},
  { id: 'gluten', label: 'Gluten / Wheat / Celiac', icon: '🌾', translations: {
    ja: '小麦・グルテン (醤油を含む)',
    th: 'ข้าวสาลี / กลูเตน (รวมถึงซีอิ๊ว)',
    vi: 'Bột mì / Gluten (Bao gồm nước tương)',
    zh: '小麦/面粉/麸质 (包括酱油)',
    ko: '밀/글루텐 (간장 포함)',
    es: 'Gluten / Trigo / Celíaco (Incluyendo salsa de soja)',
    fr: 'Gluten / Blé / Cœliaque (Y compris sauce soja)',
    it: 'Glutine / Frumento / Celiachia',
    de: 'Gluten / Weizen / Zöliakie',
    ar: 'الغلوتين / القمح / مرض السيلياك',
    hi: 'गेहूं और ग्लूटेन',
    tr: 'Glüten / Buğday / Çölyak'
  }},
  { id: 'dairy', label: 'Dairy & Milk / Lactose', icon: '🥛', translations: {
    ja: '乳製品 (牛乳、バター、チーズ、生クリーム)',
    th: 'นมและผลิตภัณฑ์จากนม (เนย ชีส ครีม)',
    vi: 'Sữa và các chế phẩm từ sữa',
    zh: '乳制品 (牛奶、黄油、奶酪)',
    ko: '유제품 (우유, 버터, 치즈)',
    es: 'Lácteos y Leche (Mantequilla, Queso)',
    fr: 'Produits laitiers (Lait, Beurre, Fromage)',
    it: 'Latticini e Latte (Burro, Formaggio)',
    de: 'Milchprodukte und Laktose',
    ar: 'منتجات الألبان والحليب',
    hi: 'दूध, मक्खन और पनीर',
    tr: 'Süt ürünleri ve Laktoz'
  }},
  { id: 'eggs', label: 'Eggs', icon: '🥚', translations: {
    ja: '卵 (鶏卵・マヨネーズ)',
    th: 'ไข่ (รวมถึงมายองเนส)',
    vi: 'Trứng (Bao gồm mayonnaise)',
    zh: '鸡蛋及蛋制品',
    ko: '달걀 / 계란 (마요네즈 포함)',
    es: 'Huevo y derivados',
    fr: 'Œufs et dérivés',
    it: 'Uova e derivati',
    de: 'Eier und Eiprodukte',
    ar: 'البيض ومشتقاته',
    hi: 'अंडे',
    tr: 'Yumurta'
  }},
  { id: 'soy', label: 'Soy / Soybean', icon: '🫘', translations: {
    ja: '大豆及び大豆油・豆腐',
    th: 'ถั่วเหลืองและผลิตภัณฑ์จากถั่วเหลือง',
    vi: 'Đậu nành và Tàu hũ',
    zh: '大豆、豆浆、豆油',
    ko: '대두 / 콩 (두부 포함)',
    es: 'Soja y derivados',
    fr: 'Soja et dérivés',
    it: 'Soia e derivati',
    de: 'Soja und Sojaprodukte',
    ar: 'الصويا ومشتقاتها',
    hi: 'सोयाबीन और सोया उत्पाद',
    tr: 'Soya ve ürünleri'
  }},
  { id: 'sesame', label: 'Sesame & Sesame Oil', icon: '🌱', translations: {
    ja: 'ごま及びごま油',
    th: 'งาและน้ำมันงา',
    vi: 'Mè / Vừng và Dầu mè',
    zh: '芝麻及芝麻油',
    ko: '참깨 및 참기름',
    es: 'Sésamo y Aceite de sésamo',
    fr: 'Sésame et Huile de sésame',
    it: 'Sesamo e Olio di sesamo',
    de: 'Sesam und Sesamöl',
    ar: 'السمسم وزيت السمسم',
    hi: 'तिल और तिल का तेल',
    tr: 'Susam ve Susam yağı'
  }},
  { id: 'pork', label: 'Pork & Lard', icon: '🥓', translations: {
    ja: '豚肉及び豚脂 (ラード・とんこつ)',
    th: 'เนื้อหมู และมันหมู',
    vi: 'Thịt heo / Mỡ heo',
    zh: '猪肉及猪油',
    ko: '돼지고기 및 라드/돈골',
    es: 'Cerdo y Grasa de cerdo / Manteca',
    fr: 'Porc et Saindoux',
    it: 'Carne di maiale e Strutto',
    de: 'Schweinefleisch und Schmalz',
    ar: 'لحم الخنزير ودهنه',
    hi: 'सुअर का मांस (Pork)',
    tr: 'Domuz eti ve yağı'
  }},
  { id: 'beef', label: 'Beef & Beef Tallow', icon: '🥩', translations: {
    ja: '牛肉及び牛脂',
    th: 'เนื้อวัว และมันวัว',
    vi: 'Thịt bò',
    zh: '牛肉及牛油',
    ko: '소고기 및 쇠기름',
    es: 'Carne de res / Ternera',
    fr: 'Bœuf et Graisse de bœuf',
    it: 'Carne bovina',
    de: 'Rindfleisch',
    ar: 'لحم البقر',
    hi: 'गोमांस (Beef)',
    tr: 'Sığır eti'
  }},
  { id: 'vegan', label: 'Strict Vegan (No Animal Products)', icon: '🥗', translations: {
    ja: '完全菜食 (ヴィーガン - 肉・魚・卵・乳・だし・ゼラチン不使用)',
    th: 'อาหารเจ / วีแกน (ไม่ใส่เนื้อสัตว์ ไข่ นม น้ำปลา หรือสารสกัดจากสัตว์)',
    vi: 'Ăn chay thuần (Thuần chay - Không thịt, cá, trứng, sữa)',
    zh: '严格素食 (纯素 - 不含肉、鱼、蛋、奶、骨汤)',
    ko: '비건 (육류, 어류, 계란, 유제품, 육수 일체 사용 금지)',
    es: 'Vegano estricto (Sin carne, pescado, lácteos ni huevos)',
    fr: 'Végétalien strict (Sans viande, poisson, produits laitiers ni œufs)',
    it: 'Vegano stretto (Senza carne, pesce, latticini o uova)',
    de: 'Streng vegan (Ohne Fleisch, Fisch, Milch oder Eier)',
    ar: 'نباتي صرف (بدون أي مشتقات حيوانية)',
    hi: 'शुद्ध शाकाहारी (दूध, अंडा, मांस रहित)',
    tr: 'Tamamen Vegan'
  }}
];

const LANGUAGES = [
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵', emergencyTitle: '⚠️ 緊急: 重度のアレルギーがあります', warningTemplate: '私は以下の食品に対して重度のアレルギーがあり、微量でも摂取すると生命に関わるアナフィラキシーショックを引き起こします。調理器具、油、だしの混入も含め、以下の食材が使われていないか確認していただけますでしょうか？', phonetic: 'Watashi wa juudo no arerugii ga arimasu. Kore ga haitte imasen ka?' },
  { code: 'th', name: 'Thai (ไทย)', flag: '🇹🇭', emergencyTitle: '⚠️ ฉุกเฉิน: มีอาการแพ้อาหารขั้นรุนแรง', warningTemplate: 'ฉันมีอาการแพ้อาหารเหล่านี้อย่างรุนแรง แม้เพียงปริมาณเล็กน้อย น้ำมันทอด หรือน้ำซุป ก็ทำให้เกิดอันตรายถึงชีวิต กรุณาตรวจสอบว่าอาหารจานนี้ไม่มีส่วนผสมเหล่านี้:', phonetic: 'Chan phae a-han yang run-raeng. Mai sai sing ni dai mai khrap/ka?' },
  { code: 'vi', name: 'Vietnamese (Tiếng Việt)', flag: '🇻🇳', emergencyTitle: '⚠️ CẢNH BÁO: DỊ ỨNG NGUY HIỂM TÍNH MẠNG', warningTemplate: 'Tôi bị dị ứng cực kỳ nghiêm trọng với các thực phẩm sau. Dù chỉ một lượng nhỏ, dầu ăn hoặc nước dùng cũng có thể gây sốc phản vệ nguy hiểm đến tính mạng. Xin vui lòng xác nhận món ăn không có:', phonetic: 'Toi bi di ung rat nang. Mon nay co chua nhung thu nay khong?' },
  { code: 'zh', name: 'Chinese (中文)', flag: '🇨🇳', emergencyTitle: '⚠️ 紧急求助: 严重食物过敏', warningTemplate: '我对以下食材有极其严重的过敏反应，即使微量接触、共用炊具或使用动物油脂都会危及生命。请务必确认菜品中绝不含有以下成分:', phonetic: 'Wǒ duì yǐxià shícái yánzhòng guòmǐn, qǐng wùbì bāng wǒ quèrèn.' },
  { code: 'ko', name: 'Korean (한국어)', flag: '🇰🇷', emergencyTitle: '⚠️ 긴급: 중증 식품 알레르기 안내', warningTemplate: '저는 아래 식품에 대해 생명을 위협할 수 있는 심각한 아나필락시스 알레르기가 있습니다. 소량이나 조리 기구, 육수, 기름을 통한 교차 오염도 절대 안 됩니다. 아래 재료가 포함되지 않았는지 확인 부탁드립니다:', phonetic: 'Jeoneun i eumsik-e simgakhang allereugi-ga isseumnida.' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸', emergencyTitle: '⚠️ AVISO MÉDICO: ALERGIA SEVERA', warningTemplate: 'Tengo una alergia severa potencialmente mortal a los siguientes alimentos. Incluso trazas, aceites cruzados o caldos me provocarán un shock anafiláctico grave. Por favor, confirme que este plato NO contiene:', phonetic: 'Tengo una alergia muy grave. ¿Este plato contiene esto?' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷', emergencyTitle: '⚠️ URGENCE MÉDICALE: ALLERGIE SÉVÈRE', warningTemplate: 'Je souffre d\'une allergie sévère et potentiellement mortelle aux aliments suivants. Même une trace infime, de l\'huile de cuisson ou du bouillon peut entraîner un choc anaphylactique. Veuillez confirmer que ce plat ne contient PAS:', phonetic: 'J\'ai une allergie très grave. Est-ce qu\'il y a ceci dans ce plat?' },
  { code: 'it', name: 'Italian (Italiano)', flag: '🇮🇹', emergencyTitle: '⚠️ AVVISO MEDICO: ALLERGIA GRAVE', warningTemplate: 'Ho una grave allergia potenzialmente letale ai seguenti ingredienti. Anche una minima traccia o contaminazione crociata può causarmi uno shock anafilattico. Per favore verifichi che questo piatto NON contenga:', phonetic: 'Ho un\'allergia molto grave. Questo piatto contiene questo?' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪', emergencyTitle: '⚠️ MEDIZINISCHER HINWEIS: SCHWERE ALLERGIE', warningTemplate: 'Ich habe eine lebensbedrohliche schwere Allergie gegen folgende Lebensmittel. Selbst kleinste Spuren oder Kreuzkontaminationen können einen anaphylaktischen Schock auslösen. Bitte bestätigen Sie, dass dieses Gericht folgendes NICHT enthält:', phonetic: 'Ich habe eine schwere Allergie. Ist das in diesem Gericht enthalten?' },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇦🇪', emergencyTitle: '⚠️ تنبيه طبي طارئ: حساسية شديدة مميتة', warningTemplate: 'لدي حساسية شديدة ومهددة للحياة من الأطعمة التالية. حتى أدنى أثر أو استخدام لزيوت الطهي المشتركة قد يسبب صدمة حساسية خطيرة. يرجى التأكد من خلو الطبق تماماً من:', phonetic: 'Ladayya hasasiyyah shadeedah jiddan min hathihil mawad.' },
  { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳', emergencyTitle: '⚠️ आपातकालीन सूचना: गंभीर एलर्जी चेतावनी', warningTemplate: 'मुझे निम्नलिखित खाद्य पदार्थों से जानलेवा गंभीर एलर्जी है। ज़रा सा अंश, पकाने का तेल या सूप भी मेरी जान के लिए ख़तरा बन सकता है। कृपया सुनिश्चित करें कि इस भोजन में यह शामिल नहीं है:', phonetic: 'Mujhe in cheezon se bahut gambhir allergy hai. Kya isme ye shamil hai?' },
  { code: 'tr', name: 'Turkish (Türkçe)', flag: '🇹🇷', emergencyTitle: '⚠️ TIBBİ ACİL UYARI: CİDDİ ALERJİ', warningTemplate: 'Aşağıdaki maddelere karşı hayati tehlike yaratan şiddetli bir alerjim var. En ufak bir kırıntı veya aynı yağda pişirme bile anaflaktik şoka yol açabilir. Lütfen bu yemekte aşağıdakilerin OLMADIĞINI onaylayın:', phonetic: 'Bu maddelere karsi cok ciddi alerjim var. Bu yemekte var mi?' }
];

export default function ChefAllergyPass() {
  const [selectedAllergens, setSelectedAllergens] = useState(['peanuts', 'shellfish']);
  const [targetLang, setTargetLang] = useState('ja');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('saved_allergy_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.allergens) setSelectedAllergens(parsed.allergens);
        if (parsed.lang) setTargetLang(parsed.lang);
      } catch (e) {}
    }
  }, []);

  const toggleAllergen = (id) => {
    let next;
    if (selectedAllergens.includes(id)) {
      next = selectedAllergens.filter(x => x !== id);
    } else {
      next = [...selectedAllergens, id];
    }
    setSelectedAllergens(next);
    localStorage.setItem('saved_allergy_profile', JSON.stringify({ allergens: next, lang: targetLang }));
  };

  const handleLangChange = (code) => {
    setTargetLang(code);
    localStorage.setItem('saved_allergy_profile', JSON.stringify({ allergens: selectedAllergens, lang: code }));
  };

  const currentLangObj = LANGUAGES.find(l => l.code === targetLang) || LANGUAGES[0];
  const activeAllergensList = ALLERGEN_OPTIONS.filter(a => selectedAllergens.includes(a.id));

  const copyCardText = () => {
    const text = `${currentLangObj.emergencyTitle}\n\n${currentLangObj.warningTemplate}\n\n` +
      activeAllergensList.map(a => `• ${a.translations[targetLang] || a.label}`).join('\n') +
      `\n\nPhonetic Guide: "${currentLangObj.phonetic}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Configuration Section */}
      <div className="bg-space-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-black font-outfit text-white flex items-center gap-3">
              <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">🛡️</span>
              Bilingual Chef Allergy Pass
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Generates a verified, emergency-grade medical card in local scripts to show waitstaff and chefs abroad.
            </p>
          </div>

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Destination:</span>
            <select
              value={targetLang}
              onChange={(e) => handleLangChange(e.target.value)}
              className="bg-space-900 border border-white/20 text-white rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:border-neon-cyan transition-colors"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Allergen Selection Chips */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Select Your Dietary Restrictions & Allergies:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {ALLERGEN_OPTIONS.map(allergen => {
              const isSelected = selectedAllergens.includes(allergen.id);
              return (
                <button
                  key={allergen.id}
                  onClick={() => toggleAllergen(allergen.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                    isSelected
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <span>{allergen.icon}</span>
                  {allergen.label}
                  {isSelected && <span className="ml-1 text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rendered Live Chef Card */}
      <div className="relative">
        <div className="bg-gradient-to-b from-rose-950/40 via-space-900 to-space-950 border-2 border-rose-500/50 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(244,63,94,0.25)] relative overflow-hidden">
          {/* Top Alert Beacon */}
          <div className="flex items-center justify-between pb-6 border-b border-rose-500/30 mb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-4 w-4 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400">
                Official Dietary & Medical Notice
              </span>
            </div>
            <div className="text-2xl">{currentLangObj.flag}</div>
          </div>

          {/* Native Script Headline */}
          <h2 className="text-2xl sm:text-3xl font-black text-rose-300 leading-snug mb-4">
            {currentLangObj.emergencyTitle}
          </h2>

          {/* Native Warning Paragraph */}
          <p className="text-slate-200 text-base sm:text-lg leading-relaxed mb-6 font-medium">
            {currentLangObj.warningTemplate}
          </p>

          {/* Highlighted Restricted Items Box */}
          <div className="bg-black/50 border border-rose-500/40 rounded-2xl p-5 mb-6">
            <div className="text-xs uppercase font-extrabold tracking-wider text-rose-400 mb-3">
              STRICTLY PROHIBITED INGREDIENTS / 厳禁成分:
            </div>
            {activeAllergensList.length === 0 ? (
              <p className="text-slate-400 text-sm italic">No restrictions selected. Choose from above.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeAllergensList.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl">
                    <span className="text-2xl">{a.icon}</span>
                    <div>
                      <div className="text-white font-bold text-sm">
                        {a.translations[targetLang] || a.label}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {a.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Traveler Verbal Pronunciation Helper */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="text-slate-300">
              <span className="font-bold text-neon-cyan">🗣️ Say aloud to waitstaff:</span>{' '}
              <span className="italic font-mono text-white">"{currentLangObj.phonetic}"</span>
            </div>
            <div className="text-slate-400 text-xs">
              Direct point-and-show card.
            </div>
          </div>

          {/* Card Actions */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={copyCardText}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-all border border-white/10"
              >
                {copied ? '✓ Copied Text' : '📋 Copy Text'}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-all border border-white/10"
              >
                🖨️ Print Pass
              </button>
            </div>

            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Cached in Offline Vault (Works without Wi-Fi/Cellular)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

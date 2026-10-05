import { GoogleGenerativeAI } from '@google/generative-ai';
import { speak } from 'google-translate-api-x';

const getGenAI = (userApiKey) => {
  const key = userApiKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
};

export const translateText = async (text, fromLang, toLang, userApiKey) => {
  const genAI = getGenAI(userApiKey);
  if (!genAI) {
    throw new Error('Please provide a Gemini API Key in the AI Settings to use translation features.');
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Translate the following text from ${fromLang === 'auto' ? 'its original language' : fromLang} to ${toLang}. Only return the translated text without any quotes or explanations. Text: "${text}"`;
    const result = await model.generateContent(prompt);
    let translated = result.response.text().trim();
    // Remove surrounding quotes if model added them
    if (translated.startsWith('"') && translated.endsWith('"')) {
      translated = translated.slice(1, -1);
    }

    return {
      translatedText: translated,
      detectedSourceLanguage: fromLang === 'auto' ? 'unknown' : fromLang,
    };
  } catch (error) {
    if (error.status === 503) {
      console.warn('Gemini 1.5 Flash returned 503 during translation. Retrying with gemini-1.5-pro...');
      const modelPro = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `Translate the following text from ${fromLang === 'auto' ? 'its original language' : fromLang} to ${toLang}. Only return the translated text without any quotes or explanations. Text: "${text}"`;
      const resultPro = await modelPro.generateContent(prompt);
      let translated = resultPro.response.text().trim();
      if (translated.startsWith('"') && translated.endsWith('"')) {
        translated = translated.slice(1, -1);
      }
      return {
        translatedText: translated,
        detectedSourceLanguage: fromLang === 'auto' ? 'unknown' : fromLang,
      };
    }
    throw error;
  }
};

export const generateSpeech = async (text, lang) => {
  const audioBase64 = await speak(text, { to: lang });
  return audioBase64;
};

export const recognizeSpeech = async (audioBuffer) => {
  try {
    // Attempting to use a free Hugging Face inference API for Whisper
    const response = await fetch(
      "https://api-inference.huggingface.co/models/openai/whisper-tiny",
      {
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}`,
          "Content-Type": "audio/flac",
        },
        method: "POST",
        body: audioBuffer,
      }
    );
    const result = await response.json();
    if (result.error) {
       console.warn('Hugging Face STT failed:', result.error);
       return "Simulated STT: Hello, how are you? (Please add HUGGINGFACE_API_KEY)";
    }
    return result.text;
  } catch (error) {
    console.error('STT error:', error);
    return "Simulated STT: Hello, how are you? (Error connecting to STT API)";
  }
};

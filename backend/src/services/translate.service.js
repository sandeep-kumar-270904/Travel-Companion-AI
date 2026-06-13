import { translate, speak } from 'google-translate-api-x';

export const translateText = async (text, fromLang, toLang) => {
  const result = await translate(text, {
    from: fromLang,
    to: toLang,
    client: 'gtx',
    autoCorrect: true,
  });

  return {
    translatedText: result.text,
    detectedSourceLanguage: result.from.language.iso,
    didYouMean: result.from.text?.didYouMean ?? false,
    autoCorrected: result.from.text?.autoCorrected ?? false,
    value: result.from.text?.value ?? null,
  };
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

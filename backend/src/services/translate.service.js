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

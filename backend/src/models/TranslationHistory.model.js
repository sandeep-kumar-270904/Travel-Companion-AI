import mongoose from 'mongoose';

const translationHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    originalText: {
      type: String,
      required: true,
    },
    translatedText: {
      type: String,
      required: true,
    },
    fromLang: {
      type: String,
      required: true,
    },
    toLang: {
      type: String,
      required: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const TranslationHistory = mongoose.model('TranslationHistory', translationHistorySchema);

export default TranslationHistory;

import mongoose from 'mongoose';

const phraseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      index: true,
    },
    items: [
      {
        english: { type: String, required: true },
        translation: { type: String }, // Can be expanded to map of languages if needed
        audioPath: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Phrase = mongoose.model('Phrase', phraseSchema);

export default Phrase;

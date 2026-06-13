import User from '../models/User.model.js';
import TranslationHistory from '../models/TranslationHistory.model.js';

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

export const updateUserProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.name = data.name || user.name;
  if (data.password) {
    user.password = data.password;
  }
  if (data.preferences) {
    user.preferences = { ...user.preferences, ...data.preferences };
  }

  const updatedUser = await user.save();
  return {
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    preferences: updatedUser.preferences,
  };
};

export const getTranslationHistory = async (userId) => {
  return await TranslationHistory.find({ user: userId }).sort({ createdAt: -1 });
};

export const addTranslationHistory = async (userId, data) => {
  const history = new TranslationHistory({
    user: userId,
    originalText: data.originalText,
    translatedText: data.translatedText,
    fromLang: data.fromLang,
    toLang: data.toLang,
  });
  return await history.save();
};

export const toggleFavoriteHistory = async (userId, historyId) => {
  const history = await TranslationHistory.findOne({ _id: historyId, user: userId });
  if (!history) throw new Error('History item not found');

  history.isFavorite = !history.isFavorite;
  return await history.save();
};

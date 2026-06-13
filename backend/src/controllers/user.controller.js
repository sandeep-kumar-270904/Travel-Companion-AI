import * as userService from '../services/user.service.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getUserProfile(req.user._id);
    res.json(profile);
  } catch (error) {
    res.status(404);
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateUserProfile(req.user._id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const history = await userService.getTranslationHistory(req.user._id);
    res.json(history);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const item = await userService.toggleFavoriteHistory(req.user._id, req.params.id);
    res.json(item);
  } catch (error) {
    res.status(404);
    next(error);
  }
};

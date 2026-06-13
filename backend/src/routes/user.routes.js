import express from 'express';
import { getProfile, updateProfile, getHistory, toggleFavorite } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.route('/history')
  .get(protect, getHistory);

router.route('/history/:id/favorite')
  .put(protect, toggleFavorite);

export default router;

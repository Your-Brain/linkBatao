import express from 'express';
import Category from '../models/Category.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET all active categories
router.get('/', async (req, res, next) => {
  try {
    let categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });

    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Technology', slug: 'technology', description: 'Artificial Intelligence, software & hardware news', icon: 'Cpu', order: 1 },
        { name: 'Programming', slug: 'programming', description: 'Web development, computer science & engineering', icon: 'Code', order: 2 },
        { name: 'Gaming', slug: 'gaming', description: 'Game trailers, eSports & gaming community', icon: 'Gamepad2', order: 3 },
        { name: 'Education', slug: 'education', description: 'Science, history & lectures', icon: 'GraduationCap', order: 4 },
        { name: 'Entertainment', slug: 'entertainment', description: 'Movies, anime & internet culture', icon: 'Tv', order: 5 },
        { name: 'Music', slug: 'music', description: 'Music videos, tracks & podcasts', icon: 'Music', order: 6 },
        { name: 'Fashion', slug: 'fashion', description: 'Streetwear & lookbooks', icon: 'Sparkles', order: 7 },
        { name: 'Sports', slug: 'sports', description: 'Highlights, athletics & fitness', icon: 'Trophy', order: 8 },
        { name: 'News', slug: 'news', description: 'World news & finance', icon: 'Newspaper', order: 9 },
        { name: 'Art', slug: 'art', description: 'Digital art, 3D design & creative works', icon: 'Palette', order: 10 },
        { name: 'Lifestyle', slug: 'lifestyle', description: 'Travel & minimalist living', icon: 'Compass', order: 11 },
        { name: 'Other', slug: 'other', description: 'Uncategorized resources', icon: 'Box', order: 12 },
        { name: 'sex', slug: 'sex', description: 'sex', icon: 'Heart', order: 13 },
      ];
      categories = await Category.insertMany(defaultCategories);
    }

    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
});

// POST create category (Admin/Moderator only)
router.post('/', protect, authorize('ADMIN', 'MODERATOR'), async (req, res, next) => {
  try {
    const { name, description, icon, order } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const category = await Category.create({ name, slug, description, icon, order });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

export default router;

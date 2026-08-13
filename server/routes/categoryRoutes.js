import express from 'express';
import Category from '../models/Category.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET all active categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
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

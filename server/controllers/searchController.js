import Resource from '../models/Resource.js';
import Category from '../models/Category.js';

// @desc    Full text search with suggestions, tag matching, and domain filter
// @route   GET /api/search
// @access  Public
export const search = async (req, res, next) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    const searchQuery = { status: 'APPROVED' };

    // Incognito / NSFW Filtering
    const includeNsfw = req.query.includeNsfw === 'true' || req.query.nsfw === 'true';
    const nsfwOnly = req.query.nsfwOnly === 'true';

    const sexCat = await Category.findOne({ slug: 'sex' });
    const sexCatId = sexCat ? sexCat._id : null;

    if (nsfwOnly) {
      if (sexCatId) {
        searchQuery.$or = [{ isNsfw: true }, { category: sexCatId }];
      } else {
        searchQuery.isNsfw = true;
      }
    } else if (!includeNsfw) {
      searchQuery.isNsfw = { $ne: true };
      if (sexCatId && !req.query.category) {
        searchQuery.category = { $ne: sexCatId };
      }
    }

    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const textConditions = [
        { title: regex },
        { description: regex },
        { tags: regex },
        { domain: regex }
      ];

      if (searchQuery.$or) {
        searchQuery.$and = [
          { $or: searchQuery.$or },
          { $or: textConditions }
        ];
        delete searchQuery.$or;
      } else {
        searchQuery.$or = textConditions;
      }
    }

    // Apply optional category filter during search
    if (req.query.category) {
      if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
        searchQuery.category = req.query.category;
      } else {
        const cat = await Category.findOne({ slug: req.query.category.toLowerCase() });
        if (cat) searchQuery.category = cat._id;
      }
    }

    // Apply optional resourceType filter
    if (req.query.resourceType) {
      searchQuery.resourceType = req.query.resourceType.toUpperCase();
    }

    const total = await Resource.countDocuments(searchQuery);

    const results = await Resource.find(searchQuery)
      .populate('category', 'name slug icon')
      .populate('submittedBy', 'username avatar')
      .sort({ views: -1, createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Generate quick search suggestions from titles & tags
    const suggestionsRaw = await Resource.find(searchQuery)
      .select('title tags')
      .limit(10);

    const suggestionsSet = new Set();
    suggestionsRaw.forEach(item => {
      if (item.title && q) suggestionsSet.add(item.title);
      if (Array.isArray(item.tags)) {
        item.tags.forEach(t => {
          if (!q || t.toLowerCase().includes(q.toLowerCase())) {
            suggestionsSet.add(`#${t}`);
          }
        });
      }
    });

    res.json({
      success: true,
      query: q,
      total,
      page,
      pages: Math.ceil(total / limit),
      suggestions: Array.from(suggestionsSet).slice(0, 6),
      data: results
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get top active tags across platform
// @route   GET /api/tags
// @access  Public
export const getTags = async (req, res, next) => {
  try {
    const tags = await Resource.aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      data: tags.map(t => ({ tag: t._id, count: t.count }))
    });
  } catch (err) {
    next(err);
  }
};

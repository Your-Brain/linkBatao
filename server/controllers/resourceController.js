import Resource from '../models/Resource.js';
import Category from '../models/Category.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { normalizeUrl } from '../utils/urlNormalizer.js';
import { detectEmbed } from '../utils/embedDetector.js';
import { fetchUrlMetadata } from '../utils/metadataFetcher.js';

// @desc    Get resources with filtering, sorting & pagination
// @route   GET /api/resources
// @access  Public
export const getResources = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    const query = { status: 'APPROVED' };

    // Category Filter
    if (req.query.category) {
      if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = req.query.category;
      } else {
        const cat = await Category.findOne({ slug: req.query.category.toLowerCase() });
        if (cat) query.category = cat._id;
      }
    }

    // Resource Type Filter
    if (req.query.resourceType) {
      query.resourceType = req.query.resourceType.toUpperCase();
    }

    // Tag Filter
    if (req.query.tag) {
      query.tags = req.query.tag.toLowerCase();
    }

    // Domain Filter
    if (req.query.domain) {
      query.domain = req.query.domain.toLowerCase();
    }

    // Sorting options
    let sort = { trendingScore: -1, createdAt: -1 };
    if (req.query.sort === 'newest') {
      sort = { createdAt: -1 };
    } else if (req.query.sort === 'oldest') {
      sort = { createdAt: 1 };
    } else if (req.query.sort === 'views') {
      sort = { views: -1 };
    } else if (req.query.sort === 'saves') {
      sort = { saves: -1 };
    }

    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .populate('category', 'name slug icon')
      .populate('submittedBy', 'username avatar')
      .sort(sort)
      .skip(startIndex)
      .limit(limit);

    res.json({
      success: true,
      count: resources.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: resources
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single resource by ID & increment views
// @route   GET /api/resources/:id
// @access  Public
export const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('category', 'name slug icon description')
      .populate('submittedBy', 'username avatar bio');

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    // Fetch related resources in same category
    const related = await Resource.find({
      category: resource.category._id,
      _id: { $ne: resource._id },
      status: 'APPROVED'
    })
      .limit(6)
      .populate('category', 'name slug');

    res.json({
      success: true,
      data: resource,
      related
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Safe Metadata Preview & Duplicate Detection for URL
// @route   POST /api/resources/metadata-preview
// @access  Public
export const previewMetadata = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    const { normalizedUrl, domain } = normalizeUrl(url);

    // Check if resource already exists in DB
    const existing = await Resource.findOne({ normalizedUrl })
      .populate('category', 'name slug');

    // Run Embed Detection
    const embedInfo = detectEmbed(url);

    // Fetch safe Open Graph metadata
    const fetchedMeta = await fetchUrlMetadata(url);

    res.json({
      success: true,
      normalizedUrl,
      domain: domain || fetchedMeta.domain,
      isDuplicate: !!existing,
      existingResource: existing || null,
      embedType: embedInfo.embedType,
      embedUrl: embedInfo.embedUrl,
      metadata: {
        title: fetchedMeta.title,
        description: fetchedMeta.description,
        thumbnail: fetchedMeta.thumbnail,
        resourceType: embedInfo.resourceType || fetchedMeta.resourceType
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit a new link (Anonymous or Authenticated)
// @route   POST /api/resources
// @access  Public (Optional Auth)
export const createResource = async (req, res, next) => {
  try {
    const { url, title, description, category, tags, resourceType, thumbnail } = req.body;

    if (!url || !title || !category) {
      return res.status(400).json({ success: false, message: 'Please provide URL, title, and category' });
    }

    const { normalizedUrl, domain } = normalizeUrl(url);

    // Check duplicate
    const existing = await Resource.findOne({ normalizedUrl });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This link has already been submitted to the platform.',
        existingId: existing._id
      });
    }

    // Verify category exists
    let catObj;
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      catObj = await Category.findById(category);
    } else {
      catObj = await Category.findOne({ slug: category.toLowerCase() });
    }

    if (!catObj) {
      return res.status(400).json({ success: false, message: 'Invalid category selected' });
    }

    // Detect Embed Type
    const embedInfo = detectEmbed(url);

    // Parse tags into clean array
    let processedTags = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map(t => t.trim().toLowerCase()).filter(Boolean);
    } else if (typeof tags === 'string') {
      processedTags = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    }

    // Determine Resource Type
    const finalType = (resourceType || embedInfo.resourceType || 'WEBSITE').toUpperCase();

    const newResource = await Resource.create({
      url,
      normalizedUrl,
      domain,
      title: title.trim(),
      description: (description || '').trim(),
      category: catObj._id,
      tags: processedTags,
      resourceType: finalType,
      embedType: embedInfo.embedType,
      embedUrl: embedInfo.embedUrl,
      thumbnail: thumbnail || '',
      submittedBy: req.user ? req.user._id : null
    });

    const populated = await Resource.findById(newResource._id)
      .populate('category', 'name slug icon')
      .populate('submittedBy', 'username avatar');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete resource (Owner or Admin)
// @route   DELETE /api/resources/:id
// @access  Private
export const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Check ownership or admin role
    const isOwner = req.user && resource.submittedBy && resource.submittedBy.toString() === req.user._id.toString();
    const isAdmin = req.user && (req.user.role === 'ADMIN' || req.user.role === 'MODERATOR');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource' });
    }

    await resource.deleteOne();

    res.json({ success: true, message: 'Resource successfully deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Save/Bookmark a resource
// @route   POST /api/resources/:id/save
// @access  Private
export const saveResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.savedResources.includes(resource._id)) {
      return res.status(400).json({ success: false, message: 'Resource already saved in your bookmarks' });
    }

    user.savedResources.push(resource._id);
    await user.save();

    resource.saves += 1;
    await resource.save();

    res.json({ success: true, message: 'Resource saved to bookmarks', saves: resource.saves });
  } catch (err) {
    next(err);
  }
};

// @desc    Unsave/Remove bookmark
// @route   DELETE /api/resources/:id/save
// @access  Private
export const unsaveResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    const user = await User.findById(req.user.id);

    user.savedResources = user.savedResources.filter(
      id => id.toString() !== req.params.id
    );
    await user.save();

    if (resource && resource.saves > 0) {
      resource.saves -= 1;
      await resource.save();
    }

    res.json({ success: true, message: 'Resource removed from bookmarks' });
  } catch (err) {
    next(err);
  }
};

// @desc    Report an inappropriate or broken link
// @route   POST /api/resources/:id/report
// @access  Public (Optional Auth)
export const reportResource = async (req, res, next) => {
  try {
    const { reason, description } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Please select a reason for reporting' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    await Report.create({
      resourceId: resource._id,
      reporterId: req.user ? req.user._id : null,
      reason,
      description: description || ''
    });

    resource.reportsCount += 1;
    if (resource.reportsCount >= 5) {
      resource.status = 'PENDING'; // send to moderation queue if high report count
    }
    await resource.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Thank you for keeping the platform safe.'
    });
  } catch (err) {
    next(err);
  }
};

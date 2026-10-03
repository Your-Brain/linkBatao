import axios from 'axios';
import crypto from 'crypto';
import Resource from '../models/Resource.js';
import ResourceView from '../models/ResourceView.js';
import Category from '../models/Category.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { normalizeUrl } from '../utils/urlNormalizer.js';
import { detectEmbed } from '../utils/embedDetector.js';
import { fetchUrlMetadata, isPrivateHost, upgradeThumbnailQuality } from '../utils/metadataFetcher.js';

// @desc    Get resources with filtering, sorting & pagination
// @route   GET /api/resources
// @access  Public
export const getResources = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    const query = { status: 'APPROVED' };

    // Incognito / NSFW Filtering
    const includeNsfw = req.query.includeNsfw === 'true' || req.query.nsfw === 'true';
    const nsfwOnly = req.query.nsfwOnly === 'true';

    const sexCat = await Category.findOne({ slug: 'sex' }).lean();
    const sexCatId = sexCat ? sexCat._id : null;

    if (nsfwOnly) {
      if (sexCatId) {
        query.$or = [{ isNsfw: true }, { category: sexCatId }];
      } else {
        query.isNsfw = true;
      }
    } else if (!includeNsfw) {
      query.isNsfw = { $ne: true };
      if (sexCatId && !req.query.category) {
        query.category = { $ne: sexCatId };
      }
    }

    // Category Filter
    if (req.query.category) {
      if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = req.query.category;
      } else {
        const cat = await Category.findOne({ slug: req.query.category.toLowerCase() }).lean();
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
      .select('-content')
      .populate('category', 'name slug icon')
      .populate('submittedBy', 'username avatar')
      .sort(sort)
      .skip(startIndex)
      .limit(limit)
      .lean();

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

// @desc    Get single resource by ID & track unique view count
// @route   GET /api/resources/:id
// @access  Public (Optional Auth)
export const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('category', 'name slug icon description')
      .populate('submittedBy', 'username avatar bio');

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Determine unique viewer identifier (User ID if logged in, or hashed IP + User-Agent fingerprint)
    let viewerIdentifier = '';
    if (req.user && req.user._id) {
      viewerIdentifier = `user_${req.user._id}`;
    } else {
      const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim();
      const userAgent = req.headers['user-agent'] || 'unknown';
      const rawString = `${clientIp}_${userAgent}`;
      viewerIdentifier = `anon_${crypto.createHash('sha256').update(rawString).digest('hex')}`;
    }

    // Deduplicate view count: only increment if viewer has not viewed within the 24-hour window
    try {
      // If viewer already viewed this resource in last 24h, this throws E11000 duplicate key error
      const isNewView = await ResourceView.create({
        resource: resource._id,
        viewerIdentifier
      });

      if (isNewView) {
        resource.views += 1;
        await resource.save();
      }
    } catch (viewErr) {
      // E11000 duplicate key error means user already viewed in last 24h -> view count remains unchanged (real unique count)
      if (viewErr.code !== 11000) {
        console.warn('View tracking notice:', viewErr.message);
      }
    }

    // Smart related resources powered by category, tags & engagement
    const isIncognito = req.query.includeNsfw === 'true' || resource.isNsfw;
    const relatedQuery = {
      _id: { $ne: resource._id },
      status: 'APPROVED'
    };

    if (!isIncognito) {
      relatedQuery.isNsfw = false;
      const sexCat = await Category.findOne({ slug: 'sex' }).lean();
      if (sexCat) relatedQuery.category = { $ne: sexCat._id };
    }

    const candidatePool = await Resource.find(relatedQuery)
      .select('-content')
      .populate('category', 'name slug icon')
      .populate('submittedBy', 'username avatar')
      .limit(30)
      .lean();

    const targetTags = (resource.tags || []).map(t => t.toLowerCase());
    const targetCatId = resource.category?._id?.toString();

    const scoredRelated = candidatePool.map(item => {
      let score = 0;
      if (targetCatId && item.category?._id?.toString() === targetCatId) score += 35;
      if (targetTags.length > 0 && item.tags?.length > 0) {
        const itemTags = new Set(item.tags.map(t => t.toLowerCase()));
        targetTags.forEach(t => { if (itemTags.has(t)) score += 20; });
      }
      score += Math.log10((item.views || 0) + 1) * 4 + (item.savesCount || 0) * 5;
      return { item, score };
    });

    scoredRelated.sort((a, b) => b.score - a.score);
    const related = scoredRelated.slice(0, 8).map(s => s.item);

    res.json({
      success: true,
      data: resource,
      related
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Smart multi-factor recommendations based on tags, category & engagement
// @route   GET /api/resources/recommendations
// @access  Public
export const getRecommendations = async (req, res, next) => {
  try {
    const { resourceId, category, tags, limit = 10, includeNsfw } = req.query;
    const isIncognito = includeNsfw === 'true';
    const maxResults = Math.min(parseInt(limit, 10) || 10, 25);

    const baseQuery = { status: 'APPROVED' };

    if (resourceId && resourceId.match(/^[0-9a-fA-F]{24}$/)) {
      baseQuery._id = { $ne: resourceId };
    }

    if (!isIncognito) {
      baseQuery.isNsfw = false;
      const sexCat = await Category.findOne({ slug: 'sex' }).lean();
      if (sexCat) {
        baseQuery.category = { $ne: sexCat._id };
      }
    }

    let targetTags = [];
    if (tags) {
      targetTags = Array.isArray(tags)
        ? tags.map(t => String(t).toLowerCase().trim())
        : String(tags).split(',').map(t => t.toLowerCase().trim()).filter(Boolean);
    }

    let targetCategory = category || null;
    if (resourceId && (!targetTags.length || !targetCategory)) {
      const source = await Resource.findById(resourceId).lean();
      if (source) {
        if (!targetTags.length && source.tags?.length) {
          targetTags = source.tags.map(t => t.toLowerCase());
        }
        if (!targetCategory && source.category) {
          targetCategory = source.category.toString();
        }
      }
    }

    let targetCategoryId = null;
    if (targetCategory) {
      if (targetCategory.match(/^[0-9a-fA-F]{24}$/)) {
        targetCategoryId = targetCategory;
      } else {
        const cat = await Category.findOne({ slug: targetCategory.toLowerCase() }).lean();
        if (cat) targetCategoryId = cat._id.toString();
      }
    }

    const candidates = await Resource.find(baseQuery)
      .select('-content')
      .populate('category', 'name slug icon')
      .populate('submittedBy', 'username avatar')
      .sort({ views: -1, createdAt: -1 })
      .limit(50)
      .lean();

    if (!candidates || candidates.length === 0) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const scored = candidates.map(item => {
      let score = 0;

      // 1. Tag overlap (+25 per matching tag)
      if (targetTags.length > 0 && item.tags?.length > 0) {
        const itemTagSet = new Set(item.tags.map(t => t.toLowerCase()));
        let overlap = 0;
        targetTags.forEach(t => {
          if (itemTagSet.has(t)) overlap += 1;
        });
        score += overlap * 25;
      }

      // 2. Category Affinity (+35)
      if (targetCategoryId && item.category?._id?.toString() === targetCategoryId) {
        score += 35;
      }

      // 3. Popularity & Engagement
      const views = item.views || 0;
      const saves = item.savesCount || 0;
      const upvotes = item.upvotes || 0;
      score += Math.log10(views + 1) * 6 + saves * 8 + upvotes * 4;

      // 4. Quality Thumbnail Boost
      if (item.thumbnail && !item.thumbnail.includes('google.com/s2/favicons')) {
        score += 15;
      }

      // 5. Freshness boost
      const ageInDays = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays < 3) {
        score += 12;
      } else if (ageInDays < 7) {
        score += 6;
      }

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Diversity check: cap same domain to 2 max
    const domainCounts = {};
    const finalResults = [];

    for (const entry of scored) {
      const dom = entry.item.domain || 'other';
      domainCounts[dom] = (domainCounts[dom] || 0) + 1;
      if (domainCounts[dom] <= 2 || scored.length <= maxResults) {
        finalResults.push(entry.item);
      }
      if (finalResults.length >= maxResults) break;
    }

    res.json({
      success: true,
      count: finalResults.length,
      data: finalResults
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
    const embedInfo = detectEmbed(normalizedUrl);

    // Fetch safe Open Graph metadata
    const fetchedMeta = await fetchUrlMetadata(normalizedUrl);

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
        resourceType: embedInfo.resourceType || fetchedMeta.resourceType,
        isNsfw: fetchedMeta.isNsfw || false
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit a new link or text post (Anonymous or Authenticated)
// @route   POST /api/resources
// @access  Public (Optional Auth)
export const createResource = async (req, res, next) => {
  try {
    const { url, title, description, content, category, tags, resourceType, thumbnail, isNsfw, isTextPost } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a title' });
    }

    const hasTextContent = Boolean((content && content.trim()) || (description && description.trim()));
    const isPureText = Boolean(isTextPost || (!url && hasTextContent) || (resourceType === 'ARTICLE' && !url));

    let finalUrl = (url || '').trim();
    if (!finalUrl) {
      if (hasTextContent) {
        // Generate unique internal permalink for native text/blog post
        const randomSlug = crypto.randomBytes(6).toString('hex');
        finalUrl = `https://auralink.app/article/${randomSlug}`;
      } else {
        return res.status(400).json({ success: false, message: 'Please provide either a valid link or article/note text' });
      }
    }

    const { normalizedUrl, domain } = normalizeUrl(finalUrl);

    // Check duplicate
    const existing = await Resource.findOne({ normalizedUrl });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This link or article has already been submitted to the platform.',
        existingId: existing._id
      });
    }

    // Verify category exists or resolve fallback
    let catObj;
    if (category && String(category).match(/^[0-9a-fA-F]{24}$/)) {
      catObj = await Category.findById(category);
    }

    if (!catObj && category) {
      const cleanCat = String(category).replace(/^cat-/, '').toLowerCase();
      catObj = await Category.findOne({
        $or: [
          { slug: cleanCat },
          { name: new RegExp(`^${cleanCat}$`, 'i') }
        ]
      });
    }

    if (!catObj) {
      catObj = await Category.findOne({ isActive: true });
    }

    if (!catObj) {
      catObj = await Category.create({
        name: 'Technology',
        slug: 'technology',
        description: 'Technology & software links',
        icon: 'Cpu'
      });
    }

    // Detect Embed Type
    const embedInfo = isPureText ? { embedType: 'NONE', embedUrl: '', resourceType: 'ARTICLE' } : detectEmbed(finalUrl);

    // Parse tags into clean array
    let processedTags = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map(t => t.trim().toLowerCase()).filter(Boolean);
    } else if (typeof tags === 'string') {
      processedTags = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    }

    // Determine Resource Type
    const finalType = (resourceType || (isPureText ? 'ARTICLE' : (embedInfo.resourceType || 'WEBSITE'))).toUpperCase();

    // Auto-detect NSFW if category is sex or tags contain adult keywords
    const isAdultCategory = catObj && (catObj.slug === 'sex' || catObj.name.toLowerCase() === 'sex');
    const hasNsfwTags = processedTags.some(t => ['nsfw', 'adult', '18+', 'xxx', 'porn', 'erotic', 'sex'].includes(t.toLowerCase()));
    const finalIsNsfw = Boolean(isNsfw || isAdultCategory || hasNsfwTags);

    let finalThumbnail = (thumbnail || '').trim();
    if (!finalThumbnail && !isPureText && finalUrl) {
      try {
        const meta = await fetchUrlMetadata(finalUrl);
        if (meta && meta.thumbnail) {
          finalThumbnail = meta.thumbnail;
        }
      } catch (e) { }
    }

    const newResource = await Resource.create({
      url: finalUrl,
      normalizedUrl,
      domain,
      title: title.trim(),
      description: (description || '').trim(),
      content: (content || (isPureText ? description : '') || '').trim(),
      isTextPost: isPureText,
      category: catObj._id,
      tags: processedTags,
      resourceType: finalType,
      isNsfw: finalIsNsfw,
      embedType: embedInfo.embedType,
      embedUrl: embedInfo.embedUrl,
      thumbnail: finalThumbnail,
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

// @desc    Update resource (Owner or Admin)
// @route   PUT /api/resources/:id
// @access  Private
export const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const isOwner = req.user && resource.submittedBy && resource.submittedBy.toString() === req.user._id.toString();
    const isAdmin = req.user && (req.user.role === 'ADMIN' || req.user.role === 'MODERATOR');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this resource' });
    }

    const { title, description, content, url, category, tags, resourceType, thumbnail, status, isNsfw } = req.body;

    if (title) resource.title = title.trim();
    if (description !== undefined) resource.description = description.trim();
    if (content !== undefined) resource.content = content.trim();
    if (thumbnail !== undefined) resource.thumbnail = thumbnail;
    if (isNsfw !== undefined) resource.isNsfw = Boolean(isNsfw);

    if (url) {
      const { normalizedUrl, domain } = normalizeUrl(url);
      const embedInfo = detectEmbed(url);
      resource.url = url;
      resource.normalizedUrl = normalizedUrl;
      resource.domain = domain;
      resource.embedType = embedInfo.embedType;
      resource.embedUrl = embedInfo.embedUrl;
    }

    if (category) {
      resource.category = category;
    }

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        resource.tags = tags.map(t => t.trim().toLowerCase()).filter(Boolean);
      } else if (typeof tags === 'string') {
        resource.tags = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      }
    }

    if (resourceType) {
      resource.resourceType = resourceType.toUpperCase();
    }

    if (isAdmin && status && ['APPROVED', 'PENDING', 'REJECTED', 'REMOVED'].includes(status)) {
      resource.status = status;
    }

    await resource.save();

    const updated = await Resource.findById(resource._id)
      .populate('category', 'name slug icon')
      .populate('submittedBy', 'username avatar');

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: updated
    });
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
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const alreadySaved = (user.savedResources || []).some(
      (id) => id.toString() === resource._id.toString()
    );

    if (alreadySaved) {
      return res.status(400).json({ success: false, message: 'Resource already saved in your bookmarks' });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { savedResources: resource._id }
    });

    const updatedResource = await Resource.findByIdAndUpdate(
      resource._id,
      { $inc: { saves: 1 } },
      { new: true }
    );

    res.json({ success: true, message: 'Resource saved to bookmarks', saves: updatedResource?.saves || resource.saves + 1 });
  } catch (err) {
    next(err);
  }
};

// @desc    Unsave/Remove bookmark
// @route   DELETE /api/resources/:id/save
// @access  Private
export const unsaveResource = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { savedResources: req.params.id }
    });

    const resource = await Resource.findById(req.params.id);
    if (resource && resource.saves > 0) {
      await Resource.findByIdAndUpdate(req.params.id, { $inc: { saves: -1 } });
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

// @desc    Safe Image Proxy to bypass CDN hotlink protection & CORS blocks
// @route   GET /api/resources/proxy-image
// @access  Public
export const proxyImage = async (req, res) => {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl) {
      return res.status(400).send('Image URL parameter is required');
    }

    let decoded = decodeURIComponent(rawUrl).trim();
    // Upgrade resolution if low-res thumb was passed
    decoded = upgradeThumbnailQuality(decoded);

    let parsed;
    try {
      parsed = new URL(decoded);
    } catch (e) {
      return res.status(400).send('Malformed image URL');
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return res.status(400).send('Invalid image protocol');
    }

    if (isPrivateHost(parsed.hostname)) {
      return res.status(403).send('Private network access is forbidden');
    }

    // Determine upstream referer that passes CDN anti-hotlinking
    let referer = `${parsed.protocol}//${parsed.hostname}/`;
    const h = parsed.hostname.toLowerCase();
    if (h.includes('phncdn.com') || h.includes('pornhub')) {
      referer = 'https://www.pornhub.com/';
    } else if (h.includes('xhcdn.com') || h.includes('xhamster') || h.includes('xhpiccdn') || h.includes('xhpingcdn')) {
      referer = 'https://xhamster.com/';
    } else if (h.includes('xvideos') || h.includes('xv-cdn')) {
      referer = 'https://www.xvideos.com/';
    } else if (h.includes('xnxx')) {
      referer = 'https://www.xnxx.com/';
    } else if (h.includes('spankbang') || h.includes('sb-cdn')) {
      referer = 'https://spankbang.com/';
    }

    const requestHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Referer': referer,
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    };

    let upstreamRes;
    try {
      upstreamRes = await axios.get(decoded, {
        responseType: 'stream',
        timeout: 9000,
        headers: requestHeaders
      });
    } catch (firstErr) {
      // If failed and URL had query params (e.g. expired hdnea/token), retry with clean URL without query
      if (parsed.search) {
        try {
          const cleanUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
          upstreamRes = await axios.get(cleanUrl, {
            responseType: 'stream',
            timeout: 9000,
            headers: requestHeaders
          });
        } catch (retryErr) {
          throw firstErr;
        }
      } else {
        throw firstErr;
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-Type', upstreamRes.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    upstreamRes.data.pipe(res);
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.status(502).send('Error streaming upstream image');
  }
};

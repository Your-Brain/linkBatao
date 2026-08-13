import Collection from '../models/Collection.js';

// @desc    Create a new bookmark collection
// @route   POST /api/collections
// @access  Private
export const createCollection = async (req, res, next) => {
  try {
    const { name, description, visibility, items } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Collection name is required' });
    }

    const collection = await Collection.create({
      ownerId: req.user.id,
      name: name.trim(),
      description: (description || '').trim(),
      visibility: visibility || 'PUBLIC',
      items: Array.isArray(items) ? items : []
    });

    res.status(201).json({
      success: true,
      data: collection
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's collections or public collections
// @route   GET /api/collections
// @access  Public (Optional Auth)
export const getCollections = async (req, res, next) => {
  try {
    let query = { visibility: 'PUBLIC' };
    if (req.user) {
      query = {
        $or: [{ visibility: 'PUBLIC' }, { ownerId: req.user.id }]
      };
    }

    const collections = await Collection.find(query)
      .populate('ownerId', 'username avatar')
      .populate({
        path: 'items',
        select: 'title thumbnail domain resourceType',
        populate: { path: 'category', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: collections.length,
      data: collections
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single collection by ID
// @route   GET /api/collections/:id
// @access  Public (Optional Auth)
export const getCollectionById = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('ownerId', 'username avatar bio')
      .populate({
        path: 'items',
        populate: [{ path: 'category', select: 'name slug icon' }, { path: 'submittedBy', select: 'username avatar' }]
      });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (collection.visibility === 'PRIVATE' && (!req.user || req.user.id !== collection.ownerId._id.toString())) {
      return res.status(403).json({ success: false, message: 'This collection is private' });
    }

    res.json({
      success: true,
      data: collection
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update collection or add/remove items
// @route   PUT /api/collections/:id
// @access  Private
export const updateCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (collection.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this collection' });
    }

    const { name, description, visibility, items } = req.body;
    if (name) collection.name = name.trim();
    if (description !== undefined) collection.description = description.trim();
    if (visibility) collection.visibility = visibility;
    if (Array.isArray(items)) collection.items = items;

    await collection.save();

    res.json({
      success: true,
      data: collection
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private
export const deleteCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (collection.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this collection' });
    }

    await collection.deleteOne();

    res.json({ success: true, message: 'Collection deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a resource item to collection
// @route   POST /api/collections/:id/items
// @access  Private
export const addItemToCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (collection.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this collection' });
    }

    const { resourceId } = req.body;
    if (!resourceId) {
      return res.status(400).json({ success: false, message: 'Resource ID is required' });
    }

    const itemExists = collection.items.some(item => item.toString() === resourceId);
    if (!itemExists) {
      collection.items.push(resourceId);
      await collection.save();
    }

    res.json({
      success: true,
      message: 'Item added to collection',
      data: collection
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove a resource item from collection
// @route   DELETE /api/collections/:id/items/:resourceId
// @access  Private
export const removeItemFromCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    if (collection.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this collection' });
    }

    const { resourceId } = req.params;
    collection.items = collection.items.filter(item => item.toString() !== resourceId);
    await collection.save();

    res.json({
      success: true,
      message: 'Item removed from collection',
      data: collection
    });
  } catch (err) {
    next(err);
  }
};


import express from 'express';
import {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  addItemToCollection,
  removeItemFromCollection
} from '../controllers/collectionController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(optionalAuth, getCollections)
  .post(protect, createCollection);

router.route('/:id')
  .get(optionalAuth, getCollectionById)
  .put(protect, updateCollection)
  .delete(protect, deleteCollection);

router.route('/:id/items')
  .post(protect, addItemToCollection);

router.route('/:id/items/:resourceId')
  .delete(protect, removeItemFromCollection);

export default router;


import express from 'express';
import {
  getResources,
  getResourceById,
  previewMetadata,
  createResource,
  updateResource,
  deleteResource,
  saveResource,
  unsaveResource,
  reportResource
} from '../controllers/resourceController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getResources);
router.post('/metadata-preview', previewMetadata);
router.post('/', optionalAuth, createResource);

router.get('/:id', getResourceById);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);

router.post('/:id/save', protect, saveResource);
router.delete('/:id/save', protect, unsaveResource);

router.post('/:id/report', optionalAuth, reportResource);

export default router;

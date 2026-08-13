import express from 'express';
import {
  getPendingReports,
  resolveReport,
  getPendingResources,
  updateResourceStatus,
  getUsers,
  updateUserRole,
  getStats
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protect & authorize to all admin routes
router.use(protect);
router.use(authorize('ADMIN', 'MODERATOR'));

router.get('/stats', getStats);
router.get('/reports', getPendingReports);
router.patch('/reports/:id', resolveReport);

router.get('/resources/pending', getPendingResources);
router.patch('/resources/:id', updateResourceStatus);

router.get('/users', authorize('ADMIN'), getUsers);
router.patch('/users/:id/role', authorize('ADMIN'), updateUserRole);

export default router;

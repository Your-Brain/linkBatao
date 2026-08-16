import express from 'express';
import {
  getPendingReports,
  resolveReport,
  getPendingResources,
  updateResourceStatus,
  getAllResourcesAdmin,
  deleteResourceAdmin,
  getUsers,
  updateUserRole,
  toggleBanUser,
  deleteUserAdmin,
  getStats
} from '../controllers/adminController.js';
import { updatePolicy } from '../controllers/policyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protect & authorize to all admin routes
router.use(protect);
router.use(authorize('ADMIN', 'MODERATOR'));

router.get('/stats', getStats);
router.get('/reports', getPendingReports);
router.patch('/reports/:id', resolveReport);

router.get('/resources/pending', getPendingResources);
router.get('/resources/all', getAllResourcesAdmin);
router.patch('/resources/:id', updateResourceStatus);
router.delete('/resources/:id', deleteResourceAdmin);

// Dynamic Policy Management
router.put('/policies/:key', updatePolicy);

router.get('/users', authorize('ADMIN'), getUsers);
router.patch('/users/:id/role', authorize('ADMIN'), updateUserRole);
router.patch('/users/:id/ban', authorize('ADMIN'), toggleBanUser);
router.delete('/users/:id', authorize('ADMIN'), deleteUserAdmin);

export default router;

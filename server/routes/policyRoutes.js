import express from 'express';
import { getPolicy } from '../controllers/policyController.js';

const router = express.Router();

// Public policy routes
router.get('/:key', getPolicy);

export default router;

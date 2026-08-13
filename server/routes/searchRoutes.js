import express from 'express';
import { search, getTags } from '../controllers/searchController.js';

const router = express.Router();

router.get('/', search);
router.get('/tags', getTags);

export default router;

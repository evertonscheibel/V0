import express from 'express';
import { getAssetTimeline, createHistoryEvent } from '../controllers/assetHistoryController.js';

const router = express.Router();

router.get('/assets/:id/timeline', getAssetTimeline);
router.post('/history', createHistoryEvent);

export default router;

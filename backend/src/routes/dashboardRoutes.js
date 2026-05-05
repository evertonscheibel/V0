import express from 'express';
import {
    getDashboardKPIs,
    getRecentActivity
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/kpis', protect, getDashboardKPIs);
router.get('/recent-activity', protect, getRecentActivity);

export default router;

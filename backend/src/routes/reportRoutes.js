import express from 'express';
import {
    getReports,
    getReport,
    generateReport,
    deleteReport
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin', 'tecnico'), getReports);

router.post('/generate', protect, authorize('admin', 'tecnico'), generateReport);

router.route('/:id')
    .get(protect, authorize('admin', 'tecnico'), getReport)
    .delete(protect, authorize('admin'), deleteReport);

export default router;

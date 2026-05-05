import express from 'express';
import multer from 'multer';
import {
    getAssets,
    getAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    exportAssets,
    importAssets
} from '../controllers/assetController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configurar multer para upload em memória
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
    .get(protect, getAssets)
    .post(protect, authorize('admin', 'tecnico'), createAsset);

router.get('/export/excel', protect, authorize('admin', 'tecnico'), exportAssets);
router.post('/import/excel', protect, authorize('admin', 'tecnico'), upload.single('file'), importAssets);

router.route('/:id')
    .get(protect, getAsset)
    .put(protect, authorize('admin', 'tecnico'), updateAsset)
    .delete(protect, authorize('admin'), deleteAsset);

export default router;


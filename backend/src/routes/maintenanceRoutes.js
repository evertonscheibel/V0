import express from 'express';
import { createMaintenance, getMaintenanceByAsset, updateMaintenance, getAllMaintenance } from '../controllers/maintenanceController.js';

const router = express.Router();

router.post('/', createMaintenance);
router.get('/', getAllMaintenance);
router.get('/asset/:assetId', getMaintenanceByAsset);
router.put('/:id', updateMaintenance);

export default router;

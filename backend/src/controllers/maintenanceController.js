import Maintenance from '../models/Maintenance.js';
import Asset from '../models/Asset.js';
import AssetHistory from '../models/AssetHistory.js';

export const createMaintenance = async (req, res) => {
    try {
        const maintenance = new Maintenance(req.body);
        await maintenance.save();

        // Create history event
        const historyId = Date.now();
        const history = new AssetHistory({
            id: historyId,
            assetId: maintenance.assetId,
            eventType: 'Manutenção Iniciada',
            description: `${maintenance.type}: ${maintenance.reason || 'Sem descrição'}`,
            relatedId: maintenance.id,
            metadata: { maintenanceType: maintenance.type }
        });
        await history.save();

        res.status(201).json(maintenance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getMaintenanceByAsset = async (req, res) => {
    try {
        const { assetId } = req.params;
        const maintenance = await Maintenance.find({ assetId: Number(assetId) }).sort({ dateOut: -1 });
        res.json(maintenance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateMaintenance = async (req, res) => {
    try {
        const { id } = req.params;
        const maintenance = await Maintenance.findOneAndUpdate({ id: Number(id) }, req.body, { new: true });
        if (!maintenance) return res.status(404).json({ message: 'Manutenção não encontrada' });

        // If closing maintenance, create history event
        if (req.body.status === 'CLOSED' && req.body.dateReturn) {
            const historyId = Date.now() + 1;
            const history = new AssetHistory({
                id: historyId,
                assetId: maintenance.assetId,
                eventType: 'Manutenção Concluída',
                description: `Concluída: ${maintenance.solution || 'Sem solução registrada'}`,
                relatedId: maintenance.id,
                metadata: { cost: maintenance.cost }
            });
            await history.save();
        }

        res.json(maintenance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllMaintenance = async (req, res) => {
    try {
        const maintenance = await Maintenance.find().sort({ dateOut: -1 });
        res.json(maintenance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

import AssetHistory from '../models/AssetHistory.js';

export const getAssetTimeline = async (req, res) => {
    try {
        const { id } = req.params;
        const timeline = await AssetHistory.find({ assetId: Number(id) }).sort({ eventDate: -1 });
        res.json(timeline);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createHistoryEvent = async (req, res) => {
    try {
        const history = new AssetHistory(req.body);
        await history.save();
        res.status(201).json(history);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

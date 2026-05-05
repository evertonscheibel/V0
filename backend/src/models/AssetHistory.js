import mongoose from 'mongoose';

const assetHistorySchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    assetId: {
        type: Number,
        required: true,
        ref: 'Asset'
    },
    eventType: {
        type: String,
        enum: ['Criação', 'Manutenção Iniciada', 'Manutenção Concluída', 'Mudança de Status', 'Ticket Vinculado', 'Atualização', 'Outro'],
        required: true
    },
    eventDate: {
        type: Date,
        default: Date.now
    },
    description: String,
    userId: String,
    relatedId: Number, // ID do ticket ou manutenção relacionado
    metadata: mongoose.Schema.Types.Mixed // Dados adicionais flexíveis
}, {
    timestamps: true
});

const AssetHistory = mongoose.model('AssetHistory', assetHistorySchema);

export default AssetHistory;

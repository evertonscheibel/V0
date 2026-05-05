import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
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
    type: {
        type: String,
        enum: ['Troca de Peça', 'Limpeza', 'Atualização', 'Revisão Técnica', 'Reparo', 'Outro'],
        default: 'Outro'
    },
    os: String,
    provider: String,
    technician: String,
    dateOut: Date,
    reason: String,
    description: String,
    cost: {
        type: Number,
        default: 0
    },
    parts: [{
        name: String,
        quantity: Number,
        cost: Number
    }],
    dateReturn: Date,
    solution: String,
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'OPEN'
    }
}, {
    timestamps: true
});

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

export default Maintenance;

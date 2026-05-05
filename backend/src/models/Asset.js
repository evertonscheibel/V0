import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
    assetId: {
        type: String,
        required: [true, 'ID do ativo é obrigatório'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['notebook', 'desktop', 'monitor', 'impressora', 'servidor', 'rede', 'periferico', 'software', 'outro'],
        default: 'notebook'
    },
    brand: {
        type: String,
        trim: true
    },
    model: {
        type: String,
        trim: true
    },
    serialNumber: {
        type: String,
        trim: true
    },
    purchaseDate: {
        type: Date
    },
    warrantyExpiration: {
        type: Date
    },
    status: {
        type: String,
        enum: ['ativo', 'em_manutencao', 'disponivel', 'descartado', 'perdido'],
        default: 'disponivel'
    },
    location: {
        type: String,
        trim: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;

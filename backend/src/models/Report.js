import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Título é obrigatório'],
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['tickets', 'assets', 'certificates', 'users', 'kb', 'boletos', 'custom'],
        default: 'custom'
    },
    description: {
        type: String,
        trim: true
    },
    filters: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    format: {
        type: String,
        enum: ['excel', 'pdf', 'json'],
        default: 'excel'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    fileUrl: {
        type: String
    },
    recordCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Report = mongoose.model('Report', reportSchema);

export default Report;

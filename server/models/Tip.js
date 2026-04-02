const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
    streamer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, default: 'Anonymous' },
    amount: { type: Number, required: true },
    message: { type: String },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' }, // Simplified for now
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tip', tipSchema);

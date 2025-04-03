import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'answered', 'approved', 'rejected'],
        default: 'pending'
    },
    answer: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Question = mongoose.model('Question', questionSchema);
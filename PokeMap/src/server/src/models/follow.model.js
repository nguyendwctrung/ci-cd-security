import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    followedAt: {
        type: Date,
        default: Date.now
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    strict: false
});

export const Follow = mongoose.model('Follows', followSchema);

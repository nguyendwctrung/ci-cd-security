import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts'
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comments'
    },
    likedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    strict: false
});

export const Like = mongoose.model('likes', likeSchema);

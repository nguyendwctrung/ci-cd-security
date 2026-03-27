import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comments',
        default: null
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastEditedAt: {
        type: Date
    }
}, {
    timestamps: true,
    strict: false
});

// Index để tăng tốc độ query
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ user: 1 });

export const Comment = mongoose.model('Comments', commentSchema);

import mongoose from 'mongoose';

const postDeleteReasonSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts',
        required: true
    },
    reason: {
        type: String,
        enum: ['spam', 'harassment', 'inappropriate', 'copyright', 'other'],
        required: true
    },
    description: {
        type: String
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    deletedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    strict: false
});

const postWarningSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts',
        required: true
    },
    warningType: {
        type: String,
        enum: ['inappropriate', 'spam', 'misleading', 'violent', 'other'],
        required: true
    },
    description: {
        type: String
    },
    warningCount: {
        type: Number,
        default: 1
    },
    warnedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    warnedAt: {
        type: Date,
        default: Date.now
    },
    isResolved: {
        type: Boolean,
        default: false
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true,
    strict: false
});

export const PostDeleteReason = mongoose.model('Post_Delete_Reasons', postDeleteReasonSchema);
export const PostWarning = mongoose.model('Post_Warnings', postWarningSchema);

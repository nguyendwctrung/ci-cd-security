import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    // Người nhận thông báo
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    // Người thực hiện hành động
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    // Loại thông báo
    type: {
        type: String,
        enum: ['like_post', 'like_comment', 'reply_comment', 'comment_post'],
        required: true
    },
    // Post liên quan (nếu có)
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts'
    },
    // Comment liên quan (nếu có)
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comments'
    },
    // Đã đọc chưa
    isRead: {
        type: Boolean,
        default: false
    },
    // Nội dung preview (để hiển thị nhanh)
    contentPreview: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index để tăng tốc độ query
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export const Notification = mongoose.model('Notifications', notificationSchema);

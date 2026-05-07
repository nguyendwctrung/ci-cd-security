import { Notification } from '../models/notification.model.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';
import { sendNotificationToUser } from './socket.service.js';

export const createNotification = async ({
    recipientId,
    senderId,
    type,
    postId = null,
    commentId = null,
    contentPreview = ''
}) => {
    // Không tạo thông báo cho chính mình
    if (recipientId.toString() === senderId.toString()) {
        return null;
    }

    const notification = new Notification({
        recipient: recipientId,
        sender: senderId,
        type,
        post: postId,
        comment: commentId,
        contentPreview 
    });

    const savedNotification = await notification.save();
    
    // Lấy thông tin sender để gửi notification đầy đủ
    const sender = await User.findById(senderId).select('username profile.avatar');
    
    // Gửi notification real-time qua socket
    const notificationData = {
        _id: savedNotification._id,
        type: savedNotification.type,
        post: savedNotification.post,
        comment: savedNotification.comment,
        isRead: savedNotification.isRead,
        contentPreview: savedNotification.contentPreview,
        createdAt: savedNotification.createdAt,
        senderUsername: sender?.username,
        senderAvatar: sender?.profile?.avatar,
        senderId: senderId
    };
    
    sendNotificationToUser(recipientId, notificationData);
    
    return savedNotification;
};

export const getNotifications = async ({ userId, page = 1, limit = 20 }) => {
    const skip = (page - 1) * limit;

    const notifications = await Notification.aggregate([
        {
            $match: {
                recipient: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: 'users',
                localField: 'sender',
                foreignField: '_id',
                as: 'senderInfo'
            }
        },
        {
            $unwind: '$senderInfo'
        },
        {
            $lookup: {
                from: 'posts',
                localField: 'post',
                foreignField: '_id',
                as: 'postInfo'
            }
        },
        {
            $lookup: {
                from: 'comments',
                localField: 'comment',
                foreignField: '_id',
                as: 'commentInfo'
            }
        },
        {
            $addFields: {
                senderUsername: '$senderInfo.username',
                senderAvatar: '$senderInfo.profile.avatar',
                postContent: { $arrayElemAt: ['$postInfo.content', 0] },
                commentContent: { $arrayElemAt: ['$commentInfo.content', 0] }
            }
        },
        {
            $project: {
                _id: 1,
                type: 1,
                post: 1,
                comment: 1,
                isRead: 1,
                contentPreview: 1,
                createdAt: 1,
                senderUsername: 1,
                senderAvatar: 1,
                senderId: '$senderInfo._id',
                postContent: 1,
                commentContent: 1
            }
        }
    ]);

    const total = await Notification.countDocuments({
        recipient: new mongoose.Types.ObjectId(userId)
    });

    return {
        notifications,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};

export const getUnreadCount = async (userId) => {
    return await Notification.countDocuments({
        recipient: new mongoose.Types.ObjectId(userId),
        isRead: false
    });
};

export const markAsRead = async (notificationId, userId) => {
    return await Notification.findOneAndUpdate(
        {
            _id: notificationId,
            recipient: userId
        },
        { isRead: true },
        { new: true }
    );
};

export const markAllAsRead = async (userId) => {
    return await Notification.updateMany(
        {
            recipient: new mongoose.Types.ObjectId(userId),
            isRead: false
        },
        { isRead: true }
    );
};

// Xoá thông báo dựa trên các tham số 
export const deleteNotification = async ({
    senderId,
    recipientId,
    type,
    postId = null,
    commentId = null
}) => {
    const query = {
        sender: senderId,
        recipient: recipientId,
        type
    };

    if (postId) query.post = postId;
    if (commentId) query.comment = commentId;

    return await Notification.deleteOne(query);
};

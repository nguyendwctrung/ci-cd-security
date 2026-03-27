import { Comment } from '../models/comment.model.js';
import { User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';
import mongoose from 'mongoose';
import * as notificationService from './notification.service.js';

// Tạo comment mới cho post
export const createComment = async ({ postId, userId, content, images = [], parentCommentId = null }) => {
    // Validate post exists
    const post = await Post.findById(postId);
    if (!post) {
        throw new Error('Post not found');
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Nếu là reply, validate parent comment exists
    let parentComment = null;
    if (parentCommentId) {
        parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
            throw new Error('Parent comment not found');
        }
    }

    const comment = new Comment({
        post: postId,
        user: userId,
        content,
        images: images || [],
        parentComment: parentCommentId || null
    });

    const savedComment = await comment.save();

    // Tạo thông báo
    const contentPreview = content ? content.substring(0, 100) : '';
    
    if (parentCommentId && parentComment) {
        // Nếu là reply comment, thông báo cho chủ comment gốc
        await notificationService.createNotification({
            recipientId: parentComment.user,
            senderId: userId,
            type: 'reply_comment',
            postId: postId,
            commentId: savedComment._id,
            contentPreview
        });
    } else {
        // Nếu là comment post, thông báo cho chủ post
        await notificationService.createNotification({
            recipientId: post.user,
            senderId: userId,
            type: 'comment_post',
            postId: postId,
            commentId: savedComment._id,
            contentPreview
        });
    }

    return savedComment;
};

// Lấy tất cả comments của một post (kèm replies)
export const getPostComments = async ({ postId, page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit;

    // Lấy comments chính (không phải replies)
    const comments = await Comment.aggregate([
        {
            $match: {
                post: new mongoose.Types.ObjectId(postId),
                parentComment: null,
                isDeleted: { $ne: true }
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
                localField: 'user',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $unwind: '$userInfo'
        },
        {
            $lookup: {
                from: 'comments',
                let: { commentId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$parentComment', '$$commentId'] },
                            isDeleted: { $ne: true }
                        }
                    },
                    {
                        $sort: { createdAt: 1 }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'user',
                            foreignField: '_id',
                            as: 'userInfo'
                        }
                    },
                    {
                        $unwind: '$userInfo'
                    },
                    {
                        $project: {
                            _id: 1,
                            content: 1,
                            images: 1,
                            likedBy: 1,
                            createdAt: 1,
                            lastEditedAt: 1,
                            'userInfo.username': 1,
                            'userInfo._id': 1,
                            'userInfo.profile.avatar': 1
                        }
                    }
                ],
                as: 'replies'
            }
        },
        {
            $addFields: {
                replyCount: { $size: '$replies' }
            }
        },
        {
            $project: {
                _id: 1,
                content: 1,
                images: 1,
                likedBy: 1,
                createdAt: 1,
                lastEditedAt: 1,
                replyCount: 1,
                replies: 1,
                'userInfo.username': 1,
                'userInfo._id': 1,
                'userInfo.profile.avatar': 1
            }
        }
    ]);

    const total = await Comment.countDocuments({
        post: postId,
        parentComment: null,
        isDeleted: { $ne: true }
    });

    return {
        data: comments,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

// Lấy replies của một comment
export const getCommentReplies = async ({ commentId, page = 1, limit = 5 }) => {
    const skip = (page - 1) * limit;

    const replies = await Comment.aggregate([
        {
            $match: {
                parentComment: new mongoose.Types.ObjectId(commentId),
                isDeleted: { $ne: true }
            }
        },
        {
            $sort: { createdAt: 1 }
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
                localField: 'user',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $unwind: '$userInfo'
        },
        {
            $project: {
                _id: 1,
                content: 1,
                images: 1,
                likedBy: 1,
                createdAt: 1,
                lastEditedAt: 1,
                'userInfo.username': 1,
                'userInfo._id': 1,
                'userInfo.profile.avatar': 1
            }
        }
    ]);

    const total = await Comment.countDocuments({
        parentComment: commentId,
        isDeleted: { $ne: true }
    });

    return {
        data: replies,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

// Update comment
export const updateComment = async ({ commentId, userId, content, images = [] }) => {
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
        throw new Error('Comment not found');
    }

    if (comment.user.toString() !== userId.toString()) {
        throw new Error('You do not have permission to edit this comment');
    }

    comment.content = content;
    if (images && images.length > 0) {
        comment.images = images;
    }
    comment.lastEditedAt = new Date();

    return await comment.save();
};

// Delete comment (soft delete)
export const deleteComment = async ({ commentId, userId }) => {
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
        throw new Error('Comment not found');
    }

    if (comment.user.toString() !== userId.toString()) {
        throw new Error('You do not have permission to delete this comment');
    }

    comment.isDeleted = true;
    return await comment.save();
};

//Mỗi người chỉ được like 1 comment 1 lần
export const toggleLikeComment = async ({ commentId, userId }) => {
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new Error('Comment not found');
    }

    const userIdStr = userId.toString();
    const hasLiked = comment.likedBy.some(id => id.toString() === userIdStr);

    if (hasLiked) {
        // Unlike - remove user from likedBy
        comment.likedBy = comment.likedBy.filter(id => id.toString() !== userIdStr);
        
        // Xóa thông báo khi unlike
        await notificationService.deleteNotification({
            senderId: userId,
            recipientId: comment.user,
            type: 'like_comment',
            commentId: commentId
        });
    } else {
        // Like - add user to likedBy
        comment.likedBy.push(userId);
        
        // Tạo thông báo khi like comment
        const contentPreview = comment.content ? comment.content.substring(0, 100) : '';
        await notificationService.createNotification({
            recipientId: comment.user,
            senderId: userId,
            type: 'like_comment',
            postId: comment.post,
            commentId: commentId,
            contentPreview
        });
    }

    await comment.save();

    return {
        comment,
        liked: !hasLiked,
        likesCount: comment.likedBy.length
    };
};

// Get comment by ID (với full info)
export const getCommentById = async ({ commentId }) => {
    const comment = await Comment.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(commentId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        {
            $unwind: '$userInfo'
        },
        {
            $project: {
                _id: 1,
                post: 1,
                content: 1,
                images: 1,
                likedBy: 1,
                parentComment: 1,
                createdAt: 1,
                lastEditedAt: 1,
                'userInfo.username': 1,
                'userInfo._id': 1,
                'userInfo.profile.avatar': 1
            }
        }
    ]);

    return comment[0] || null;
};
export function likeComment(arg0) {
    throw new Error("Function not implemented.");
}


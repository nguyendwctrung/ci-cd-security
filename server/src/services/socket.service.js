import * as commentService from './comment.service.js';

// Store io instance globally để các service khác có thể sử dụng
let ioInstance = null;

export function getIO() {
    return ioInstance;
}

// Store user socket mappings (userId -> socketId)
const userSockets = new Map();

export function getUserSocketId(userId) {
    return userSockets.get(userId.toString());
}

export function initSocket(io) {
    ioInstance = io;
    
    io.on("connection", (socket) => {
        // User joins post room để nhận real-time updates
        socket.on("join_post", (postId) => {
            socket.join(`post_${postId}`);
        });

        // User leaves post room
        socket.on("leave_post", (postId) => {
            socket.leave(`post_${postId}`);
        });
        
        // User đăng ký nhận notification
        socket.on("register_user", (userId) => {
            if (userId) {
                userSockets.set(userId.toString(), socket.id);
                socket.join(`user_${userId}`);
                console.log(`User ${userId} registered for notifications`);
            }
        });
        
        // User unregister (khi logout)
        socket.on("unregister_user", (userId) => {
            if (userId) {
                userSockets.delete(userId.toString());
                socket.leave(`user_${userId}`);
            }
        });

        // Comment mới được tạo
        socket.on("new_comment", async (data) => {
            try {
                const { postId, userId, content, images, parentCommentId } = data;

                // Lưu comment vào database
                const comment = await commentService.createComment({
                    postId,
                    userId,
                    content,
                    images: images || [],
                    parentCommentId: parentCommentId || null
                });

                // Lấy full comment info
                const populatedComment = await commentService.getCommentById({
                    commentId: comment._id
                });

                // Broadcast comment mới tới tất cả clients trong post room
                io.to(`post_${postId}`).emit("comment_added", {
                    success: true,
                    data: populatedComment,
                    isReply: !!parentCommentId
                });

                // Emit comment count update (only for top-level comments, not replies)
                if (!parentCommentId) {
                    // Count all top-level comments (not replies) for this post
                    const Comment = (await import('../models/comment.model.js')).Comment;
                    const commentCount = await Comment.countDocuments({
                        post: postId,
                        parentComment: null,
                        isDeleted: { $ne: true }
                    });

                    // Broadcast comment count update to all clients in post room
                    io.to(`post_${postId}`).emit("comment_count_updated", {
                        postId,
                        commentCount
                    });
                }
            } catch (error) {
                socket.emit("comment_error", {
                    success: false,
                    message: error.message
                });
            }
        });

        // Update comment
        socket.on("update_comment", async (data) => {
            try {
                const { commentId, userId, content, images, postId } = data;

                const comment = await commentService.updateComment({
                    commentId,
                    userId,
                    content,
                    images: images || []
                });

                const populatedComment = await commentService.getCommentById({
                    commentId: comment._id
                });

                io.to(`post_${postId}`).emit("comment_updated", {
                    success: true,
                    data: populatedComment
                });
            } catch (error) {
                socket.emit("comment_error", {
                    success: false,
                    message: error.message
                });
            }
        });

        // Delete comment
        socket.on("delete_comment", async (data) => {
            try {
                const { commentId, userId, postId } = data;

                // Get comment before deleting to check if it's a top-level comment
                const Comment = (await import('../models/comment.model.js')).Comment;
                const comment = await Comment.findById(commentId);
                const isTopLevelComment = comment && !comment.parentComment;

                await commentService.deleteComment({
                    commentId,
                    userId
                });

                io.to(`post_${postId}`).emit("comment_deleted", {
                    success: true,
                    commentId: commentId
                });

                // Update comment count if it was a top-level comment
                if (isTopLevelComment) {
                    const commentCount = await Comment.countDocuments({
                        post: postId,
                        parentComment: null,
                        isDeleted: { $ne: true }
                    });

                    io.to(`post_${postId}`).emit("comment_count_updated", {
                        postId,
                        commentCount
                    });
                }
            } catch (error) {
                socket.emit("comment_error", {
                    success: false,
                    message: error.message
                });
            }
        });

        // Toggle like comment (like/unlike)
        socket.on("toggle_like_comment", async (data) => {
            try {
                const { commentId, postId, userId } = data;

                const result = await commentService.toggleLikeComment({
                    commentId,
                    userId
                });

                io.to(`post_${postId}`).emit("comment_like_toggled", {
                    success: true,
                    commentId: commentId,
                    likedBy: result.comment.likedBy,
                    likesCount: result.likesCount,
                    liked: result.liked
                });
            } catch (error) {
                socket.emit("comment_error", {
                    success: false,
                    message: error.message
                });
            }
        });

        socket.on("disconnect", () => {
            // Remove user from userSockets map
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
        })
    })
}

/**
 * Gửi notification real-time tới user
 */
export function sendNotificationToUser(userId, notification) {
    if (ioInstance) {
        ioInstance.to(`user_${userId}`).emit("new_notification", notification);
    }
}
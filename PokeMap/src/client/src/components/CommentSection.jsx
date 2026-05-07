import { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import './CommentSection.css';

export default function CommentSection({ postId, currentUserId }) {
    const { socket, isConnected } = useSocket();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    // Fetch comments khi component mount
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/post/${postId}/comments?page=1&limit=10`
                );
                const data = await response.json();
                setComments(data.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching comments:', error);
                setLoading(false);
            }
        };

        fetchComments();
    }, [postId]);

    // Lắng nghe socket events
    useEffect(() => {
        if (!socket || !isConnected) return;

        // Join post room
        socket.emit('join_post', postId);

        // Lắng nghe comment mới
        socket.on('comment_added', (data) => {
            if (data.success) {
                const newComment = data.data;

                // Kiểm tra nếu là reply (có parentComment)
                if (newComment.parentComment) {
                    // Thêm reply vào parent comment
                    setComments(prev => prev.map(comment => {
                        if (comment._id === newComment.parentComment) {
                            return {
                                ...comment,
                                replies: [...(comment.replies || []), newComment]
                            };
                        }
                        return comment;
                    }));
                } else {
                    // Thêm comment mới vào đầu danh sách
                    setComments(prev => [newComment, ...prev]);
                }
            }
        });

        // Lắng nghe comment được update
        socket.on('comment_updated', (data) => {
            if (data.success) {
                const updatedComment = data.data;
                setComments(prev =>
                    prev.map(c => {
                        if (c._id === updatedComment._id) {
                            return updatedComment;
                        }
                        // Kiểm tra trong replies
                        if (c.replies && c.replies.length > 0) {
                            return {
                                ...c,
                                replies: c.replies.map(r =>
                                    r._id === updatedComment._id ? updatedComment : r
                                )
                            };
                        }
                        return c;
                    })
                );
            }
        });

        // Lắng nghe comment bị xoá
        socket.on('comment_deleted', (data) => {
            if (data.success) {
                const { commentId } = data;
                setComments(prev => {
                    // Xoá comment chính
                    const filtered = prev.filter(c => c._id !== commentId);
                    // Xoá reply trong các comment
                    return filtered.map(c => {
                        if (c.replies && c.replies.length > 0) {
                            return {
                                ...c,
                                replies: c.replies.filter(r => r._id !== commentId)
                            };
                        }
                        return c;
                    });
                });
            }
        });

        // Lắng nghe toggle like comment
        socket.on('comment_like_toggled', (data) => {
            if (data.success) {
                const { commentId, likedBy } = data;
                setComments(prev =>
                    prev.map(c => {
                        if (c._id === commentId) {
                            return { ...c, likedBy };
                        }
                        // Cập nhật like trong replies
                        if (c.replies && c.replies.length > 0) {
                            return {
                                ...c,
                                replies: c.replies.map(r =>
                                    r._id === commentId ? { ...r, likedBy } : r
                                )
                            };
                        }
                        return c;
                    })
                );
            }
        });

        // Lắng nghe error
        socket.on('comment_error', (data) => {
            alert('Error: ' + data.message);
        });

        return () => {
            socket.off('comment_added');
            socket.off('comment_updated');
            socket.off('comment_deleted');
            socket.off('comment_like_toggled');
            socket.off('comment_error');
            socket.emit('leave_post', postId);
        };
    }, [socket, isConnected, postId]);

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedImages.length > 5) {
            alert('Tối đa 5 ảnh cho một comment');
            return;
        }

        setSelectedImages(prev => [...prev, ...files]);

        // Tạo preview
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImages(prev => [...prev, event.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImagesToCloudinary = async () => {
        if (selectedImages.length === 0) return [];

        setUploadingImages(true);

        try {
            const formData = new FormData();
            selectedImages.forEach(image => {
                formData.append('images', image);
            });

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/upload/upload-comment-images`,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            const data = await response.json();
            setUploadingImages(false);

            if (data.status === 'success' && data.data) {
                return data.data;
            } else {
                alert('Lỗi upload ảnh: ' + (data.message || 'Unknown error'));
                return [];
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Lỗi upload ảnh: ' + error.message);
            setUploadingImages(false);
            return [];
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !isConnected) return;

        let imageUrls = [];
        if (selectedImages.length > 0) {
            imageUrls = await uploadImagesToCloudinary();
        }

        socket.emit('new_comment', {
            postId,
            userId: currentUserId,
            content: newComment,
            parentCommentId: replyingTo,
            images: imageUrls
        });

        setNewComment('');
        setReplyingTo(null);
        setSelectedImages([]);
        setPreviewImages([]);
    };

    const handleDeleteComment = (commentId) => {
        if (window.confirm('Bạn chắc chắn muốn xoá comment này?')) {
            socket.emit('delete_comment', {
                commentId,
                userId: currentUserId,
                postId
            });
        }
    };

    const handleLikeComment = (commentId) => {
        socket.emit('toggle_like_comment', {
            commentId,
            postId,
            userId: currentUserId
        });
    };

    // Kiểm tra user đã like comment chưa
    const hasUserLiked = (likedBy) => {
        if (!likedBy || !Array.isArray(likedBy)) return false;
        return likedBy.some(id => id.toString() === currentUserId?.toString());
    };

    const handleReply = (commentId) => {
        setReplyingTo(commentId);
    };

    if (loading) {
        return <div className="comment-loading">Đang tải comments...</div>;
    }

    return (
        <div className="comment-section">
            <h3>Bình luận ({comments.length})</h3>

            {/* Input form - chỉ hiển thị khi đã sign in và socket connected */}
            {currentUserId && isConnected && (
                <form onSubmit={handleAddComment} className="comment-form">
                    <div className="comment-input-wrapper">
                        {replyingTo && (
                            <div className="reply-indicator">
                                Đang trả lời comment
                                <button
                                    type="button"
                                    className="cancel-reply"
                                    onClick={() => setReplyingTo(null)}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={replyingTo ? "Trả lời bình luận..." : "Viết bình luận..."}
                            rows="3"
                        />
                        <div className="comment-actions-bar">
                            <label className="image-upload-label">
                                📷 Ảnh
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    disabled={uploadingImages}
                                    className="hidden-file-input"
                                />
                            </label>
                            <button
                                type="submit"
                                disabled={!newComment.trim() || uploadingImages}
                            >
                                {uploadingImages ? 'Đang upload...' : 'Gửi'}
                            </button>
                        </div>

                        {/* Image preview */}
                        {previewImages.length > 0 && (
                            <div className="image-preview-container">
                                {previewImages.map((preview, index) => (
                                    <div key={index} className="preview-item">
                                        <img src={preview} alt={`preview-${index}`} />
                                        <button
                                            type="button"
                                            className="remove-image"
                                            onClick={() => handleRemoveImage(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </form>
            )}

            {/* Comments list */}
            <div className="comments-list">
                {comments.length === 0 ? (
                    <p className="no-comments">Chưa có bình luận nào</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment._id} className="comment-item">
                            <div className="comment-header">
                                <img
                                    src={comment.userInfo?.profile?.avatar || '/default-avatar.png'}
                                    alt={comment.userInfo?.username}
                                    className="comment-avatar"
                                />
                                <div className="comment-user-info">
                                    <strong>{comment.userInfo?.username}</strong>
                                    <span className="comment-date">
                                        {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>

                            <div className="comment-content">
                                {comment.content}
                            </div>

                            {comment.images && comment.images.length > 0 && (
                                <div className="comment-images">
                                    {comment.images.map((img, idx) => (
                                        <img key={idx} src={img} alt="comment-img" />
                                    ))}
                                </div>
                            )}

                            <div className="comment-actions">
                                <button
                                    className={`action-btn like-btn ${hasUserLiked(comment.likedBy) ? 'liked' : ''} ${!currentUserId ? 'disabled' : ''}`}
                                    onClick={() => currentUserId && handleLikeComment(comment._id)}
                                    disabled={!currentUserId}
                                    title={!currentUserId ? 'Please sign in to like comments' : ''}
                                >
                                    {hasUserLiked(comment.likedBy) ? '❤️' : '🤍'} {comment.likedBy?.length || 0}
                                </button>
                                <button
                                    className="action-btn reply-btn"
                                    onClick={() => handleReply(comment._id)}
                                >
                                    Trả lời
                                </button>
                                {comment.userInfo?._id === currentUserId && (
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDeleteComment(comment._id)}
                                    >
                                        Xoá
                                    </button>
                                )}
                            </div>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="replies-section">
                                    {comment.replies.map(reply => (
                                        <div key={reply._id} className="reply-item">
                                            <div className="comment-header">
                                                <img
                                                    src={reply.userInfo?.profile?.avatar || '/default-avatar.png'}
                                                    alt={reply.userInfo?.username}
                                                    className="comment-avatar"
                                                />
                                                <div className="comment-user-info">
                                                    <strong>{reply.userInfo?.username}</strong>
                                                    <span className="comment-date">
                                                        {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="comment-content">
                                                {reply.content}
                                            </div>
                                            {reply.images && reply.images.length > 0 && (
                                                <div className="comment-images">
                                                    {reply.images.map((img, idx) => (
                                                        <img key={idx} src={img} alt="reply-img" />
                                                    ))}
                                                </div>
                                            )}
                                            <div className="comment-actions">
                                                <button
                                                    className={`action-btn like-btn ${hasUserLiked(reply.likedBy) ? 'liked' : ''} ${!currentUserId ? 'disabled' : ''}`}
                                                    onClick={() => currentUserId && handleLikeComment(reply._id)}
                                                    disabled={!currentUserId}
                                                    title={!currentUserId ? 'Please sign in to like comments' : ''}
                                                >
                                                    {hasUserLiked(reply.likedBy) ? '❤️' : '🤍'} {reply.likedBy?.length || 0}
                                                </button>
                                                {reply.userInfo?._id === currentUserId && (
                                                    <button
                                                        className="action-btn delete-btn"
                                                        onClick={() => handleDeleteComment(reply._id)}
                                                    >
                                                        Xoá
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

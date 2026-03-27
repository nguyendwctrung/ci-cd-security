import { useState, memo, useEffect}from "react";

import ContentPostCard from "./ContentPostCard.jsx";
import PostDetailModal from "./PostDetailModal";
import ImageDetailModal from "../../Posts/components/ImageDetailModal";   
import PostEditModal from "./PostEditModal.jsx";
import PostDeleteModal from "./PostDeleteModal.jsx";
import PostRecoverModal from "./PostRecoverModal.jsx";
import useIntersectionObserver from "@/hooks/useIntersectionObserver.jsx";
import { useSocket } from "@/hooks/useSocket.jsx";






const PostCard = memo (function PostCard({data, isOwnerProfile = false}) {
    const [post, setPost] = useState (data);
    useEffect (() => {
        setPost(data);
    }, [data]);
    const [showPostDetail, setShowPostDetail] = useState(false);
    const [showImageDetail, setShowImageDetail] = useState(false); 
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);  
    const [showRecoverModal, setShowRecoverModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const imageObserver = useIntersectionObserver({ threshold: 0.1 });
    const { socket, isConnected } = useSocket();

    // Listen for comment count updates
    useEffect(() => {
        if (!socket || !isConnected || !post?._id) return;

        // Join post room to receive updates
        socket.emit('join_post', post._id);

        const handleCommentCountUpdate = (data) => {
            if (data.postId === post._id) {
                setPost(prev => ({
                    ...prev,
                    comments: data.commentCount
                }));
            }
        };

        socket.on('comment_count_updated', handleCommentCountUpdate);

        return () => {
            socket.off('comment_count_updated', handleCommentCountUpdate);
            socket.emit('leave_post', post._id);
        };
    }, [socket, isConnected, post?._id]);
    const handleImageClick = (index) => {
        setSelectedImageIndex(index);
        setShowImageDetail(true);
    }

    const handlePostClick = () => {
        setShowPostDetail(true);
    }

    const handleEditClick = () => {
        setShowEditModal(true);
    }
    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    }

    const handleRecoverClick = () => {
        setShowRecoverModal(true);
    }
    if (!post){
        return null;
    }
    return (
        <>
            <div ref = {imageObserver.ref} className={`bg-gray-800/70 rounded-2xl p-6 mb-6 shadow-lg border border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors
                 ${imageObserver.hasIntersected ? "animate__animated animate__fadeInUp" : ""}`} onClick={handlePostClick}>
                {imageObserver.hasIntersected && (
                    <ContentPostCard key={post._id} data={post} setData = {setPost} handleImageClick={handleImageClick} isOwnerProfile = {isOwnerProfile} onEditClick={handleEditClick} onDeleteClick = {handleDeleteClick} onRecoverClick = {handleRecoverClick}/>
                )}
            </div>      

            {/* Post Detail Modal */}
            {showPostDetail && (
                <PostDetailModal
                    data = {post}   
                    setData = {setPost}
                    onClose={() => setShowPostDetail(false)}
                    onImageClick={handleImageClick}
                />
            )}

            {/* Image Detail Modal */}
            {showImageDetail && (
                <ImageDetailModal
                    images={post.images}
                    currentIndex={selectedImageIndex}
                    onClose={() => setShowImageDetail(false)}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <PostEditModal
                    postData={post}
                    setPost={setPost}
                    onClose={() => setShowEditModal(false)}
                />
            )}
            {/* Delete Modal */}
            {showDeleteModal && (
                <PostDeleteModal
                    postData={post}
                    setPost={setPost}
                    onClose ={() => setShowDeleteModal(false)}
                />
            )}
            {/* Recover Modal */}
            {showRecoverModal && (
                <PostRecoverModal
                    postData={post}
                    setPost={setPost}
                    onClose ={() => setShowRecoverModal(false)}
                />
            )}

    </>
    );
})
export default PostCard;
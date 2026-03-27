import { useState, useEffect } from "react";
import CommentSection from "@/components/CommentSection";
import { useAuth } from "@/routes/ProtectedRouter";
import { useSocket } from "@/hooks/useSocket.jsx";

export default function CommentsSection({ data, setData }) {
    const { user } = useAuth();
    const [currentUserId, setCurrentUserId] = useState(null);
    const { socket, isConnected } = useSocket();
    const [commentCount, setCommentCount] = useState(data?.comments || 0);

    useEffect(() => {
        if (user && user._id) {
            setCurrentUserId(user._id);
        }
    }, [user]);

    useEffect(() => {
        setCommentCount(data?.comments || 0);
    }, [data?.comments]);

    // Listen for comment count updates
    useEffect(() => {
        if (!socket || !isConnected || !data?._id) return;

        // Join post room to receive updates
        socket.emit('join_post', data._id);

        const handleCommentCountUpdate = (updateData) => {
            if (updateData.postId === data._id) {
                setCommentCount(updateData.commentCount);
                // Also update parent data if setData is provided
                if (setData) {
                    setData(prev => ({
                        ...prev,
                        comments: updateData.commentCount
                    }));
                }
            }
        };

        socket.on('comment_count_updated', handleCommentCountUpdate);

        return () => {
            socket.off('comment_count_updated', handleCommentCountUpdate);
            socket.emit('leave_post', data._id);
        };
    }, [socket, isConnected, data?._id, setData]);

    if (!data || !data._id) {
        return <div className="text-gray-400 p-4">Post data not available</div>;
    }

    return (
        <div className="w-96 border-l border-gray-700/50 flex flex-col bg-gray-800/30 backdrop-blur-sm overflow-hidden">
            {/* Comments header */}
            <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-white text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Comments</h3>
                <p className="text-gray-400 text-sm mt-1">{commentCount} comments</p>
            </div>

            {/* Comment section with socket support */}
            <div className="flex-1 overflow-hidden">
                <CommentSection postId={data._id} currentUserId={currentUserId} />
            </div>
        </div>
    );
}
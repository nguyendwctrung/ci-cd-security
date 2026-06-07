import { X, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from "sonner";

export default function PostDeleteModal({ postData, onClose, setPost }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        async function deletePost(){
            setIsDeleting (true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post/delete`, {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ postId: postData._id }),
                });
                const data = await response.json();
                if (response.ok) {
                    toast.success("Post deleted successfully.");
                    setPost(null);
                    onClose();
                } else {
                    toast.error(data.message || "Failed to delete the post.");
                }
            }
            
            catch (error){
                toast.error("An error occurred while deleting the post.");
                console.error("Error deleting post:", error);
            }
            finally {
                setIsDeleting (false);
            }
        }
        deletePost();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate__animated animate__fadeIn">
            <div className="bg-gray-700/50 rounded-2xl shadow-2xl max-w-md w-full border border-gray-600" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-400/50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-400" />
                            Delete Post
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                        >
                            <X className="w-5 h-5 text-white cursor-pointer" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    <div className="text-center">
                        {/* Warning Icon */}
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>

                        {/* Warning Message */}
                        <h3 className="text-lg font-medium text-white mb-2">
                            Are you sure you want to delete this post?
                        </h3>
                        <p className="text-gray-300 text-sm mb-6">
                            Other people will no longer be able to see this post unless you restore it later.
                        </p>

                        {/* Post Preview */}
                        {postData.content && (
                            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
                                <p className="text-gray-300 text-sm line-clamp-3">
                                    <div dangerouslySetInnerHTML={{__html: postData.content}}></div>
                                </p>
                                {postData.images && postData.images.length > 0 && (
                                    <p className="text-gray-400 text-xs mt-2">
                                        📎 {postData.images.length} image{postData.images.length > 1 ? 's' : ''} attached
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 cursor-pointer bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-medium"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Click outside to close */}
            <div
                className="absolute inset-0 -z-1"
                onClick={onClose}
            />
        </div>
    );
}

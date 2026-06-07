import { X, RotateCcw, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from "sonner";

export default function PostRecoverModal({ postData, onClose, setPost }) {
    const [isRecovering, setIsRecovering] = useState(false);

    const handleRecover = async () => {
        async function recoverPost(){
            setIsRecovering(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/post/recover`, {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ postId: postData._id }),
                });
                const data = await response.json();
                if (response.ok) {
                    toast.success("Post recovered successfully.");
                    setPost(null);
                    onClose();  
                } else {
                    toast.error(data.message || "Failed to recover the post.");
                }
            }

            catch (error){
                toast.error("An error occurred while recovering the post.");
                console.error("Error recovering post:", error);
            }
            finally {
                setIsRecovering(false);
            }
        }
        recoverPost();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate__animated animate__fadeIn">
            <div className="bg-gray-700/50 rounded-2xl shadow-2xl max-w-md w-full border border-gray-600" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-400/50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-green-400" />
                            Recover Post
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
                        {/* Success Icon */}
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-4">
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>

                        {/* Confirmation Message */}
                        <h3 className="text-lg font-medium text-white mb-2">
                            Recover this post?
                        </h3>
                        <p className="text-gray-300 text-sm mb-6">
                            This post will be restored and visible to other users again.
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
                                disabled={isRecovering}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleRecover}
                                disabled={isRecovering}
                                className="flex-1 px-4 py-3 cursor-pointer bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRecovering ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Recovering...</span>
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw className="w-4 h-4" />
                                        <span>Recover</span>
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

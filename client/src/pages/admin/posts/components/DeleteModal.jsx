import { Trash2, X } from 'lucide-react';

import {toast} from "sonner";
import "animate.css"
// DeleteModal Component
const DeleteModal = ({ post, setPost, setOpenModal}) => {



  const handleDelete = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/post/delete/${post._id}`, {
      method: 'PATCH',
      credentials: 'include'
    })
    .then (res =>{
        if (!res.ok){
            return res.json().then (data => {
                throw new Error (data.message || "Failed to delete the post");
            });
        }
        return res.json();
    })
    .then (data => {
        toast.success("Post deleted successfully.");
        setPost (post => ({...post, isDeleted: true, deletedAt: data.deletedAt}));
        setOpenModal(false);
    })
    .catch (err => {
        console.error("Error deleting post:", err);
        toast.error(err.message || "Failed to delete the post");
    });

  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0" onClick={() => {setOpenModal(false)}}></div>
      <div className="bg-gray-50 rounded-3xl max-w-md w-full animate__animated animate__fadeInDown animate__fast shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Trash2 className="text-red-500" size={24} />
            Delete Post
          </h2>
          <button onClick={() => {setOpenModal(false)}} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-2">Are you sure to delete this post?</p>
          <p className="text-gray-600 text-sm mb-6">The post is from <span className="font-semibold">{post.username} :</span><span className = "line-clamp-3" dangerouslySetInnerHTML={{__html: post.content}}></span></p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-orange-300 text-sm">You can recover later.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={() => {setOpenModal(false)}}
            className="px-6 py-2 cursor-pointer bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick = {handleDelete}
            className="px-6 py-2 cursor-pointer bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
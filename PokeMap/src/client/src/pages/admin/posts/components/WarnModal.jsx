import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import {toast} from "sonner";
import { useAuth } from '@/routes/ProtectedRouter.jsx';
// WarnModal Component
const WarnModal = ({ post, setPost, setOpenModal }) => {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const {user} = useAuth();
  console.log ("WarnModal User:", user);
  
  
  const reasons = [
    { value: 'inappropriate', label: 'Content is inappropriate' },
    { value: 'spam', label: 'This is spam' },
    { value: 'misleading', label: 'Content is misleading' },
    { value: 'violent', label: 'Violent content' },
    { value: 'other', label: 'Other' }
  ];
  
  const handleSubmit = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/post/warn/${post._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        warningType: reason,
        description: comment,
        warnedBy: user?._id || null
      })
    })
    .then (res => {
        if (!res.ok){
            return res.json().then (data => {
                throw new Error (data.message || "Failed to warn the post");
            });
        }
        return res.json();
    })
    .then ( data => {
        toast.success("Post warned successfully.");
        setPost(prev => ({...prev, warning_counts: data.warning_counts, isDeleted: data.isDeleted, deletedAt: data.deletedAt})); 
    })
    .catch (err => {
        console.error("Error warning post:", err);
        toast.error("Failed to warn the post.");
    });

    setOpenModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0" onClick={() => {setOpenModal(false)}}></div>
      <div className="bg-gray-50 rounded-3xl max-w-[50%] w-full animate__animated animate__fadeInDown animate__fast shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle className="text-orange-500" size={24} />
            Warning Post
          </h2>
          <button onClick={() => {setOpenModal(false)}} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">Post of <span className="font-semibold">{post.username}</span></p>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">Warning Reason</label>
            <div className="space-y-2">
              {reasons.map((r) => (
                <label key={r.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Add comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment for the user..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="3"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={() => {setOpenModal(false)}}
            className="px-6 py-2 cursor-pointer bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 cursor-pointer bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Warn Post
          </button>
        </div>
      </div>
    </div>
  );
};
export default WarnModal;
import { RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
export default function RecoverModal({ post, setPost, setOpenModal }) {
  const handleRecover = () => {

    async function recoverPost () {
        try{
            const response = await fetch (`${import.meta.env.VITE_API_URL}/api/admin/post/recover/${post._id}`, {
                method: 'PATCH',
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok){
                throw new Error (data.message || "Failed to recover the post");
            }
            toast.success("Post recovered successfully.");
            setPost (post => ({...post, isDeleted: false, deletedAt: null}));

        }
        catch (err){
            console.error("Error recovering post:", err);
            toast.error(err.message || "Failed to recover the post");
        }
    }
    recoverPost();
    setOpenModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0" onClick={() => setOpenModal(false)}></div>
      <div className="bg-gray-50 rounded-3xl max-w-md w-full animate__animated animate__fadeInDown animate__fast shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <RotateCcw className="text-green-500" size={24} />
            Recover Post
          </h2>
          <button onClick={() => setOpenModal(false)} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-2">Are you sure to recover this post?</p>
          <p className="text-gray-600 text-sm mb-6">The post is from <span className="font-semibold">{post.username}: </span><span className = "line-clamp-3" dangerouslySetInnerHTML={{__html: post.content}}></span></p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm">This will restore the post to its original state.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={() => setOpenModal(false)}
            className="px-6 py-2 cursor-pointer bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleRecover}
            className="px-6 py-2 cursor-pointer bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
          >
            Recover
          </button>
        </div>
      </div>
    </div>
  );
}
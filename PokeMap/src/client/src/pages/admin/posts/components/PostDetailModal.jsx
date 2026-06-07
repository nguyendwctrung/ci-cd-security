import { X, Heart, MessageCircle, Image, Calendar, FileText, Eye } from 'lucide-react';

const PostDetailModal = ({ post, setOpenModal }) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => {setOpenModal(false)}} />

      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate__animated animate__fadeInDown animate_faster">
        {/* Modal Header */}
        <div className="flex items-center gap-4 p-6 border-b border-slate-200 bg-slate-50">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Post Details</h2>
            <p className="text-slate-600 text-sm">View complete post information</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setOpenModal(false)}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto scrollbar-hide">
          {/* Author Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {post.avatar ? (
                  <img
                    src={post.avatar}
                    alt={post.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  post.username.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="text-slate-800 font-bold text-xl">{post.username}</h3>
                <p className="text-slate-600 text-sm">Post Author</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                
              </div>
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                  <div>Updated : 
                  {new Date (post.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  </div>
                )
              }
            </div>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Likes</p>
                  <p className="text-slate-800 font-bold text-xl">{post.likes || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Comments</p>
                  <p className="text-slate-800 font-bold text-xl">{post.comments || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Image className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">Images</p>
                  <p className="text-slate-800 font-bold text-xl">{post.images?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Post Content</h3>
            </div>
            <div className="text-slate-700 leading-relaxed text-base rounded-lg p-4 " dangerouslySetInnerHTML={{ __html: post.content }} >
            </div>
          </div>

          {/* Images Gallery */}
          {post.images && post.images.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Image className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Images ({post.images.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`Post image ${idx + 1}`}
                      className="rounded-lg w-full h-48 object-cover border border-slate-200 hover:shadow-md transition-shadow"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setOpenModal(false)}
              className="cursor-pointer px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
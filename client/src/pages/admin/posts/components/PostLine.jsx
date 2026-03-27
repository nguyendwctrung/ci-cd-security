import {useState, useEffect} from 'react';
import {Eye, AlertCircle, Trash2, RotateCcw } from "lucide-react";
import PostDetailModal from "@/pages/admin/posts/components/PostDetailModal";
import WarnModal from "@/pages/admin/posts/components/WarnModal";
import DeleteModal from "@/pages/admin/posts/components/DeleteModal";
import RecoverModal from "@/pages/admin/posts/components/RecoverModal";
export default function PostLine ({postInfo}) {
    const [post, setPost] = useState(postInfo);
    useEffect (() => {
        setPost (postInfo);
    }, [postInfo]);
    const [openDetailPost, setOpenDetailPost] = useState(null);
    const [openWarnPost, setOpenWarnPost] = useState(null);
    const [openDeletePost, setOpenDeletePost] = useState(null);
    const [openRecoverPost, setOpenRecoverPost] = useState(null);
    return (
        <>
            <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                    {post.avatar ? (
                    <img src={post.avatar} alt={post.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                    post.username ? post.username.charAt(0).toUpperCase() : 'U'
                    )}
                </div>
                <div>
                    <div className="text-slate-900 font-semibold text-base">{post.username}</div>
                    <div className="text-slate-500 text-sm font-medium">Author</div>
                </div>
                </div>
            </td>
            <td className="px-6 py-5 max-w-xs">
                <div className="text-slate-800 font-medium text-base line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{__html : post.content}} >
                </div>
                <div className="text-slate-500 text-sm font-medium mt-1">
                {post.images && post.images.length > 0 && `${post.images.length} image${post.images.length > 1 ? 's' : ''}`}
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-emerald-700 font-semibold text-sm">{post.likes || 0} likes</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-700 font-semibold text-sm">{post.comments || 0} comments</span>
                </div>
                </div>
            </td>

            <td className="px-7 py-5">
                <span className={`inline-flex  items-center px-3 py-1.5 rounded-full text-sm font-bold ${
                (post.warning_counts || 0) > 0
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200'
                    : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                }`}>
                {post.warning_counts || 0}
                </span>
            </td>   

            <td className="px-3 py-5">
                {post.isDeleted ? (
                <span className="inline-flex min-w-[120px] items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200">
                    Deleted at :
                    <br></br>
                    {new Date(post.deletedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
                
                ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                    Active
                </span>
                )}
                
            </td>

            <td className="px-6 py-5">
                <div className="text-slate-800 font-medium text-base min-w-[100px]">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })}
                </div>
                <div className="text-slate-500 text-sm font-medium">
                {new Date(post.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })}
                </div>
            </td>

            <td className="px-6 py-5">
                <div className="flex items-center justify-end gap-3">
                <button
                    onClick={() => setOpenDetailPost(true)}
                    className="inline-flex cursor-pointer items-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200 rounded-lg hover:from-indigo-100 hover:to-blue-100 hover:border-indigo-300 transition-all duration-200 font-semibold text-sm shadow-sm"
                    title="View details"
                >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                </button>
                <button
                    onClick={() => setOpenWarnPost(true)}
                    className="inline-flex cursor-pointer items-center px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200 rounded-lg hover:from-orange-100 hover:to-amber-100 hover:border-orange-300 transition-all duration-200 font-semibold text-sm shadow-sm"
                    title="Warn post"
                >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Warn
                </button>
                { !post.isDeleted && <button
                    onClick={() => setOpenDeletePost(true)}
                    className="inline-flex cursor-pointer items-center px-4 py-2 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 rounded-lg hover:from-red-100 hover:to-rose-100 hover:border-red-300 transition-all duration-200 font-semibold text-sm shadow-sm"
                    title="Delete post"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </button>}
                {post.isDeleted && <button
                    onClick={() => setOpenRecoverPost(true)}
                    className="inline-flex cursor-pointer items-center px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 hover:border-green-300 transition-all duration-200 font-semibold text-sm shadow-sm"
                    title="Recover post"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Recover
                </button>}
                </div>
            </td>

             {/* Modals */}
            {openDetailPost && <PostDetailModal post={post} setOpenModal = {setOpenDetailPost}/>}
            {openWarnPost && <WarnModal post={post} setPost = {setPost} setOpenModal = {setOpenWarnPost} />}
            {openDeletePost && <DeleteModal post={post} setPost = {setPost} setOpenModal = {setOpenDeletePost} />}
            {openRecoverPost && <RecoverModal post={post} setPost = {setPost} setOpenModal = {setOpenRecoverPost} />}
        </>
    );
}
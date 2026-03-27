import chatBubbleIcon from "@/assets/icons/chat_bubble.png";
import LikeButton from "./LikeButton.jsx";
import FollowButton from "./FollowButton.jsx";
import {Link} from "react-router-dom";
import {cn} from "@/lib/utils.js"
import { useState, useRef, useEffect } from "react";
import MiniProfileAuthor from "./MiniProfileAuthor.jsx";
import { Edit, Trash2, RotateCcw, Sparkles } from "lucide-react";
export default function ContentPostCard ({data, setData, handleImageClick, isOwnerProfile, className, onEditClick, onDeleteClick, onRecoverClick}){ {
    const [isExpanded, setIsExpanded] = useState(false);
    const [needsExpansion, setNeedsExpansion] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current) {
            // Check if content exceeds max height (128px = 8rem = 32 * 4px)
            const maxHeight = 128;
            const isClamped = contentRef.current.scrollHeight > maxHeight;
            setNeedsExpansion(isClamped);
        }
    }, [data.content]);
    
    return (
        <>
            {/* Header with user info and follow button */}
            <div className={cn("flex justify-between mb-4", className)}>
                <div className="flex items-center space-x-3">
                    <MiniProfileAuthor userId = {data.owner_id} username = {data.username}>
                        <Link to = {data.owner_id ? `/profile/${data.username}_${data.owner_id}` : "#"} className="relative" onClick = {(e) => e.stopPropagation()}>
                            {data.avatar ? (<img 
                                src={data.avatar || ""} 
                                alt={data.username || "User Avatar"}
                                className="w-16 h-16 rounded-full border-4 object-cover border-purple-500 hover:scale-105 hover:shadow-[0px_5px_10px] hover:shadow-purple-500 cursor-pointer transition-transform duration-300  "
                            />) :
                            (<div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center text-white text-2xl font-bold border-4 border-purple-400 hover:scale-105 hover:shadow-[0px_5px_10px] hover:shadow-purple-500 cursor-pointer transition-transform duration-300">
                                {data.username ? data.username.charAt(0).toUpperCase() : "U"}
                            </div>)
                            }
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-rose-500/80 rounded-full flex items-center justify-center">
                                <Sparkles className="text-white w-3 h-3" />
                            </div>
                        </Link>

                    </MiniProfileAuthor>
                    <div>
                        <h3 className="text-white text-xl font-semibold">{data.username}</h3>
                        <p className="text-gray-400 text-sm">{data.createdAt ? new Date (data.createdAt).toLocaleString() : ""}</p>
                        {/* updatedAt if != createdAt */}
                        {data.updatedAt && data.updatedAt !== data.createdAt && (
                            
                            <span className="text-gray-400 text-sm">edited: {new Date (data.updatedAt).toLocaleString()}</span>
                            
                        )}
                    </div>
                    
                    
                </div>
                {/* Follow button and Edit button */}
                <div className="flex items-center space-x-2">
                    {!isOwnerProfile && <FollowButton isFollowing = {data.isFollowing} setIsFollowing = {setData}
                     postId = {data._id}></FollowButton>}
                    {isOwnerProfile && (
                        <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditClick();
                            }}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors duration-200"
                            title="Edit post"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        {!data.isDeleted ?
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteClick();
                                }}
                                className="p-2 bg-red-700/50 hover:bg-red-500 rounded-full text-white transition-colors duration-200"
                                title="Delete post"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        :
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRecoverClick();
                                }}
                                className="p-2 bg-green-700/50 hover:bg-green-500 rounded-full text-white transition-colors duration-200"
                                title="Recover post"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        }
                        </>
                    )}
                </div>
                
            </div>

            {/* Content */}
            <div className="mb-4">
                <div 
                    ref={contentRef}
                    className={cn(
                        "text-white text-lg transition-all duration-300 overflow-hidden",
                        !isExpanded && "max-h-32"
                    )} 
                    dangerouslySetInnerHTML={{__html: data.content}}
                >
                </div>
                {needsExpansion && !isExpanded && (
                    <button 
                        onClick={(e) => {e.stopPropagation();setIsExpanded(true)}}
                        className="text-blue-400 hover:text-blue-300 cursor-pointer text-sm font-medium mt-2 transition-colors duration-200"
                    >
                        ...more
                    </button>
                )}
                {isExpanded && needsExpansion && (
                    <button 
                        onClick={(e) => {e.stopPropagation();setIsExpanded(false)}}
                        className="text-blue-400 cursor-pointer hover:text-blue-300 text-sm font-medium mt-2 transition-colors duration-200"
                    >
                        show less
                    </button>
                )}
            </div>

            {/* Image display - show only first image */}
            {data.images && data.images.length > 0 && (
                <div className="mb-4">
                    <img
                        src={data.images[0]}
                        alt="Post content"
                        className="w-full min-h-[300px] max-h-[300px] object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(0);
                        }}
                    />
                    {data.images.length > 1 && (
                        <div className="text-gray-400 text-sm mt-2 text-center">
                            +{data.images.length - 1} more image{data.images.length > 2 ? 's' : ''}
                        </div>
                    )}
                </div>
            )}

            {/* Engagement stats */}
            <div className="flex items-center space-x-8">

                {/* Likes */}
                <LikeButton isLiked = {data.isLiked} likes = {data.likes} setData = {setData} postId = {data._id}></LikeButton>


                {/* Comments */}
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl p-1 bg-white/50 rounded-full cursor-pointer">
                            <img src={chatBubbleIcon} alt="comments"/>
                        </span>
                    </div>
                    <span className="text-white font-semibold">{data.comments}</span>
                </div>
            </div>
        </>
    );
}}
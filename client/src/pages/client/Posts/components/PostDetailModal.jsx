
import { X} from "lucide-react";
import ContentPostCard from "./ContentPostCard.jsx";
import Comment from "./Comment.jsx";

export default function PostDetailModal({ data, setData, onClose, onImageClick }) {



    return (
        <div className="fixed inset-0 bg-white/50 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/95 rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-700 animate__animated animate__zoomIn animated_faster">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                    <h2 className="text-white text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Post Details</h2>
                    <button
                        onClick={onClose}
                        className="p-3 cursor-pointer bg-gray-800/80 rounded-full hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                <div className="flex max-h-[calc(90vh-80px)]">
                    {/* Left side - Post content */}
                    <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
                        <ContentPostCard data={data} setData = {setData} handleImageClick={onImageClick}/>
                    </div>
                    {/* Right side - Comments */}
                    <Comment data={data} setData={setData} />

                </div>
            </div>
        </div>
    );
}




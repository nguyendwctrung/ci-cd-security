import activeStarIcon from "@/assets/icons/active_star.png";
import inactiveStarIcon from "@/assets/icons/inactive_star.png";

import { toast } from "sonner";
import { useAuth } from "@/routes/ProtectedRouter.jsx";

export default function LikeButton({ isLiked, likes, setData, postId }) {
    const { user } = useAuth();

    const handleLikeClick = (e) => {
        e.stopPropagation();

        if (!user) {
            toast.error("Please sign in to like posts");
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/api/post/${postId}/like`, {
            method: "POST",
            credentials: "include",
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => {
                        throw new Error(data.message || "Failed to like/unlike post");
                    })
                }
                return res.json();
            })
            .then(data => {
                console.log(data);
                setData(prevData => ({
                    ...prevData,
                    isLiked: !isLiked,
                    likes: isLiked ? prevData.likes - 1 : prevData.likes + 1
                }));
            })
            .catch(err => {
                toast.error(err.message || "Error liking/unliking post");
            })

    }
    return (
        <>
            {/* Likes */}
            <div
                className={`flex items-center space-x-2 ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={handleLikeClick}
                title={!user ? 'Please sign in to like posts' : ''}
            >
                <div className={`w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center ${!user ? '' : 'cursor-pointer'}`}>
                    <span className={`text-white text-xl p-1 ${isLiked ? "bg-red-600 shadow-[0px_0px_5px] shadow-red-100" : ""} rounded-full transition-all duration-300`}>
                        <img src={isLiked ? activeStarIcon : inactiveStarIcon} alt="like" />
                    </span>
                </div>
                <span className="text-white font-semibold">{likes}</span>
            </div>
        </>
    );
}
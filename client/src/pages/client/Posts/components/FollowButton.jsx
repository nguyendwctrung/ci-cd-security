import { toast } from "sonner";
export default function FollowButton({ isFollowing, setIsFollowing, postId = null, userId = null }) {

    const handleFollow = (e) => {
        e.stopPropagation();
        if (!postId && !userId) return;
        const url = userId ? `${import.meta.env.VITE_API_URL}/api/user/${userId}/follow` : `${import.meta.env.VITE_API_URL}/api/post/${postId}/follow`;
        fetch(url, {
            method: "POST",
            credentials: "include",
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => {
                        throw new Error(data.message || "Failed to follow/unfollow user");
                    })
                }
                return res.json();
            })
            .then(data => {
                console.log(data.message || "Successfully followed/unfollowed user");
                setIsFollowing(prev => ({ ...prev, isFollowing: !isFollowing }))
            })
            .catch(err => {
                toast.error(err.message || "Error following/unfollowing user");
            })
    }
    return (
        <button
            onClick={handleFollow}
            className={`px-4 py-4 min-h-[70px] h-full rounded-lg font-medium text-base transition-colors ${isFollowing
                    ? 'bg-gray-700 text-white hover:bg-gray-600 cursor-pointer'
                    : 'text-white cursor-pointer'
                }`}
            style={!isFollowing ? { backgroundColor: '#807DDB' } : {}}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    );
}
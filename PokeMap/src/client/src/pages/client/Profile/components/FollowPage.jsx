import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, UserCircle } from "lucide-react";
import { toast } from "sonner";
import ProfileHeader from "@/pages/client/Profile/components/ProfileHeader.jsx";
import FollowButton from "@/pages/client/Posts/components/FollowButton.jsx";
import {useAuth} from "@/routes/ProtectedRouter.jsx";
// Fake data for testing


export default function FollowPage() {
    const { username_id } = useParams();
    
    const [activeTab, setActiveTab] = useState("followers");
    const [users, setUsers] = useState([]);
    const userId = username_id?.split("_")[1];

    useEffect(() => {
        // Initialize following states from fake data
        async function fetchFollowList() {
            try{
                const promise = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/user/profile/follow/list?userId=${userId}&type=${activeTab}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );
                const data = await promise.json();
                if (!promise.ok){
                    toast.error(data.message || "Failed to fetch follow list");
                    throw new Error (data.message || "Failed to fetch follow list");
                }
                setUsers(data.data);
            }
            catch (error){
                console.error("Error fetching follow list:", error);
            }
        }
        fetchFollowList();
    }, [activeTab, userId]);


    return (
        <div className="min-h-screen pt-20 px-4">
            <div className = " flex flex-col mx-auto w-[80%] ">
                {/* Header */}
                <ProfileHeader></ProfileHeader>

                {/* Tabs */}
                <div className="mb-6 mt-10">
                    <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700/50 max-w-md mx-auto">
                        <button
                            onClick={() => setActiveTab("followers")}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeTab === "followers"
                                    ? "bg-gray-700/50 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>Followers</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("following")}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeTab === "following"
                                    ? "bg-gray-700/50 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                            }`}
                        >
                            <UserCircle className="w-4 h-4" />
                            <span>Following</span>
                        </button>
                    </div>
                </div>

                {/* Users List */}
                <div className="space-y-3">
                    {users.length === 0 ? (
                        <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700">
                            <p className="text-gray-400">
                                No {activeTab === "followers" ? "followers" : "following"} yet
                            </p>
                        </div>
                    ) : (
                        users.map((user) => (
                            <UserFollowItem 
                                key={user.userInfo._id}
                                user={{
                                    _id: user.userInfo._id,
                                    username: user.userInfo.username,
                                    profile: user.userInfo.profile,
                                    isFollowing: user.isFollowedByCurrentUser,
                                }}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}



export function UserFollowItem({ user }) {
    const navigate = useNavigate();
    const auth = useAuth();
    const isOwner = auth.user && (auth.user._id === user._id);
    const [isFollowing, setIsFollowing] = useState({
        isFollowing: user.isFollowing,
    });
    const handleUserClick = () => {
        navigate(`/profile/${user.username}_${user._id}`);
    };

    

    return (
        <div className="bg-gray-800/70 w-[70%] mx-auto rounded-xl p-5 border border-gray-700 hover:bg-gray-750 transition-all duration-200">
            <div className={`flex gap-3 ${user.profile?.description ? 'items-start' : 'items-center'}`}>
                {/* Avatar */}
                <div
                    onClick={handleUserClick}
                    className="cursor-pointer flex-shrink-0"
                >
                    {user.profile?.avatar ? (
                        <img
                            src={user.profile.avatar}
                            alt={user.username}
                            className="w-20 h-20 rounded-full object-cover border-2 border-purple-400 hover:scale-105 transition-transform duration-200"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold border-2 border-purple-400 hover:scale-105 transition-transform duration-200">
                            {user.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <h3
                        onClick={handleUserClick}
                        className="text-white font-semibold text-xl hover:text-blue-400 cursor-pointer transition-colors leading-tight"
                    >
                        {user.username}
                    </h3>
                </div>

                {/* Follow Button */}
                {!isOwner ?
                <div className="flex-shrink-0 self-center">
                    <FollowButton
                        isFollowing={isFollowing.isFollowing}
                        setIsFollowing={setIsFollowing}
                        userId={user._id}
                    >
                    </FollowButton>
                </div>
                : null}
            </div>
        </div>
    );
}

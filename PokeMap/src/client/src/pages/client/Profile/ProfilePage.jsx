import ShortcutToMap from "@/components/common/ShortcutToMap";
import Posts from "@/pages/client/Posts/Posts";
import {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import ProfileHeader from "@/pages/client/Profile/components/ProfileHeader.jsx";
import { FileText, Archive } from "lucide-react";

import {useAuth} from "@/routes/ProtectedRouter.jsx";
// username, email, sex, followers, following, avatar




export default function ProfilePage(){
    const [isBanned, setIsBanned] = useState(false);
    const {user} = useAuth();
    const {username_id} = useParams();
    const userId = username_id.split("_")[1];
    const isOwnerProfile = userId === user?._id;
    const [activeTab, setActiveTab] = useState("all");

    const [posts, setPosts] = useState ([]);
    useEffect (() => {
        // Check if user is banned
        fetch(`${import.meta.env.VITE_API_URL}/api/user/banned?id=${userId}`, {
            method : "GET",
            credentials : "include",
        })
        .then (res => res.json())
        .then (data => {
            setIsBanned(data.isBanned);
        })
        .catch (err => {
            console.error ("Error checking if user is banned:", err);
        });
    }, [])
    useEffect (() => {
        if (isBanned) {
            return;
        }
        fetch (`${import.meta.env.VITE_API_URL}/api/post/get_user_post?userId=${userId}&isDeleted=${activeTab === "deleted" ? "true" : "false"}`,
            {
                method : "GET",
                credentials : "include",
            }
        )
        .then(res => res.json())
        .then(data => {
            if (data.status === "success"){
                setPosts (data.data);
                console.log ("Fetched user posts:", data.data);
            }
        })
        .catch (err => {
            console.error ("Error fetching user posts:", err);
        });
    }, [username_id, isBanned, activeTab])
    
    // Memoize posts to prevent unnecessary re-renders
    // const memoizedPosts = useMemo(() => posts, [posts.length, posts.map(p => p._id).join(','), posts.map(p => p.isDeleted).join(','), activeTab]);
    
    if (isBanned){
        return (
            <div className=" pt-20 px-4 ">
                <div className = " flex flex-col mx-auto w-[80%] ">
                    <div className="text-center text-red-500 font-semibold mt-10">
                        This user has been banned and their profile is not accessible.
                    </div>
                </div>
            </div>
        );
    }
    return(
        <div className=" pt-20 px-4 ">
            <div className = " flex flex-col mx-auto w-[80%] ">
                <ProfileHeader />
                <div className = "grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 mt-8">
                    <div className = "w-full">
                        {/* Posts Tabs */}
                        {isOwnerProfile && (
                            <div className="mb-6">
                                <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
                                    <button
                                        onClick={() => setActiveTab("all")}
                                        className={`flex-1 flex items-center justify-center cursor-pointer gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            activeTab === "all"
                                                ? "bg-gray-700/50 text-white shadow-lg"
                                                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                        }`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>All Posts</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("deleted")}
                                        className={`flex-1 flex items-center justify-center cursor-pointer gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            activeTab === "deleted"
                                                ? "bg-red-600/80 text-white shadow-lg"
                                                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                        }`}
                                    >
                                        <Archive className="w-4 h-4" />
                                        <span>Deleted Posts</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <Posts isOwnerProfile={isOwnerProfile} posts = {posts} setPosts = {setPosts} activeTab={activeTab}></Posts>
                    </div>
                    <ShortcutToMap className = "top-[60%] right-[10%] w-[300px] static"></ShortcutToMap>
                </div>
                
            </div>
            
            
        </div>
    );

}
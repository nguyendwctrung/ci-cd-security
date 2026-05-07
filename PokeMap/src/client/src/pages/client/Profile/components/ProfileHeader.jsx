import {useEffect, useState} from "react";
import {useAuth} from "@/routes/ProtectedRouter.jsx";
import {useParams, useNavigate, Link} from "react-router-dom";
import Loading from "@/components/common/ClientLoading";
import { Sparkles } from "lucide-react";


export default function ProfileHeader({isMiniCard = false, user_id_outside = null, username_outside = null}){

    const {user} = useAuth();
    console.log ("Authenticated user in ProfileHeader:", user);
    const [userProfile, setUserProfile] = useState();
    const {username_id} = useParams();
    const username = username_id?.split("_")[0];
    const userId = username_id?.split("_")[1];
    const isOwnerProfile = userId === user?._id;
    const [isLoading, setIsLoading] = useState(true);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const navigate = useNavigate();
    // Fetch user profile data
    useEffect (() => {
        setIsLoading(true);
        let apiUrl = "";
        if (isMiniCard){
            apiUrl = `${import.meta.env.VITE_API_URL}/api/user/profile?id=${user_id_outside}&username=${username_outside}`;
        }
        else {
            apiUrl = `${import.meta.env.VITE_API_URL}/api/user/profile?id=${userId}&username=${username}`;
        }
        fetch(apiUrl, {
            method : "GET",
            credentials : "include",
        })
        .then (res => res.json())
        .then (data => {
            if (data.success){
                setUserProfile(data.data);
            }
        })
        .catch (err => {
            console.error("Error fetching user profile:", err);
        })
        .finally(()=> {
            setIsLoading(false);
        })
    }, [username_id, user_id_outside, username_outside]);
    if (!userProfile && !isLoading){
        return (<div className="text-center text-red-500 font-semibold">
            User profile not found.
        </div>
        );
    }
    return(
        isLoading && !isMiniCard ? <Loading></Loading> :<div className={`${isMiniCard ? 'bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 shadow-xl' : 'bg-gray-800 rounded-2xl p-8 border-2 border-blue-500 shadow-lg'}`}>
            <div className={`flex justify-between items-start ${isMiniCard ? 'mb-4' : 'mb-6'}`}>
                {/* Left side - User info and stats */}
                <div className="grid grid-cols-2 w-full">
                    {/* Name */}
                    <div className={`${isMiniCard ? 'mb-3' : 'mb-6'}`}>
                        <h1 className={`${isMiniCard ? 'text-white text-xl font-bold mb-1' : 'text-white text-4xl font-bold mb-2'}`}>{userProfile?.username}</h1>
                        {
                            (userProfile && userProfile.sex && (userProfile.sex).toUpperCase() === "MALE") ?
                            (<p className={`${isMiniCard ? 'text-blue-400 text-sm mb-2' : 'text-blue-400 text-lg mb-4'}`}>Male Trainer</p>) :
                            (userProfile && userProfile.sex && (userProfile.sex).toUpperCase () === "FEMALE" ? 
                            <p className={`${isMiniCard ? 'text-rose-400 text-sm mb-2' : 'text-rose-400 text-lg mb-4'}`}>Female Trainer</p> :
                            <p className={`${isMiniCard ? 'text-gray-400 text-sm mb-2' : 'text-gray-400 text-lg mb-4'}`}>Trainer</p>)
                        }
                        {/* Email - chỉ hiển thị khi không phải mini card */}
                        {!isMiniCard && (
                            <div className="flex items-center space-x-2 mb-4">
                                <span className="text-gray-400 text-lg">{userProfile?.email}</span>
                            </div>
                        )}
                    
                    </div>
                    {/* Stats */}
                    <Link to = {isMiniCard ? "/#" : `/profile/${userProfile?.username}_${userProfile?._id}/follow`} 
                    className={`flex ${isMiniCard ? 'space-x-6' : 'space-x-12'}`}>
                        <div>
                            <h3 className={`${isMiniCard ? 'text-white text-sm font-semibold mb-0.5' : 'text-white text-xl font-bold mb-1'}`}>Followers</h3>
                            <p className={`${isMiniCard ? 'text-white text-lg font-bold' : 'text-white text-2xl font-bold'}`}>{userProfile?.profile?.followers}</p>
                        </div>
                        <div>
                            <h3 className={`${isMiniCard ? 'text-white text-sm font-semibold mb-0.5' : 'text-white text-xl font-bold mb-1'}`}>Following</h3>
                            <p className={`${isMiniCard ? 'text-white text-lg font-bold' : 'text-white text-2xl font-bold'}`}>{userProfile?.profile?.following}</p>
                        </div>
                    </Link>
                </div>
                
                {/* Right side - Profile picture */}
                <div className={`relative ${isMiniCard ? 'ml-4' : 'ml-8'}`}>
                    <div className={`${isMiniCard ? 'w-16 h-16' : 'w-24 h-24'} rounded-full bg-gradient-to-r from-purple-400 to-rose-600 p-1`}>
                        {(userProfile && userProfile.profile && userProfile.profile.avatar) ? (
                        <img 
                            src={userProfile?.profile?.avatar} 
                            alt={userProfile?.name}
                            className="w-full h-full rounded-full object-cover"
                        />)
                        :
                        (<div className={`w-full h-full rounded-full bg-gray-400 flex items-center justify-center text-white ${isMiniCard ? 'text-xl' : 'text-3xl'} font-bold`}>
                            {userProfile?.username.charAt(0).toUpperCase()}
                        </div>)
                        }
                    </div>
                    {/* Star decoration */}
                    <div className={`absolute -top-2 -right-2 ${isMiniCard ? 'w-5 h-5' : 'w-8 h-8'} bg-rose-500 rounded-full flex items-center justify-center`}>
                        <Sparkles className={`text-white ${isMiniCard ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    </div>
                </div>
            </div>

            {/* Description Section - chỉ hiển thị khi không phải mini card */}
            {!isMiniCard && (
                <div className="mb-6">
                    <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                        <div
                            className={`text-gray-300 text-base leading-relaxed prose prose-invert max-w-none ${
                                !showFullDescription ? 'line-clamp-3' : ''
                            }`}
                            dangerouslySetInnerHTML={{__html: userProfile?.description}}
                        ></div>

                        {/* Toggle Button */}
                        {userProfile.description && (
                            <button
                                onClick={() => setShowFullDescription(!showFullDescription)}
                                className="mt-3 text-gray-500 hover:text-gray-300 cursor-pointer text-sm font-medium transition-colors"
                            >
                                {showFullDescription ? 'Shorten' : 'More'}
                        </button>
                    )}
                </div>
            </div>
            )}

            {/* Action Buttons - chỉ hiển thị khi không phải mini card và là owner */}
            {isOwnerProfile && !isMiniCard && (
                <div className="flex gap-3">
                    <button
                        onClick={() => {navigate(`/profile/edit`)}}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xl font-semibold py-4 rounded-2xl transition-colors cursor-pointer"
                    >
                        Edit Profile
                    </button>
                </div>
            )}
        </div>
    );
}
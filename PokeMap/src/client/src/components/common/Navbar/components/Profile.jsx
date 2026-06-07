import React, {useState, useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/routes/ProtectedRouter.jsx";
import speakingURL from "speakingurl"
import {toast} from "sonner"
import BellNotification from "@/components/common/Navbar/components/BellNotification.jsx";

export default function Profile(){
    const {user} = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (isLoading) return; // Prevent multiple clicks
        setIsLoading(true);
        fetch("http://localhost:10000/api/auth/logout", {
            method: "POST",
            credentials: "include",
        })
        .then((res) => {
            if (res.ok) {
                console.log("Logged out successfully");
                toast.success("Logged out successfully");
                // reload the page to update the UI
                
                navigate("/");
                window.location.reload();
            }
            else{
                toast.error("Failed to log out");
            }
        })
        .catch((err) => {
            console.error("Logout error:", err);
            toast.error("An error occurred during logout");
        })
        .finally(() => {
            setIsLoading(false);
        });
        
    };

    const handleViewProfile = () => {
        navigate(`/profile/${user.username}_${user._id}`);
        setIsDropdownOpen(false);
    };

    const handleChangePassword = () => {
        navigate('/profile/change-password');
        setIsDropdownOpen(false);
    };

    return (
        <div className="flex items-center">
            {user ? (
                <>
                    <BellNotification />

                    {/* Profile Dropdown */}
                    <div className="relative ml-4" ref={dropdownRef}>
                        <div
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-700 rounded-full p-1 transition-colors"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            {user.profile && user.profile.avatar ? (
                                <img
                                    src={user.profile.avatar}
                                    alt="Profile"
                                    className="w-8 h-8 object-cover rounded-full"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gray-500 flex items-center justify-center text-white text-sm font-bold rounded-full">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-gray-300 text-sm hidden sm:block">{user.username}</span>
                            <svg
                                className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-2 z-50">
                                <button
                                    onClick={handleViewProfile}
                                    className="w-full text-left cursor-pointer px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>View Profile</span>
                                </button>

                                <button
                                    onClick={handleChangePassword}
                                    className="w-full text-left px-4 py-2 cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    <span>Change Password</span>
                                </button>

                                <div className="border-t border-gray-600 my-1"></div>

                                <button
                                    onClick={handleLogout}
                                    disabled={isLoading}
                                    className={`w-full text-left px-4 py-2 cursor-pointer text-red-400 hover:bg-red-600 hover:text-white transition-colors flex items-center space-x-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <a href="/account/login" className="font-bold text-white px-4 py-2 rounded-lg hover:text-gray-400 hover:cursor-pointer transition-colors">
                    Sign In
                </a>
            )}
        </div>
    );
}

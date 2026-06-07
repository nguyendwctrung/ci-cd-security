import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import speakingurl from "speakingurl";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function SearchBar() {
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState({ users: [], posts: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState("all"); // "all", "users", "posts"
    const searchRef = useRef(null);
    const debounceRef = useRef(null);
    const navigate = useNavigate();

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (keyword.trim().length < 2) {
            setResults({ users: [], posts: [] });
            setShowDropdown(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            await performSearch();
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [keyword]);

    const performSearch = async () => {
        if (keyword.trim().length < 2) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/api/search?keyword=${encodeURIComponent(keyword.trim())}&userLimit=5&postLimit=5`
            );
            const data = await response.json();
            
            if (data.success) {
                setResults({
                    users: data.data.users || [],
                    posts: data.data.posts || [],
                    totalUsers: data.data.totalUsers || 0,
                    totalPosts: data.data.totalPosts || 0
                });
                setShowDropdown(true);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setKeyword(e.target.value);
    };

    const handleUserClick = (user) => {
        setShowDropdown(false);
        setKeyword("");
        navigate(`/profile/${speakingurl(user.username)}_${user._id}`);
    };

    const handlePostClick = (post) => {
        setShowDropdown(false);
        setKeyword("");
        // Navigate directly to the post page
        navigate(`/post/${post._id}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && keyword.trim().length >= 2) {
            setShowDropdown(false);
            navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
        }
        if (e.key === "Escape") {
            setShowDropdown(false);
        }
    };

    const handleViewAll = (type) => {
        setShowDropdown(false);
        navigate(`/search?q=${encodeURIComponent(keyword.trim())}&tab=${type}`);
    };

    // Highlight matching text
    const highlightText = (text, keyword) => {
        if (!text || !keyword) return text;
        const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
        return parts.map((part, index) => 
            part.toLowerCase() === keyword.toLowerCase() 
                ? <span key={index} className="bg-yellow-500/30 text-yellow-300">{part}</span>
                : part
        );
    };

    // Strip HTML tags from content
    const stripHtml = (html) => {
        if (!html) return "";
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const filteredUsers = activeTab === "posts" ? [] : results.users;
    const filteredPosts = activeTab === "users" ? [] : results.posts;
    const hasResults = filteredUsers.length > 0 || filteredPosts.length > 0;

    return (
        <div className="relative" ref={searchRef}>
            <div className="flex items-center bg-gray-800/90 backdrop-blur-sm rounded-xl px-5 py-3 w-[500px] border border-gray-700/50 shadow-lg">
                <input
                    type="text"
                    placeholder="Search users, posts..."
                    className="bg-transparent text-white placeholder-gray-400 outline-none flex-1 text-sm"
                    value={keyword}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => keyword.trim().length >= 2 && setShowDropdown(true)}
                />
                <button 
                    className="text-gray-400 hover:text-blue-400 transition-colors ml-2"
                    onClick={performSearch}
                >
                    {isLoading ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Search Results Dropdown */}
            {showDropdown && (
                <div className="absolute top-full left-0 mt-3 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50 w-[500px] max-h-[80vh] overflow-hidden z-50">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-700/50 bg-gray-800/50">
                        <button
                            className={`flex-1 px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                                activeTab === "all" 
                                    ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10" 
                                    : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                            }`}
                            onClick={() => setActiveTab("all")}
                        >
                            All Results
                        </button>
                        <button
                            className={`flex-1 px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                                activeTab === "users" 
                                    ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10" 
                                    : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                            }`}
                            onClick={() => setActiveTab("users")}
                        >
                            Users ({results.totalUsers || 0})
                        </button>
                        <button
                            className={`flex-1 px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                                activeTab === "posts" 
                                    ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10" 
                                    : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                            }`}
                            onClick={() => setActiveTab("posts")}
                        >
                            Posts ({results.totalPosts || 0})
                        </button>
                    </div>

                    <div className="overflow-y-auto scrollbar-hide  max-h-[65vh] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        {!hasResults && !isLoading && (
                            <div className="p-8 text-center text-gray-400">
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <p className="text-sm">No results found for "<span className="text-white">{keyword}</span>"</p>
                                <p className="text-xs mt-1">Try different keywords or check spelling</p>
                            </div>
                        )}

                        {isLoading && (
                            <div className="p-8 text-center">
                                <svg className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-400 text-sm">Searching...</p>
                            </div>
                        )}

                        {/* Users Section */}
                        {filteredUsers.length > 0 && (
                            <div className="p-4">
                                <div className="flex items-center gap-2 px-3 py-2 mb-3">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Users</span>
                                </div>
                                <div className="space-y-1">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user._id}
                                            className="flex items-center gap-4 p-3 hover:bg-gray-800/50 rounded-lg cursor-pointer transition-all duration-200 group"
                                            onClick={() => handleUserClick(user)}
                                        >
                                            <div className="relative">
                                                {user.profile?.avatar ? (
                                                    <img 
                                                        src={user.profile.avatar}
                                                        alt={user.username || "User Avatar"}
                                                        className="w-10 h-10 rounded-full object-cover bg-gray-600 ring-2 ring-gray-700 group-hover:ring-blue-500/50 transition-all flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg font-bold ring-2 ring-gray-700 group-hover:ring-blue-500/50 transition-all flex-shrink-0">
                                                        {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white font-semibold truncate group-hover:text-blue-400 transition-colors">
                                                    {highlightText(user.username, keyword)}
                                                </div>
                                                {user.description && (
                                                    <div className="text-gray-400 text-sm truncate mt-0.5">
                                                        <div dangerouslySetInnerHTML={{ __html: highlightText(stripHtml(user.description), keyword) }}></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                {user.profile?.followers || 0}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {results.totalUsers > 5 && (
                                    <button
                                        className="w-full mt-3 text-center text-blue-400 hover:text-blue-300 text-sm py-2 px-4 rounded-lg hover:bg-blue-500/10 transition-all duration-200 font-medium"
                                        onClick={() => handleViewAll("users")}
                                    >
                                        View all {results.totalUsers} users
                                        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Posts Section */}
                        {filteredPosts.length > 0 && (
                            <div className="p-4 border-t border-gray-700/50">
                                <div className="flex items-center gap-2 px-3 py-2 mb-3">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Posts</span>
                                </div>
                                <div className="space-y-2">
                                    {filteredPosts.map((post) => (
                                        <div
                                            key={post._id}
                                            className="flex items-start gap-4 p-3 hover:bg-gray-800/50 rounded-lg cursor-pointer transition-all duration-200 group"
                                            onClick={() => handlePostClick(post)}
                                        >
    
                                            {post.avatar ? (
                                                <img 
                                                    src={post.avatar}
                                                    alt={post.username || "User Avatar"}
                                                    className="w-10 h-10 rounded-full object-cover bg-gray-600 ring-2 ring-gray-700 group-hover:ring-blue-500/50 transition-all flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg font-bold ring-2 ring-gray-700 group-hover:ring-blue-500/50 transition-all flex-shrink-0">
                                                    {post.username ? post.username.charAt(0).toUpperCase() : "U"}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                                                    <span>@{post.username}</span>
                                                    <span className="text-gray-600">•</span>
                                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-white text-sm leading-relaxed line-clamp-2 group-hover:text-blue-100 transition-colors">
                                                    {highlightText(stripHtml(post.content)?.substring(0, 150), keyword)}
                                                    {stripHtml(post.content)?.length > 150 && "..."}
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-gray-500 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                        {post.likesCount || 0}
                                                    </div>
                                                </div>
                                            </div>
                                            {post.images?.length > 0 && (
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={post.images[0]}
                                                        alt="Post"
                                                        className="w-14 h-14 rounded-lg object-cover ring-1 ring-gray-700 group-hover:ring-blue-500/50 transition-all"
                                                    />
                                                    {post.images.length > 1 && (
                                                        <div className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                            +{post.images.length - 1}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {results.totalPosts > 5 && (
                                    <button
                                        className="w-full mt-3 text-center text-blue-400 hover:text-blue-300 text-sm py-2 px-4 rounded-lg hover:bg-blue-500/10 transition-all duration-200 font-medium"
                                        onClick={() => handleViewAll("posts")}
                                    >
                                        View all {results.totalPosts} posts
                                        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {hasResults && (
                        <div className="border-t border-gray-700/50 p-4 bg-gray-800/30">
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                    Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Enter</kbd> for full search
                                </div>
                                <button
                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                                    onClick={() => handleViewAll("all")}
                                >
                                    View All Results →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
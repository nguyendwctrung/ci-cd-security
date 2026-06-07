import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Search } from "lucide-react";
import speakingurl from "speakingurl";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get("q") || "";
    const initialTab = searchParams.get("tab") || "all";


    const [activeTab, setActiveTab] = useState(initialTab);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [userPage, setUserPage] = useState(1);
    const [postPage, setPostPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPosts, setTotalPosts] = useState(0);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);

    const limit = 10;

    useEffect(() => {
        if (query) {

            fetchResults(query);
        }
    }, [query]);

    const fetchResults = async (searchKeyword) => {
        if (activeTab === "all" || activeTab === "users") {
            await fetchUsers(searchKeyword, 1);
        }
        if (activeTab === "all" || activeTab === "posts") {
            await fetchPosts(searchKeyword, 1);
        }
    };

    const fetchUsers = async (searchKeyword, page) => {
        setIsLoadingUsers(true);
        try {
            const response = await fetch(
                `${API_URL}/api/search/users?keyword=${encodeURIComponent(searchKeyword)}&page=${page}&limit=${limit}`
            );
            const data = await response.json();
            if (data.success) {
                if (page === 1) {
                    setUsers(data.data.users);
                } else {
                    setUsers((prev) => [...prev, ...data.data.users]);
                }
                setTotalUsers(data.data.total);
                setUserPage(page);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const fetchPosts = async (searchKeyword, page) => {
        setIsLoadingPosts(true);
        try {
            const response = await fetch(
                `${API_URL}/api/search/posts?keyword=${encodeURIComponent(searchKeyword)}&page=${page}&limit=${limit}`
            );
            const data = await response.json();
            if (data.success) {
                if (page === 1) {
                    setPosts(data.data.posts);
                } else {
                    setPosts((prev) => [...prev, ...data.data.posts]);
                }
                setTotalPosts(data.data.total);
                setPostPage(page);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setIsLoadingPosts(false);
        }
    };


    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(`/search?q=${encodeURIComponent(query)}&tab=${tab}`);
        if (tab === "users" && users.length === 0) {
            fetchUsers(query, 1);
        }
        if (tab === "posts" && posts.length === 0) {
            fetchPosts(query, 1);
        }
    };

    const handleUserClick = (user) => {
        navigate(`/profile/${speakingurl(user.username)}_${user._id}`);
    };

    const handlePostClick = (post) => {
        // Navigate directly to the post page
        navigate(`/post/${post._id}`);
    };

    const handleLoadMoreUsers = () => {
        fetchUsers(query, userPage + 1);
    };

    const handleLoadMorePosts = () => {
        fetchPosts(query, postPage + 1);
    };

    // Highlight matching text
    const highlightText = (text, keyword) => {
        if (!text || !keyword) return text;
        const parts = text.split(new RegExp(`(${keyword})`, "gi"));
        return parts.map((part, index) =>
            part.toLowerCase() === keyword.toLowerCase() ? (
                <span key={index} className="bg-yellow-500/30 text-yellow-300">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    // Strip HTML tags from content
    const stripHtml = (html) => {
        if (!html) return "";
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    return (
        <div className="min-h-screen pt-20 px-4">
            <div className="max-w-4xl mx-auto">


                {/* Results count */}
                {query && (
                    <div className="mb-4 text-gray-400">
                        Found {totalUsers} users and {totalPosts} posts for "{query}"
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-gray-700 mb-6">
                    <button
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === "all"
                                ? "text-blue-400 border-b-2 border-blue-400"
                                : "text-gray-400 hover:text-white"
                        }`}
                        onClick={() => handleTabChange("all")}
                    >
                        All Results
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === "users"
                                ? "text-blue-400 border-b-2 border-blue-400"
                                : "text-gray-400 hover:text-white"
                        }`}
                        onClick={() => handleTabChange("users")}
                    >
                        Users ({totalUsers})
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === "posts"
                                ? "text-blue-400 border-b-2 border-blue-400"
                                : "text-gray-400 hover:text-white"
                        }`}
                        onClick={() => handleTabChange("posts")}
                    >
                        Posts ({totalPosts})
                    </button>
                </div>

                {/* Users Section */}
                {(activeTab === "all" || activeTab === "users") && (
                    <div className="mb-8">
                        {activeTab === "all" && users.length > 0 && (
                            <h2 className="text-xl font-bold text-white mb-4">Users</h2>
                        )}
                        
                        {isLoadingUsers && users.length === 0 ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : users.length === 0 && query ? (
                            activeTab === "users" && (
                                <div className="text-center text-gray-400 py-8">
                                    No users found for "{query}"
                                </div>
                            )
                        ) : (
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-center gap-4 p-4 bg-black/70 rounded-lg hover:bg-black/90 cursor-pointer transition-colors"
                                        onClick={() => handleUserClick(user)}
                                    >
                                        {user.profile?.avatar ? (
                                            <img
                                                src={user.profile.avatar}
                                                alt={user.username}
                                                className="w-16 h-16 rounded-full object-cover bg-gray-600 flex-shrink-0"
                                            ></img>
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white font-semibold text-lg">
                                                {highlightText(user.username, query)}
                                            </div>
                                            {user.description && (
                                              
                                                <div className = "text-white" dangerouslySetInnerHTML={{ __html: highlightText(stripHtml(user.description), query) }}></div>
                                                    
                                            )}
                                        </div>
                                        <div className="text-right text-gray-500 text-sm">
                                            <div>{user.profile?.followers || 0} followers</div>
                                            <div>{user.profile?.following || 0} following</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {users.length < totalUsers && (
                            <div className="text-center mt-4">
                                <button
                                    className="text-blue-400 hover:text-blue-300 font-medium"
                                    onClick={handleLoadMoreUsers}
                                    disabled={isLoadingUsers}
                                >
                                    {isLoadingUsers ? "Loading..." : "Load more users"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Posts Section */}
                {(activeTab === "all" || activeTab === "posts") && (
                    <div className="mb-8">
                        {activeTab === "all" && posts.length > 0 && (
                            <h2 className="text-xl font-bold text-white mb-4">Posts</h2>
                        )}

                        {isLoadingPosts && posts.length === 0 ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : posts.length === 0 && query ? (
                            activeTab === "posts" && (
                                <div className="text-center text-gray-400 py-8">
                                    No posts found for "{query}"
                                </div>
                            )
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <div
                                        key={post._id}
                                        className="p-4 bg-black/70 rounded-lg hover:bg-black/90 cursor-pointer transition-colors"
                                        onClick={() => handlePostClick(post)}
                                    >
                                        <div className="flex items-start gap-3">
                                            {post.avatar ? 
                                            (
                                                <img
                                                    src={post.avatar}
                                                    alt={post.username}
                                                    className="w-12 h-12 rounded-full object-cover bg-gray-600 flex-shrink-0"
                                                ></img>
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                                                    {post.username.charAt(0).toUpperCase()}
                                                </div>
                                            )
                                            }
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-medium">
                                                        @{post.username}
                                                    </span>
                                                    <span className="text-gray-500 text-sm">
                                                        · {new Date(post.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="text-white mt-2 whitespace-pre-wrap">
                                                    {highlightText(stripHtml(post.content), query)}
                                                </div>
                                                {post.images?.length > 0 && (
                                                    <div className="flex gap-2 mt-3 overflow-x-auto">
                                                        {post.images.slice(0, 4).map((img, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={img}
                                                                alt={`Post image ${idx + 1}`}
                                                                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                                                            />
                                                        ))}
                                                        {post.images.length > 4 && (
                                                            <div className="w-24 h-24 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400">
                                                                +{post.images.length - 4}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 mt-3 text-gray-400 text-sm">
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="w-4 h-4" /> {post.likesCount || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageCircle className="w-4 h-4" /> {post.commentsCount || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {posts.length < totalPosts && (
                            <div className="text-center mt-4">
                                <button
                                    className="text-blue-400 hover:text-blue-300 font-medium"
                                    onClick={handleLoadMorePosts}
                                    disabled={isLoadingPosts}
                                >
                                    {isLoadingPosts ? "Loading..." : "Load more posts"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty state */}
                {!query && (
                    <div className="text-center text-gray-400 py-16">
                        <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-xl">Start searching for users or posts</p>
                    </div>
                )}
            </div>
        </div>
    );
}

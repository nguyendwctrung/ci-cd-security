import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import notificationIcon from "@/assets/icons/bell.png";
import { useSocket } from "@/hooks/useSocket.jsx";
import { useAuth } from "@/routes/ProtectedRouter.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function BellNotification() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();

    // Register user for socket notifications
    useEffect(() => {
        if (socket && isConnected && user?._id) {
            socket.emit("register_user", user._id);
            
            // Cleanup on unmount
            return () => {
                socket.emit("unregister_user", user._id);
            };
        }
    }, [socket, isConnected, user?._id]);

    // Listen for real-time notifications
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification) => {
            console.log("New notification received:", notification);
            
            // Add to notifications list
            setNotifications((prev) => [notification, ...prev]);
            
            // Increment unread count
            setUnreadCount((prev) => prev + 1);
        };

        socket.on("new_notification", handleNewNotification);

        return () => {
            socket.off("new_notification", handleNewNotification);
        };
    }, [socket]);

    // Fetch unread count on mount (fallback for when socket reconnects)
    useEffect(() => {
        fetchUnreadCount();
    }, []);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (open && notifications.length === 0) {
            fetchNotifications(1);
        }
    }, [open]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(`${API_URL}/api/notification/unread-count`, {
                method: "GET",
                credentials: "include",
            });
            const data = await response.json();
            if (data.success) {
                setUnreadCount(data.data.unreadCount);
            }
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    };

    const fetchNotifications = async (pageNum) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/api/notification?page=${pageNum}&limit=10`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );
            const data = await response.json();
            if (data.success) {
                if (pageNum === 1) {
                    setNotifications(data.data.notifications);
                } else {
                    setNotifications((prev) => [...prev, ...data.data.notifications]);
                }
                setPage(pageNum);
                setHasMore(pageNum < data.data.totalPages);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.isRead) {
            try {
                await fetch(`${API_URL}/api/notification/${notification._id}/read`, {
                    method: "PATCH",
                    credentials: "include",
                });
                // Update local state
                setNotifications((prev) =>
                    prev.map((n) =>
                        n._id === notification._id ? { ...n, isRead: true } : n
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        }

        // Navigate to post
        if (notification.post) {
            navigate(`/post/${notification.post}`);
            setOpen(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetch(`${API_URL}/api/notification/read-all`, {
                method: "PATCH",
                credentials: "include",
            });
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !isLoading) {
            fetchNotifications(page + 1);
        }
    };

    const getNotificationMessage = (notification) => {
        const username = notification.senderUsername || "Someone";
        switch (notification.type) {
            case "like_post":
                return `${username} liked your post`;
            case "like_comment":
                return `${username} liked your comment`;
            case "reply_comment":
                return `${username} replied to your comment`;
            case "comment_post":
                return `${username} commented on your post`;
            default:
                return `${username} interacted with your content`;
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMins > 0) return `${diffMins}m ago`;
        return "Just now";
    };

    // Strip HTML tags
    const stripHtml = (html) => {
        if (!html) return "";
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className={`relative w-fit p-2 hover:cursor-pointer hover:bg-gray-700 rounded-3xl 
                transition-all duration-300 ${open ? "bg-gray-700" : ""}`}
                onClick={() => setOpen((o) => !o)}
            >
                <img src={notificationIcon} className="w-[30px]" alt="Notifications" />
                {unreadCount > 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 w-5 h-5 rounded-full flex justify-center items-center text-white font-bold text-xs border-2 border-gray-900">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                )}
            </div>

            {/* Dropdown */}
            <div
                className={`absolute top-full mt-2 right-0 w-[350px] bg-gray-900 border border-gray-700 shadow-xl rounded-xl overflow-hidden transition-all duration-300 z-50
                ${open ? "visible opacity-100" : "invisible opacity-0"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-white font-semibold text-lg">Notifications</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notification List */}
                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading && notifications.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">🔔</div>
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <>
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`flex items-start gap-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-800 ${
                                        !notification.isRead ? "bg-blue-900/20" : ""
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        {notification.senderAvatar ? (
                                            <img
                                                src={notification.senderAvatar}
                                                alt={notification.senderUsername}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                                                {notification.senderUsername?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                        )}
                                        {/* Icon type */}
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs">
                                            {notification.type === "like_post" && "❤️"}
                                            {notification.type === "like_comment" && "❤️"}
                                            {notification.type === "reply_comment" && "💬"}
                                            {notification.type === "comment_post" && "💬"}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm">
                                            <span className="font-semibold">
                                                {notification.senderUsername}
                                            </span>{" "}
                                            {getNotificationMessage(notification).replace(
                                                notification.senderUsername,
                                                ""
                                            )}
                                        </p>
                                        {notification.contentPreview && (
                                            <p className="text-gray-400 text-xs mt-1 truncate">
                                                "{stripHtml(notification.contentPreview)}"
                                            </p>
                                        )}
                                        <p className="text-gray-500 text-xs mt-1">
                                            {getTimeAgo(notification.createdAt)}
                                        </p>
                                    </div>

                                    {/* Unread indicator */}
                                    {!notification.isRead && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                    )}
                                </div>
                            ))}

                            {/* Load more */}
                            {hasMore && (
                                <div className="p-3 text-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoading}
                                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                    >
                                        {isLoading ? "Loading..." : "Load more"}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export function MenuInsideBell() {
    // This component is no longer needed, keeping for backward compatibility
    return null;
}

import * as notificationService from "../../services/notification.service.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20 } = req.query;

        const result = await notificationService.getNotifications({
            userId,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            message: "Notifications fetched successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching notifications"
        });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const count = await notificationService.getUnreadCount(userId);

        res.json({
            success: true,
            data: { unreadCount: count }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error getting unread count"
        });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const { notificationId } = req.params;

        const notification = await notificationService.markAsRead(notificationId, userId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.json({
            success: true,
            message: "Notification marked as read",
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error marking notification as read"
        });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        await notificationService.markAllAsRead(userId);

        res.json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error marking all notifications as read"
        });
    }
};

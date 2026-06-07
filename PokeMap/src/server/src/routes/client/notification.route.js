import express from "express";
import * as notificationController from "../../controllers/client/notification.controller.js";
import { verifyToken } from "../../middlewares/auth.middlewares.js";

const router = express.Router();

// Lấy danh sách thông báo
router.get("/", verifyToken, notificationController.getNotifications);

// Lấy số thông báo chưa đọc
router.get("/unread-count", verifyToken, notificationController.getUnreadCount);

// Đánh dấu một thông báo đã đọc
router.patch("/:notificationId/read", verifyToken, notificationController.markAsRead);

// Đánh dấu tất cả đã đọc
router.patch("/read-all", verifyToken, notificationController.markAllAsRead);

export default router;

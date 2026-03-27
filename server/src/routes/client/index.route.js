import express from "express";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import mapRouter from "./map.route.js";
import postRouter from "./post.route.js";
import uploadRouter from "./upload.route.js";
import searchRouter from "./search.route.js";
import notificationRouter from "./notification.route.js";
const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/map", mapRouter);
router.use("/post", postRouter);
router.use("/upload", uploadRouter);
router.use("/search", searchRouter);
router.use("/notification", notificationRouter);
export default router;
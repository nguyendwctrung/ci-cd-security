import express from "express";
import * as userController from "../../controllers/client/user.controller.js";
import { upload } from "../../config/cloudinary.config.js";
import {verifyToken} from "../../middlewares/auth.middlewares.js";
const router = express.Router();


router.get("/profile", userController.getUserProfile);
router.patch("/profile/edit", verifyToken, upload.single("avatar"), userController.editUserProfile);
router.post("/profile/change-password", verifyToken, userController.changePassword);
router.get("/profile/follow/list", verifyToken, userController.getFollowList);
router.get("/banned", userController.isUserBanned);
router.post("/:userId/follow", verifyToken, userController.followUser); // done

export default router;
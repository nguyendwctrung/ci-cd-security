import express from "express";
import * as authController from "../../controllers/client/auth.controller.js";
import {verifyToken} from "../../middlewares/auth.middlewares.js";
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/verify-otp-signup", authController.verifySignupOTP);
router.post("/resend-otp-signup", authController.resendSignupOTP);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp-forgot-password", authController.verifyForgotPasswordOTP);
router.post("/reset-password", authController.resetPassword);
router.get("/me", verifyToken, authController.getMe);
router.post("/logout", verifyToken, authController.logout);
export default router;

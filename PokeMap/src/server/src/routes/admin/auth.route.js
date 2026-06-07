import express from "express";
import * as authController from "../../controllers/admin/auth.controller.js";

const router = express.Router();

router.post("/signup", authController.signupAdmin);
router.post("/verify-otp-signup", authController.verifyAdminSignupOTP);
router.post("/resend-otp-signup", authController.resendAdminSignupOTP);
router.post("/login", authController.loginAdmin);
router.post("/forgot-password", authController.forgotPasswordAdmin);
router.post("/verify-otp-forgot-password", authController.verifyAdminForgotPasswordOTP);
router.post("/reset-password", authController.resetAdminPassword);
router.get("/verify-token", authController.verifyAdminToken);
router.post("/logout", authController.logoutAdmin);

export default router;

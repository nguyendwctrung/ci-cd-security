import jwt from 'jsonwebtoken';
import {
    signupService,
    verifySignupOTPService,
    resendSignupOTPService,
    loginService,
    forgotPasswordService,
    verifyForgotPasswordOTPService,
    resetPasswordService
} from '../../services/auth.service.js';

// SIGNUP ADMIN - Step 1
export const signupAdmin = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        
        // Validate input
        if (!email || !password || !username) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and username are required'
            });
        }

        const result = await signupService(email, password, username, 'admin');
        
        res.status(200).json({
            success: result.success,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Admin signup error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during admin signup'
        });
    }
};

// VERIFY ADMIN SIGNUP OTP - Step 2
export const verifyAdminSignupOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const result = await verifySignupOTPService(email, otp, 'admin');
        
        res.status(201).json({
            success: result.success,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Verify admin OTP error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during admin verification'
        });
    }
};

// RESEND ADMIN SIGNUP OTP
export const resendAdminSignupOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const result = await resendSignupOTPService(email, 'admin');
        
        res.status(200).json({
            success: result.success,
            message: result.message
        });

    } catch (error) {
        console.error('Resend admin OTP error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during OTP resend'
        });
    }
};

// LOGIN ADMIN
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await loginService(email, password, 'admin');

        // Create JWT token
        const token = jwt.sign(
            { id: result.data.user.id, email: result.data.user.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set cookie
        res.cookie("adminToken", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: result.success,
            message: result.message,
            token: token,
            data: result.data
        });

    } catch (error) {
        console.error('Admin login error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during admin login'
        });
    }
};

// FORGOT PASSWORD ADMIN
export const forgotPasswordAdmin = async (req, res) => {
    try {
        const { email } = req.body;

        const result = await forgotPasswordService(email, 'admin');
        
        res.status(200).json({
            success: result.success,
            message: result.message
        });

    } catch (error) {
        console.error('Admin forgot password error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during forgot password'
        });
    }
};

// VERIFY ADMIN FORGOT PASSWORD OTP
export const verifyAdminForgotPasswordOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const result = await verifyForgotPasswordOTPService(email, otp);
        
        res.status(200).json({
            success: result.success,
            message: result.message
        });

    } catch (error) {
        console.error('Verify admin forgot password OTP error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during OTP verification'
        });
    }
};

// RESET ADMIN PASSWORD
export const resetAdminPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const result = await resetPasswordService(email, newPassword, 'admin');
        
        res.status(200).json({
            success: result.success,
            message: result.message
        });

    } catch (error) {
        console.error('Admin reset password error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during password reset'
        });
    }
};

// VERIFY ADMIN TOKEN
export const verifyAdminToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Type guard to check if decoded is an object with role property
        if (typeof decoded === 'string' || !decoded.role || decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token is valid',
            role: decoded.role,
            userId: decoded.id,
            email: decoded.email
        });

    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// LOGOUT ADMIN
export const logoutAdmin = async (req, res) => {
    try {
        res.clearCookie("adminToken");
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Admin logout error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during logout'
        });
    }
};

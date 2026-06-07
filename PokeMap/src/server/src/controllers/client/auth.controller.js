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

import { User } from '../../models/auth.model.js';

// SIGNUP - Step 1
export const signup = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        
        // Validate input
        if (!email || !password || !username) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and username are required'
            });
        }

        const result = await signupService(email, password, username, 'user');
        
        res.status(200).json({
            success: result.success,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Signup error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during signup'
        });
    }
};

// VERIFY SIGNUP OTP - Step 2
export const verifySignupOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const result = await verifySignupOTPService(email, otp, 'user');
        
        res.status(201).json({
            success: result.success,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Verify OTP error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during verification'
        });
    }
};

// RESEND SIGNUP OTP
export const resendSignupOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const result = await resendSignupOTPService(email, 'user');
        
        res.status(200).json({
            success: result.success,
            message: result.message
        });

    } catch (error) {
        console.error('Resend OTP error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during OTP resend'
        });
    }
};

// LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await loginService(email, password, 'user');

        // Create JWT token
        const token = jwt.sign(
            { id: result.data.user.id, email: result.data.user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );


        // Set cookie
        res.cookie("accessToken", token, {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: result.success,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during login'
        });
    }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const result = await forgotPasswordService(email, 'user');
        
        res.status(200).json({
            success: result.success,
            message: result.message
        });

    } catch (error) {
        console.error('Forgot Password error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during forgot password'
        });
    }
};

// VERIFY FORGOT PASSWORD OTP
export const verifyForgotPasswordOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const result = await verifyForgotPasswordOTPService(email, otp);
        
        res.status(200).json({
            success: result.success,
            message: result.message
        });

    } catch (error) {
        console.error('Verify Forgot Password OTP error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during OTP verification'
        });
    }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const result = await resetPasswordService(email, newPassword, 'user');
        
        res.status(200).json({
            success: result.success,
            message: result.message
        });

    } catch (error) {
        console.error('Reset Password error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Server error during password reset'
        });
    }
};

// GET ME
export const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await User.findById(userId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            user: result
        });
    } catch (error) {
        console.error('Get Me error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during fetching user data'
        });
    }
};


// LOGOUT
export const logout = async (req, res) => {
    try {
        if (!req.cookies.accessToken) {
            return res.status(400).json({
                success: false,
                message: 'No active session found'
            });
        }
        res.clearCookie("accessToken", {
            httpOnly: false,
            secure: false,
            sameSite: 'lax'
        });
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during logout'
        });
    }
};
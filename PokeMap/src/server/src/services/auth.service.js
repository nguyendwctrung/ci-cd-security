import { User, PendingUser, OTPResetPassword } from '../models/auth.model.js';
import sendEmail from '../config/email.config.js';
import { generateOTP, hashPassword, comparePassword } from '../helpers/auth.helper.js';

// SIGNUP SERVICE - Create pending user and send OTP
export const signupService = async (email, password, username, role = 'user') => {
    // 1. Check if user already exists (check both as user and admin)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error(`Email already registered`);
    }

    // 2. Check if email exists in pending (delete old entry for same role)
    await PendingUser.deleteOne({ email, role });

    // 3. Hash password
    const hashedPassword = await hashPassword(password);

    // 4. Generate OTP
    const otp = generateOTP();

    // 5. Create pending user
    const pendingUser = new PendingUser({
        email,
        password: hashedPassword,
        username,
        otp,
        role
    });

    await pendingUser.save();

    // 6. Send OTP email
    await sendEmail(
        email,
        `Your ${role.charAt(0).toUpperCase() + role.slice(1)} Signup OTP`,
        `Your OTP for completing ${role} signup is: ${otp}. It is valid for 10 minutes.`
    );

    return {
        success: true,
        message: `OTP sent to your email. Please verify to complete ${role} signup.`,
        data: { email }
    };
};

// VERIFY SIGNUP OTP SERVICE
export const verifySignupOTPService = async (email, otp, role = 'user') => {
    // 1. Find pending user
    const pendingUser = await PendingUser.findOne({ email, role });
    if (!pendingUser) {
        throw new Error(`No pending ${role} signup found for this email`);
    }

    // 2. Check if OTP expired
    if (new Date() > pendingUser.otpExpires) {
        await PendingUser.deleteOne({ email });
        throw new Error('OTP expired. Please signup again.');
    }

    // 3. Check attempts limit
    if (pendingUser.attempts >= 3) {
        await PendingUser.deleteOne({ email });
        throw new Error('Too many failed attempts. Please signup again.');
    }

    // 4. Verify OTP
    if (pendingUser.otp !== otp) {
        pendingUser.attempts += 1;
        await pendingUser.save();
        throw new Error(`Invalid OTP. ${3 - pendingUser.attempts} attempts remaining.`);
    }

    // 5. OTP is valid - Create real user
    const newUser = new User({
        email: pendingUser.email,
        password: pendingUser.password,
        username: pendingUser.username,
        role: pendingUser.role,
        emailVerified: true
    });

    await newUser.save();

    // 6. Delete pending user
    await PendingUser.deleteOne({ email });

    return {
        success: true,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`,
        data: {
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role
            }
        }
    };
};

// RESEND SIGNUP OTP SERVICE
export const resendSignupOTPService = async (email, role = 'user') => {
    // Find pending user
    const pendingUser = await PendingUser.findOne({ email, role });
    if (!pendingUser) {
        throw new Error(`No pending ${role} signup found for this email`);
    }

    if (pendingUser.recreation >= 3) {
        await PendingUser.deleteOne({ email });
        throw new Error('OTP resend limit reached. Please signup again.');
    }

    // Generate new OTP
    const newOTP = generateOTP();
    
    // Update pending user
    pendingUser.otp = newOTP;
    pendingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    pendingUser.attempts = 0;
    pendingUser.recreation += 1;
    
    await pendingUser.save();

    // Send new OTP
    await sendEmail(
        email,
        `Your New ${role.charAt(0).toUpperCase() + role.slice(1)} Signup OTP`,
        `Your new OTP for completing ${role} signup is: ${newOTP}. It is valid for 10 minutes.`
    );

    return {
        success: true,
        message: 'New OTP sent to your email'
    };
};

// LOGIN SERVICE
export const loginService = async (email, password, role = 'user') => {
    // 1. Find user
    const user = await User.findOne({ email, role });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    // 2. Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    return {
        success: true,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} login successful`,
        data: {
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                profile: user.profile
            }
        }
    };
};

// FORGOT PASSWORD SERVICE
export const forgotPasswordService = async (email, role = 'user') => {
    const user = await User.findOne({ email, role });
    if (!user) {
        throw new Error(`${role.charAt(0).toUpperCase() + role.slice(1)} email not found`);
    }

    await OTPResetPassword.deleteMany({ email });

    const otp = generateOTP();

    const otpEntry = new OTPResetPassword({
        email: email,
        otp: otp
    });

    await otpEntry.save();

    await sendEmail(
        email,
        `Your ${role.charAt(0).toUpperCase() + role.slice(1)} Password Reset OTP`,
        `Your OTP for resetting your ${role} password is: ${otp}. It is valid for 10 minutes.`
    );

    return {
        success: true,
        message: 'OTP sent to your email'
    };
};

// VERIFY FORGOT PASSWORD OTP SERVICE
export const verifyForgotPasswordOTPService = async (email, otp) => {
    const otpEntry = await OTPResetPassword.findOne({ email });

    if (!otpEntry) {
        throw new Error('No OTP request found for this email');
    }

    if (new Date() > otpEntry.otpExpires) {
        await OTPResetPassword.deleteMany({ email });
        throw new Error('OTP expired. Please request a new one.');
    }

    if (otpEntry.attempts >= 3) {
        await OTPResetPassword.deleteMany({ email });
        throw new Error('Too many failed attempts. Please request a new OTP.');
    }   

    if (otpEntry.otp !== otp) {
        otpEntry.attempts += 1;
        await otpEntry.save();
        throw new Error(`Invalid OTP. ${3 - otpEntry.attempts} attempts remaining.`);
    }

    return {
        success: true,
        message: 'OTP verified. You can now reset your password.'
    };
};

// RESET PASSWORD SERVICE
export const resetPasswordService = async (email, newPassword, role = 'user') => {
    const user = await User.findOne({ email, role });

    if (!user) {
        throw new Error(`${role.charAt(0).toUpperCase() + role.slice(1)} email not found`);
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    await OTPResetPassword.deleteMany({ email });

    return {
        success: true,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} password reset successful`
    };
};

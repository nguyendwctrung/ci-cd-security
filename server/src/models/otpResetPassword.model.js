import mongoose from 'mongoose';

const otpResetPasswordSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    otpExpires: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000)
    },
    attempts: {
        type: Number,
        default: 0,
        max: 3
    }
}, {
    timestamps: true,
    strict: false
});

export const OTPResetPassword = mongoose.model('OTP_Reset_Password', otpResetPasswordSchema);

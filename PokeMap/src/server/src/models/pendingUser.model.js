import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    profile: {
        firstName: String,
        lastName: String
    },
    otp: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
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
    },
    recreation: {
        type: Number,
        default: 0,
        max: 3
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
    }
}, {
    timestamps: true,
    strict: false
});

// Compound unique index: email + role combination must be unique
pendingUserSchema.index({ email: 1, role: 1 }, { unique: true });

export const PendingUser = mongoose.model('Pending_users', pendingUserSchema);

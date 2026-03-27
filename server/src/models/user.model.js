import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    avatar: { 
        type: String 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    sex: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other'
    },
    description: {
        type: String,
        default: ''
    },
    profile: {
        avatar: {
            type: String,
            default: ''
        },
        followers: {
            type: Number,
            default: 0
        },
        following: {
            type: Number,
            default: 0
        }
    },
    emailVerified: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    selectedPokemon: {
        type: [Number], // Array of Pokemon IDs
        default: []
    },
    bannedAt: {
        type: Date,
        default: null
    }
    },
    {
        timestamps: true,
        strict: false
    }
    
);

export const User = mongoose.model('Users', userSchema);

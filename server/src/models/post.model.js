import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users', 
        required: true 
    },
    content: { 
        type: String,
        required: true
    },
    images: [{ 
        type: String 
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    lastEditedAt: { 
        type: Date 
    },
    isDeleted: { 
        type: Boolean, 
        default: false 
    },
    deletedAt: { 
        type: Date 
    },
    isWarned: { 
        type: Boolean, 
        default: false 
    }
}, {
    timestamps: true,
    strict: false
});

export const Post = mongoose.model('Posts', postSchema);
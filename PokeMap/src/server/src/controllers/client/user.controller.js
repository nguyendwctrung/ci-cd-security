import * as userService from "../../services/user.service.js";
import uploadToCloudinary from "../../config/cloudinary.config.js";
import fs from 'fs';
import {User} from "../../models/user.model.js";
import * as authHelper from '../../helpers/auth.helper.js';
export async function getUserProfile (req, res) {
    try{
        const {id, username} = req.query;
        const userProfile = await userService.findUserProfile(id, username);
        if (!userProfile) {
            return  res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            data: userProfile
        })
    }
    catch (e){
        res.status(500).json({
            success: false,
            message: e.message || "Server error fetching user profile"
        })
    }
}

export async function editUserProfile (req, res) {
    try{
        const userId = req.user.id;
        const updateData = req.body;
        const avatarFile = req.file;

        if (avatarFile) {
            const avatarUploadResult = await uploadToCloudinary(avatarFile.path, 'avatar_user_pokemap');
            updateData['profile.avatar'] = avatarUploadResult.secure_url;
            fs.unlinkSync(avatarFile.path);
            
        }
        const updatedUser = await userService.updateUserProfile(userId, updateData);
        res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            data: updatedUser
        })

    }
    catch (e){
        res.status(500).json({
            success: false,
            message: e.message || "Server error updating user profile"
        })
    }
}

export async function changePassword (req, res) {
    try {   
        const userId =  req.user.id;
        const { currentPassword, newPassword} = req.body;
        // verify current password
        const password = await User.findById(userId).select('password');
        const isMatch = await authHelper.comparePassword(currentPassword, password.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }
        // update to new password
        const result = await User.findByIdAndUpdate(
            userId,
            { password: await authHelper.hashPassword(newPassword) },
            { new: true }
        ).select('-password');
        res.status(200).json({
            success: true,
            message: "Password changed successfully",
            data: result
        });

    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: e.message || "Server error changing password"
        })
    }
}

export async function isUserBanned (req, res) {
    try {
        const {id} = req.query;
        const user = await User.findById(id).select('bannedAt');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const isBanned = user.bannedAt ? true : false;
        res.status(200).json({
            success: true,
            message: "User ban status fetched successfully",
            isBanned: isBanned
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: e.message || "Server error checking user ban status"
        })
    }
}



export async function getFollowList (req, res) {
    try{
        const { userId, type } = req.query;
        const currentUserId = req.user ? req.user.id : null;
        const followList = await userService.getFollowList ({ userId, type, currentUserId });
        res.status(200).json({
            success: true,
            message: "Follow list fetched successfully",
            data: followList
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message || "Server error fetching follow list"
        });
    }

}
export async function followUser (req, res) {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user.id;
        const result = await userService.followUser ({ targetUserId, currentUserId });
        if (!result){
            return res.status(400).json({
                success: false,
                message: "Failed to follow/unfollow user"
            });
        }
        res.status(200).json({
            success: true,
            message: result.isFollowing ? "User followed successfully" : "User unfollowed successfully",
        });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            message: e.message || "Server error following/unfollowing user"
        })
    }
}

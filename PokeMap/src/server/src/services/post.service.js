import { Post } from '../models/post.model.js'
import {Like} from '../models/like.model.js'
import {Follow} from '../models/follow.model.js'
import {User} from '../models/user.model.js'
import { PostWarning } from '../models/postModeration.model.js'
import sendEmail from '../config/email.config.js';
import mongoose from 'mongoose';
import * as notificationService from './notification.service.js';

//  ADMIN FUNCTIONS
export const getAllPosts = async ({page, limit, search}) => {
    
    try{
        const skip = (page - 1) * limit;
        /** @type {import('mongoose').PipelineStage[]} */
        let pipeline = [];

        let userIds = []; // For storing matching user IDs from search

        // Step 0: If searching, find matching users first
        if (search && search.trim() !== "") {
            const matchingUsers = await User.aggregate([
                {
                    $search: {
                        index: "user_search_index",
                        text: {
                            query: search,
                            path: ["username"],
                            fuzzy: { maxEdits: 1 }
                        }
                    }
                },
                {
                    $project: { _id: 1 }
                }
            ]);

            userIds = matchingUsers.map(u => u._id);
        }

        // Step 1: Search on content FIRST (if search provided)
        if (search && search.trim() !== "") {
            pipeline.push({
                $search: {
                    index: "post_search_index",
                    text: {
                        query: search,
                        path: ["content"],
                        fuzzy: { maxEdits: 1 }
                    }
                }
            });

            pipeline.push({
                $addFields: {
                    searchScore: { $meta: "searchScore" }
                }
            });

            // Union with posts from matching users
            if (userIds.length > 0) {
                pipeline.push({
                    $unionWith: {
                        coll: "posts",
                        pipeline: [
                            {
                                $match: {
                                    user: { $in: userIds }
                                }
                            },
                            {
                                $addFields: {
                                    searchScore: 10  // Lower score for username match
                                }
                            }
                        ]
                    }
                });
            }

            // Remove duplicates if same post matches both content and user
            pipeline.push({
                $group: {
                    _id: "$_id",
                    doc: { $first: "$$ROOT" },
                    maxScore: { $max: "$searchScore" }
                }
            });

            pipeline.push({
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$doc", { searchScore: "$maxScore" }]
                    }
                }
            });
        }

        // Step 2: Lookup userInfo
        pipeline.push({
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo"
            }
        });

        // Step 3: Extract username and avatar
        pipeline.push({
            $addFields: {
                username: { $arrayElemAt: ["$userInfo.username", 0] },
                avatar: { $arrayElemAt: ["$userInfo.profile.avatar", 0] }
            }
        });

        // Step 4: Sort
        pipeline.push({
            $sort: search && search.trim() !== ""
                ? { searchScore: -1, createdAt: -1 }
                : { createdAt: -1 }
        });

        // Step 5: Remove userInfo before facet
        pipeline.push({
            $project: {
                userInfo: 0,
                searchScore: 0
            }
        });

        // Step 6: Facet for pagination + other lookups
        pipeline.push({
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "post_warnings",
                            localField: "_id",
                            foreignField: "post",
                            as: "warnings"
                        }
                    },
                    {
                        $lookup: {
                            from: "comments",
                            localField: "_id",
                            foreignField: "post",
                            as: "comments"
                        }
                    },
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "post",
                            as: "likes"
                        }
                    },
                    {
                        $addFields: {
                            warning_counts: { $arrayElemAt: ["$warnings.warningCount", 0] },
                            comments: { $size: "$comments" },
                            likes: { $size: "$likes" }
                        }
                    },
                    {
                        $project: {
                            warnings: 0
                        }
                    }
                ],
                total: [
                    { $count: "count" }
                ]
            }
        });

        const result = await Post.aggregate(pipeline);
        const posts = result[0].data;
        const totalCount = result[0].total[0] ? result[0].total[0].count : 0;

        return {
            data: posts,
            totalCount: totalCount
        };
    }
    catch (error) {
        console.error("Error in getAllPosts:", error);
        return null;
    }
}

export const getPostById = async (postId) => {
    return await Post.findById(postId);
}

export const countPosts = async () => {
    return await Post.countDocuments();
}

// ADMIN FUNCTION
export const warnPost = async (postId, warningType, description, warnedBy) => {
    // Find the post
    const post = await Post.findById(postId);


    if (!post) {
        return null;
    }
    console.log("Post found:", postId);
    // Check existing warnings for this post
    const existingWarning = await PostWarning.findOne({ post: postId});
    console.log("Existing warning:", existingWarning);
    let warningCount = 1;
    let warning;

    if (existingWarning) {
        // Update existing warning
        existingWarning.warningCount += 1;
        existingWarning.warningCount = existingWarning.warningCount >= 3 ? 3 : existingWarning.warningCount;
        warningCount = existingWarning.warningCount;
        warning = await existingWarning.save();
    } else {
        // Create new warning
        warning = new PostWarning({
            post: postId,
            warningType,
            description,
            warnedBy,
            warningCount: 1
        });
        console.log("Creating new warning:", warning);
        warning = await warning.save();
        console.log("New warning saved:", warning);
    }
    if (post.isDeleted){
        return {
            code : "FAILED",
            message: `Post is already deleted.`,
            warning_counts: warningCount,
            isDeleted: post.isDeleted,
            deletedAt: post.deletedAt
        }
    }
    // Update post
    post.isWarned = true;
    const author = await Post.findById(postId).populate('user');

    // @ts-ignore
    if (author.user && author.user.email) {
        // @ts-ignore
        console.log("Sending email to: ", author.user.email);

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #ff6b35; margin: 0; font-size: 28px;">⚠️ Post Warning</h1>
                    </div>

                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <h2 style="color: #856404; margin: 0 0 15px 0; font-size: 20px;">Your post has been warned</h2>
                        <p style="color: #856404; margin: 0; font-size: 16px; line-height: 1.5;">
                            Your post has received a warning and requires your attention.
                        </p>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Warning Details:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555; width: 120px;">Post Content:</td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">
                                    <div style="max-height: 100px; overflow-y: auto; background-color: #f8f9fa; padding: 8px; border-radius: 4px; border: 1px solid #dee2e6;">
                                        ${post.content.length > 300 ? post.content.substring(0, 300) + '...' : post.content}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Warning Type:</td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${warningType}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Description:</td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${description}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; font-weight: bold; color: #555;">Warning Count:</td>
                                <td style="padding: 10px 0; color: #d9534f; font-weight: bold; font-size: 18px;">${warningCount} out of 3</td>
                            </tr>
                        </table>
                    </div>

                    ${warningCount >= 3 ?
                        `<div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                            <h3 style="color: #721c24; margin: 0 0 10px 0; font-size: 18px;">🚫 Critical Warning</h3>
                            <p style="color: #721c24; margin: 0; font-size: 16px; line-height: 1.5;">
                                This is your third warning. Your post has been automatically deleted as per our community guidelines.
                            </p>
                        </div>`
                        :
                        `<div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                            <h3 style="color: #0c5460; margin: 0 0 10px 0; font-size: 18px;">📋 Important Notice</h3>
                            <p style="color: #0c5460; margin: 0; font-size: 16px; line-height: 1.5;">
                                Please review our community guidelines and ensure your future posts comply with our rules.
                                ${warningCount === 2 ? 'This is your second warning. One more will result in post deletion.' : ''}
                            </p>
                        </div>`
                    }

                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666; margin: 0; font-size: 14px;">
                            If you have any questions, please contact our support team.
                        </p>
                        <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">
                            This is an automated message. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </div>
        `;

        sendEmail(
        // @ts-ignore
        author.user.email,
        'Your post has been warned',
        htmlContent,
        true
        );
    }
    

    // If warnCount reaches 3, delete the post
    if (warningCount >= 3) {
        post.isDeleted = true;
        post.deletedAt = new Date();
        
        warning.isResolved = true;
        warning.resolvedAt = new Date();
        await warning.save();
        
    }

    // Save the updated post
    await post.save();

    return {
        message: `Post warned successfully. Warning count: ${warningCount}/3`,
        warning_counts: warningCount,
        isDeleted: post.isDeleted,
        deletedAt: post.deletedAt
    };
};

export const findAuthorByPostId = async (postId) => {
    const post =  await Post.findById(postId).populate('user');
    return post.user;
}


export const deletePost = async (postId) => {
    const result = await Post.findByIdAndUpdate(postId, {
        isDeleted: true,
        deletedAt: new Date()
    }, { new: true });
    return result;
}

export const recoverPost = async (postId) => {
    const result = await Post.findByIdAndUpdate(postId, {
        isDeleted: false,
        deletedAt: null
    }, { new: true });
    return result;
}


export const createPost = async ({content, images, user}) => {
    const newPost = await Post.create({
        content,
        images,
        user
    });
    return newPost; 
}
export const editPost = async ({postId, content, images}) => {
    return await Post.findByIdAndUpdate(postId, {
        content: content,
        images: images
    }, { new: true });
}

export const getPostsInHome = async ({viewer, limit, exclude_ids}) => {

    
    
    console.log ("Viewer in home: ", viewer);
    const userPosts = await Post.aggregate([
        {
            $match: {isDeleted: { $ne: true } }
        },
        {
            $match: { _id: { $nin: exclude_ids.map(id => new mongoose.Types.ObjectId(id)) }}
        },
        {
            $sample: { size: limit }
        },
        {
            $sort: { createdAt: -1 },
        }
        ,
        {
            $lookup : {
                from : "users",
                localField : "user",
                foreignField : "_id",
                as : "userInfo"         
            },
        },
        {
            $match: {
                $or: [
                    { "userInfo.bannedAt": null },
                    { "userInfo.bannedAt": { $exists: false } }
                ]
            }
        },
        
        {
            $lookup : {
                from: "comments",
                localField: "_id",
                foreignField: "post",
                as: "comments"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "post",
                as: "likes"
            }
        },
            // is Liked by viewer
        {
            $lookup : {
                from : "likes",
                let : {postId : "$_id"},
                pipeline : [
                    {
                        $match : {
                            $expr : {
                                $and : [
                                    {$eq : ["$post", "$$postId"]},
                                    {$eq : ["$user", viewer ? new mongoose.Types.ObjectId(viewer._id) : null]}
                                ]
                            }
                        }
                    }
                ],
                as : "isLikedByViewer"
            }
        }
        ,
        {
            $lookup : {
                from : "follows",
                let : {postUserId : "$user"},
                pipeline : [
                    {
                        $match : {
                            $expr : {
                                $and : [
                                    {$eq : ["$follower", viewer ? new mongoose.Types.ObjectId(viewer._id) : null]},
                                    {$eq : ["$following", "$$postUserId"]}
                                ]
                            }
                        }
                    }
                ],
                as : "followInfo"    
            }
        }
        ,
        {
            $addFields: {
                'comments': { $size: "$comments" },
                'likes': { $size: "$likes" },
                'username' : { $arrayElemAt: [ "$userInfo.username", 0 ] },
                'avatar' : { $arrayElemAt: [ "$userInfo.profile.avatar", 0 ] },
                'isFollowing' : { $gt : [ {$size : "$followInfo"}, 0 ] },
                'isLiked' : { $gt : [ {$size : "$isLikedByViewer"}, 0 ] },
                'owner_id' : { $arrayElemAt: [ "$userInfo._id", 0 ] }
            }
        },
        {
            $project: {
                userInfo: 0,
                followInfo: 0,
                isLikedByViewer: 0
            }
        }
    ])

    console.log("getUserPosts result:", userPosts.length, "posts found");
    return userPosts;
}
export const getUserPostById = async ({postId, userId, viewer}) => {

    const post_id = new mongoose.Types.ObjectId(postId);
    const user_id = new mongoose.Types.ObjectId(userId);
    const userPostbyId = await Post.aggregate([
        {
            $match: { _id : post_id, user : user_id, isDeleted: { $ne: true } }
        },
        {
            $lookup : {
                from : "users",
                localField : "user",
                foreignField : "_id",
                as : "userInfo"
            }
        },
        {
            $lookup : {
                from: "comments",
                localField: "_id",
                foreignField: "post",
                as: "comments"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "post",
                as: "likes"
            }
        },
            // is Liked by viewer
        {
            $lookup : {
                from : "likes",
                let : {postId : "$_id"},
                pipeline : [
                    {
                        $match : {
                            $expr : {
                                $and : [
                                    {$eq : ["$post", "$$postId"]},
                                    {$eq : ["$user", viewer ? new mongoose.Types.ObjectId(viewer._id) : null]}
                                ]
                            }
                        }
                    }
                ],
                as : "isLikedByViewer"
            }
        }
        ,
        {
            $lookup : {
                from : "follows",
                let : {postUserId : "$user"},
                pipeline : [
                    {
                        $match : {
                            $expr : {
                                $and : [
                                    {$eq : ["$follower", viewer ? new mongoose.Types.ObjectId(viewer._id) : null]},
                                    {$eq : ["$following", "$$postUserId"]}
                                ]
                            }
                        }
                    }
                ],
                as : "followInfo"    
            }
        }
        ,
        {
            $addFields: {
                'comments': { $size: "$comments" },
                'likes': { $size: "$likes" },
                'username' : { $arrayElemAt: [ "$userInfo.username", 0 ] },
                'avatar' : { $arrayElemAt: [ "$userInfo.profile.avatar", 0 ] },
                'isFollowing' : { $gt : [ {$size : "$followInfo"}, 0 ] },
                'isLiked' : { $gt : [ {$size : "$isLikedByViewer"}, 0 ] },
                'owner_id' : { $arrayElemAt: [ "$userInfo._id", 0 ] }
            }
        },
        {
            $project: {
                userInfo: 0,
                followInfo: 0,
                isLikedByViewer: 0
            }
        }
    ])

    return userPostbyId;
} 

export const getUserPosts = async ({userId, viewer, isDeleted}) => {
    
    console.log("getUserPosts called with userId:", userId, "type:", typeof userId);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    console.log("Converted to ObjectId:", userObjectId);
    const userPosts = await Post.aggregate([
        {
            $match: { user:  userObjectId, isDeleted: isDeleted ? true : { $ne: true } }
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $lookup : {
                from : "users",
                localField : "user",
                foreignField : "_id",
                as : "userInfo"
            }
        },
        {
            $lookup : {
                from: "comments",
                localField: "_id",
                foreignField: "post",
                as: "comments"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "post",
                as: "likes"
            }
        },
            // is Liked by viewer
        {
            $lookup : {
                from : "likes",
                let : {postId : "$_id"},
                pipeline : [
                    {
                        $match : {
                            $expr : {
                                $and : [
                                    {$eq : ["$post", "$$postId"]},
                                    {$eq : ["$user", viewer ? new mongoose.Types.ObjectId(viewer._id) : null]}
                                ]
                            }
                        }
                    }
                ],
                as : "isLikedByViewer"
            }
        }
        ,
        {
            $lookup : {
                from : "follows",
                let : {postUserId : "$user"},
                pipeline : [
                    {
                        $match : {
                            $expr : {
                                $and : [
                                    {$eq : ["$follower", viewer ? new mongoose.Types.ObjectId(viewer._id) : null]},
                                    {$eq : ["$following", "$$postUserId"]}
                                ]
                            }
                        }
                    }
                ],
                as : "followInfo"    
            }
        }
        ,
        {
            $addFields: {
                'comments': { $size: "$comments" },
                'likes': { $size: "$likes" },
                'username' : { $arrayElemAt: [ "$userInfo.username", 0 ] },
                'avatar' : { $arrayElemAt: [ "$userInfo.profile.avatar", 0 ] },
                'isFollowing' : { $gt : [ {$size : "$followInfo"}, 0 ] },
                'isLiked' : { $gt : [ {$size : "$isLikedByViewer"}, 0 ] },
                'owner_id' : { $arrayElemAt: [ "$userInfo._id", 0 ] }
            }
        },
        {
            $project: {
                userInfo: 0,
                followInfo: 0,
                isLikedByViewer: 0
            }
        }
    ])

    console.log("getUserPosts result:", userPosts.length, "posts found");
    return userPosts;
}



export const likePost = async ({postId, user}) => {
    const existingLike = await Like.findOne({post: postId, user: user._id});
    const post = await Post.findById(postId);
    
    if (existingLike) {
        // Unlike
        await Like.deleteOne({ _id: existingLike._id });
        
        // Xóa thông báo khi unlike
        if (post) {
            await notificationService.deleteNotification({
                senderId: user._id,
                recipientId: post.user,
                type: 'like_post',
                postId: postId
            });
        }
        
        return { message: "Post unliked" };
    } else {
        // Like
        const newLike = new Like({
            post: postId,
            user: user._id
        });
        await newLike.save();
        
        // Tạo thông báo khi like
        if (post) {
            const contentPreview = post.content ? post.content.substring(0, 100) : '';
            await notificationService.createNotification({
                recipientId: post.user,
                senderId: user._id,
                type: 'like_post',
                postId: postId,
                contentPreview
            });
        }
        
        return { message: "Post liked" };
    }
}

export const followUserFromPost = async ({postId, userId}) => {
    // is UserId owner of the post
    const post = await Post.findById(postId);
    if (!post) {
        return { status : "false",message: 'Post not found' };
    }
    const postOwnerId = post.user.toString();

    if (postOwnerId == userId) {
        return {status : "false", message: "Cannot follow yourself" };
    }

    const existingFollow = await Follow.findOne({follower: userId, following: postOwnerId});
    if (existingFollow) {
        // Unfollow
        await Follow.deleteOne({ _id: existingFollow._id });
        return { message: "User unfollowed" };
    }
    else {
        // Follow
        const newFollow = new Follow({
            follower: userId,
            following: postOwnerId
        });
        await newFollow.save();
        return { message: "User followed" };
    }

}


// Get post detail by postId
export const getPostDetail = async ({ postId, viewer }) => {
    const post_id = new mongoose.Types.ObjectId(postId);
    
    const postDetail = await Post.aggregate([
        {
            $match: { _id: post_id, isDeleted: { $ne: true } }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "post",
                as: "comments"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "post",
                as: "likes"
            }
        },
        // is Liked by viewer
        {
            $lookup: {
                from: "likes",
                let: { postId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$post", "$$postId"] },
                                    { $eq: ["$user", viewer ? new mongoose.Types.ObjectId(viewer._id) : null] }
                                ]
                            }
                        }
                    }
                ],
                as: "isLikedByViewer"
            }
        },
        {
            $lookup: {
                from: "follows",
                let: { postUserId: "$user" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$follower", viewer ? new mongoose.Types.ObjectId(viewer._id) : null] },
                                    { $eq: ["$following", "$$postUserId"] }
                                ]
                            }
                        }
                    }
                ],
                as: "followInfo"
            }
        },
        {
            $addFields: {
                'comments': { $size: "$comments" },
                'likes': { $size: "$likes" },
                'username': { $arrayElemAt: ["$userInfo.username", 0] },
                'avatar': { $arrayElemAt: ["$userInfo.profile.avatar", 0] },
                'isFollowing': { $gt: [{ $size: "$followInfo" }, 0] },
                'isLiked': { $gt: [{ $size: "$isLikedByViewer" }, 0] },
                'owner_id': { $arrayElemAt: ["$userInfo._id", 0] }
            }
        },
        {
            $project: {
                userInfo: 0,
                followInfo: 0,
                isLikedByViewer: 0
            }
        }
    ]);

    return postDetail.length > 0 ? postDetail[0] : null;
}

import { User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';
import mongoose from 'mongoose';

export const searchUsers = async (keyword, { page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit;

    
    const usersAggregate = await User.aggregate([
        {
            $search: {
                index: "user_search_index",
                text: {
                    query: keyword,
                    path: ["username", "description"],
                    fuzzy: { maxEdits: 1}
            }
        }
        },
        {
            $match: {
                $and: [
                    { $or: [{ bannedAt: null }, { bannedAt: { $exists: false } }] }
                ]
            }
        }
        ,
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "following",
                as: "followersList"
            }
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "follower",
                as: "followingList"
            }
        },
        {
            $addFields: {
                'profile.followers': { $size: "$followersList" },
                'profile.following': { $size: "$followingList" }
            }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                description: 1,
                'profile.avatar': 1,
                'profile.followers': 1,
                'profile.following': 1,
                createdAt: 1
            }
        },
        {
            $facet: {
                users: [
                    { $skip: skip },
                    { $limit: limit }
                ],
                totals: [
                    { $count: "count" }
                ]
            }

        }
    ]);

    const users = usersAggregate[0].users;
    const total = usersAggregate[0].totals[0]?.count || 0;
    return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};

export const searchPosts = async (keyword, { page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit;

    
    const aggregationResult = await Post.aggregate([
        {
            $search: {
                index: "post_search_index",
                text: {
                    query: keyword,
                    path: "content",
                    fuzzy: { maxEdits: 1}
                }
            }
        }
        ,
        {
            $match: {
                isDeleted: { $ne: true }
            }
        }
        ,
        {
            $sort: { createdAt: -1 }
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
        {
            $addFields: {
                username: { $arrayElemAt: ["$userInfo.username", 0] },
                avatar: { $arrayElemAt: ["$userInfo.profile.avatar", 0] },
                userId: { $arrayElemAt: ["$userInfo._id", 0] },
                commentsCount: { $size: "$comments" },
                likesCount: { $size: "$likes" }
            }
        },
        {
            $project: {
                _id: 1,
                content: 1,
                images: 1,
                username: 1,
                avatar: 1,
                userId: 1,
                commentsCount: 1,
                likesCount: 1,
                createdAt: 1
            }
        },
        {
            $facet: {
                posts: [
                    { $skip: skip },
                    { $limit: limit }
                ],
                total: [
                    { $count: "count" }
                ]
            }
        }
    ]);

    const posts = aggregationResult[0].posts;
    const total = aggregationResult[0].total[0]?.count || 0;

    return {
        posts,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};

export const searchAll = async (keyword, { userLimit = 5, postLimit = 5 }) => {
    const usersPromise = searchUsers(keyword, { page: 1, limit: userLimit });
    const postsPromise = searchPosts(keyword, { page: 1, limit: postLimit });
    const [usersResult, postsResult] = await Promise.all([usersPromise, postsPromise]);

    const users = usersResult.users;
    const posts = postsResult.posts;
    const totalUsers = usersResult.total;
    const totalPosts = postsResult.total;

    return {
        users,
        posts,
        totalUsers,
        totalPosts
    };
};

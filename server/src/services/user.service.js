import { parse } from 'dotenv';
import { User } from '../models/user.model.js';
import moongoose from 'mongoose';
import speakingURL from "speakingurl"
import { Follow } from '../models/follow.model.js';
// ADMIN FUNCTION
export const getAllUsers = async ({page, limit, search}) => {
  try {
    const limitPage = parseInt(limit) > 0 ? parseInt(limit) : 10;
    const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
    const skip = (pageNumber - 1) * limitPage;
    
    /** @type {import('mongoose').PipelineStage[]} */
    let pipeline = [];
    
    // Search
    if (search && search.trim() !== "") {
      pipeline.push(
        {
          $search: {
            index: "user_search_index",
            text: {
              query: search,
              path: ["username", "description", "email", "role"],
              fuzzy: { maxEdits: 1}
            }
          }
        }
      );
      // Add score to sort 
      pipeline.push(
        {
          $addFields: {
            searchScore: { $meta: "searchScore" }
          }
        }
      );
    }
    
    // Sort both in search and non-search cases
    pipeline.push(
      {
        $sort: search && search.trim() !== "" 
          ? { searchScore: -1 }  // By relevance when searching
          : { createdAt: -1 }     // By creation date otherwise
      }
    );

    // Facet for pagination and total count
    pipeline.push(
      {
        $facet: {
          // Branch 1: Get paginated data with full details
          data: [
            { $skip: skip },
            { $limit: limitPage },
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
                followersList: 0,
                followingList: 0,
                searchScore: 0
              }
            }
          ],
          // Branch 2: Get total count (before skip/limit)
          total: [
            { $count: "count" }
          ]
        }
      }
    );
    
    // Execute aggregation
    const result = await User.aggregate(pipeline);
    const users = result[0].data;
    const totalCount = result[0].total[0] ? result[0].total[0].count : 0;
    
    return {
      users: users,
      totalCount: totalCount,
    };

  } catch (error) {
    return null;
  }
}


export const getUserById = async (userId) => {
  return await User.findById(userId);
}

export const countUsers = async () => {
  return await User.countDocuments();
}

export const deleteUser = async (userId) => {
  // set bannedAt field to current date
  return await User.findByIdAndUpdate(
    userId,
    { bannedAt: new Date() },
    { new: true }
  );
}

export const restoreUser = async (userId) => {
  // set bannedAt field to null
  return await User.findByIdAndUpdate(
    userId,
    { bannedAt: null },
    { new: true }
  );
}

export const isUserNameExist = async (id, username) => {
  const userName = await User.findOne({ _id: id ,
    bannedAt: { $in: [null, undefined] }
  });
  return speakingURL(userName.username) === speakingURL(username);
}

export async function findUserProfile (id, username) {
  let query = {
    _id : new moongoose.Types.ObjectId(id)
  }
  const isExistUserName = await isUserNameExist (id, username);
  if (!isExistUserName) {
    return null;
  }


  const userProfile = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "follows", // Make sure this matches your collection name
          localField: "_id",
          foreignField: "following", // Users who follow THIS user
          as: "followersList"
        }
      },
      {
        $lookup: {
          from: "follows", // Make sure this matches your collection name
          localField: "_id",
          foreignField: "follower", // Users THIS user follows
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
          password: 0,
          followersList: 0,
          followingList: 0
        }
      }
  ]);

  if (!userProfile || userProfile.length === 0) {
    return null;
  }


  return userProfile[0]; // Return first result since aggregate returns array
}


export async function updateUserProfile (userId, updateData) {

  const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
  ).select('-password');

  return updatedUser;
}


export async function getFollowList ({userId, type, currentUserId}){
  const userObjectId = new moongoose.Types.ObjectId(userId);
  const currentUserObjectId = currentUserId ? new moongoose.Types.ObjectId(currentUserId) : null;

  const listFollowAggregate = await Follow.aggregate([
    {
      $match: type === "followers"
        ? { following: userObjectId }
        : { follower: userObjectId }
    },
    {
      $lookup: {
        from: "users",
        localField: type === "followers" ? "follower" : "following",
        foreignField: "_id",
        as: "userInfo"
      }
    },
    {
      $addFields: {
        userInfo: { $arrayElemAt: ["$userInfo", 0] }
      }
    },
    // Check if currentUser is following each user in the list
    {
      $lookup: {
        from: "follows",
        let: { targetUserId: type === "followers" ? "$follower" : "$following" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$follower", currentUserObjectId] },
                  { $eq: ["$following", "$$targetUserId"] }
                ]
              }
            }
          },
          {
            $project: { _id: 1 }
          }
        ],
        as: "isFollowingByCurrentUser"
      }
    },
    {
      $addFields: {
        isFollowedByCurrentUser: {
          $cond: [
            { $gt: [{ $size: "$isFollowingByCurrentUser" }, 0] },
            true,
            false
          ]
        }
      }
    },
    {
      $project: {
        isFollowingByCurrentUser: 0
      }
    }
  ]);

  return listFollowAggregate;
}


export async function followUser ({targetUserId, currentUserId}) {
  try{
    if (targetUserId.toString() === currentUserId.toString()) {
        return null;
    }
    const existingFollow = await Follow.findOne({
        follower: currentUserId,
        following: targetUserId
    });
    if (existingFollow) {
        // Unfollow
        await Follow.deleteOne({
            _id: existingFollow._id
        });
        return { action: "unfollowed" };
    }
    else {
        // Follow
        const newFollow = new Follow({
            follower: currentUserId,
            following: targetUserId
        });
        await newFollow.save();
        return { action: "followed", isFollowing: true };
    }
  }
  catch(error){
    return null;
  }
}
import uploadToCloudinary from "../../config/cloudinary.config.js";
import fs from 'fs';
import * as postService from "../../services/post.service.js";
import * as commentService from "../../services/comment.service.js";
import moongoose from "mongoose";

// Example post controller functions
export const createPost = async (req, res) => {
    // Your logic here
    const content = req.body.postContent;
    const userId = req.body.userId;
    const isOwner = userId == req.user._id;
    const images = req.files; // Array of uploaded image files


    if (!content || !isOwner) {
        return res.status(400).json({ message: "Post content and user ID are required" });
    }

    let imageUrls = [];
    if (images && images.length > 0) {
        // Alternative: Use for...of loop instead of Promise.all + map
        for (const image of images) {
            const result = await uploadToCloudinary(image.path, "posts");
            fs.unlinkSync(image.path);
            imageUrls.push(result.secure_url);
        }

    }

    const newPost = await postService.createPost ({
        content: content,
        images: imageUrls,
        user: userId
    })

    const newPostId = newPost._id;

    const newData = await postService.getUserPostById ({postId : newPostId, userId : userId, viewer : req.user || null});
    
    res.json({
        status: "success",
        message: "Post created successfully",
        data : newData[0]
    });
};

export const editPost = async (req, res) => {
    const content = req.body.editPostContent;
    const userId = req.body.userId;
    const postId = req.body.postId;
    const isOwner = userId == req.user._id;
    const images = req.files;
    const oldImages = req.body.oldImages ? JSON.parse (req.body.oldImages) : [];

    if (!content || !isOwner || !postId) {
        return res.status(400).json({ message: "Post content, user ID, and post ID are required" });
    }

    let imageUrls = [];
    if (images && images.length > 0) {
        for (const image of images) {
            const result = await uploadToCloudinary(image.path, "posts");
            console.log("Uploaded image URL:", result.secure_url);
            // Delete the local file after upload
            fs.unlinkSync(image.path);
            imageUrls.push(result.secure_url);
        }
    }

    // Combine old images with newly uploaded images
    const allImages = [...oldImages, ...imageUrls];

    await postService.editPost ({
        postId: postId,
        content: content,
        images: allImages,
    })
    const newData = await postService.getPostById (postId);
    res.json({
        status: "success",
        message: "Post edited successfully",
        data : newData
    });
}

export const getPostsInHome = async (req, res) => {
    const viewer = req.user || null;
    const limit = req.body.limit || 5;
    const exclude_ids = req.body.exclude_ids || [];
    const results = await postService.getPostsInHome ({viewer : viewer, limit : limit, exclude_ids : exclude_ids});
    res.json ({
        status : "success",
        message : "Posts fetched successfully",
        data : results
    });

};

export const getUserPosts = async (req, res) => {
    const viewer = req.user || null;

    const results = await postService.getUserPosts ({userId : req.query.userId, viewer : viewer, isDeleted : req.query.isDeleted === "true" ? true : false});
    res.json ({
        status : "success",
        message : "User posts fetched successfully",
        data : results
    });
}

export const likePost = async (req, res) => {
    const postId = req.params.postId;
    await postService.likePost ({postId: postId, user: req.user});
    res.json({ message: "Post liked successfully" });
}

export const getPostComments = async (req, res) => {
    try {
        const postId = req.params.postId;
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;

        const result = await commentService.getPostComments({
            postId,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            status: "success",
            message: "Comments fetched successfully",
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

export const getCommentReplies = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;

        const result = await commentService.getCommentReplies({
            commentId,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            status: "success",
            message: "Replies fetched successfully",
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

export const deletePost = async(req, res) => {
    // Your logic here
    const postId = req.body.postId;
    const userId = req.user._id;
    //  Check is owner of the post
    const owner = await postService.findAuthorByPostId(postId);
    if (owner._id.toString() !== userId.toString()) {
        return res.status(403).json({ message: "You are not authorized to delete this post" });
    }
    // Soft delete the post
    await postService.deletePost(postId);
    res.json({ message: "Delete post",
        postId: postId
     });
}

export const recoverPost = async(req, res) => {
    // Your logic here
    const postId = req.body.postId;
    const userId = req.user._id;
    //  Check is owner of the post
    const owner = await postService.findAuthorByPostId(postId);
    if (owner._id.toString() !== userId.toString()) {
        return res.status(403).json({ message: "You are not authorized to recover this post" });
    }
    // Recover the post
    await postService.recoverPost(postId);
    res.json({ message: "Post recovered successfully",
        postId: postId
     });
}

export const followUserFromPost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user._id;
    const result = await postService.followUserFromPost ({postId: postId, userId: userId});
    if (result.status === "false") {
        return  res.status(400).json({ success: false, message: result.message });
    }
    res.json({ success: true, message: "User followed successfully" });
}

export const getPostDetail = async (req, res) => {
    try {
        const postId = req.params.postId;
        const viewer = req.user || null;
        
        const post = await postService.getPostDetail({ postId, viewer });
        
        if (!post) {
            return res.status(404).json({
                status: "error",
                message: "Post not found"
            });
        }
        
        res.json({
            status: "success",
            message: "Post fetched successfully",
            data: post
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message || "Error fetching post"
        });
    }
}
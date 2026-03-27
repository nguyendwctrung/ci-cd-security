import express from "express";
import * as postController from "../..//controllers/client/post.controller.js";
import {upload} from "../../config/cloudinary.config.js";
import {verifyToken, justDecodeToken} from "../../middlewares/auth.middlewares.js";

const route = express.Router ();


route.post("/create", verifyToken, upload.array("images", 10), postController.createPost); // done
route.patch("/edit", verifyToken, upload.array("images", 10), postController.editPost); // done
route.post("/home", justDecodeToken, postController.getPostsInHome); // done
route.get("/get_user_post", justDecodeToken, postController.getUserPosts); // query userId  // done
route.post("/:postId/like", verifyToken, postController.likePost); // done

// Get single post detail
route.get("/:postId/detail", justDecodeToken, postController.getPostDetail);

//Comment routes
route.get("/:postId/comments", postController.getPostComments);
route.get("/comments/:commentId/replies", postController.getCommentReplies);

route.delete("/delete", verifyToken, postController.deletePost);
route.patch("/recover", verifyToken, postController.recoverPost);
route.post("/:postId/follow", verifyToken, postController.followUserFromPost); // done (remove author follow himself later)


export default route;
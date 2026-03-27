import express from "express";
import * as searchController from "../../controllers/client/search.controller.js";

const router = express.Router();

// Search all (users and posts) 
router.get("/", searchController.searchAll);

// Search users only 
router.get("/users", searchController.searchUsers);

// Search posts only
router.get("/posts", searchController.searchPosts);

export default router;

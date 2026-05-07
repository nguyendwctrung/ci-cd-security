import * as searchService from "../../services/search.service.js";

export async function searchAll(req, res) {
    try {
        const { keyword, userLimit = 5, postLimit = 5 } = req.query;
        
        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Keyword is required"
            });
        }

        const results = await searchService.searchAll(keyword.trim(), {
            userLimit: parseInt(userLimit),
            postLimit: parseInt(postLimit)
        });

        res.status(200).json({
            success: true,
            message: "Search completed successfully",
            data: results
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message || "Server error during search"
        });
    }
}

export async function searchUsers(req, res) {
    try {
        const { keyword, page = 1, limit = 10 } = req.query;
        
        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Keyword is required"
            });
        }

        const results = await searchService.searchUsers(keyword.trim(), {
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.status(200).json({
            success: true,
            message: "Search users completed successfully",
            data: results
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message || "Server error during user search"
        });
    }
}

export async function searchPosts(req, res) {
    try {
        const { keyword, page = 1, limit = 10 } = req.query;
        
        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Keyword is required"
            });
        }

        const results = await searchService.searchPosts(keyword.trim(), {
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.status(200).json({
            success: true,
            message: "Search posts completed successfully",
            data: results
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message || "Server error during post search"
        });
    }
}

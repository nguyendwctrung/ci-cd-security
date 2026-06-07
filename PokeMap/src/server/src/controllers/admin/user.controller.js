import * as userService from '../../services/user.service.js';

export const getUserLists = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const search = req.query.search || "";
        const users = await userService.getAllUsers({page: Number(page), limit: Number(limit), search: search});
        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: users.users,
            totalCount: users.totalCount,
            totalPages: Math.ceil(users.totalCount / limit),
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
}

export const getUserById = async (req, res) => {
    const userId = req.params.id;

    if (!userId) {
        return res.json({
            success: false,
            message: 'User ID is required',
        });
    }

    try {
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found',
            });
        }
        res.json({
            success: true,
            message: 'User retrieved successfully',
            data: user,
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
}


export const getTotalUsers = async (req, res) => {
    try {
        const totalUsers = await userService.countUsers();
        res.json({
            success: true,
            message: 'Total users retrieved successfully',
            data: totalUsers,
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
}

export const deleteUser = async (req, res) => {
    const userId = req.params.id;

    if (!userId) {
        return res.json({
            success: false,
            message: 'User ID is required',
        });
    }

    try {
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.json({
                success: false,
                message: 'User not found',
            });
        }
        
        const result = await userService.deleteUser(userId);
        res.json({
            success: true,
            message: 'User deleted successfully',
            bannedAt: result.bannedAt,
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
}


export const restoreUser = async (req, res) => {
    const userId = req.params.id;

    if (!userId) {
        return res.status(404).json({
            success: false,
            message: 'User ID is required',
        });
    }
    try {
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        await userService.restoreUser(userId);
        res.json({
            success: true,
            message: 'User restored successfully',
        });

    }
    catch (e){
        res.status(500).json({
            success: false,
            message: e.message,
        });
    }
}
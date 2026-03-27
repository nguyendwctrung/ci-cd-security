import express from 'express';
        
import * as userController from '../../controllers/admin/user.controller.js';

const router = express.Router();

router.get('/listUsers', userController.getUserLists);

router.get('/detailUser/:id', userController.getUserById);

router.delete('/deleteUser/:id', userController.deleteUser);

router.patch('/restoreUser/:id', userController.restoreUser);

router.get('/total-users', userController.getTotalUsers);

export default router;
import express from 'express';

import * as postController from '../../controllers/admin/post.controller.js';

const router = express.Router();

router.get('/listPosts', postController.getAllPosts);

router.get('/total-posts', postController.getTotalPosts);

router.patch('/warn/:postId', postController.warnPost);

router.patch('/delete/:postId', postController.deletePost);

router.patch('/recover/:postId', postController.recoverPost);

export default router;
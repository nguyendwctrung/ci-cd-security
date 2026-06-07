import express from 'express';
import uploadToCloudinary from '../../config/cloudinary.config.js';
import fs from 'fs';
import { upload } from '../../config/cloudinary.config.js';

const router = express.Router();

// Upload image cho comment
router.post('/upload-comment-images', upload.array('images', 5), async (req, res) => {
    try {
        const images = req.files;
        
        if (!images || images.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No images provided'
            });
        }

        const imageUrls = [];

        for (const image of images) {
            const result = await uploadToCloudinary(image.path, 'comments');
            fs.unlinkSync(image.path);
            imageUrls.push(result.secure_url);
        }

        res.json({
            status: 'success',
            data: imageUrls
        });
    } catch (error) {
        console.error('Error uploading comment images:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

export default router;

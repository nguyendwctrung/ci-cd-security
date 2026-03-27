import cloudinary from 'cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
cloudinary.v2.config ({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Multer configuration for file uploads
const tempDir = path.join('.', 'tempUploads');
if (!fs.existsSync(tempDir)){
    fs.mkdirSync (tempDir);
}

const storage = multer.diskStorage({
    destination : function (req, file, cb){
        cb (null, tempDir);
    }
    ,
    filename : function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb (null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer ({ storage: storage });



export default async function uploadToCloudinary (filePath, folder) {
    try {
        const result = await cloudinary.v2.uploader.upload(filePath, { folder: folder});

        return result;
    } catch (e) {
        console.error("Cloudinary upload error: ", e);
        throw e;
    }
}

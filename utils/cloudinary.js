import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'esdaly/others';

        if (file.fieldname === 'avatar') {
            folder = 'esdaly/avatars';
        } else if (file.fieldname === 'product' || file.fieldname === 'images') {
            folder = 'esdaly/products';
        } else if (file.fieldname === 'category' || file.fieldname === 'image') {
            folder = 'esdaly/categories';
        }

        return {
            folder: folder,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
            public_id: file.fieldname + '-' + Date.now()
        };
    },
});

export { cloudinary, storage };

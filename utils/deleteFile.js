import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * دالة لحذف الملفات مادياً من السيرفر أو Cloudinary
 * @param {string} imageUrl - رابط الصورة أو مسارها النسبي
 */
export const deleteFile = async (imageUrl) => {
    if (!imageUrl) return;

    try {
        // 1. إذا كانت الصورة على Cloudinary
        if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com')) {
            // استخراج public_id من الرابط
            // مثال: https://res.cloudinary.com/demo/image/upload/v12345/folder/image.jpg -> folder/image
            const parts = imageUrl.split('/');
            const filenameWithExtension = parts[parts.length - 1];
            const filename = filenameWithExtension.split('.')[0];

            // البحث عن المجلد (مثلاً esdaly/products)
            const folderIndex = parts.indexOf('esdaly');
            let publicId = filename;

            if (folderIndex !== -1) {
                publicId = parts.slice(folderIndex).join('/').split('.')[0];
            }

            console.log(`🗑️ Deleting from Cloudinary: ${publicId}`);
            await cloudinary.uploader.destroy(publicId);
            return;
        }

        // 2. إذا كانت الصورة مخزنة محلياً
        // تنظيف المسار من أي سلاش في البداية
        let relativePath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;

        // تحويل المسار النسبي إلى مسار مطلق على السيرفر
        // البحث عن مجلد uploads
        const uploadsIndex = relativePath.indexOf('uploads');
        if (uploadsIndex !== -1) {
            relativePath = relativePath.substring(uploadsIndex);
        }

        const absolutePath = path.join(__dirname, '..', relativePath);

        if (fs.existsSync(absolutePath)) {
            console.log(`🗑️ Deleting local file: ${absolutePath}`);
            fs.unlinkSync(absolutePath);
        } else {
            console.warn(`⚠️ File not found for deletion: ${absolutePath}`);
        }
    } catch (error) {
        console.error('❌ Error deleting file:', error.message);
    }
};

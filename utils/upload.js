import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { storage as cloudinaryStorage } from './cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist (skip on Vercel/Production)
const uploadDir = path.join(__dirname, '../uploads');
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

if (!isProduction && !fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    console.warn('⚠️ Could not create upload directory:', err.message);
  }
}

// Storage configuration for Local Development
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadDir;

    // Different folders for different file types
    if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadDir, 'avatars');
    } else if (file.fieldname === 'product' || file.fieldname === 'images') {
      uploadPath = path.join(uploadDir, 'products');
    } else if (file.fieldname === 'category' || file.fieldname === 'image') {
      uploadPath = path.join(uploadDir, 'categories');
    } else if (file.fieldname === 'review') {
      uploadPath = path.join(uploadDir, 'reviews');
    }

    if (!isProduction && !fs.existsSync(uploadPath)) {
      try {
        fs.mkdirSync(uploadPath, { recursive: true });
      } catch (err) {
        console.warn('⚠️ Could not create upload sub-directory:', err.message);
      }
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Use Cloudinary if configured AND in production, otherwise Local
const useCloudinary = isProduction && !!process.env.CLOUDINARY_CLOUD_NAME;
console.log('DEBUG: Environment is', isProduction ? 'Production/Vercel' : 'Local');
if (useCloudinary) {
  console.log('DEBUG: Using Cloudinary Storage');
  console.log('DEBUG: Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Defined' : 'UNDEFINED');
} else {
  console.log('DEBUG: Using Local Storage (Cloudinary disabled for Local Dev)');
}
const selectedStorage = useCloudinary ? cloudinaryStorage : localStorage;

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|avif|jfif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('image/');

  if (mimetype) {
    return cb(null, true);
  } else {
    cb(new Error(`نوع الملف غير مدعوم (${file.mimetype}). يرجى رفع صورة فقط (JPEG, JPG, PNG, GIF, WEBP, AVIF)`));
  }
};

// Upload configurations
export const upload = multer({
  storage: selectedStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

export const uploadMultiple = multer({
  storage: selectedStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10
  },
  fileFilter: fileFilter
});

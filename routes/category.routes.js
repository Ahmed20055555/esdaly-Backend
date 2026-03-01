import express from 'express';
import { body, validationResult } from 'express-validator';
import Category from '../models/Category.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الفئات',
      error: error.message
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || !category.isActive) {
      return res.status(404).json({
        success: false,
        message: 'الفئة غير موجودة'
      });
    }

    res.json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الفئة',
      error: error.message
    });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private/Admin
router.post('/', protect, authorize('admin'), (req, res, next) => {
  console.log('⏳ Starting category upload process...');
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer/Cloudinary Upload Error:', err);
      return res.status(500).json({
        success: false,
        message: 'خطأ في رفع الصورة',
        error: err.message,
        details: err.code || 'UNKNOWN_MULTER_ERROR',
        stack: process.env.VERCEL ? err.stack : undefined
      });
    }
    console.log('✅ Image upload stage completed');
    next();
  });
}, [
  body('name').trim().notEmpty().withMessage('اسم الفئة مطلوب')
], async (req, res) => {
  try {
    console.log('⏳ Processing category database creation...');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, nameEn, description, parentCategory, order } = req.body;

    const category = await Category.create({
      name,
      nameEn,
      description,
      image: req.file ? (req.file.path || `/uploads/categories/${req.file.filename}`) : '',
      parentCategory: parentCategory || null,
      order: order || 0,
      isActive: true
    });

    console.log('✅ Category document created:', name);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الفئة بنجاح',
      category
    });
  } catch (error) {
    console.error('Category create error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء الفئة',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'الفئة غير موجودة'
      });
    }

    const { name, nameEn, description, parentCategory, order, isActive } = req.body;

    if (name) category.name = name;
    if (nameEn !== undefined) category.nameEn = nameEn;
    if (description !== undefined) category.description = description;
    if (req.file && typeof req.file.filename === 'string' && req.file.filename.trim() !== '') {
      category.image = `/uploads/categories/${req.file.filename}`;
    }
    if (parentCategory !== undefined) category.parentCategory = parentCategory;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.json({
      success: true,
      message: 'تم تحديث الفئة بنجاح',
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الفئة',
      error: error.message
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'الفئة غير موجودة'
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'تم حذف الفئة بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الفئة',
      error: error.message
    });
  }
});

export default router;

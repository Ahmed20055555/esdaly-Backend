import express from 'express';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import Order from '../models/Order.model.js';

const router = express.Router();

// @route   GET /api/stats/public
// @desc    Public stats for homepage (no auth) - products count, categories, featured
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const [productsCount, categoriesCount, featuredCount, ordersCount] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Category.countDocuments(),
      Product.countDocuments({ isActive: true, isFeatured: true }),
      Order.countDocuments({ status: { $nin: ['cancelled'] } })
    ]);

    res.json({
      success: true,
      stats: {
        productsCount,
        categoriesCount,
        featuredCount,
        ordersCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات',
      error: error.message
    });
  }
});

export default router;

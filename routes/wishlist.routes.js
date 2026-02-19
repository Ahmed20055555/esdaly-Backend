import express from 'express';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get user's wishlist products
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist',
        match: { isActive: true },
        select: 'name description price images stock comparePrice slug',
        populate: { path: 'category', select: 'name slug' }
      })
      .select('wishlist')
      .lean();

    const products = user?.wishlist || [];

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المفضلة',
      error: error.message
    });
  }
});

// @route   POST /api/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }

    const user = await User.findById(req.user._id);
    if (user.wishlist.some((id) => id.toString() === productId)) {
      return res.status(200).json({
        success: true,
        message: 'المنتج موجود بالفعل في المفضلة',
        wishlist: user.wishlist
      });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'تمت الإضافة للمفضلة',
      wishlist: user.wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الإضافة',
      error: error.message
    });
  }
});

// @route   DELETE /api/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.productId
    );
    await user.save();

    res.json({
      success: true,
      message: 'تمت الإزالة من المفضلة',
      wishlist: user.wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الإزالة',
      error: error.message
    });
  }
});

// @route   DELETE /api/wishlist
// @desc    Clear entire wishlist
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = [];
    await user.save();

    res.json({
      success: true,
      message: 'تم تفريغ المفضلة',
      wishlist: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في التفريغ',
      error: error.message
    });
  }
});

export default router;

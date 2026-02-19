import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Newsletter from '../models/Newsletter.model.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/newsletter
// @desc    Subscribe to newsletter (public)
// @access  Public
router.post('/', [
  body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح').normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const source = req.body.source || 'footer';

    let subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (subscriber) {
      if (subscriber.status === 'active') {
        return res.status(200).json({
          success: true,
          message: 'أنتِ مشتركة بالفعل في النشرة'
        });
      }
      subscriber.status = 'active';
      subscriber.source = source;
      subscriber.subscribedAt = new Date();
      subscriber.unsubscribedAt = undefined;
      await subscriber.save();
    } else {
      subscriber = await Newsletter.create({
        email: email.toLowerCase(),
        source
      });
    }

    res.status(201).json({
      success: true,
      message: 'تم تسجيل بريدك بنجاح، سنتواصل معك قريباً'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في التسجيل',
      error: error.message
    });
  }
});

// @route   POST /api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter (public, by email)
// @access  Public
router.post('/unsubscribe', [
  body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح').normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const subscriber = await Newsletter.findOneAndUpdate(
      { email: req.body.email.toLowerCase() },
      { status: 'unsubscribed', unsubscribedAt: new Date() },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'البريد غير مسجل في النشرة'
      });
    }

    res.json({
      success: true,
      message: 'تم إلغاء الاشتراك بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إلغاء الاشتراك',
      error: error.message
    });
  }
});

// @route   GET /api/newsletter
// @desc    Get all newsletter subscribers
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const subscribers = await Newsletter.find(filter)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Newsletter.countDocuments(filter);

    res.json({
      success: true,
      subscribers,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المشتركين',
      error: error.message
    });
  }
});

// @route   PUT /api/newsletter/:id/status
// @desc    Update subscriber status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), [
  body('status').isIn(['active', 'unsubscribed']).withMessage('حالة غير صحيحة')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const subscriber = await Newsletter.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'المشترك غير موجود'
      });
    }

    subscriber.status = req.body.status;
    if (req.body.status === 'unsubscribed') {
      subscriber.unsubscribedAt = new Date();
    } else {
      subscriber.unsubscribedAt = undefined;
    }
    await subscriber.save();

    res.json({
      success: true,
      message: 'تم تحديث الحالة',
      subscriber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الحالة',
      error: error.message
    });
  }
});

// @route   DELETE /api/newsletter/:id
// @desc    Delete subscriber
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'المشترك غير موجود'
      });
    }
    res.json({
      success: true,
      message: 'تم حذف المشترك'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في الحذف',
      error: error.message
    });
  }
});

export default router;

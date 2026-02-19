import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الفئة مطلوب'],
    unique: true,
    trim: true
  },
  nameEn: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug before saving (يدعم العربي والإنجليزي ويتجنب slug فارغ)
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    const fromName = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\u0621-\u064Aa-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    this.slug = fromName || `category-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  next();
});

export default mongoose.model('Category', categorySchema);

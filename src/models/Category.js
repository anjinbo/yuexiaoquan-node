const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  sort: {
    type: Number,
    default: 0
  },
  status: {
    type: Number,
    default: 1,
    enum: [0, 1]
  },
  postCount: {
    type: Number,
    default: 0
  },
  isHot: {
    type: Boolean,
    default: false
  },
  seoTitle: {
    type: String,
    default: ''
  },
  seoDescription: {
    type: String,
    default: ''
  },
  seoKeywords: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

categorySchema.index({ sort: 1 })
categorySchema.index({ status: 1 })
categorySchema.index({ parentId: 1 })

module.exports = mongoose.model('Category', categorySchema)

const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请输入作品标题'],
    maxlength: [100, '标题最多100个字符']
  },
  description: {
    type: String,
    default: ''
  },
  images: [{
    url: { type: String, required: true },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  }],
  // 兼容旧字段
  imageUrl: {
    type: String
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author: {
    type: String,
    default: '匿名用户'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

PostSchema.index({ createdAt: -1 })
PostSchema.index({ likes: -1 })
PostSchema.index({ authorId: 1 })
PostSchema.index({ categoryId: 1 })

module.exports = mongoose.model('Post', PostSchema)

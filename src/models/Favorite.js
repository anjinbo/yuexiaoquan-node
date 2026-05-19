const mongoose = require('mongoose')

const favoriteSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

favoriteSchema.index({ postId: 1, userId: 1 }, { unique: true })
favoriteSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('Favorite', favoriteSchema)

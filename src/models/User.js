const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  nickname: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  bio: {
    type: String,
    default: ''
  },
  birthday: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: null
  },
  location: {
    type: String,
    default: ''
  },
  phone: {
    type: String
  },
  wechatOpenid: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: Number,
    default: 1,
    enum: [0, 1]
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('User', userSchema)

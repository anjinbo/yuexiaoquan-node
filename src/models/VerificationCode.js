const mongoose = require('mongoose')

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  code: {
    type: String,
    required: true,
    length: 6
  },
  type: {
    type: Number,
    required: true,
    enum: [1, 2]
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

verificationCodeSchema.index({ email: 1, type: 1 })

module.exports = mongoose.model('VerificationCode', verificationCodeSchema)

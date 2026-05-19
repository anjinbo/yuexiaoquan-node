const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const authController = require('../controllers/authController')

// 头像上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/avatars'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${req.session.userId}-${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/
    const ext = allowed.test(path.extname(file.originalname).toLowerCase())
    const mime = allowed.test(file.mimetype)
    if (ext && mime) {
      cb(null, true)
    } else {
      cb(new Error('仅支持图片格式'))
    }
  }
})

router.post('/send-code', authController.sendCode)
router.post('/login', authController.login)
router.post('/wechat-login', authController.wechatLogin)
router.get('/user', authController.getCurrentUser)
router.post('/logout', authController.logout)
router.post('/profile', authController.updateProfile)
router.post('/avatar', upload.single('avatar'), authController.uploadAvatar)

module.exports = router

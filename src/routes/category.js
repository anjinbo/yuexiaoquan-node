const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const requireAuth = require('../middlewares/requireAuth')

// 公开接口
router.get('/', categoryController.list)

// 管理接口（需登录）
router.get('/admin', requireAuth, categoryController.adminList)
router.post('/admin', requireAuth, categoryController.create)
router.put('/admin/:id', requireAuth, categoryController.update)
router.delete('/admin/:id', requireAuth, categoryController.remove)

module.exports = router

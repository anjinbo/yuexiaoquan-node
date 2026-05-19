/**
 * 主路由文件
 * 统一管理所有API路由
 */
const express = require('express')
const router = express.Router()

// 导入子路由
const postsRouter = require('./posts')
const authRouter = require('./auth')
const categoryRouter = require('./category')
const uploadRouter = require('./upload')
const proxyRouter = require('./proxy')

// 健康检查接口
router.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: '服务正常运行',
    timestamp: new Date().toISOString()
  })
})

// 认证相关路由
router.use('/auth', authRouter)

// 分类相关路由
router.use('/categories', categoryRouter)

// 上传相关路由
router.use('/upload', uploadRouter)

// 作品相关路由
router.use('/posts', postsRouter)

// 图片代理
router.use('/proxy', proxyRouter)

module.exports = router

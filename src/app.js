/**
 * 月小圈 - 后端服务入口
 */

// 加载环境变量
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const session = require('express-session')
const { MongoStore } = require('connect-mongo')
const path = require('path')

// 导入模块
const connectDB = require('./config/database')
const routes = require('./routes')
const { notFound, errorHandler } = require('./middlewares/errorHandler')
const logger = require('./utils/logger')
const requestLogger = require('./middlewares/requestLogger')

// 创建Express应用
const app = express()

// 获取端口号
const PORT = process.env.PORT || 8000

// 连接数据库
connectDB()

// MongoDB 连接地址
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yuexiaoquan'

// 中间件
app.use(requestLogger)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongoUrl: MONGODB_URI,
    ttl: 7 * 24 * 60 * 60,
    autoRemove: 'native'
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  }
}))

// 静态文件 - 上传的图片
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// API路由 - 统一前缀为/api
app.use('/api', routes)

// 404 处理
app.use(notFound)

// 全局错误处理
app.use(errorHandler)

// 启动服务器
app.listen(PORT, () => {
  logger.info(`🚀 服务器运行在 http://localhost:${PORT}`)
  logger.info(`📚 API文档: http://localhost:${PORT}/api/health`)
})

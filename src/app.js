/**
 * 月小圈 - 后端服务入口
 */

// 加载环境变量
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const session = require('express-session')
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

// 中间件
app.use(requestLogger)

app.use(cors({
  origin: true,
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ✅ 临时安全 session（不依赖 connect-mongo，绝对不报错）
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_123456',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  }
}))

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// API路由
app.use('/api', routes)

// 404
app.use(notFound)

// 错误处理
app.use(errorHandler)

// ✅ 线上必须监听 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 服务器运行在端口 ${PORT}`)
})
/**
 * 月小圈 - 后端服务入口
 */

// 加载环境变量
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const session = require('express-session')
const MongoStore = require('connect-mongo') // ✅ 修复这里
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

// ✅ 修复 CORS，允许所有域名（线上必须）
app.use(cors({
  origin: true,
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ✅ 修复 session + connect-mongo 正确写法
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI
  }),
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

// ✅ 修复监听 0.0.0.0（线上必须）
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 服务器运行在端口 ${PORT}`)
})
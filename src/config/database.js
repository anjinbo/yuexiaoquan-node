/**
 * MongoDB数据库连接配置
 */
const mongoose = require('mongoose')
const logger = require('../utils/logger')

// 获取MongoDB连接地址，默认连接到本地的yuexiaoquan数据库
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yuexiaoquan'

/**
 * 连接数据库函数
 */
const connectDB = async () => {
  try {
    // 连接MongoDB
    await mongoose.connect(MONGODB_URI)
    logger.info('✅ MongoDB连接成功:', { uri: MONGODB_URI })
  } catch (error) {
    logger.error('❌ MongoDB连接失败:', { error: error.message })
    // 连接失败时退出进程
    process.exit(1)
  }
}

// 监听连接事件
mongoose.connection.on('disconnected', () => {
  logger.warn('📡 MongoDB断开连接')
})

mongoose.connection.on('error', (error) => {
  logger.error('❌ MongoDB错误:', { error })
})

module.exports = connectDB

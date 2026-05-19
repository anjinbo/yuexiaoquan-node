/**
 * 统一错误处理中间件
 */
const { error: createError } = require('../utils/response')
const logger = require('../utils/logger')

/**
 * 404 中间件
 */
const notFound = (req, res, next) => {
  const err = new Error(`找不到 ${req.originalUrl}`)
  err.status = 404
  next(err)
}

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  // 打印错误日志
  logger.error('❌ 错误:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  })

  // 确定状态码
  const statusCode = err.status || 500
  const message = err.message || '服务器内部错误'

  // 返回错误响应
  res.status(statusCode).json(createError(message, statusCode))
}

module.exports = {
  notFound,
  errorHandler
}

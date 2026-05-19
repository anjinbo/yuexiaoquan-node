const logger = require('../utils/logger')

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now()
  const { method, originalUrl, ip, headers } = req

  // 记录请求开始
  logger.http(`Request started: ${method} ${originalUrl}`, {
    method,
    url: originalUrl,
    ip: ip || headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: headers['user-agent']
  })

  // 监听响应完成
  res.on('finish', () => {
    const duration = Date.now() - start
    const { statusCode } = res

    const logData = {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip: ip || headers['x-forwarded-for'] || req.connection.remoteAddress
    }

    if (statusCode >= 500) {
      logger.error(`Request failed: ${method} ${originalUrl}`, logData)
    } else if (statusCode >= 400) {
      logger.warn(`Request warning: ${method} ${originalUrl}`, logData)
    } else {
      logger.info(`Request completed: ${method} ${originalUrl}`, logData)
    }
  })

  next()
}

module.exports = requestLogger

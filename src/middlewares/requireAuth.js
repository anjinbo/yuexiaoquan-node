const { sendError } = require('../utils/response')

module.exports = (req, res, next) => {
  if (!req.session?.userId) {
    return sendError(res, '请先登录', 401)
  }
  next()
}

const express = require('express')
const router = express.Router()
const { generateUploadToken } = require('../utils/qiniu')
const { sendSuccess, sendError } = require('../utils/response')

// 获取七牛云上传凭证（需要登录）
router.post('/token', (req, res) => {
  if (!req.session.userId) {
    return sendError(res, '请先登录', 401)
  }
  try {
    const { token, domain } = generateUploadToken()
    sendSuccess(res, { token, domain })
  } catch (err) {
    sendError(res, '获取上传凭证失败')
  }
})

module.exports = router

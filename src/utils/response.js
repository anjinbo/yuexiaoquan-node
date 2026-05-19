/**
 * 统一响应工具
 * 用于规范API返回格式
 */

/**
 * 通用响应状态码
 */
const STATUS_CODE = {
  SUCCESS: 200,           // 成功
  BAD_REQUEST: 400,       // 请求参数错误
  UNAUTHORIZED: 401,      // 未授权
  NOT_FOUND: 404,         // 资源不存在
  SERVER_ERROR: 500       // 服务器错误
}

/**
 * 成功响应
 * @param {any} data - 返回的数据
 * @param {string} message - 返回的消息
 * @param {number} code - 状态码
 */
const success = (data = null, message = '操作成功', code = STATUS_CODE.SUCCESS) => {
  return {
    code,
    message,
    data,
    success: true
  }
}

/**
 * 失败响应
 * @param {string} message - 错误消息
 * @param {number} code - 状态码
 * @param {any} errors - 详细错误信息
 */
const error = (message = '操作失败', code = STATUS_CODE.SERVER_ERROR, errors = null) => {
  return {
    code,
    message,
    errors,
    success: false
  }
}

/**
 * 分页响应
 * @param {Array} list - 数据列表
 * @param {number} total - 总数
 * @param {number} page - 当前页
 * @param {number} pageSize - 每页条数
 */
const page = (list = [], total = 0, page = 1, pageSize = 10) => {
  return success({
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  })
}

// 发送成功响应
const sendSuccess = (res, data, message, code) => {
  res.status(code || STATUS_CODE.SUCCESS).json(success(data, message, code))
}

// 发送错误响应
const sendError = (res, message, code, errors) => {
  res.status(code || STATUS_CODE.SERVER_ERROR).json(error(message, code, errors))
}

module.exports = {
  STATUS_CODE,
  success,
  error,
  page,
  sendSuccess,
  sendError
}

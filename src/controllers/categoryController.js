const Category = require('../models/Category')
const { sendSuccess, sendError } = require('../utils/response')

// 公开：获取分类列表（前端 TabsNav 用）
exports.list = async (req, res) => {
  try {
    const categories = await Category.find({ status: 1 })
      .sort({ sort: 1, createdAt: 1 })
      .select('name slug icon image color postCount isHot sort')
      .lean()
    sendSuccess(res, categories)
  } catch (err) {
    sendError(res, err.message)
  }
}

// 管理：获取全部分类（含禁用的）
exports.adminList = async (req, res) => {
  try {
    const { page = 1, pageSize = 50 } = req.query
    const skip = (page - 1) * pageSize
    const total = await Category.countDocuments()
    const categories = await Category.find()
      .sort({ sort: 1, createdAt: 1 })
      .skip(skip)
      .limit(Number(pageSize))
      .lean()
    sendSuccess(res, { list: categories, total, page: Number(page), pageSize: Number(pageSize) })
  } catch (err) {
    sendError(res, err.message)
  }
}

// 管理：创建分类
exports.create = async (req, res) => {
  try {
    const { name, slug, description, icon, color, parentId, sort, status, isHot, seoTitle, seoDescription, seoKeywords } = req.body
    const category = await Category.create({
      name, slug, description, icon, color, parentId, sort, status, isHot, seoTitle, seoDescription, seoKeywords
    })
    sendSuccess(res, category)
  } catch (err) {
    if (err.code === 11000) return sendError(res, 'slug 已存在', 400)
    sendError(res, err.message)
  }
}

// 管理：更新分类
exports.update = async (req, res) => {
  try {
    const { id } = req.params
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    if (!category) return sendError(res, '分类不存在', 404)
    sendSuccess(res, category)
  } catch (err) {
    if (err.code === 11000) return sendError(res, 'slug 已存在', 400)
    sendError(res, err.message)
  }
}

// 管理：删除分类
exports.remove = async (req, res) => {
  try {
    const { id } = req.params
    const category = await Category.findByIdAndDelete(id)
    if (!category) return sendError(res, '分类不存在', 404)
    sendSuccess(res, null, '删除成功')
  } catch (err) {
    sendError(res, err.message)
  }
}

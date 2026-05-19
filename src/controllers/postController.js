const Post = require('../models/Post')
const User = require('../models/User')
const Category = require('../models/Category')
const Comment = require('../models/Comment')
const Like = require('../models/Like')
const Favorite = require('../models/Favorite')
const { sendSuccess, sendError } = require('../utils/response')

const getPostList = async (req, res) => {
  try {
    const pageNum = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const { categoryId, keyword } = req.query
    const skip = (pageNum - 1) * pageSize

    const where = { isPublished: true }
    if (categoryId) where.categoryId = categoryId

    // 关键词搜索 - 模糊匹配标题、描述、标签
    if (keyword) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      where.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { tags: { $regex: escaped, $options: 'i' } }
      ]
    }

    const [list, total] = await Promise.all([
      Post.find(where)
        .populate('authorId', 'nickname avatar')
        .populate('categoryId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Post.countDocuments(where)
    ])

    const userId = req.session.userId
    if (userId && list.length) {
      const postIds = list.map(p => p._id)
      const [likes, favorites] = await Promise.all([
        Like.find({ postId: { $in: postIds }, userId }).select('postId'),
        Favorite.find({ postId: { $in: postIds }, userId }).select('postId')
      ])
      const likedIds = new Set(likes.map(l => l.postId.toString()))
      const favoritedIds = new Set(favorites.map(f => f.postId.toString()))
      list.forEach(post => {
        post.isLiked = likedIds.has(post._id.toString())
        post.isFavorited = favoritedIds.has(post._id.toString())
      })
    }

    sendSuccess(res, { list, total, page: pageNum, pageSize })
  } catch (error) {
    console.error('获取作品列表失败:', error)
    sendError(res, '获取作品列表失败', 500)
  }
}

const getUserPosts = async (req, res) => {
  try {
    const userId = req.session.userId
    console.log('getUserPosts - userId:', userId)
    if (!userId) {
      return sendError(res, '请先登录', 401)
    }

    const pageNum = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 20
    const skip = (pageNum - 1) * pageSize

    const [list, total] = await Promise.all([
      Post.find({ authorId: userId, isPublished: true })
        .populate('authorId', 'nickname avatar')
        .populate('categoryId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Post.countDocuments({ authorId: userId, isPublished: true })
    ])

    console.log('getUserPosts - found:', list.length, 'total:', total)

    if (list.length) {
      const postIds = list.map(p => p._id)
      const [likes, favorites] = await Promise.all([
        Like.find({ postId: { $in: postIds }, userId }).select('postId'),
        Favorite.find({ postId: { $in: postIds }, userId }).select('postId')
      ])
      const likedIds = new Set(likes.map(l => l.postId.toString()))
      const favoritedIds = new Set(favorites.map(f => f.postId.toString()))
      list.forEach(post => {
        post.isLiked = likedIds.has(post._id.toString())
        post.isFavorited = favoritedIds.has(post._id.toString())
      })
    }

    sendSuccess(res, { list, total, page: pageNum, pageSize })
  } catch (error) {
    console.error('获取用户作品失败:', error)
    sendError(res, '获取用户作品失败', 500)
  }
}

const getUserFavorites = async (req, res) => {
  try {
    const userId = req.session.userId
    if (!userId) {
      return sendError(res, '请先登录', 401)
    }

    const pageNum = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 20
    const skip = (pageNum - 1) * pageSize

    const [favorites, total] = await Promise.all([
      Favorite.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate({
          path: 'postId',
          populate: [
            { path: 'authorId', select: 'nickname avatar' },
            { path: 'categoryId', select: 'name slug' }
          ]
        })
        .lean(),
      Favorite.countDocuments({ userId })
    ])

    const list = favorites.map(f => f.postId).filter(Boolean)
    list.forEach(post => { post.isFavorited = true })

    sendSuccess(res, { list, total, page: pageNum, pageSize })
  } catch (error) {
    console.error('获取用户收藏失败:', error)
    sendError(res, '获取用户收藏失败', 500)
  }
}

const getUserLikes = async (req, res) => {
  try {
    const userId = req.session.userId
    if (!userId) {
      return sendError(res, '请先登录', 401)
    }

    const pageNum = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 20
    const skip = (pageNum - 1) * pageSize

    const [likes, total] = await Promise.all([
      Like.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate({
          path: 'postId',
          populate: [
            { path: 'authorId', select: 'nickname avatar' },
            { path: 'categoryId', select: 'name slug' }
          ]
        })
        .lean(),
      Like.countDocuments({ userId })
    ])

    const list = likes.map(l => l.postId).filter(Boolean)
    list.forEach(post => { post.isLiked = true })

    sendSuccess(res, { list, total, page: pageNum, pageSize })
  } catch (error) {
    console.error('获取用户点赞失败:', error)
    sendError(res, '获取用户点赞失败', 500)
  }
}

const getPostDetail = async (req, res) => {
  try {
    const { id } = req.params
    const post = await Post.findById(id)
      .populate('authorId', 'nickname avatar')
      .populate('categoryId', 'name slug')

    if (!post) {
      return sendError(res, '作品不存在', 404)
    }

    const userId = req.session.userId
    const [likeCount, favoriteCount, commentCount] = await Promise.all([
      Like.countDocuments({ postId: id }),
      Favorite.countDocuments({ postId: id }),
      Comment.countDocuments({ postId: id })
    ])

    let isLiked = false, isFavorited = false
    if (userId) {
      [isLiked, isFavorited] = await Promise.all([
        Like.exists({ postId: id, userId }),
        Favorite.exists({ postId: id, userId })
      ])
    }

    await Post.findByIdAndUpdate(id, { $inc: { viewCount: 1 } })

    sendSuccess(res, {
      ...post.toObject(),
      likeCount,
      favoriteCount,
      commentCount,
      isLiked,
      isFavorited
    })
  } catch (error) {
    console.error('获取作品详情失败:', error)
    sendError(res, '获取作品详情失败', 500)
  }
}

const getComments = async (req, res) => {
  try {
    const { id } = req.params
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 20
    const skip = (page - 1) * pageSize

    const [comments, total] = await Promise.all([
      Comment.find({ postId: id })
        .populate('userId', 'nickname avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Comment.countDocuments({ postId: id })
    ])

    sendSuccess(res, { list: comments, total, page, pageSize })
  } catch (error) {
    console.error('获取评论失败:', error)
    sendError(res, '获取评论失败', 500)
  }
}

const createComment = async (req, res) => {
  try {
    if (!req.session.userId) {
      return sendError(res, '请先登录', 401)
    }

    const { id } = req.params
    const { content } = req.body

    if (!content?.trim()) {
      return sendError(res, '评论内容不能为空', 400)
    }

    const [post, user] = await Promise.all([
      Post.findById(id),
      User.findById(req.session.userId).select('nickname avatar')
    ])

    if (!post) {
      return sendError(res, '作品不存在', 404)
    }

    const comment = await Comment.create({
      postId: id,
      userId: req.session.userId,
      content: content.trim()
    })

    const newComment = await Comment.findById(comment._id)
      .populate('userId', 'nickname avatar')

    sendSuccess(res, newComment, '评论成功')
  } catch (error) {
    console.error('发表评论失败:', error)
    sendError(res, '发表评论失败', 500)
  }
}

const toggleLike = async (req, res) => {
  try {
    if (!req.session.userId) {
      return sendError(res, '请先登录', 401)
    }

    const { id } = req.params
    const userId = req.session.userId

    const existing = await Like.findOne({ postId: id, userId })
    let isLiked
    if (existing) {
      await Like.deleteOne({ _id: existing._id })
      isLiked = false
    } else {
      await Like.create({ postId: id, userId })
      isLiked = true
    }

    const likeCount = await Like.countDocuments({ postId: id })
    sendSuccess(res, { isLiked, likeCount }, isLiked ? '点赞成功' : '取消点赞成功')
  } catch (error) {
    console.error('点赞操作失败:', error)
    sendError(res, '点赞操作失败', 500)
  }
}

const toggleFavorite = async (req, res) => {
  try {
    if (!req.session.userId) {
      return sendError(res, '请先登录', 401)
    }

    const { id } = req.params
    const userId = req.session.userId

    const existing = await Favorite.findOne({ postId: id, userId })
    let isFavorited
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id })
      isFavorited = false
    } else {
      await Favorite.create({ postId: id, userId })
      isFavorited = true
    }

    const favoriteCount = await Favorite.countDocuments({ postId: id })
    sendSuccess(res, { isFavorited, favoriteCount }, isFavorited ? '收藏成功' : '取消收藏成功')
  } catch (error) {
    console.error('收藏操作失败:', error)
    sendError(res, '收藏操作失败', 500)
  }
}

const deletePost = async (req, res) => {
  try {
    const userId = req.session.userId
    if (!userId) {
      return sendError(res, '请先登录', 401)
    }

    const { id } = req.params
    const post = await Post.findById(id)

    if (!post) {
      return sendError(res, '作品不存在', 404)
    }

    if (post.authorId.toString() !== userId) {
      return sendError(res, '无权删除此作品', 403)
    }

    await Post.findByIdAndDelete(id)
    // 同时删除关联的点赞、收藏、评论
    await Promise.all([
      Like.deleteMany({ postId: id }),
      Favorite.deleteMany({ postId: id }),
      Comment.deleteMany({ postId: id })
    ])

    sendSuccess(res, null, '删除成功')
  } catch (error) {
    console.error('删除作品失败:', error)
    sendError(res, '删除作品失败', 500)
  }
}

const createPost = async (req, res) => {
  try {
    if (!req.session.userId) {
      return sendError(res, '请先登录', 401)
    }

    const { title, description, images, categoryId, tags } = req.body
    console.log('createPost - userId:', req.session.userId)

    const user = await User.findById(req.session.userId).select('nickname avatar')
    if (!user) {
      return sendError(res, '用户不存在', 404)
    }

    const post = await Post.create({
      title,
      description,
      images: images || [],
      authorId: req.session.userId,
      author: user.nickname,
      categoryId: categoryId || null,
      tags: tags || []
    })

    console.log('createPost - post created:', post._id, 'authorId:', post.authorId)

    // 返回 populated 的帖子数据
    const populatedPost = await Post.findById(post._id)
      .populate('authorId', 'nickname avatar')
      .populate('categoryId', 'name slug')

    sendSuccess(res, populatedPost, '发布成功')
  } catch (error) {
    console.error('创建作品失败:', error)
    sendError(res, error.message || '发布失败', 400)
  }
}

module.exports = {
  getPostList,
  getPostDetail,
  getComments,
  createComment,
  toggleLike,
  toggleFavorite,
  createPost,
  deletePost,
  getUserPosts,
  getUserFavorites,
  getUserLikes
}

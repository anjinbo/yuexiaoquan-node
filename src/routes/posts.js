const express = require('express')
const router = express.Router()
const {
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
} = require('../controllers/postController')

router.get('/', getPostList)
router.get('/user/posts', getUserPosts)
router.get('/user/favorites', getUserFavorites)
router.get('/user/likes', getUserLikes)
router.get('/:id', getPostDetail)
router.delete('/:id', deletePost)
router.get('/:id/comments', getComments)
router.post('/', createPost)
router.post('/:id/comments', createComment)
router.post('/:id/like', toggleLike)
router.post('/:id/favorite', toggleFavorite)

module.exports = router

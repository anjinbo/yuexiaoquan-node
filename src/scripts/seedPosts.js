/**
 * 重建分类 + 爬取 pexels 数据 + 多用户 + 分类分配
 * 用法: node src/scripts/seedPosts.js
 */
require('dotenv').config()
const mongoose = require('mongoose')
const Post = require('../models/Post')
const User = require('../models/User')
const Category = require('../models/Category')

const API_URL = 'https://imooc-front.lgdsunday.club/prod-api/pexels/list'

// 外部网站的分类数据
const remoteCategories = [
  { slug: 'web_app_icon', name: 'UI/UX', sort: 0 },
  { slug: 'design', name: '平面', sort: 1 },
  { slug: 'illustration', name: '插画/漫画', sort: 2 },
  { slug: 'photography', name: '摄影', sort: 3 },
  { slug: 'games', name: '游戏', sort: 4 },
  { slug: 'anime', name: '动漫', sort: 5 },
  { slug: 'industrial_design', name: '工业设计', sort: 6 },
  { slug: 'architecture', name: '建筑设计', sort: 7 },
  { slug: 'art', name: '人文艺术', sort: 8 },
  { slug: 'home', name: '家居/家装', sort: 9 },
  { slug: 'apparel', name: '女装/搭配', sort: 10 },
  { slug: 'men', name: '男士/风尚', sort: 11 },
  { slug: 'modeling_hair', name: '造型/美妆', sort: 12 },
  { slug: 'diy_crafts', name: '手工/布艺', sort: 13 },
  { slug: 'food_drink', name: '美食', sort: 14 },
  { slug: 'travel_places', name: '旅行', sort: 15 },
  { slug: 'wedding_events', name: '婚礼', sort: 16 },
  { slug: 'kids', name: '儿童', sort: 17 },
  { slug: 'pets', name: '宠物', sort: 18 },
  { slug: 'quotes', name: '美图', sort: 19 },
  { slug: 'people', name: '明星', sort: 20 },
  { slug: 'beauty', name: '美女', sort: 21 },
  { slug: 'desire', name: '礼物', sort: 22 },
  { slug: 'geek', name: '极客', sort: 23 },
  { slug: 'data_presentation', name: '数据图', sort: 24 },
  { slug: 'cars_motorcycles', name: '汽车/摩托', sort: 25 },
  { slug: 'film_music_books', name: '电影/图书', sort: 26 },
  { slug: 'tips', name: '生活百科', sort: 27 },
  { slug: 'education', name: '教育', sort: 28 },
  { slug: 'sports', name: '运动', sort: 29 },
  { slug: 'funny', name: '搞笑', sort: 30 },
]

// 额外用户
const fakeUsers = [
  { nickname: '摄影师小王', avatar: 'https://i.pravatar.cc/150?img=1', email: 'wang@test.com' },
  { nickname: '旅行达人', avatar: 'https://i.pravatar.cc/150?img=2', email: 'lvxing@test.com' },
  { nickname: '美食猎人', avatar: 'https://i.pravatar.cc/150?img=3', email: 'food@test.com' },
  { nickname: '城市漫步者', avatar: 'https://i.pravatar.cc/150?img=4', email: 'city@test.com' },
  { nickname: '自然探索', avatar: 'https://i.pravatar.cc/150?img=5', email: 'nature@test.com' },
  { nickname: '人像摄影', avatar: 'https://i.pravatar.cc/150?img=6', email: 'portrait@test.com' },
  { nickname: '风光大师', avatar: 'https://i.pravatar.cc/150?img=7', email: 'scenic@test.com' },
  { nickname: '街头快拍', avatar: 'https://i.pravatar.cc/150?img=8', email: 'street@test.com' },
  { nickname: '静物达人', avatar: 'https://i.pravatar.cc/150?img=9', email: 'still@test.com' },
  { nickname: '夜景猎手', avatar: 'https://i.pravatar.cc/150?img=10', email: 'night@test.com' },
]

async function fetchPosts(page, size) {
  const res = await fetch(`${API_URL}?page=${page}&size=${size}&categoryId=&searchText=`)
  const json = await res.json()
  if (!json.success) throw new Error('API error')
  return json.data.list
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yuexiaoquan')
  console.log('MongoDB connected')

  // 1. 清除旧分类和旧帖子
  await Category.deleteMany({})
  await Post.deleteMany({})
  console.log('Cleaned old categories and posts')

  // 2. 创建分类
  const categoryDocs = await Category.insertMany(
    remoteCategories.map(c => ({ name: c.name, slug: c.slug, sort: c.sort, status: 1 }))
  )
  console.log(`Created ${categoryDocs.length} categories`)

  // slug → _id 映射
  const categoryMap = {}
  categoryDocs.forEach(c => { categoryMap[c.slug] = c._id })

  // 3. 创建假用户
  const users = []
  for (const u of fakeUsers) {
    let user = await User.findOne({ email: u.email })
    if (!user) {
      user = await User.create(u)
    }
    users.push(user)
  }
  // 加上已有用户
  const allUsers = await User.find()
  console.log(`Total users: ${allUsers.length}`)

  // 4. 爬取 200 条数据（10页 x 20条）
  const pages = 10
  const size = 20
  let totalInserted = 0
  const categorySlugList = remoteCategories.map(c => c.slug)

  for (let p = 1; p <= pages; p++) {
    console.log(`Fetching page ${p}/${pages}...`)
    const items = await fetchPosts(p, size)

    for (const item of items) {
      // 去重
      const exists = await Post.findOne({ 'images.url': item.photo })
      if (exists) continue

      // 从 tags 中匹配分类（排除 "all"）
      const postTags = (item.tags || []).filter(t => t !== 'all')
      let matchedSlug = postTags.find(t => categorySlugList.includes(t))
      // 如果没匹配到，随机分配一个分类
      if (!matchedSlug) {
        matchedSlug = categorySlugList[Math.floor(Math.random() * categorySlugList.length)]
      }
      const categoryId = categoryMap[matchedSlug]

      // 随机分配用户
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]

      await Post.create({
        title: item.title || '来自 Pexels 的图片',
        description: `作者: ${item.author}`,
        images: [{
          url: item.photo,
          width: item.photoWidth || 500,
          height: item.photoHeight || 500
        }],
        authorId: randomUser._id,
        author: randomUser.nickname,
        categoryId,
        tags: postTags.slice(0, 5),
        likes: Math.floor(Math.random() * 500),
        viewCount: Math.floor(Math.random() * 3000)
      })
      totalInserted++
    }

    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\nInserted ${totalInserted} posts`)

  // 5. 统计
  const total = await Post.countDocuments()
  console.log(`Total posts: ${total}`)

  const catStats = await Post.aggregate([
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ])
  console.log('\nPosts per category:')
  for (const s of catStats) {
    const cat = categoryDocs.find(c => c._id.toString() === s._id?.toString())
    console.log(`  ${cat?.name || s._id}: ${s.count}`)
  }

  const userStats = await Post.aggregate([
    { $group: { _id: '$author', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ])
  console.log('\nPosts per user:')
  userStats.forEach(s => console.log(`  ${s._id}: ${s.count}`))

  process.exit(0)
}

seed().catch(err => {
  console.error('Seed error:', err)
  process.exit(1)
})

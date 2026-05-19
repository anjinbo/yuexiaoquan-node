/**
 * 种子脚本：初始化分类数据
 * 运行方式：node src/scripts/seedCategories.js
 */
const mongoose = require('mongoose')
require('dotenv').config()

const Category = require('../models/Category')

const categories = [
  { name: '全部', slug: 'all', sort: 0 },
  { name: '用户界面/用户体验', slug: 'web_app_icon', sort: 1 },
  { name: '平面', slug: 'design', sort: 2 },
  { name: '插画/漫画', slug: 'illustration', sort: 3 },
  { name: '摄影', slug: 'photography', sort: 4 },
  { name: '游戏', slug: 'games', sort: 5 },
  { name: '动漫', slug: 'anime', sort: 6 },
  { name: '工业设计', slug: 'industrial_design', sort: 7 },
  { name: '建筑设计', slug: 'architecture', sort: 8 },
  { name: '人文艺术', slug: 'art', sort: 9 },
  { name: '家居/家装', slug: 'home', sort: 10 },
  { name: '女装/搭配', slug: 'apparel', sort: 11 },
  { name: '男/风尚', slug: 'men', sort: 12 },
  { name: '造型/美妆', slug: 'modeling_hair', sort: 13 },
  { name: '手工/布艺', slug: 'diy_crafts', sort: 14 },
  { name: '美食', slug: 'food_drink', sort: 15 },
  { name: '旅行', slug: 'travel_places', sort: 16 },
  { name: '婚礼', slug: 'wedding_events', sort: 17 },
  { name: '儿童', slug: 'kids', sort: 18 },
  { name: '宠物', slug: 'pets', sort: 19 },
  { name: '美图', slug: 'quotes', sort: 20 },
  { name: '明星', slug: 'people', sort: 21 },
  { name: '美女', slug: 'beauty', sort: 22 },
  { name: '礼物', slug: 'desire', sort: 23 },
  { name: '极客', slug: 'geek', sort: 24 },
  { name: '数据图', slug: 'data_presentation', sort: 25 },
  { name: '汽车/摩托', slug: 'cars_motorcycles', sort: 26 },
  { name: '电影/图书', slug: 'film_music_books', sort: 27 },
  { name: '生活百科', slug: 'tips', sort: 28 },
  { name: '教育', slug: 'education', sort: 29 },
  { name: '运动', slug: 'sports', sort: 30 },
  { name: '搞笑', slug: 'funny', sort: 31 }
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yuexiaoquan')
    console.log('MongoDB connected')

    // 清空旧数据
    await Category.deleteMany({})
    console.log('Cleared existing categories')

    // 插入种子数据
    const result = await Category.insertMany(categories)
    console.log(`Seeded ${result.length} categories`)

    await mongoose.disconnect()
    console.log('Done')
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

seed()

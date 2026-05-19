/**
 * 更新分类数据：为热门精选增加 image、color、sort、status 字段
 * 运行方式：node src/scripts/updateCategoryHot.js
 */
const mongoose = require('mongoose')
require('dotenv').config()

const Category = require('../models/Category')

// 要更新的分类：slug → { image, color, sort }
const updates = {
  illustration:    { sort: 100, color: '#667eea', image: 'https://picsum.photos/seed/illustration/400/300' },
  photography:     { sort: 90,  color: '#f5576c', image: 'https://picsum.photos/seed/photography/400/300' },
  design:          { sort: 80,  color: '#4facfe', image: 'https://picsum.photos/seed/design/400/300' },
  anime:           { sort: 70,  color: '#43e97b', image: 'https://picsum.photos/seed/anime/400/300' },
  food_drink:      { sort: 60,  color: '#fa709a', image: 'https://picsum.photos/seed/food/400/300' },
  travel_places:   { sort: 50,  color: '#a18cd1', image: 'https://picsum.photos/seed/travel/400/300' },
  home:            { sort: 40,  color: '#fccb90', image: 'https://picsum.photos/seed/home/400/300' },
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yuexiaoquan')
    console.log('MongoDB connected')

    for (const [slug, data] of Object.entries(updates)) {
      const result = await Category.updateOne(
        { slug },
        { $set: { ...data, status: 1 } }
      )
      console.log(`Updated "${slug}": matched=${result.matchedCount}, modified=${result.modifiedCount}`)
    }

    await mongoose.disconnect()
    console.log('Done')
  } catch (err) {
    console.error('Failed:', err)
    process.exit(1)
  }
}

run()

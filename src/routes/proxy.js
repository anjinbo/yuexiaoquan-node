/**
 * 图片代理路由 - 解决跨域图片加载问题
 */
const express = require('express')
const router = express.Router()
const https = require('https')
const http = require('http')

router.get('/', (req, res) => {
  const { url } = req.query
  if (!url) return res.status(400).send('missing url')

  try {
    const parsed = new URL(url)
    const client = parsed.protocol === 'https:' ? https : http

    client.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (proxyRes) => {
      // 跟随重定向
      if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
        client.get(proxyRes.headers.location, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }, (redirectRes) => {
          res.setHeader('Content-Type', redirectRes.headers['content-type'] || 'image/jpeg')
          res.setHeader('Cache-Control', 'public, max-age=86400')
          redirectRes.pipe(res)
        }).on('error', () => res.status(502).send('proxy error'))
        return
      }

      res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg')
      res.setHeader('Cache-Control', 'public, max-age=86400')
      proxyRes.pipe(res)
    }).on('error', () => {
      if (!res.headersSent) res.status(502).send('proxy error')
    })
  } catch {
    res.status(400).send('invalid url')
  }
})

module.exports = router

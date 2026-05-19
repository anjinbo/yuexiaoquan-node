const User = require('../models/User')
const VerificationCode = require('../models/VerificationCode')
const { success, error } = require('../utils/response')
const nodemailer = require('nodemailer')
const logger = require('../utils/logger')

// 生成6位数字验证码
const generateCode = () => {
  return Math.random().toString().slice(2, 8)
}

// 创建邮件发送器
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

// 发送验证码
exports.sendCode = async (req, res) => {
  try {
    const { email, type = 1 } = req.body

    if (!email) {
      return res.status(400).json(error('请输入邮箱'))
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json(error('邮箱格式不正确'))
    }

    const now = new Date()
    const recentCode = await VerificationCode.findOne({
      email,
      type,
      createdAt: { $gt: new Date(now.getTime() - 60000) }
    })

    if (recentCode) {
      logger.warn(`验证码发送太频繁: ${email}`)
      return res.status(400).json(error('验证码发送太频繁，请1分钟后重试'))
    }

    const code = generateCode()
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000)

    await VerificationCode.create({
      email,
      code,
      type,
      expiresAt
    })

    // 如果配置了SMTP则发送真实邮件，否则打印到控制台
    if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== 'your-email@qq.com') {
      const transporter = createTransporter()
      await transporter.sendMail({
        from: `"月小圈" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: '【月小圈】邮箱验证码',
        html: `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2>欢迎使用月小圈</h2>
            <p>您的邮箱验证码是：</p>
            <div style="font-size: 32px; font-weight: bold; color: #e91e63; margin: 20px 0; letter-spacing: 4px;">${code}</div>
            <p>验证码将在5分钟后过期，请尽快使用。</p>
            <p>如非本人操作，请忽略此邮件。</p>
          </div>
        `
      })
      logger.info(`[验证码] 已发送至 ${email}`)
    } else {
      logger.info(`[验证码] ${email}: ${code} (未配置SMTP，仅打印到控制台)`)
    }

    res.json(success({ message: '验证码已发送，请查收邮箱' }))
  } catch (err) {
    logger.error('发送验证码失败:', { error: err.message, stack: err.stack })
    res.status(500).json(error('发送验证码失败'))
  }
}

// 邮箱验证码登录
exports.login = async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json(error('请输入邮箱和验证码'))
    }

    const verification = await VerificationCode.findOne({
      email,
      code,
      type: 1,
      used: false,
      expiresAt: { $gt: new Date() }
    })

    if (!verification) {
      logger.warn(`验证码验证失败: ${email}`)
      return res.status(400).json(error('验证码无效或已过期'))
    }

    verification.used = true
    await verification.save()

    let user = await User.findOne({ email })
    const isNewUser = !user

    if (isNewUser) {
      const nickname = email.split('@')[0]
      user = await User.create({
        email,
        nickname,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${email}`
      })
      logger.info(`新用户注册: ${email}`)
    }

    user.lastLoginAt = new Date()
    await user.save()

    req.session.userId = user._id

    logger.info(`用户登录成功: ${email}`)

    res.json(success({
      user: {
        id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        email: user.email
      },
      isNewUser,
      message: isNewUser ? '注册成功并已登录' : '登录成功'
    }))
  } catch (err) {
    logger.error('登录失败:', { error: err.message, stack: err.stack })
    res.status(500).json(error('登录失败'))
  }
}

// 获取当前登录用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json(error('未登录', 401))
    }

    const user = await User.findById(req.session.userId).select('-__v')

    if (!user) {
      logger.warn(`用户不存在: ${req.session.userId}`)
      return res.status(404).json(error('用户不存在', 404))
    }

    res.json(success({
      user: {
        id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        email: user.email,
        bio: user.bio,
        birthday: user.birthday,
        gender: user.gender,
        location: user.location,
        createdAt: user.createdAt
      }
    }))
  } catch (err) {
    logger.error('获取用户信息失败:', { error: err.message, stack: err.stack })
    res.status(500).json(error('获取用户信息失败'))
  }
}

// 退出登录
exports.logout = (req, res) => {
  const userId = req.session.userId
  req.session.destroy((err) => {
    if (err) {
      logger.error('退出失败:', { error: err.message })
      return res.status(500).json(error('退出失败'))
    }
    if (userId) {
      logger.info(`用户退出登录: ${userId}`)
    }
    res.clearCookie('connect.sid', { path: '/' })
    res.json(success({ message: '已退出登录' }))
  })
}

// 更新个人资料
exports.updateProfile = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json(error('未登录', 401))
    }

    const { nickname, bio, birthday, gender, location } = req.body
    const user = await User.findById(req.session.userId)

    if (!user) {
      return res.status(404).json(error('用户不存在', 404))
    }

    if (nickname !== undefined) user.nickname = nickname
    if (bio !== undefined) user.bio = bio
    if (birthday !== undefined) user.birthday = birthday ? new Date(birthday) : null
    if (gender !== undefined) user.gender = gender
    if (location !== undefined) user.location = location

    await user.save()

    logger.info(`用户资料更新: ${user._id}`)

    res.json(success({
      user: {
        id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        email: user.email,
        bio: user.bio,
        birthday: user.birthday,
        gender: user.gender,
        location: user.location,
        createdAt: user.createdAt
      }
    }))
  } catch (err) {
    logger.error('更新资料失败:', { error: err.message, stack: err.stack })
    res.status(500).json(error('更新资料失败'))
  }
}

// 上传头像
const path = require('path')
const fs = require('fs')

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json(error('未登录', 401))
    }

    if (!req.file) {
      return res.status(400).json(error('请选择图片'))
    }

    const user = await User.findById(req.session.userId)
    if (!user) {
      return res.status(404).json(error('用户不存在', 404))
    }

    // 生成头像URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    user.avatar = avatarUrl
    await user.save()

    logger.info(`头像更新: ${user._id}`)

    res.json(success({ avatar: avatarUrl }))
  } catch (err) {
    logger.error('上传头像失败:', { error: err.message, stack: err.stack })
    res.status(500).json(error('上传头像失败'))
  }
}

// 微信扫码登录
exports.wechatLogin = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json(error('缺少微信登录token'))
    }

    // 通过token获取微信用户信息
    const wxRes = await fetch('https://wxlogin.com/wxuser/userinfo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })

    const wxData = await wxRes.json()

    if (wxData.code !== 200 || !wxData.data) {
      logger.warn('微信用户信息获取失败:', wxData)
      return res.status(400).json(error('微信登录失败，请重试'))
    }

    const wxUser = wxData.data
    const openid = wxUser.openid || wxUser.wx_openid

    if (!openid) {
      return res.status(400).json(error('微信登录失败：未获取到用户标识'))
    }

    // 通过openid查找或创建用户
    let user = await User.findOne({ wechatOpenid: openid })
    const isNewUser = !user

    if (isNewUser) {
      user = await User.create({
        wechatOpenid: openid,
        nickname: wxUser.nickname || '微信用户',
        avatar: wxUser.headimgurl || ''
      })
      logger.info(`微信新用户注册: ${openid}`)
    } else {
      // 更新微信用户信息
      user.nickname = wxUser.nickname || user.nickname
      user.avatar = wxUser.headimgurl || user.avatar
    }

    user.lastLoginAt = new Date()
    await user.save()

    req.session.userId = user._id

    logger.info(`微信登录成功: ${openid}`)

    res.json(success({
      user: {
        id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        email: user.email
      },
      isNewUser,
      message: isNewUser ? '注册成功并已登录' : '登录成功'
    }))
  } catch (err) {
    logger.error('微信登录失败:', { error: err.message, stack: err.stack })
    res.status(500).json(error('微信登录失败'))
  }
}

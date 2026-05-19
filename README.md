# 月小圈 - 后端

基于 Express + MongoDB 的博客分享平台后端服务。

## 项目结构

```
server/
├── src/
│   ├── config/          # 配置文件
│   │   └── database.js  # 数据库配置
│   ├── controllers/     # 控制器
│   │   └── postController.js
│   ├── models/          # 数据模型
│   │   └── Post.js
│   ├── routes/          # 路由
│   │   ├── index.js
│   │   └── posts.js
│   ├── middlewares/     # 中间件
│   │   └── errorHandler.js
│   ├── utils/           # 工具函数
│   │   └── response.js
│   └── app.js           # 应用入口
├── .env
├── .env.example
├── package.json
└── README.md
```

## 功能特性

- RESTful API 设计
- MongoDB 数据库集成
- 统一响应格式
- 错误处理中间件
- CORS 跨域支持

## 数据库配置

- 端口：27017
- 数据库名：yuexiaoquan

## API 接口

### 健康检查
- `GET /api/health` - 健康检查

### 作品相关
- `GET /api/posts` - 获取作品列表（分页）
- `GET /api/posts/:id` - 获取作品详情
- `POST /api/posts` - 创建作品
- `PUT /api/posts/:id/like` - 点赞作品

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产环境启动
npm start
```

## 环境变量

复制 `.env.example` 为 `.env` 并配置：

```
PORT=8000
MONGODB_URI=mongodb://localhost:27017/yuexiaoquan
NODE_ENV=development
```

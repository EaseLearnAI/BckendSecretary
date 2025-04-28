当然可以！以下是翻译后的中文版，保留了原本的 Markdown 格式：

---

# SuperTimer 任务管理 API

一个基于 Node.js、Express 和 MongoDB 构建的 RESTful 任务管理 API。该 API 提供了任务管理、任务分组和番茄钟（Pomodoro）跟踪等功能。

## 功能特色

- 任务管理（创建、读取、更新、删除任务）
- 任务分组功能
- 任务优先级管理
- 截止日期管理
- 任务状态跟踪
- 番茄钟会话跟踪
- 通过四象限（重要性/紧急性矩阵）组织任务
- JWT 用户认证
- 全面的错误处理
- 日志记录功能

## 技术栈

- **Node.js**：JavaScript 运行时环境
- **Express**：Web 应用框架
- **MongoDB**：NoSQL 数据库
- **Mongoose**：MongoDB 对象建模工具
- **JWT**：用户认证
- **Winston**：日志记录
- **Morgan**：HTTP 请求日志
- **Express Validator**：输入验证

## 项目结构

```
src/
├── config/         # 配置文件
├── controllers/    # 控制器（请求处理器）
├── middleware/     # 自定义中间件
├── models/         # 数据库模型
├── routes/         # API 路由
├── utils/          # 工具函数
├── logs/           # 应用日志
└── server.js       # 入口文件
```

## API 接口

### 用户认证

- `POST /api/v1/auth/register` - 注册新用户
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/auth/me` - 获取当前登录用户信息
- `PUT /api/v1/auth/updatedetails` - 更新用户信息
- `PUT /api/v1/auth/updatepassword` - 更新用户密码

### 任务分组

- `GET /api/v1/task-groups` - 获取所有任务分组
- `GET /api/v1/task-groups/:groupId` - 获取指定任务分组
- `POST /api/v1/task-groups` - 创建新的任务分组
- `PUT /api/v1/task-groups/:groupId` - 更新指定任务分组
- `DELETE /api/v1/task-groups/:groupId` - 删除指定任务分组

### 任务管理

- `GET /api/v1/tasks` - 获取所有任务
- `GET /api/v1/tasks/:taskId` - 获取指定任务
- `POST /api/v1/tasks` - 创建新任务
- `PUT /api/v1/tasks/:taskId` - 更新任务
- `PATCH /api/v1/tasks/:taskId/status` - 更新任务状态
- `DELETE /api/v1/tasks/:taskId` - 删除任务
- `GET /api/v1/tasks/quadrants` - 根据四象限获取任务

### 番茄钟会话

- `GET /api/v1/tasks/:taskId/pomodoro` - 获取某个任务下的所有番茄钟会话
- `GET /api/v1/tasks/:taskId/pomodoro/:sessionId` - 获取指定的番茄钟会话
- `POST /api/v1/tasks/:taskId/pomodoro` - 创建新的番茄钟会话
- `PUT /api/v1/tasks/:taskId/pomodoro/:sessionId` - 更新番茄钟会话
- `DELETE /api/v1/tasks/:taskId/pomodoro/:sessionId` - 删除番茄钟会话

## 快速开始

### 环境要求

- Node.js（版本 14 及以上）
- MongoDB 数据库

### 安装步骤

1. 克隆项目仓库
```
git clone <repository-url>
```

2. 安装依赖
```
cd BckendSecretary
npm install
```

3. 配置环境变量  
在项目根目录创建 `.env` 文件，添加以下内容：
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/supertimer
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
LOG_LEVEL=info
```

4. 启动服务器
```
# 开发模式
npm run dev

# 生产模式
npm start
```

## 用户认证

所有 API 接口（除了认证相关接口）都需要通过 JWT 认证访问。在请求头中添加认证信息：

```
Authorization: Bearer <token>
```

## 错误处理

API 返回标准化的错误响应格式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误信息",
    "details": {
      "field": "具体字段错误信息"
    }
  },
  "success": false
}
```

## 日志记录

日志文件存储在 `src/logs` 目录下：
- `combined.log`：记录所有日志
- `error.log`：仅记录错误日志

## 许可证

ISC License

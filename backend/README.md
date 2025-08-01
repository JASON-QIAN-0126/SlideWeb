# Backend API for Presto

## Vercel 部署配置

### 1. 创建 Vercel KV 数据库

1. 在 Vercel 控制台中，进入你的项目
2. 点击 "Storage" 标签页
3. 创建新的 KV 数据库
4. 记下数据库的 URL 和 Token

### 2. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```
KV_REST_API_URL=你的KV数据库URL
KV_REST_API_TOKEN=你的KV数据库Token
NODE_ENV=production
```

### 3. 部署步骤

1. 确保你在 `backend` 目录中
2. 运行 `vercel` 命令进行部署
3. 或者通过 GitHub 集成自动部署

### 4. 本地开发

```bash
npm install
npm run dev
```

### 5. 故障排除

如果遇到 500 错误：

1. 检查 Vercel KV 环境变量是否正确设置
2. 查看 Vercel 函数日志
3. 确保所有依赖都已正确安装

### API 端点

- `POST /admin/auth/login` - 用户登录
- `POST /admin/auth/register` - 用户注册
- `POST /admin/auth/logout` - 用户登出
- `GET /admin/auth/profile` - 获取用户资料
- `GET /store` - 获取存储数据
- `PUT /store` - 更新存储数据
- `GET /docs` - API 文档 
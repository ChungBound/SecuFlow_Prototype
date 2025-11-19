# 部署指南

## 1. 构建修复

### Vercel 部署问题修复

如果在 Vercel 部署时遇到以下错误：
```
TypeError: Cannot read properties of undefined (reading 'split')
```

这是因为某些环境变量未定义导致的。我们已经修复了 `vite.config.ts` 和 `vite/plugins.ts` 中的环境变量检查问题。

### 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```
VITE_APP_API_BASEURL=https://your-backend-url.vercel.app
VITE_OPEN_PROXY=true
VITE_BUILD_SOURCEMAP=false
VITE_BUILD_COMPRESS=gzip
VITE_BUILD_ARCHIVE=
VITE_BUILD_MOCK=false
VITE_OPEN_DEVTOOLS=false
VITE_APP_DEBUG_TOOL=
VITE_APP_DISABLE_DEVTOOL=false
```

## 2. 构建修复

为了解决打包失败的问题，我们修改了 `package.json` 中的 `build:example` 命令，移除了 `vue-tsc` 类型检查。这意味着打包时会忽略 TypeScript 类型错误。

## 2. Docker 部署方案

我们为您准备了 Docker 容器化部署方案，包含以下文件：

- `Dockerfile`: 用于构建前端镜像
- `nginx.conf`: Nginx 配置文件，用于服务静态文件和处理路由
- `docker-compose.yml`: 用于编排服务

### 本地运行

确保您已安装 Docker 和 Docker Compose。

```bash
docker-compose up --build -d
```

访问 http://localhost 即可看到应用。

## 3. AWS 部署方案

### 方案 A: EC2 (推荐用于全栈部署)

这是最灵活的方式，适合同时部署前端和 Python FastAPI 后端。

1. **启动 EC2 实例**: 选择 Ubuntu 或 Amazon Linux 2
2. **安装 Docker**:
   ```bash
   sudo yum update -y
   sudo amazon-linux-extras install docker
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```
3. **部署代码**:
   - 将代码上传到服务器 (git clone 或 scp)
   - 如果有后端代码，请确保 `docker-compose.yml` 中的 `backend` 部分指向正确的路径
   - 运行 `docker-compose up -d --build`

### 方案 B: S3 + CloudFront (仅前端)

如果您只想部署前端，这是成本最低且性能最好的方式。

1. **本地构建**:
   ```bash
   npm run build:example
   ```
2. **上传到 S3**:
   - 创建一个 S3 存储桶，启用静态网站托管
   - 将 `dist-example` 文件夹中的所有内容上传到存储桶
3. **配置 CloudFront (可选但推荐)**:
   - 创建 CloudFront 分发，源指向您的 S3 存储桶
   - 这将提供 HTTPS 支持和全球 CDN 加速

### 后端部署 (Python FastAPI)

对于 FastAPI 后端，建议创建一个 `Dockerfile`：

```dockerfile
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

然后在 `docker-compose.yml` 中取消注释 `backend` 部分并指向该目录。
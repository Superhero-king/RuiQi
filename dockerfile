# 阶段1: 构建Node.js前端
FROM node:23.10.0-alpine AS frontend-builder
# 安装pnpm
RUN npm install -g pnpm@10.6.5
# 设置工作目录
WORKDIR /app
# 先复制package.json和pnpm-lock.yaml (如果有)
COPY server/web/package.json server/web/pnpm-lock.yaml* ./
# 安装依赖
RUN pnpm install
# 复制前端项目其他文件
COPY server/web/ ./
# 构建前端
RUN pnpm build

# 阶段2: 构建Go后端
FROM golang:1.24.1-alpine AS backend-builder
# 设置Go环境变量
ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64
# 设置工作目录
WORKDIR /build
# 复制go.work
COPY go.work ./
# 先复制go.mod和go.sum文件（如果存在）
COPY server/go.mod server/go.sum* ./server/
COPY pkg/go.mod pkg/go.sum* ./pkg/
COPY coraza-spoa/go.mod coraza-spoa/go.sum* ./coraza-spoa/
# 预下载依赖
RUN go work use ./coraza-spoa ./pkg ./server && \
    go mod download
# 复制整个项目结构
COPY coraza-spoa/ ./coraza-spoa/
COPY pkg/ ./pkg/
COPY server/ ./server/
# 复制前端构建产物到正确位置
COPY --from=frontend-builder /app/dist ./server/web/dist
# 构建后端
RUN cd server && go build -o ../simple-waf-server main.go

# 阶段3: 最终镜像 - 使用Ubuntu 24.04并安装HAProxy 3.0
FROM ubuntu:24.04
# 避免交互式前端
ENV DEBIAN_FRONTEND=noninteractive
# 安装HAProxy 3.0（保持不变）
RUN apt-get update && \
    apt-get install -y --no-install-recommends software-properties-common ca-certificates libcap2-bin && \
    add-apt-repository -y ppa:vbernat/haproxy-3.0 && \
    apt-get update && \
    apt-get install -y haproxy=3.0.* && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 创建必要的目录
WORKDIR /app

# 从构建器复制Go二进制文件
COPY --from=backend-builder /build/simple-waf-server .
# 复制前端构建产物
COPY --from=backend-builder /build/server/web/dist ./web/dist
# 复制Swagger文档文件
COPY --from=backend-builder /build/server/docs/ ./docs/

# 设置运行权限并添加CAP_NET_BIND_SERVICE权限
RUN chmod +x /app/simple-waf-server && \
    setcap 'cap_net_bind_service=+ep' /app/simple-waf-server

# 创建非root用户
RUN useradd -r -s /bin/false appuser && \
    chown -R appuser:appuser /app

# 切换到非root用户
USER appuser

# 设置环境变量
ENV GIN_MODE=release

# 暴露端口 
EXPOSE 2333

# 运行应用，绑定到80端口
CMD ["/app/simple-waf-server"]
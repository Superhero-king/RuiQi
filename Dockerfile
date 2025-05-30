# 多阶段构建
# 阶段1: 构建Node.js前端
FROM node:23.10.0 AS frontend-builder
# 安装pnpm
RUN npm install -g pnpm@10.6.5
# 设置工作目录
WORKDIR /app
# 复制前端项目文件
COPY web/ ./
# 安装依赖并构建前端
RUN pnpm install
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
# 复制整个项目结构
COPY coraza-spoa/ ./coraza-spoa/
COPY pkg/ ./pkg/
COPY server/ ./server/
COPY go.work ./
COPY geo-ip/ ./geo-ip/
# 复制前端构建产物到正确位置
COPY --from=frontend-builder /app/dist ./server/public/dist
# 使用Go的工作区功能进行构建
RUN go work use ./coraza-spoa ./pkg ./server
RUN cd server && go build -o ../ruiqi-waf main.go

# 阶段3: 最终镜像 - 使用官方 HAProxy 3.0.10 镜像
FROM haproxy:3.0.10
# 立即切换到 root 用户进行初始化设置
USER root

# 创建 ruiqi 用户和组
RUN groupadd --gid 1000 ruiqi && \
    useradd --uid 1000 --gid ruiqi --home-dir /home/ruiqi --create-home --shell /bin/bash ruiqi

# 将 ruiqi 用户添加到 haproxy 组，以便有权限执行 haproxy 相关操作
RUN usermod -a -G haproxy ruiqi

# 创建应用目录并设置权限
WORKDIR /app
RUN chown ruiqi:ruiqi /app

# 从构建器复制Go二进制文件
COPY --from=backend-builder /build/ruiqi-waf .
# 复制前端构建产物
COPY --from=backend-builder /build/server/public/dist ./public/dist
# 复制Swagger文档文件
COPY --from=backend-builder /build/server/docs/ ./docs/

# 设置应用文件权限
RUN chown -R ruiqi:ruiqi /app && chmod +x /app/ruiqi-waf

# 创建 ruiqi 用户家目录下的 ruiqi-waf 目录并复制 geo-ip 文件夹
RUN mkdir -p /home/ruiqi/ruiqi-waf
COPY --from=backend-builder /build/geo-ip/ /home/ruiqi/ruiqi-waf/geo-ip/
RUN chown -R ruiqi:ruiqi /home/ruiqi/ruiqi-waf

# 切换到 ruiqi 用户
USER ruiqi

# 设置环境变量
ENV GIN_MODE=release
# 重置 ENTRYPOINT（覆盖基础镜像的 docker-entrypoint.sh）
ENTRYPOINT []
# 暴露端口
EXPOSE 2333
# 运行应用
CMD ["/app/ruiqi-waf"]
#!/bin/bash

echo "🚀 开始部署到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 检查环境变量
echo "📋 检查环境变量..."
if [ -z "$KV_REST_API_URL" ] || [ -z "$KV_REST_API_TOKEN" ]; then
    echo "⚠️  警告: KV_REST_API_URL 或 KV_REST_API_TOKEN 环境变量未设置"
    echo "请在 Vercel 项目设置中配置这些环境变量"
    echo ""
    echo "配置步骤:"
    echo "1. 在 Vercel 控制台创建 KV 数据库"
    echo "2. 在项目设置中添加环境变量:"
    echo "   - KV_REST_API_URL"
    echo "   - KV_REST_API_TOKEN"
    echo "   - NODE_ENV=production"
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 部署到 Vercel
echo "🌐 部署到 Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "如果遇到问题，请检查:"
echo "1. Vercel KV 数据库是否正确创建"
echo "2. 环境变量是否正确设置"
echo "3. 查看 Vercel 函数日志" 
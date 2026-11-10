#!/bin/bash

# 视频通话应用开发环境启动脚本

echo "🚀 启动视频通话应用开发环境..."

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: 需要Node.js 18或更高版本，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"

# 安装依赖
echo "📦 安装依赖包..."
npm install

# 启动服务器
echo "🔧 启动信令服务器..."
cd server
node index.js &
SERVER_PID=$!
cd ..

# 等待服务器启动
sleep 2

# 启动前端开发服务器
echo "🌐 启动前端开发服务器..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 开发环境已启动！"
echo "📱 前端地址: http://localhost:3000"
echo "🔧 信令服务器: ws://localhost:8080/ws"
echo ""
echo "📝 测试用户:"
echo "   - user1 / password"
echo "   - user2 / password"
echo "   - user3 / password"
echo "   - user4 / password"
echo "   - user5 / password"
echo ""
echo "🛑 按 Ctrl+C 停止所有服务"

# 等待用户中断
wait

# 清理进程
echo "🧹 清理进程..."
kill $SERVER_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
echo "✅ 已停止所有服务"

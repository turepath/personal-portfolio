
#!/bin/bash

echo "🚀 Setting up Focus Companion Backend..."

# Install dependencies
npm install

# Setup env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example"
fi

# Spin up containers
docker-compose up -d
echo "✅ Docker containers (Postgres/Redis) are starting..."

# Wait for DB to be ready
echo "⏳ Waiting for database..."
sleep 5

# Run migrations
npx prisma generate
npx prisma migrate dev --name init

echo "🎉 Setup complete! Run 'npm run dev' to start."

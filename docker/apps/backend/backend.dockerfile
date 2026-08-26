FROM node:alpine3.22

RUN npm install -g pnpm

WORKDIR /app

COPY backend/package.json backend/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY backend/ .

# Generate Prisma Client
RUN pnpm prisma generate

# Server
ENV PORT=80
# JWT
ENV JWT_ACCESS_EXPIRATION="15m"
ENV JWT_REFRESH_EXPIRATION="7d"
# Bcrypt
ENV BCRYPT_SALT_ROUNDS=10
# Logging
ENV LOG_DIR="./logs"
ENV LOG_RETENTION_DAYS=30
ENV LOG_LEVEL="info"
# Super Admin Prisma Seed
ENV SUPER_ADMIN_EMAIL="admin@example.com"
ENV SUPER_ADMIN_PASSWORD="S;-RV8PQ(^VE]]k"
ENV SUPER_ADMIN_FIRST_NAME="Super"
ENV SUPER_ADMIN_LAST_NAME="Admin"
# Storage
ENV STORAGE_PROVIDER="local"
ENV STORAGE_LOCAL_PATH="./uploads"
ENV AZURE_STORAGE_CONNECTION_STRING=""
ENV AZURE_STORAGE_CONTAINER=""
# Mail
ENV MAIL_PROVIDER="gmail"
ENV MAIL_FROM="noreply@colegiolear.com"
ENV MAIL_HOST="smtp.gmail.com"
ENV MAIL_PORT=587

RUN pnpm build

EXPOSE 80

CMD ["pnpm", "start"]

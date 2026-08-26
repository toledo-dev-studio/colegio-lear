FROM node:alpine3.22

RUN npm install -g pnpm

WORKDIR /app

COPY backend/package.json backend/pnpm-lock.yaml backend/pnpm-workspace.yaml ./

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

EXPOSE 80

CMD ["pnpm", "run", "dev"]

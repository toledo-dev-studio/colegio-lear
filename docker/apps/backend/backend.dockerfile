FROM node:current-alpine3.22

RUN npm install -g pnpm

WORKDIR /app

COPY backend/package.json backend/pnpm-lock.yaml ./

RUN pnpm config set ignore-scripts true && pnpm install --frozen-lockfile

COPY backend/ .

# Cookie
ARG COOKIE_SECURE
# Database 
ARG DATABASE_URL
# JWT
ARG JWT_SECRET
# Mail
ARG MAIL_USER
ARG MAIL_PASSWORD
# CORS (comma-separated list of allowed origins)
ARG CORS_ORIGIN
# Frontend hosts para correos de EMAIL (según el destinatario: admin/profesor o alumno)
ARG FRONTEND_URL_ADMIN
ARG FRONTEND_URL_STUDENT

# Server
ENV PORT=80
# Database 
ENV DATABASE_URL=$DATABASE_URL
# JWT
ENV JWT_SECRET=$JWT_SECRET
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
ENV MAIL_USER=$MAIL_USER
ENV MAIL_PASSWORD=$MAIL_PASSWORD
# Cookie
ENV COOKIE_SECURE=$COOKIE_SECURE
# CORS (comma-separated list of allowed origins)
ENV CORS_ORIGIN=$CORS_ORIGIN
# Frontend hosts para correos de EMAIL (según el destinatario: admin/profesor o alumno)
ENV FRONTEND_URL_ADMIN=$FRONTEND_URL_ADMIN
ENV FRONTEND_URL_STUDENT=$FRONTEND_URL_STUDENT

EXPOSE 80

CMD ["node", "index.js"]

# Render Cron Job: notification delivery. Self-contained app (does not use the
# backend's code); build context is this folder:
#   docker build -t colegio-lear-cron-notifications cronjobs/notification-delivery
#
# Debian (glibc) on purpose, not Alpine: musl's resolver only returned the IPv6
# addresses of login.microsoftonline.com, so on IPv4-only networks the
# Microsoft Graph calls failed with ENETUNREACH.

# ─── Build: compile TypeScript ───────────────────────────────────────────────────
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ─── Runtime: production deps + compiled output only ─────────────────────────────
FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]

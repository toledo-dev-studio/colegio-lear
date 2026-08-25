FROM node:current-alpine3.22

RUN npm install -g pnpm

WORKDIR /app

COPY backend/package.json backend/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY backend/ .

EXPOSE 80

CMD ["node", "index.js"]

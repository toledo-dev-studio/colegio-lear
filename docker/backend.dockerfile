FROM node:current-alpine3.22

RUN npm install -g pnpm

WORKDIR /app

COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm config set ignore-scripts true && pnpm install --frozen-lockfile

COPY backend/ .

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
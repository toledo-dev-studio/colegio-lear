FROM node:current-alpine3.22 AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY frontend/admin-web/package.json frontend/admin-web/pnpm-lock.yaml ./
RUN pnpm config set ignore-scripts true && pnpm install --frozen-lockfile
COPY frontend/admin-web/ .
RUN pnpm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
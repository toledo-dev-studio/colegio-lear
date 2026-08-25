FROM node:current-alpine3.22 AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY frontend/student-web/package.json frontend/student-web/pnpm-lock.yaml ./
RUN pnpm config set ignore-scripts true && pnpm install --frozen-lockfile
COPY frontend/student-web/ .
RUN npx vite build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
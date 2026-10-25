FROM node:alpine3.22 AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY frontend/student-web/package.json frontend/student-web/pnpm-lock.yaml ./

RUN pnpm config set ignore-scripts true && pnpm install --frozen-lockfile

COPY frontend/student-web/ .

ARG VITE_API_URL
ARG VITE_ENVIRONMENT

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

RUN pnpm run build

FROM nginx:alpine

COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

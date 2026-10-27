FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Идентификатор счётчика Метрики (необязателен): build-arg в Dokploy
ARG PUBLIC_METRIKA_ID
ENV PUBLIC_METRIKA_ID=$PUBLIC_METRIKA_ID
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html/po-system
EXPOSE 80

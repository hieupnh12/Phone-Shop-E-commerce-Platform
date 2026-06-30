# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG REACT_APP_API_URL=/phoneShop
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine
RUN apk add --no-cache openssl

COPY nginx.http.conf /etc/nginx/templates/default.http.conf
COPY nginx.ssl.conf /etc/nginx/templates/default.ssl.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && rm -f /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz | grep -q ok || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]

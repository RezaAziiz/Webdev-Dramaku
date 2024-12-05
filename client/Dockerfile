# Stage 1: Build React App
FROM node:14.14.0-alpine AS builder
WORKDIR /app

# Salin file package.json dan package-lock.json untuk menginstall dependencies
COPY ./package.json ./

# Install dependencies
RUN npm install

# Salin seluruh source code ke container
COPY ./ ./

# Bangun aplikasi React
RUN npm run build

# Stage 2: Serve React App with Nginx
FROM nginx:stable-alpine

# Expose port yang digunakan oleh Nginx
EXPOSE 3000

# Salin file konfigurasi Nginx (default.conf)
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Salin hasil build React dari stage pertama ke folder Nginx
COPY --from=builder /app/build /usr/share/nginx/html

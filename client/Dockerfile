# Stage 1: Build static assets
FROM node:lts-alpine AS builder

# Update and upgrade packages
RUN apk update && apk upgrade --no-cache

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --silent

# Build args for Vite (overridden by .env.production if present)
ARG VITE_API_URL
ARG VITE_TINY_MCE

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Remove default nginx config and add custom config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
# Stage 1: deps
FROM node:lts-alpine AS deps

# Update and upgrade packages
RUN apk update && apk upgrade --no-cache

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --silent

# Stage 2: (optionally test or build)
FROM node:24-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# if test exists:
# RUN npm test

# Stage 3: production runtime
FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app .

EXPOSE 10000

CMD ["node", "src/index.js"]
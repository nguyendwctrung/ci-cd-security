# Stage 1: Build dependencies
FROM node:24-alpine AS deps
WORKDIR /app

# Install dependencies from package manifests
COPY package*.json ./
RUN npm ci --silent

# Stage 2: Optional tests and verification
FROM node:24-alpine AS test
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Uncomment if tests exist:
# RUN npm test

# Stage 3: Production runtime image
FROM node:24-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 10000

CMD ["node", "index.js"]
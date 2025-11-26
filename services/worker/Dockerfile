##############################################
# 1. Build Stage
##############################################
FROM node:24-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

##############################################
# 2. Runtime Stage
##############################################
FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/services/worker/proto ./proto

EXPOSE 50052
CMD ["node", "dist/main.js"]

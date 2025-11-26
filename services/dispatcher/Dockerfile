##############################################
# 1. Build Stage
##############################################
FROM node:24-alpine as builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

##############################################
# 2. Runtime Stage
##############################################
FROM node:24-alpine

WORKDIR /app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/services/dispatcher/proto ./proto
COPY services/dispatcher/.env* ./
COPY services/dispatcher/package*.json ./

EXPOSE 50051
CMD ["node", "dist/main.js"]

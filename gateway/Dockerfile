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

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/proto ./proto

EXPOSE 3000
CMD ["node", "dist/main.js"]

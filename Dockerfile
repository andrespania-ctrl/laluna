# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json server.ts ./
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy compiled server
COPY --from=builder /app/dist ./dist

# Copy static site assets
COPY index.html menu.html podcast.html ./
COPY css/ ./css/
COPY js/ ./js/
COPY i18n/ ./i18n/
COPY images/ ./images/

EXPOSE 8080

CMD ["node", "dist/server.js"]

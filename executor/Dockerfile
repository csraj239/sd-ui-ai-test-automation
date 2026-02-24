FROM node:18-alpine

WORKDIR /app

# Install only required system dependencies for Playwright
# Playwright downloads and caches browser binaries during npm install
RUN apk add --no-cache \
    ca-certificates \
    nss \
    freetype \
    ttf-freefont \
    libx11 \
    libxrender \
    libxext \
    libgcc \
    libstdc++

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "start"]

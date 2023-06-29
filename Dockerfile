FROM node:18-alpine
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont 

WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm i
COPY . .
EXPOSE 7363
ENV NODE_ENV prod
CMD [ "pnpm", "start" ]

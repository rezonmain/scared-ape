FROM node:18-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm i
COPY . .
EXPOSE 7363
ENV NODE_ENV prod
CMD [ "pnpm", "start" ]

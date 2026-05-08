FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server ./server

ENV NODE_ENV=production
ENV AI_SERVER_HOST=0.0.0.0
ENV AI_SERVER_PORT=3001

EXPOSE 3001

CMD ["npm", "run", "server"]

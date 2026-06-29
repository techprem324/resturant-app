# Node.js Express API Dockerfile
FROM node:18-alpine

LABEL maintainer="Lumina Dev Team"
LABEL description="Lumina Restaurant OS Backend Service"

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

CMD [ "node", "server.js" ]


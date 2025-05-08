FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Replace npm ci with npm install
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
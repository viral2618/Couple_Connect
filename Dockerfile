FROM node:18-alpine

# Install build dependencies for MediaSoup
RUN apk add --no-cache python3 make g++ gcc linux-headers

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
EXPOSE 10000-10100/udp
EXPOSE 10000-10100/tcp

CMD ["npm", "start"]
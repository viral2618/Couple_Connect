FROM node:20

# Install build dependencies for MediaSoup
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000
EXPOSE 10000-10100/udp
EXPOSE 10000-10100/tcp

CMD ["npm", "start"]
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { let data = ''; res.on('data', chunk => data += chunk); res.on('end', () => { process.exit(res.statusCode === 200 ? 0 : 1) }); }).on('error', () => process.exit(1))"

# Start the app
CMD ["npm", "start"]
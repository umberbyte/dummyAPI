FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy application source
COPY . .

# Expose target port 6080
EXPOSE 6080

ENV PORT=6080
ENV NODE_ENV=production

CMD ["node", "src/server.js"]

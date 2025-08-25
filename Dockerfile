# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install Python and pip (required for yt-dlp)
RUN apk add --no-cache python3 py3-pip curl

# Install yt-dlp globally
RUN pip3 install yt-dlp

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set environment variable for yt-dlp path
ENV YT_DLP_PATH=/usr/bin/yt-dlp

# Build the application
RUN pnpm build

# Use PORT environment variable from Heroku
ENV PORT=3000
EXPOSE $PORT

# Start the application
CMD ["pnpm", "start"]

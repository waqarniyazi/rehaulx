# ReHaulX Deployment Guide

This guide explains how to deploy ReHaulX with yt-dlp support on various platforms.

## Environment Variables

Set the following environment variables in your production environment:

```bash
# Required for yt-dlp
YT_DLP_PATH=/usr/local/bin/yt-dlp  # Adjust based on your installation

# Your existing environment variables
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
# ... other variables from your .env.local
```

## Platform-Specific Deployment

### 1. Vercel Deployment

Unfortunately, Vercel's serverless functions don't support binary executables like yt-dlp. For Vercel, you'll need to:

1. Use a different approach or migrate to a platform that supports binaries
2. Or modify the code to use YouTube Data API instead

### 2. Railway Deployment

Railway supports Docker deployments with custom binaries:

1. Use the provided `Dockerfile`
2. Deploy with: `railway up`
3. Set environment variables in Railway dashboard

### 3. DigitalOcean App Platform

1. Use the provided `Dockerfile`
2. Set environment variables in the control panel
3. Deploy from GitHub repository

### 4. Heroku Deployment

Create a `heroku.yml` file:

```yaml
build:
  docker:
    web: Dockerfile
run:
  web: pnpm start
```

Then deploy with:
```bash
heroku stack:set container -a your-app-name
git push heroku main
```

### 5. VPS/Dedicated Server

1. Install Node.js 18+
2. Install Python and pip
3. Install yt-dlp: `pip install yt-dlp`
4. Clone repository and install dependencies
5. Build and run the application

```bash
# Install dependencies
pnpm install

# Install yt-dlp
pip install yt-dlp

# Build application
pnpm build

# Start application
pnpm start
```

## Local Development Setup

The `scripts/install-yt-dlp.js` script will automatically try to install yt-dlp when you run `npm install` or `pnpm install`. If this fails, install manually:

### macOS
```bash
brew install yt-dlp
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install python3-pip
pip3 install yt-dlp
```

### Manual Installation
```bash
pip install yt-dlp
```

## Troubleshooting

### yt-dlp not found error
1. Verify yt-dlp is installed: `yt-dlp --version`
2. Check the installation path: `which yt-dlp`
3. Set the correct path in your environment: `YT_DLP_PATH=/path/to/yt-dlp`

### Permission denied
Make sure yt-dlp binary is executable:
```bash
chmod +x /path/to/yt-dlp
```

### Python not found
Install Python 3.6+ on your system. yt-dlp requires Python to run.

## Alternative Hosting Platforms

If you need serverless deployment (like Vercel), consider these alternatives:

1. **Hybrid approach**: Use serverless for the main app + separate service for video processing
2. **YouTube Data API**: Replace yt-dlp with YouTube's official API (limited functionality)
3. **Edge functions**: Some platforms support edge functions with more capabilities

## Docker Compose (for local development)

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - YT_DLP_PATH=/usr/bin/yt-dlp
    volumes:
      - .:/app
      - /app/node_modules
```

Run with: `docker-compose up`

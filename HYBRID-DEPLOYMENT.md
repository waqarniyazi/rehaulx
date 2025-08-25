# Hybrid Deployment Guide: Vercel + Heroku

## Architecture Overview

- **Main App**: Deployed on Vercel (rehaulx.com)
- **Video Service**: Deployed on Heroku with Docker (handles yt-dlp processing)

## Step-by-Step Deployment

### 1. Deploy Video Service to Heroku

```bash
# Navigate to video service directory
cd video-service

# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-video-service-name

# Set the stack to container
heroku stack:set container -a your-video-service-name

# Set environment variables
heroku config:set YT_DLP_PATH=/usr/bin/yt-dlp -a your-video-service-name
heroku config:set MAIN_APP_URL=https://rehaulx.com -a your-video-service-name
heroku config:set NODE_ENV=production -a your-video-service-name

# Deploy to Heroku
git init
git add .
git commit -m "Initial video service commit"
git push heroku main

# Your service will be available at: https://your-video-service-name.herokuapp.com
```

### 2. Update Main App Environment Variables

In your Vercel dashboard, add this environment variable:

```bash
VIDEO_SERVICE_URL=https://your-video-service-name.herokuapp.com
```

### 3. Deploy Main App to Vercel

```bash
# In your main project directory
vercel --prod
```

## Local Development

For local development, you can run both services:

```bash
# Terminal 1: Main app
npm run dev

# Terminal 2: Video service
cd video-service
npm start
```

## Testing the Integration

Test the video analysis endpoint:

```bash
curl -X POST https://rehaulx.com/api/analyze-video \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

## Monitoring

- **Main App**: Monitor through Vercel dashboard
- **Video Service**: Monitor through Heroku dashboard at `heroku logs --tail -a your-video-service-name`

## Scaling

- **Vercel**: Automatically scales serverless functions
- **Heroku**: Scale video service with `heroku ps:scale web=2 -a your-video-service-name`

## Benefits of This Architecture

✅ **Best of Both Worlds**: Fast Vercel hosting + Docker support for yt-dlp  
✅ **Cost Effective**: Only pay for video processing when needed  
✅ **Reliable**: Separate services mean better fault isolation  
✅ **Scalable**: Can scale video processing independently

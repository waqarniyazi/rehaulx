#!/bin/bash

echo "Deploying video-service to Heroku..."

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Copy video-service files to temporary directory
cp -r video-service/* "$TEMP_DIR/"
cd "$TEMP_DIR"

# Initialize git repository
git init
git add .
git commit -m "Deploy video-service to Heroku"

# Set Heroku remote
git remote add heroku https://git.heroku.com/rehaulx-video.git

# Set environment variables on Heroku
echo "Setting environment variables..."
heroku config:set DATABAY_USER="rehaulx" --app rehaulx-video
heroku config:set DATABAY_PASS="e948e018-fe59-6c95-affa-68f69f8ad8b0" --app rehaulx-video

# Push to Heroku
git push heroku master --force

# Return to original directory
cd - > /dev/null

echo "Deployment complete!"

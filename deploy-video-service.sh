#!/bin/bash
# Deploy video-service to Heroku
# Run this script from the root of your project

echo "Deploying video-service to Heroku..."

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Copy video-service files to temp directory
cp -r video-service/* "$TEMP_DIR/"
cd "$TEMP_DIR"

# Initialize git repo
git init
git add .
git commit -m "Deploy video-service to Heroku"

# Add Heroku remote and deploy
heroku git:remote -a rehaulx-video
git push heroku master --force

# Clean up
cd -
rm -rf "$TEMP_DIR"
echo "Deployment complete!"

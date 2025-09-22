#!/bin/bash
# Vercel build script to ensure index.html is in the expected location

echo "Starting custom build process..."
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

# Ensure public directory exists and has index.html
if [ -f "public/index.html" ]; then
  echo "✅ Found public/index.html"
else
  echo "❌ Missing public/index.html"
  exit 1
fi

# Run the React build
echo "Running React build..."
npm run build

echo "Build completed successfully!"
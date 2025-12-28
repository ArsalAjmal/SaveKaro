#!/bin/bash

# Quick Deployment Script for SaveKaro

echo "🚀 SaveKaro Deployment Helper"
echo "=============================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit
echo "💾 Committing changes..."
read -p "Enter commit message (default: 'Deployment update'): " commit_msg
commit_msg=${commit_msg:-"Deployment update"}
git commit -m "$commit_msg"

echo ""
echo "✅ Files committed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Create a repository on GitHub"
echo "2. Run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/savekaro.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Follow the DEPLOYMENT_GUIDE.md for deploying to Netlify and Render"
echo ""
echo "🎉 Good luck with your deployment!"


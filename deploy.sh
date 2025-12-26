#!/bin/bash

# 508 Ministry Dashboard - Automated Deployment Script
# This script automates the Git setup and initial push

echo "========================================="
echo "508 Ministry Dashboard Deployment"
echo "========================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "✓ Initializing Git repository..."
    git init
else
    echo "✓ Git repository already initialized"
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo "⚠ Warning: .gitignore not found!"
    exit 1
fi

# Add all files
echo "✓ Adding files to Git..."
git add .

# Create initial commit
echo "✓ Creating initial commit..."
git commit -m "Initial commit: 508 Ministry Dashboard with full authentication and database integration"

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "✓ Remote 'origin' already configured"
    echo ""
    echo "Current remote URL:"
    git remote get-url origin
    echo ""
    read -p "Do you want to update the remote URL? (y/N): " update_remote

    if [ "$update_remote" = "y" ] || [ "$update_remote" = "Y" ]; then
        read -p "Enter new GitHub repository URL: " repo_url
        git remote set-url origin "$repo_url"
        echo "✓ Remote URL updated"
    fi
else
    read -p "Enter your GitHub repository URL: " repo_url
    git remote add origin "$repo_url"
    echo "✓ Remote added"
fi

# Set main branch
echo "✓ Setting main branch..."
git branch -M main

# Push to GitHub
echo "✓ Pushing to GitHub..."
read -p "Ready to push to GitHub? (y/N): " confirm_push

if [ "$confirm_push" = "y" ] || [ "$confirm_push" = "Y" ]; then
    git push -u origin main
    echo ""
    echo "========================================="
    echo "✓ Deployment script complete!"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "1. Go to your Coolify dashboard"
    echo "2. Create a new Application from Git"
    echo "3. Connect to your GitHub repository"
    echo "4. Follow the DEPLOY.md guide for configuration"
    echo ""
    echo "Repository URL: $repo_url"
    echo ""
else
    echo ""
    echo "Push cancelled. Run this script again when ready."
fi

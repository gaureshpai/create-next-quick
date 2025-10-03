#!/bin/bash

# GitHub Pages Setup Verification Script
# Run this after enabling Pages in repository settings

echo "🔍 Checking GitHub Pages status..."
echo ""

# Check if Pages is enabled
PAGES_STATUS=$(gh api repos/gaureshpai/create-next-quick/pages 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ GitHub Pages is enabled!"
    echo "📄 Pages Configuration:"
    echo "$PAGES_STATUS" | jq .
    echo ""
    
    # Try to get the Pages URL
    PAGES_URL=$(echo "$PAGES_STATUS" | jq -r '.html_url // .url // "Not available"')
    echo "🌐 Documentation URL: $PAGES_URL"
    
    # Check if workflow exists
    echo ""
    echo "🔍 Checking deployment workflow..."
    gh workflow list | grep -i "deploy\|pages\|docs" || echo "⚠️  Deploy workflow not found"
    
else
    echo "❌ GitHub Pages is not enabled yet"
    echo ""
    echo "📋 Manual Setup Required:"
    echo "1. Go to: https://github.com/gaureshpai/create-next-quick/settings/pages"
    echo "2. Under 'Source', select 'GitHub Actions'"
    echo "3. Save the settings"
    echo ""
    echo "🔄 Then run this script again to verify!"
fi

echo ""
echo "📚 Expected Documentation URL:"
echo "https://gaureshpai.github.io/create-next-quick/"
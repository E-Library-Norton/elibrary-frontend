#!/bin/bash

# SEO Validation Script for Norton University E-Library Frontend
# Usage: bash scripts/validate-seo.sh

set -e

echo "🔍 SEO Validation Script for Norton University E-Library"
echo "======================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required environment variables
echo "📝 Checking environment variables..."
if [ -f ".env.local" ]; then
  if grep -q "NEXT_PUBLIC_SITE_URL" .env.local; then
    echo -e "${GREEN}✓${NC} NEXT_PUBLIC_SITE_URL is set"
  else
    echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_SITE_URL not found in .env.local"
  fi
  
  if grep -q "NEXT_PUBLIC_BACKEND_URL" .env.local; then
    echo -e "${GREEN}✓${NC} NEXT_PUBLIC_BACKEND_URL is set"
  else
    echo -e "${RED}✗${NC} NEXT_PUBLIC_BACKEND_URL not found in .env.local"
  fi
else
  echo -e "${YELLOW}⚠${NC} .env.local file not found. Copy from .env.example"
fi
echo ""

# Check for required files
echo "📂 Checking required SEO files..."
files=(
  "app/layout.tsx"
  "app/head.tsx"
  "app/robots.txt/route.ts"
  "app/sitemap.xml/route.ts"
  "lib/seo.ts"
  "lib/schema.ts"
  "public/manifest.json"
  "components/BookSchema.tsx"
  "SEO.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file missing"
  fi
done
echo ""

# Check for head files in main routes
echo "🔗 Checking head.tsx files for main routes..."
routes=(
  "app/about/head.tsx"
  "app/contact/head.tsx"
  "app/books/head.tsx"
  "app/audios/head.tsx"
  "app/videos/head.tsx"
  "app/library/head.tsx"
  "app/profile/head.tsx"
  "app/books/[id]/head.tsx"
  "app/auth/signin/head.tsx"
  "app/auth/signup/head.tsx"
)

for route in "${routes[@]}"; do
  if [ -f "$route" ]; then
    echo -e "${GREEN}✓${NC} $route"
  else
    echo -e "${YELLOW}⚠${NC} $route missing"
  fi
done
echo ""

# Check metadata in layout.tsx
echo "🏷️  Checking metadata configuration..."
if grep -q "metadataBase" app/layout.tsx; then
  echo -e "${GREEN}✓${NC} metadataBase configured"
else
  echo -e "${RED}✗${NC} metadataBase not found"
fi

if grep -q "openGraph" app/layout.tsx; then
  echo -e "${GREEN}✓${NC} OpenGraph metadata configured"
else
  echo -e "${RED}✗${NC} OpenGraph metadata not found"
fi

if grep -q "twitter" app/layout.tsx; then
  echo -e "${GREEN}✓${NC} Twitter metadata configured"
else
  echo -e "${RED}✗${NC} Twitter metadata not found"
fi

if grep -q "robots" app/layout.tsx; then
  echo -e "${GREEN}✓${NC} Robots configuration found"
else
  echo -e "${RED}✗${NC} Robots configuration not found"
fi
echo ""

# Check security headers in next.config.ts
echo "🔒 Checking security headers..."
if grep -q "X-Frame-Options" next.config.ts; then
  echo -e "${GREEN}✓${NC} X-Frame-Options header configured"
else
  echo -e "${YELLOW}⚠${NC} X-Frame-Options header not found"
fi

if grep -q "Content-Security-Policy" next.config.ts; then
  echo -e "${GREEN}✓${NC} CSP header configured"
else
  echo -e "${YELLOW}⚠${NC} CSP header not found"
fi

if grep -q "Strict-Transport-Security" next.config.ts; then
  echo -e "${GREEN}✓${NC} HSTS header configured"
else
  echo -e "${YELLOW}⚠${NC} HSTS header not found"
fi
echo ""

echo "✅ SEO Validation Complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update NEXT_PUBLIC_SITE_URL in .env.local with your production domain"
echo "2. Run 'npm run build' to verify no build errors"
echo "3. Run 'npm run start' to test locally"
echo "4. Test with: curl http://localhost:3000/robots.txt"
echo "5. Test with: curl http://localhost:3000/sitemap.xml"
echo "6. Read SEO.md for complete SEO setup and maintenance guide"
echo ""

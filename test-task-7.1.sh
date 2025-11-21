#!/bin/bash

# Task 7.1 Validation Script
# Tests: Legacy URL routing for provinces

echo "=== TASK 7.1: URL RESTRUCTURING TEST ==="
echo ""

# Clean output directory
echo "Cleaning output directory..."
rm -rf output/*

# Generate English province pages (test with limit=1 for speed)
echo ""
echo "Generating 1 English province page..."
node src/index.js en --pages-only

# Check if directory structure exists
echo ""
echo "Checking directory structure..."

# Expected structure for English: output/province/[slug]/index.html
if [ -d "output/province/agrigento" ]; then
  echo "✓ Directory structure exists: output/province/agrigento/"
  
  if [ -f "output/province/agrigento/index.html" ]; then
    echo "✓ Index file exists: output/province/agrigento/index.html"
    
    # Check file size
    SIZE=$(wc -c < "output/province/agrigento/index.html")
    echo "✓ File size: ${SIZE} bytes"
    
    # Check for canonical URL in the file
    if grep -q 'rel="canonical"' "output/province/agrigento/index.html"; then
      CANONICAL=$(grep -oP 'href="\K[^"]*(?=")' "output/province/agrigento/index.html" | grep canonical | head -1)
      echo "✓ Canonical URL found: ${CANONICAL}"
      
      if [[ "$CANONICAL" == *"/province/agrigento/"* ]]; then
        echo "✓ Canonical URL matches expected format"
        echo ""
        echo "✅ TASK 7.1 VALIDATION PASSED"
      else
        echo "✗ Canonical URL does not match expected format"
        echo "   Expected: .../province/agrigento/"
        echo "   Got: ${CANONICAL}"
        echo ""
        echo "❌ TASK 7.1 VALIDATION FAILED"
      fi
    else
      echo "✗ No canonical URL found in HTML"
      echo ""
      echo "❌ TASK 7.1 VALIDATION FAILED"
    fi
  else
    echo "✗ Index file not found"
    echo ""
    echo "❌ TASK 7.1 VALIDATION FAILED"
  fi
else
  echo "✗ Directory structure not found"
  echo ""
  echo "❌ TASK 7.1 VALIDATION FAILED"
fi

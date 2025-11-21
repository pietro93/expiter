# Task 7.1 Validation Script (PowerShell)
# Tests: Legacy URL routing for provinces

Write-Host "=== TASK 7.1: URL RESTRUCTURING TEST ===" -ForegroundColor Cyan
Write-Host ""

# Clean output directory
Write-Host "Cleaning output directory..."
if (Test-Path output) {
  Remove-Item output -Recurse -Force
}

# Generate English province pages
Write-Host ""
Write-Host "Generating English province pages..."
& node src/index.js en --pages-only

# Check if directory structure exists
Write-Host ""
Write-Host "Checking directory structure..."

$testPath = "output\province\agrigento"
$indexFile = "output\province\agrigento\index.html"

if (Test-Path $testPath -PathType Container) {
  Write-Host "✓ Directory structure exists: output\province\agrigento\" -ForegroundColor Green
  
  if (Test-Path $indexFile -PathType Leaf) {
    Write-Host "✓ Index file exists: output\province\agrigento\index.html" -ForegroundColor Green
    
    # Check file size
    $size = (Get-Item $indexFile).Length
    Write-Host "✓ File size: $size bytes" -ForegroundColor Green
    
    # Check for canonical URL
    $content = Get-Content $indexFile -Raw
    if ($content -match 'rel="canonical"') {
      $canonicalMatch = [regex]::Match($content, 'rel="canonical"\s+href="([^"]*)"')
      if ($canonicalMatch.Success) {
        $canonical = $canonicalMatch.Groups[1].Value
        Write-Host "✓ Canonical URL found: $canonical" -ForegroundColor Green
        
        if ($canonical -match '/province/agrigento/') {
          Write-Host "✓ Canonical URL matches expected format" -ForegroundColor Green
          Write-Host ""
          Write-Host "✅ TASK 7.1 VALIDATION PASSED" -ForegroundColor Green
        } else {
          Write-Host "✗ Canonical URL does not match expected format" -ForegroundColor Red
          Write-Host "   Expected: .../province/agrigento/" -ForegroundColor Red
          Write-Host "   Got: $canonical" -ForegroundColor Red
          Write-Host ""
          Write-Host "❌ TASK 7.1 VALIDATION FAILED" -ForegroundColor Red
        }
      }
    } else {
      Write-Host "✗ No canonical URL found in HTML" -ForegroundColor Red
      Write-Host ""
      Write-Host "❌ TASK 7.1 VALIDATION FAILED" -ForegroundColor Red
    }
  } else {
    Write-Host "✗ Index file not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "❌ TASK 7.1 VALIDATION FAILED" -ForegroundColor Red
  }
} else {
  Write-Host "✗ Directory structure not found" -ForegroundColor Red
  Write-Host ""
  Write-Host "❌ TASK 7.1 VALIDATION FAILED" -ForegroundColor Red
}

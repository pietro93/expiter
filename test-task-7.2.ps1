# Task 7.2 Validation Script (PowerShell)
# Tests: Town/Comune Generator with hierarchical structure
# Tests only first 50 towns for speed

Write-Host "=== TASK 7.2: TOWN/COMUNE GENERATOR TEST ===" -ForegroundColor Cyan
Write-Host ""

# Clean the towns from output
Write-Host "Cleaning town output..."
if (Test-Path output/comuni) {
  Remove-Item output/comuni -Recurse -Force
}
if (Test-Path output/it/comuni) {
  Remove-Item output/it/comuni -Recurse -Force
}

# Create a Node script to test town generation with limit
$testScript = @"
import TownGenerator from './src/generators/townGenerator.js';

(async () => {
  const generator = new TownGenerator({
    concurrency: 20,
    environment: 'production'
  });

  try {
    console.log('\n🏘️  Testing town generation (first 50 towns)...\n');
    
    // Generate for English only
    const stats = await generator.generateTownPages('en', 50);
    
    console.log('\nResults:');
    console.log(\`  Generated: \${stats.successful}/\${stats.total}\`);
    console.log(\`  Failed: \${stats.failed}\`);
    console.log(\`  Size: \${stats.totalSize} bytes\`);
    
    if (stats.failed > 0) {
      console.log('\nErrors (first 3):');
      stats.errors.slice(0, 3).forEach(e => {
        console.log(\`  - \${e.town}: \${e.error}\`);
      });
    }
    
    generator.cleanup();
    
    if (stats.successful > 0) {
      console.log('\n✅ Town generation test PASSED');
      process.exit(0);
    } else {
      console.log('\n❌ Town generation test FAILED');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
"@

# Write the test script
$testScript | Out-File -FilePath 'test-towns.mjs' -Encoding UTF8

# Run it
Write-Host "Running town generator test..."
& node test-towns.mjs

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "Verifying directory structure..."
  
  # Check for communes
  $communesPath = "output\comuni"
  if (Test-Path $communesPath -PathType Container) {
    Write-Host "✓ Comuni directory exists" -ForegroundColor Green
    
    # Check for provinces
    $provinces = Get-ChildItem $communesPath -Directory
    Write-Host "✓ Found $($provinces.Count) province directories" -ForegroundColor Green
    
    # Check first province for towns
    if ($provinces.Count -gt 0) {
      $firstProvince = $provinces[0]
      $towns = Get-ChildItem $firstProvince.FullName -Directory
      Write-Host "✓ First province ($($firstProvince.Name)) has $($towns.Count) town directories" -ForegroundColor Green
      
      # Check for index.html in first town
      if ($towns.Count -gt 0) {
        $firstTown = $towns[0]
        $indexFile = Join-Path $firstTown.FullName "index.html"
        if (Test-Path $indexFile -PathType Leaf) {
          Write-Host "✓ Index file found in town directory" -ForegroundColor Green
          
          $size = (Get-Item $indexFile).Length
          Write-Host "✓ File size: $size bytes" -ForegroundColor Green
          
          Write-Host ""
          Write-Host "✅ TASK 7.2 VALIDATION PASSED" -ForegroundColor Green
        } else {
          Write-Host "✗ No index.html found in town directory" -ForegroundColor Red
        }
      }
    }
  } else {
    Write-Host "✗ Comuni directory not found" -ForegroundColor Red
  }
}

# Clean up test script
Remove-Item 'test-towns.mjs' -Force

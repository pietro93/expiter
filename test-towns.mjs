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
    console.log(`  Generated: ${stats.successful}/${stats.total}`);
    console.log(`  Failed: ${stats.failed}`);
    console.log(`  Size: ${stats.totalSize} bytes`);
    
    if (stats.failed > 0) {
      console.log('\nErrors (first 3):');
      stats.errors.slice(0, 3).forEach(e => {
        console.log(`  - ${e.town}: ${e.error}`);
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

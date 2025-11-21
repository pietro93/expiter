import SearchIndexGenerator from './src/generators/searchIndexGenerator.js';

(async () => {
  const generator = new SearchIndexGenerator();

  try {
    console.log('\n🔍 Testing search index generation...\n');
    
    // Generate for English only
    const stats = await generator.generateAllLanguages(['en']);
    
    console.log('\nResults:');
    console.log(JSON.stringify(stats, null, 2));
    
    generator.cleanup();
    
    if (stats.summary.successful > 0) {
      console.log('\n✅ Search index generation test PASSED');
      process.exit(0);
    } else {
      console.log('\n❌ Search index generation test FAILED');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

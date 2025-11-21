import ComparisonGenerator from './src/generators/comparisonGenerator.js';

(async () => {
  const generator = new ComparisonGenerator();

  try {
    console.log('\n⚖️  Testing comparison generator...\n');
    
    // Generate for English only
    const stats = await generator.generateAllLanguages(['en']);
    
    console.log('\nResults:');
    console.log(JSON.stringify(stats, null, 2));
    
    generator.cleanup();
    
    if (stats.summary.totalFiles > 0) {
      console.log('\n✅ Comparison generation test PASSED');
      process.exit(0);
    } else {
      console.log('\n❌ Comparison generation test FAILED');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

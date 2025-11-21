import DataLoader from './src/utils/data-loader.js';

(async () => {
  const loader = new DataLoader();

  try {
    console.log('Testing DataLoader...\n');
    
    // Load dataset
    const dataset = await loader.loadDataset();
    console.log(`✓ Loaded dataset with ${Object.keys(dataset).length} provinces`);
    
    // Load comuni
    const comuni = await loader.loadComuni();
    console.log(`✓ Loaded comuni: ${comuni.length} towns total`);
    
    // Show breakdown by province
    const provinceMap = {};
    comuni.forEach(c => {
      const prov = c.Province || 'Unknown';
      provinceMap[prov] = (provinceMap[prov] || 0) + 1;
    });
    
    console.log(`\nBreakdown by province (first 10):`);
    Object.entries(provinceMap).slice(0, 10).forEach(([prov, count]) => {
      console.log(`  ${prov}: ${count} towns`);
    });
    
    const stats = await loader.getStats();
    console.log(`\n${JSON.stringify(stats, null, 2)}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

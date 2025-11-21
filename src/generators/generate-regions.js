import RegionGenerator from './regionGenerator.js';

async function generateRegions() {
  const generator = new RegionGenerator();
  
  try {
    await generator.initialize();
    const results = await generator.generateAllLanguages();
    console.log('\n' + JSON.stringify(generator.getStatistics(), null, 2));
    await generator.cleanup();
  } catch (error) {
    console.error('Error during region generation:', error);
    process.exit(1);
  }
}

generateRegions();

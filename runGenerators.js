import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const generators = [
  'indexGeneratorSSR.js',
  'indexGeneratorSSRFrance.js',
  'indexGeneratorSSRGermany.js',
  'indexGeneratorSSRitaly.js',
  'indexGeneratorSSRSpanish.js',
  'regionGeneratorSSR.js',
  'regionGeneratorSSRFrench.js',
  'regionGeneratorSSRGerman.js',
  'regionGeneratorSSRItaly.js',
  'pageGeneratorSSR.js',
  'pageGeneratorSSRFrench.js',
  'pageGeneratorSSRGerman.js',
  'pageGeneratorSSRItaly.js',
  'pageGeneratorSSRSpanish.js',
  'provincesGeneratorSSR.js',
  'townPageGenerator.js',
  'townPageGeneratorFrench.js',
  'townPageGeneratorGerman.js',
  'townPageGeneratorItaly.js',
  'townPageGeneratorSpanish.js',
  'sitemapGenerator.js',
  'sitemapGeneratorItaly.js',
  'QoLgenerator.js',
  'QoLgeneratorItaly.js',
  'safetyGenerator.js',
  'safetyPageGenerator.js',
  'CaSGenerator.js',
  'CaSGeneratorIT.js',
  'comuniGenerator.js',
  'comuniGeneratorFrench.js',
  'comuniGeneratorGerman.js',
  'comuniGeneratorItaly.js',
  'comuniGeneratorSpanish.js',
];

async function runGenerator(scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`Starting: ${scriptName}`);
    const child = execFile('node', [scriptName], 
      { cwd: __dirname, timeout: 120000 }, // 2 minute timeout
      (error, stdout, stderr) => {
        if (error) {
          console.log(`✗ ${scriptName}: ${error.message}`);
          resolve({ script: scriptName, status: 'error', error: error.message });
        } else {
          console.log(`✓ ${scriptName}: ${stdout}`);
          resolve({ script: scriptName, status: 'success' });
        }
      }
    );
    
    child.on('error', (error) => {
      console.log(`✗ ${scriptName}: Error - ${error.message}`);
      resolve({ script: scriptName, status: 'error', error: error.message });
    });
  });
}

async function main() {
  console.log(`Running ${generators.length} generators...\n`);
  
  const results = [];
  for (const generator of generators) {
    const result = await runGenerator(generator);
    results.push(result);
  }
  
  console.log('\n=== SUMMARY ===');
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;
  console.log(`Successful: ${successful}/${generators.length}`);
  console.log(`Failed: ${failed}/${generators.length}`);
  
  if (failed > 0) {
    console.log('\nFailed scripts:');
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`  - ${r.script}: ${r.error}`);
    });
  }
}

main().catch(console.error);

#!/usr/bin/env node
/**
 * Extract Comuni Data from Existing HTML Files
 * 
 * Scrapes the existing deployed HTML pages in /comuni/[province]/[town].html
 * and extracts the structured data to create temp/[Province]-comuni.json files
 * for use by the new TownGenerator.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const comuniDir = path.join(__dirname, 'comuni');
const tempDir = path.join(__dirname, 'temp');

// Ensure temp directory exists
try {
  await fs.mkdir(tempDir, { recursive: true });
} catch (err) {
  // Directory exists or other error
}

/**
 * Extract data from a single HTML file
 */
function extractComuniData(html) {
  const $ = cheerio.load(html);
  
  const data = {};
  
  // Find the info table with the structure
  const table = $('table#list');
  if (!table.length) {
    console.warn('No info table found in HTML');
    return null;
  }
  
  // Parse table rows
  const rows = table.find('tbody tr');
  rows.each((idx, row) => {
    const cells = $(row).find('th, td');
    if (cells.length >= 2) {
      const key = $(cells[0]).text().trim().toLowerCase();
      const value = $(cells[1]).text().trim();
      data[key] = value;
    }
  });
  
  if (!data.name) {
    console.warn('Could not extract name from HTML');
    return null;
  }
  
  return {
    Name: data.name,
    Province: data.province || '',
    Region: data.region || '',
    Population: data.population || '0',
    Density: data.density || '0',
    Altitude: data.altitude || '0',
    ClimateZone: data['climate zone'] || '',
  };
}

/**
 * Process all HTML files in a province directory
 */
async function processProvinceDirectory(provinceName) {
  const provinceDir = path.join(comuniDir, provinceName);
  
  try {
    const files = await fs.readdir(provinceDir);
    const htmlFiles = files.filter(f => f.endsWith('.html') && !f.startsWith('province-of-'));
    
    if (htmlFiles.length === 0) {
      console.log(`  No town HTML files found in ${provinceName}`);
      return {};
    }
    
    const comuniData = {};
    let successCount = 0;
    
    for (const file of htmlFiles) {
      try {
        const filePath = path.join(provinceDir, file);
        const html = await fs.readFile(filePath, 'utf8');
        const data = extractComuniData(html);
        
        if (data) {
          comuniData[data.Name] = data;
          successCount++;
        }
      } catch (err) {
        console.error(`    Error processing ${file}: ${err.message}`);
      }
    }
    
    console.log(`  ${provinceName}: extracted ${successCount}/${htmlFiles.length} towns`);
    return comuniData;
  } catch (err) {
    console.error(`Error reading directory ${provinceName}:`, err.message);
    return {};
  }
}

/**
 * Map province directory names to proper province names
 */
function getProperProvinceName(dirName) {
  const nameMap = {
    'l-aquila': 'L\'Aquila',
    'la-spezia': 'La Spezia',
    'ascoli-piceno': 'Ascoli Piceno',
    'pesaro-e-urbino': 'Pesaro e Urbino',
    'barletta-andria-trani': 'Barletta-Andria-Trani',
    'monza-e-brianza': 'Monza e Brianza',
    'verbano-cusio-ossola': 'Verbano-Cusio-Ossola',
    'forlì-cesena': 'Forlì-Cesena',
    'reggio-calabria': 'Reggio Calabria',
    'reggio-emilia': 'Reggio Emilia',
    'sud-sardegna': 'Sud Sardegna',
    'vibo-valentia': 'Vibo Valentia',
  };
  
  // Convert kebab-case to Title Case
  const titleCase = dirName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
  
  return nameMap[dirName] || titleCase.replace(/-/g, ' ');
}

/**
 * Main extraction process
 */
async function extractAllComuniData() {
  console.log('Extracting comuni data from HTML files...\n');
  
  try {
    const entries = await fs.readdir(comuniDir, { withFileTypes: true });
    const provinceDirs = entries.filter(e => e.isDirectory()).map(e => e.name);
    
    console.log(`Found ${provinceDirs.length} province directories\n`);
    
    let totalTowns = 0;
    let savedFiles = 0;
    
    for (const provinceDir of provinceDirs) {
      // Skip non-province directories
      if (provinceDir === 'node_modules' || provinceDir.startsWith('.')) {
        continue;
      }
      
      const comuniData = await processProvinceDirectory(provinceDir);
      
      if (Object.keys(comuniData).length > 0) {
        const properName = getProperProvinceName(provinceDir);
        const outputPath = path.join(tempDir, `${properName}-comuni.json`);
        
        await fs.writeFile(outputPath, JSON.stringify(comuniData, null, 2), 'utf8');
        totalTowns += Object.keys(comuniData).length;
        savedFiles++;
        
        console.log(`    → Saved to temp/${properName}-comuni.json`);
      }
    }
    
    console.log(`\n✅ Extraction complete!`);
    console.log(`   Total towns extracted: ${totalTowns}`);
    console.log(`   Files saved: ${savedFiles}`);
    console.log(`   Output directory: ${tempDir}`);
    
  } catch (err) {
    console.error('Fatal error during extraction:', err.message);
    process.exit(1);
  }
}

// Run extraction
await extractAllComuniData();

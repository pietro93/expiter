#!/usr/bin/env node
/**
 * Reorganize Output Directory
 * Move English files from /en/ to root
 * Keep other languages under their language code
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, 'output');

function copyDirRecursive(src, dst) {
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const dstPath = path.join(dst, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  });
}

console.log('\n🔄 Reorganizing output structure...\n');

try {
  const enDir = path.join(outputDir, 'en');

  if (!fs.existsSync(enDir)) {
    console.log('❌ /en directory not found!');
    process.exit(1);
  }

  console.log('📁 Current structure:');
  console.log('  output/en/province/');
  console.log('  output/en/region/');
  console.log('  output/en/sitemap.xml');
  console.log('  output/it/province/');
  console.log('  output/de/province/');
  console.log('  etc.\n');

  console.log('📝 Moving English files from /en/ to root...\n');

  // Move English province pages
  if (fs.existsSync(path.join(enDir, 'province'))) {
    console.log('  Moving province pages...');
    const srcProv = path.join(enDir, 'province');
    const dstProv = path.join(outputDir, 'province');
    
    if (fs.existsSync(dstProv)) {
      fs.rmSync(dstProv, { recursive: true });
    }
    copyDirRecursive(srcProv, dstProv);
    console.log('    ✅ Province pages moved');
  }

  // Move English region pages
  if (fs.existsSync(path.join(enDir, 'region'))) {
    console.log('  Moving region pages...');
    const srcReg = path.join(enDir, 'region');
    const dstReg = path.join(outputDir, 'region');
    
    if (fs.existsSync(dstReg)) {
      fs.rmSync(dstReg, { recursive: true });
    }
    copyDirRecursive(srcReg, dstReg);
    console.log('    ✅ Region pages moved');
  }

  // Move English town pages
  if (fs.existsSync(path.join(enDir, 'comuni'))) {
    console.log('  Moving town pages...');
    const srcTown = path.join(enDir, 'comuni');
    const dstTown = path.join(outputDir, 'comuni');
    
    if (fs.existsSync(dstTown)) {
      fs.rmSync(dstTown, { recursive: true });
    }
    copyDirRecursive(srcTown, dstTown);
    console.log('    ✅ Town pages moved');
  }

  // Move English sitemap
  if (fs.existsSync(path.join(enDir, 'sitemap.xml'))) {
    console.log('  Moving sitemap...');
    const srcSite = path.join(enDir, 'sitemap.xml');
    const dstSite = path.join(outputDir, 'sitemap.xml');
    fs.copyFileSync(srcSite, dstSite);
    console.log('    ✅ Sitemap moved');
  }

  // Delete empty /en folder
  console.log('\n  Cleaning up /en directory...');
  fs.rmSync(enDir, { recursive: true });
  console.log('    ✅ /en folder deleted');

  console.log('\n✅ Reorganization complete!\n');
  console.log('📊 New structure:');
  console.log('  output/province/          ← English (no /en/ prefix)');
  console.log('  output/region/            ← English');
  console.log('  output/comuni/            ← English');
  console.log('  output/sitemap.xml        ← English');
  console.log('  output/it/province/       ← Italian');
  console.log('  output/it/region/         ← Italian');
  console.log('  output/it/comuni/         ← Italian');
  console.log('  output/de/province/       ← German');
  console.log('  output/es/province/       ← Spanish');
  console.log('  output/fr/province/       ← French');
  console.log('\n✨ URLs will now be:');
  console.log('  https://expiter.com/province/roma/');
  console.log('  https://expiter.com/comuni/roma/roma/');
  console.log('  https://expiter.com/it/province/roma/');
  console.log('  https://expiter.com/de/province/roma/\n');

} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}

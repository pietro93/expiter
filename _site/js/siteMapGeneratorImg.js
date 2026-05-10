import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const path = require('path');

function generateSitemap(startPath, outputPath, baseUrl) {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    function fromDir(startPath) {

        fs.readdirSync(startPath).forEach(function(file) {
            let filePath = path.join(startPath, file);

            if (fs.statSync(filePath).isDirectory()) {
                fromDir(filePath);
            } else if (filePath.match(/\.(jpg|jpeg|png|webp)$/i)) {
                let urlPath = filePath.replace('..','').replace(/\\/g, '/');
                sitemap += '<url>\n<loc>' + baseUrl + urlPath + '</loc>\n</url>\n';
            }
        });
    }

    fromDir(startPath);
    sitemap += '</urlset>';

    fs.writeFileSync(outputPath, sitemap);
}

generateSitemap('../img', '../sitemap/img-sitemap.xml', 'https://expiter.com');

console.log("Generated img-sitemap.xml")

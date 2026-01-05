import fetch from 'node-fetch';
import fs from 'fs';

async function updateAdsTxt() {
    try {
        const response = await fetch('https://adstxt.journeymv.com/sites/1cce7071-25c6-48c1-b7ee-1da5674b8bfd/ads.txt');
        let content = await response.text();
        
        // Append the new line if not already present
        const newLine = 'google.com, pub-0087385699618984, DIRECT, f08c47fec0942fa0';
        if (!content.includes(newLine)) {
            content += '\n' + newLine + '\n';
        }
        
        fs.writeFileSync("./ads.txt", content.trim() + '\n');
        console.log('ads.txt updated successfully with Google AdSense entry');
    } catch (error) {
        console.error('Error updating ads.txt:', error);
    }
}

updateAdsTxt();

import fetch from 'node-fetch';
import fs from 'fs';

async function updateAdsTxt() {
    try {
        const response = await fetch('https://adstxt.journeymv.com/sites/1cce7071-25c6-48c1-b7ee-1da5674b8bfd/ads.txt');
        const content = await response.text();
        fs.writeFileSync("./ads.txt", content);
        console.log('ads.txt updated successfully');
    } catch (error) {
        console.error('Error updating ads.txt:', error);
    }
}

updateAdsTxt();
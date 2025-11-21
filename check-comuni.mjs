import fs from 'fs';

const comuni = JSON.parse(fs.readFileSync('comuni.json', 'utf8'));
console.log('First 3 comuni:');
console.log(JSON.stringify(comuni.slice(0, 3), null, 2));
console.log(`\nTotal comuni: ${comuni.length}`);
console.log(`Keys in first item: ${Object.keys(comuni[0]).join(', ')}`);

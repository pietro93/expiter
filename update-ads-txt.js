import https from 'https'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const SOURCE = 'https://adstxt.journeymv.com/sites/1cce7071-25c6-48c1-b7ee-1da5674b8bfd/ads.txt'
const DEST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'ads.txt')

https.get(SOURCE, res => {
  if (res.statusCode !== 200) {
    console.error(`Failed: HTTP ${res.statusCode}`)
    process.exit(1)
  }
  let body = ''
  res.on('data', chunk => body += chunk)
  res.on('end', () => {
    const existing = fs.existsSync(DEST) ? fs.readFileSync(DEST, 'utf8') : ''
    if (body === existing) {
      console.log('ads.txt is already up to date.')
    } else {
      fs.writeFileSync(DEST, body, 'utf8')
      console.log('ads.txt updated.')
    }
  })
}).on('error', err => {
  console.error('Fetch error:', err.message)
  process.exit(1)
})

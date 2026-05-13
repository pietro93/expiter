import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const nunjucks = require('nunjucks')

const env = nunjucks.configure('src/templates', { autoescape: false, noCache: true })

export { env, nunjucks }

import { createServer } from 'http';
import fetch from 'node-fetch';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jsdom = require('jsdom')
require('events').EventEmitter.prototype._maxListeners = 107;
require('events').defaultMaxListeners = 107;

createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
}).listen(8080);



const fs = require("fs");
const https = require("follow-redirects").https;
//const https = require('follow-redirects').https;

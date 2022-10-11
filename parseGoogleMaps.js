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

let url='https://www.google.com/search?q=sant%27angelo+limosano+campobasso&sxsrf=ALiCzsZUGEDezpq_BhdTmcrj3cIYZULQnQ%3A1665484918845&source=hp&ei=dkhFY7P8L--K9u8P5aqT0Aw&iflsig=AJiK0e8AAAAAY0VWhhFylqIH9ezkOFLuMZYuGBhQWaXS&ved=0ahUKEwizj9rn_tf6AhVvhf0HHWXVBMoQ4dUDCAc&uact=5&oq=sant%27angelo+limosano+campobasso&gs_lcp=Cgdnd3Mtd2l6EAMyBwgAEIAEEBMyBwguEIAEEBMyBQgAEIYDUABYAGDEAWgAcAB4AIABgAGIAYABkgEDMC4xmAEAoAECoAEB&sclient=gws-wiz';
let html="";
https.get(url, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (data) {
    
      html += data;
      
    }),
    res.on('end',function(){
        console.log(html)
    })
})
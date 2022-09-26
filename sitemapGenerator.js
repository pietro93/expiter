import { createServer } from 'http';
import fetch from 'node-fetch';
import fs from 'fs';

var dataset;
var siteMap= '<?xml version="1.0" encoding="UTF-8"?>'+
'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+
'   <url>'+
'   <loc>https://expiter.com/</loc>'+
'   <priority>1</priority>'+
'   </url>'+

'   <url>'+
'   <loc>https://expiter.com/app/</loc>'+
'   <priority>1</priority>'+
'   </url>'+

'   <url>'+
'   <loc>https://expiter.com/about/</loc>'+
'   <priority>.5</priority>'+
'   </url>'+

'   <url>'+
'   <loc>https://expiter.com/resources/</loc>'+
'   <priority>.5</priority>'+
'   </url>'+

    '<url>'+
'   <loc>https://expiter.com/provinces/</loc>'+
'   <priority>.5</priority>'+
'   </url>'

createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Hello World!');
}).listen(8080);

fetch('https://expiter.com/dataset.json', {method:"Get"})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        dataset=data;  
        for (let i = 0; i < 107; i++){
            let province = dataset[i];
            console.log("adding /province/" + dataset[i].Name.replace(/\s+/g, '-').toLowerCase() +"/ to sitemap")
            siteMap=siteMap.concat('<url>'+
            '<loc>https://expiter.com/province/'+dataset[i].Name.replace(/\s+/g, '-').toLowerCase()+'/</loc>'+
            '<priority>.8</priority>'+
            '</url>')
        }

        siteMap=siteMap.concat('</urlset>')
        
        var fileName = './autositemap.xml';
            
            fs.writeFile(fileName, siteMap, function (err, file) {
                if (err) throw err;
                else console.log(fileName+' Saved!');
            });
        })
    .catch(function (err) {
        console.log('error: ' + err);
    });

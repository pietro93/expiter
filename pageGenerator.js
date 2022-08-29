import { createServer } from 'http';
import fetch from 'node-fetch';
import fs from 'fs';

createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Hello World!');
}).listen(8080);

var dataset;
var provinces = {};
var selection = [];
var region_filters = [];
var additionalFilters=[];

fetch('https://raw.githubusercontent.com/pietro93/italycities.github.io/main/dataset.json', {method:"Get"})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        dataset=data;  
        for (let i = 0; i < dataset.length; i++){
            let province = dataset[i]
        
        var html =  "<html>"+
        '<head><meta charset="utf-8">'+
        '<meta name="viewport" content="width=device-width, initial-scale=1">'+
        '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>'+
        '<script type="text/json" src="../dataset.json"></script>'+
        '<script type="text/javascript" src="../script.js"></script>'+
        '<link rel="stylesheet" href="../node_modules/bulma/css/bulma.min.css">'+
        '<link rel="stylesheet" href="../style.css">'+
        "<title >"+province.Name+"</title></head>"+
        '<body>'+
        '<row class=""><div id="app" class="container fullwidth columns"></row>'+
        '<row id="info"></row>'+
        '</body></html>'

        var fileName = './province/'+province.Name+'.html';
        
        fs.writeFile(fileName, html, function (err, file) {
            if (err) throw err;
            console.log('Saved!');
          });
        }
    })
    .catch(function (err) {
        console.log('error: ' + err);
    });






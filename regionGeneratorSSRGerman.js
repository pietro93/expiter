import * as pb from './js/pageBuilder.js'
import {de} from './js/pageBuilder.js'
import { createServer } from 'http';
import fetch from 'node-fetch';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jsdom = require('jsdom')

createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Hello World!');
}).listen(8080);

var dataset;
var regions = {};
var facts={};
var selection = [];
var region_filters = [];
var additionalFilters=[];
var dataset;
var avg;


fetch('https://expiter.com/dataset.json', {method:"Get"})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        //console.log(dom.window.document.querySelector("body").textContent)
        dataset=data;  
        populateData(data);
        //generateSiteMap(dataset);
        var dirName = 'de/regionen/';
var     fileName = 'italienische-regionen.html';
        
        const dom = new jsdom.JSDOM(
            "<html lang='de'>"+ // Change the language to German
            '<head><meta charset="utf-8">'+
            '<link rel="canonical" href="https://expiter.com/de/'+fileName+'/"/>'+
            '<link rel="alternate" hreflang="en" href="https://expiter.com/regions-of-italy/" />'+
            '<link rel="alternate" hreflang="fr" href="https://expiter.com/fr/regions-italiennes/" />'+
            '<link rel="alternate" hreflang="it" href="https://expiter.com/it/regioni-italiane/" />'+
            '<meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale-1,user-scalable=0">'+
            '<script type="text/javascript" src="https://expiter.com/jquery3.6.0.js" defer></script>'+
            '<script type="text/json" src="https://expiter.com/dataset.json"></script>'+
            '<script type="text/javascript" src="https://expiter.com/script.js" defer></script>'+
            '<script type="text/javascript" src="https://expiter.com/bootstrap-toc.js" defer></script>'+
            '<link rel="stylesheet" href="https://expiter.com/fonts.css" media="print" onload="this.media=\'all\'"></link>'+
            '<link rel="stylesheet" href="https://expiter.com/bulma.min.css">'+
            '<link rel="stylesheet" href="https://expiter.com/style.css">'+
            '<link rel="stylesheet" href="https://expiter.com/comuni/comuni-style.css">'+
        
            '<meta name="description" content="Liste der 20 Regionen Italiens - Bevölkerung, Fläche, Hauptstadt und weitere Informationen." />'+ // German translation
            '<meta name="keywords" content="'+'Regionen Italiens, Italienische Regionen, Liste der Regionen, Italienische Regionen, Regionen nach Bevölkerung" />'+ // German translation
            "<title>Italienische Regionen</title>"+ // German translation
            '<link rel="icon" type="image/x-icon" title="Expiter - Auswanderer und Nomaden in Italien" href="https://expiter.com/img/expiter-favicon.ico"></link>'+ // German translation
            "</head>"+

            '<body data-spy="scroll" data-target="#toc">'+

            '<div class="toc container collapsed" >'+
			'<i class="arrow left" onclick="$(\'.toc\').toggleClass(\'collapsed\')"></i>'+
			'<div class="row">'+
			  '<div class="col-sm-3">'+
				'<nav id="toc" data-toggle="toc"></nav>'+
                '<div class="col-sm-9"></div>'+
			  '</div>'+
			'</div>'+
		'</div>'+
        '<nav id="navbar"></nav>'+
'<div class="hero" style="background-image:url(\'https://expiter.com/img/'+"ROM"+'.webp\')" '+'title="Regionen Italiens"'+'>'+
'</div><h1 class="title">Italienische Regionen </h1>'+
'<section id="Liste der Italienischen Regionen">'+
'<center><table id="list">'+
'<tr id="header">'+
'<th>Name</th>'+
'<th>Bevölkerung</th>'+
'<th>Fläche</th>'+
'<th>Dichte</th>'+
'<th>Provinzen</th>'+
'<th>Gemeinden</th>'+
'<th>Hauptstadt</th>'+
'</tr>'+
'</table>'+
'<p id="info"></p></center>'+
'</section>'+
'</body></html>'
        )
        const $ = require('jquery')(dom.window)
        let list=$("#list").html();
        
        for (let i = 108; i < dataset.length; i++){
            list+="<tr>"+
            '<th><h2>'+de(dataset[i]["Name"])+'</h2></th>'+
            '<th>'+dataset[i]["Population"]+'</th>'+
            '<th>'+dataset[i]["Size"]+'</th>'+
            '<th>'+dataset[i]["Density"]+'</th>'+
            '<th>'+dataset[i]["Provinces"]+'</th>'+
            '<th>'+dataset[i]["Towns"]+'</th>'+
            '<th>'+'<a href="https://expiter.com/de/provinz/'+de(dataset[i]["Capital"]).replace(/\s+/g,"-").replace("'","-").toLowerCase()+
            '/">'+de(dataset[i]["Capital"])+'</a>'+'</th>'+
            "</tr>"
        }
        
        $("#list").html(list);
        
        let info="Es gibt 20 Regionen in Italien. Die <b>Lombardei</b> ist die bevölkerungsreichste Region mit insgesamt 9.965.046 Einwohnern, während Sizilien die größte Fläche mit einer Größe von 25.832,55 km² hat."+
    "</br></br>Die Region mit den meisten Siedlungen ist die <b>Lombardei</b> mit 1506 Gemeinden."+
    "</br></br>Die kleinste und am wenigsten bevölkerte Region ist das <b>Aostatal</b> mit einer Fläche von nur 3.260,85 km², 74 Gemeinden und einer Bevölkerung von 123.337 Einwohnern."+
    "</br></br>Die Hauptstadt von Italien, <b><a href='https://expiter.com/de/provinz/rom/'>Rom</a></b>, befindet sich in der Region <b>Lazio</b>."

    $("#info").html(info)

    //var info=getInfo(region)
    
   // $("#info").append(info.related)
    pb.setNavBarDE($)
    
    
    let html = dom.window.document.documentElement.outerHTML;
  
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
        }

    fs.writeFile(dirName+fileName, html, function (err, file) {
       if (err) throw err;
       console.log(dirName+fileName+' Saved!');
   });
}
)

function populateData(data){
    for (let i = 108; i < data.length; i++) {
        let region = data[i];
        regions[region["Name"]] = region;
        regions[region["Name"]].index = i;
        facts[region["Name"]] = {}; // Initialize "facts" dictionary with each region
        facts[region["Name"]].snippet =
        '<figure class="column is-3 related"><a href="https://expiter.com/de/regionen/'+de(region.Name).replace(/\s+/g,"-").replace(/'/g,"-").toLowerCase()+'/">'+
        '<img title="'+de(region.Name)+'" load="lazy" src="'+
        'https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+region.Name+'.webp?tr=w-280,h-140,c-at_least,q-5" '+
        'alt="Region '+de(data[i].Name)+', Italien"></img>'+
        '<figcaption>'+de(region.Name)+", Italien</figcaption></a></figure>";
    }
    avg = data[107];
}


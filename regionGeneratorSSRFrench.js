import * as pb from './js/pageBuilder.js'
import {fr} from './js/pageBuilder.js'
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
        var dirName = 'fr/regions/';
        var fileName = 'regions-italiennes.html';
        
        const dom = new jsdom.JSDOM(
            "<html lang='fr'>"+ // Change the language to French
            '<head><meta charset="utf-8">'+
            '<link rel="canonical" href="https://expiter.com/'+fileName+'/"/>'+
            '<link rel="alternate" hreflang="en" href="https://expiter.com/regions-of-italy/" />'+
            '<link rel="alternate" hreflang="de" href="https://expiter.com/de/italienische-regionen/" />'+
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
        
            '<meta name="description" content="Liste des 20 régions d\'Italie - population, superficie, chef-lieu et autres informations." />'+ // French translation
            '<meta name="keywords" content="'+'régions d\'Italie, Italie régions, liste des régions, régions italiennes, régions par population" />'+ // French translation
            "<title>Régions Italiennes</title>"+ // French translation
            '<link rel="icon" type="image/x-icon" title="Expiter - Expatriés et nomades en Italie" href="https://expiter.com/img/expiter-favicon.ico"></link>'+ // French translation
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
'<div class="hero" style="background-image:url(\'https://expiter.com/img/regions.webp\')" '+'title="Régions d\'Italie"'+'>'+
'</div><h1 class="title">Régions Italiennes </h1>'+
'<section id="Liste des Régions Italiennes">'+
'<center><table id="list">'+
'<tr id="header">'+
'<th>Nom</th>'+
'<th>Population</th>'+
'<th>Superficie</th>'+
'<th>Densité</th>'+
'<th>Provinces</th>'+
'<th>Communes</th>'+
'<th>Chef-lieu</th>'+
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
            '<th><h2>'+fr(dataset[i]["Name"])+'</h2></th>'+
            '<th>'+dataset[i]["Population"]+'</th>'+
            '<th>'+dataset[i]["Size"]+'</th>'+
            '<th>'+dataset[i]["Density"]+'</th>'+
            '<th>'+dataset[i]["Provinces"]+'</th>'+
            '<th>'+dataset[i]["Towns"]+'</th>'+
            '<th>'+'<a href="https://expiter.com/fr/province/'+fr(dataset[i]["Capital"]).replace(/\s+/g,"-").replace("'","-").toLowerCase()+
            '/">'+fr(dataset[i]["Capital"])+'</a>'+'</th>'+
            "</tr>"
        }
        
        $("#list").html(list);
        
        let info="Il y a 20 régions en Italie. La <b>Lombardie</b> est la région la plus peuplée avec un total de 9 965 046 habitants, tandis que la "+
    "<b>Sicile</b> est la plus grande en superficie avec une étendue de 25 832,55 km²."+
    "</br></br>La région avec le plus grand nombre de centres habités est la <b>Lombardie</b>, avec 1506 communes."+
    "</br></br>La région la plus petite et la moins peuplée est la <b>Vallée d'Aoste</b> avec une superficie de seulement 3 260,85 km², 74 communes et une population de 123 337 habitants."+
    "</br></br>La capitale de l'Italie, <b><a href='https://expiter.com/fr/province/rome/'>Rome</a></b>, se trouve dans la région du <b>Lazio</b>."

    $("#info").html(info)

        //var info=getInfo(region)
        
       // $("#info").append(info.related)
        pb.setNavBarFR($)
        
        
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
            '<figure class="column is-3 related"><a href="https://expiter.com/fr/regions/'+fr(region.Name).replace(/\s+/g,"-").replace(/'/g,"-").toLowerCase()+'/">'+
            '<img title="'+fr(region.Name)+'" load="lazy" src="'+
            'https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+region.Name+'.webp?tr=w-280,h-140,c-at_least,q-5" '+
            'alt="Région de '+fr(data[i].Name)+', Italie"></img>'+
            '<figcaption>'+fr(region.Name)+", Italie</figcaption></a></figure>";
        }
        avg = data[107];
    }
    
    

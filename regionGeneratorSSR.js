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
       
            
            var dirName = 'region/';
            var fileName = 'regions-of-italy.html';
            
            const dom = new jsdom.JSDOM(
            "<html lang='en'>"+
            '<head><meta charset="utf-8">'+
            '<link rel="canonical" href="https://expiter.com/'+fileName+'/"/>'+
            '<link rel="alternate" hreflang="en" href="https://expiter.com/'+fileName+'/" />'+
            '<link rel="alternate" hreflang="it" href="https://expiter.com/it/'+fileName+'/" />'+
            '<meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale-1,user-scalable=0">'+
            '<script type="text/javascript" src="https://expiter.com/jquery3.6.0.js" defer></script>'+
            '<script type="text/json" src="https://expiter.com/dataset.json"></script>'+
            '<script type="text/javascript" src="https://expiter.com/script.js" defer></script>'+
            '<script type="text/javascript" src="https://expiter.com/bootstrap-toc.js" defer></script>'+
            '<link rel="stylesheet" href="https://expiter.com/fonts.css" media="print" onload="this.media=\'all\'"></link>'+
            '<link rel="stylesheet" href="https://expiter.com/bulma.min.css">'+
            '<link rel="stylesheet" href="https://expiter.com/style.css">'+
            '<link rel="stylesheet" href="https://expiter.com/comuni/comuni-style.css">'+
            
            '<meta name="description" content="List of all 20 regions in Italy with information about size, population, provinces, towns and more." />'+
	        '<meta name="keywords" content="'+'regions of Italy, Italy regions, list of regions in italy, Italian regions, regions in Italy by population" />'+
            "<title> Regions in Italy </title>"+
            '<link rel="icon" type="image/x-icon" title="Expiter - Italy Expats and Nomads" href="https://expiter.com/img/expiter-favicon.ico"></link>'+
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
        '<div class="hero" style="background-image:url(\'https://expiter.com/img/'+"ROMA"+'.webp\')" '+'title="Regions of Italy"'+'>'+
        '</div><h1 class="title">Regions of Italy </h1>'+
        '<section id="List of Regions in Italy">'+
        '<center><table id="list">'+
        '<tr id="header">'+
        '<th>Name</th>'+
        '<th>Population</th>'+
        '<th>Size</th>'+
        '<th>Density</th>'+
        '<th>Provinces</th>'+
        '<th>Towns</th>'+
        '<th>Capital</th>'+
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
            '<th><h2>'+dataset[i]["Name"]+'</h2></th>'+
            '<th>'+dataset[i]["Population"]+'</th>'+
            '<th>'+dataset[i]["Size"]+'</th>'+
            '<th>'+dataset[i]["Density"]+'</th>'+
            '<th>'+dataset[i]["Provinces"]+'</th>'+
            '<th>'+dataset[i]["Towns"]+'</th>'+
            '<th>'+dataset[i]["Capital"]+'</th>'+
            "</tr>"
        }
        
        $("#list").html(list);
        
        let info="There are 20 regions in Italy. The region of <b>Lombardia</b> is the largest by population with a total of 9.965.046 inhabitants, whereas "+
        "<b>Sicily</b> is the largest by size with a territory of 25.832,55	km²."+
        "</br></br>The <b>Lombardia</b> region also contains the greatest number of Italian towns and provinces, with a total of 1506 municipalities."+
        "</br></br>The smallest and least populated region is <b>Aosta Valley</b> with an area of 3.260,85km², 74 towns and a population of 123.337."+
        "</br></br>The Capital of Italy, <b><a href='https://expiter.com/province/roma/'>Rome</a></b>, is located in the <b>Lazio</b> region."
       
        $("#info").html(info)

        //var info=getInfo(region)
        
       // $("#info").append(info.related)
        setNavBar($)
        
        
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


    
function setNavBar($){
    $("#navbar").append(
    '<div class="navbar-container">'+
    '<input type="checkbox" name="navbar" id="nbar">'+
    '<div class="hamburger-lines">'+
        '<span class="line line1"></span>'+
        '<span class="line line2"></span>'+
        '<span class="line line3"></span>'+
    '</div>'+
    '<ul class="menu-items">'+
        '<li><a href="https://expiter.com">Home</a></li>'+
        '<li><a href="https://expiter.com/resources/">Resources</a></li>'+
        '<li><a href="https://expiter.com/tools/codice-fiscale-generator/">Tools</a></li>'+
        '<li><a href="https://expiter.com/app/#About">About</a></li>'+
        '<li><a href="https://forms.gle/WiivbZg8336TmeUPA" target="_blank">Take Survey</a></li>'+
        '</ul>'+
        '  <label class="switch" id="switch">'+
        '<input type="checkbox">'+
        '<span class="slider round"></span>'+
      '</label>'+
   '<a href="/"><p class="logo">Italy Expats & Nomads</p></a>'+
  '</div>')
  }

    
function populateData(data){
    for (let i = 108; i < data.length; i++) {
     let region = data[i];
     regions[region["Name"]]=region;
     regions[region["Name"]].index=i;
     facts[region["Name"]]={}; //initialize "facts" dictionary with each region
     facts[region["Name"]].snippet=
     '<figure class="column is-3 related"><a href="https://expiter.com/region/'+region.Name.replace(/\s+/g,"-").replace("'","-").toLowerCase()+'/">'+
     '<img title="'+region.Name+'" load="lazy" src="'+
     'https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+region.Name+'.webp?tr=w-280,h-140,c-at_least,q-5" '+
     'alt="Regione di '+data[i].Name+', '+data[i].Region+'"></img>'+
     '<figcaption>'+region.Name+", Italy</figcaption></a></figure>";
   }
   avg=data[107];
   
 }

function getInfo(region){
    let name=region.Name;
    
    let info = {}


  let target, related1, related2, related3, related4;
       
        (region.Name=="Valle d'Aosta"?target=["Piemonte","Lombardia","Liguria","Trentino-Alto Adige"]:
        (region.Name=="Trentino-Alto Adige"?target=["Veneto","Lombardia","Emilia-Romagna","Friuli-Venezia Giulia"]:
        (region.Name=="Molise"?target=["Abruzzo","Marche","Lazio","Umbria","Emilia-Romagna"]:
        (region.Name=="Abruzzo"?target=["Molise","Marche","Lazio","Umbria"]:
        (region.Name=="Emilia-Romagna"?target=["Toscana","Lombardia","Veneto","Marche"]:
        (region.Name=="Liguria"?target=["Piemonte","Toscana","Valle d'Aosta","Lombardia","Emilia-Romagna"]:
        (region.Name=="Piemonte"?target=["Lombardia","Valle d'Aosta","Liguria","Emilia-Romagna"]:
        (region.Name=="Lombardia"?target=["Piemonte","Valle d'Aosta","Trentino-Alto Adige","Emilia-Romagna","Veneto"]:
        (region.Name=="Friuli-Venezia Giulia"?target=["Veneto","Trentino-Alto Adige","Lombardia","Emilia-Romagna"]:
        (region.Name=="Basilicata"?target=["Campania","Puglia","Calabria","Lazio","Molise"]:
        (region.Name=="Puglia"?target=["Basilicata","Campania","Calabria","Lazio","Molise"]:
        (region.Name=="Umbria"?target=["Marche","Toscana","Lazio","Emilia-Romagna","Abruzzo"]:
        (region.Name=="Sicilia"?target=["Calabria","Sardegna","Campania","Basilicata"]:
        (region.Name=="Sardegna"?target=["Sicilia","Toscana","Campania","Lazio"]:
        (region.Name=="Calabria"?target=["Sicilia","Puglia","Campania","Basilicata"]:
        (region.Name=="Campania"?target=["Basilicata","Puglia","Calabria","Lazio","Molise"]:
        (region.Name=="Toscana"?target=["Emilia-Romagna","Liguria","Umbria","Marche","Lazio"]:
        (region.Name=="Lazio"?target=["Toscana","Campania","Umbria","Abruzzo","Marche","Molise","Basilicata"]:
        (region.Name=="Marche"?target=["Abruzzo","Molise","Lazio","Umbria","Emilia-Romagna"]:
        (region.Name=="Veneto"?target=["Piemonte","Valle d'Aosta","Trentino-Alto Adige","Emilia-Romagna","Lombardia"]:
        ""))))))))))))))))))));
        
        target=target.filter(item => item !== name)
        related1=target[Math.floor(Math.random()*target.length)]
        target=target.filter(item => item !== related1)
        related2=target[Math.floor(Math.random()*target.length)]
        target=target.filter(item => item !== related2)
        related3=target[Math.floor(Math.random()*target.length)]
        target=target.filter(item => item !== related3)
        related4=target[Math.floor(Math.random()*target.length)]

        info.related='<h2>Provinces Nearby</h2> '+
        '<row class="columns is-multiline is-mobile"> '+        
        facts[related1].snippet+
        facts[related2].snippet+
        facts[related3].snippet+
        facts[related4].snippet+'</row>'
       
        return info;
      }

function generateSiteMap(dataset){
  let comuniSiteMap='<?xml version="1.0" encoding="UTF-8"?> '+'\n'+
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> '+'\n';
        for (let i = 0; i < 107; i++){
          let region = dataset[i];
          let urlPath = 'region/'+region.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
          urlPath = "https://expiter.com/"+urlPath+"/"
          comuniSiteMap+='<url>'+
          '<loc>'+urlPath+'</loc>'+
          '</url>'+'\n'
        }
  comuniSiteMap+='</urlset>'
  fs.writeFile("sitemap/region-sitemap.xml", comuniSiteMap, function (err, file) {
    if (err) throw err;
    console.log("region-sitemap.xml"+' Saved!');
});
}


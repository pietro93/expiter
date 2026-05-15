import * as pb from './js/pageBuilder.js'
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
var provinces = {};
var facts={};
var selection = [];
var region_filters = [];
var additionalFilters=[];
var dataset;
var avg;
var regions ={};

fetch('https://expiter.com/dataset.json', {method:"Get"})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        //console.log(dom.window.document.querySelector("body").textContent)
        dataset=data;  
        populateData(data);
        generateSiteMap(dataset);
        for (let i = 0; i < 107; i++){
            let province = dataset[i];
       
            if (fs.existsSync('temp/'+province.Name+'-comuni.json')){
            let parsedData = fs.readFileSync('temp/'+province.Name+'-comuni.json','utf8');
            let dic=JSON.parse(parsedData);
            dataset[i]["Comuni"]=dic
            }
            else console.log("Missing comuni: "+province.Name)

            var dirName = 'comuni/province-of-'+province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
            var fileName = '.html';

            let sidebar=pb.setSideBar(province)
            
            const dom = new jsdom.JSDOM(
            "<html lang='en'>"+
            '<head><meta charset="utf-8">'+
            '<link rel="canonical" href="https://expiter.com/'+dirName+'/"/>'+
            '<link rel="alternate" hreflang="en" href="https://expiter.com/'+dirName+'/" />'+
            '<link rel="alternate" hreflang="it" href="https://expiter.com/it/comune/provincia-di-'+province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()+'/" />'+
            '<meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale-1,user-scalable=0">'+
            '<script type="text/javascript" src="https://expiter.com/jquery3.6.0.js" defer></script>'+
            '<script type="text/json" src="https://expiter.com/dataset.json"></script>'+
            '<script type="text/javascript" src="https://expiter.com/script.js" defer></script>'+
            '<script type="text/javascript" src="https://expiter.com/bootstrap-toc.js" defer></script>'+
            '<link rel="stylesheet" href="https://expiter.com/fonts.css" media="print" onload="this.media=\'all\'"></link>'+
            '<link rel="stylesheet" href="https://expiter.com/bulma.min.css">'+
            '<link rel="stylesheet" href="https://expiter.com/style.css?v=1.2">'+
            '<link rel="stylesheet" href="https://expiter.com/comuni/comuni-style.css?v=1.0">'+
            
            '<meta name="description" content="Information about living in '+province.Name+', Italy for expats and digital nomads. '+province.Name+' quality of life, cost of living, safety and more." />'+
	        '<meta name="keywords" content="'+province.Name+' italy, '+province.Name+' expat,'+province.Name+' life,'+province.Name+' digital nomad" />'+
            "<title>"+province.Name+" - Quality of Life and Info Sheet for Expats </title>"+
            '<link rel="icon" type="image/x-icon" title="Expiter - Italy Expats and Nomads" href="https://expiter.com/img/expiter-favicon.ico"></link>'+
            "</head>"+
            '<aside class="menu sb higher">'+sidebar+'</aside>\n'+

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
        '<div class="hero" style="background-image:url(\'https://expiter.com/img/'+province.Abbreviation+'.webp\')" '+'title="Towns in the '+province.Name+' Province"'+'>'+
        '</div><h1 class="title">Towns in </h1>'+
        '<section id="List of Comuni in '+province.Name+'">'+
        '<center><table id="list" class="table">'+
        '<tr id="header">'+
        '<th>Name</th>'+
        '<th>Population</th>'+
        '<th>Density</th>'+
        '<th>Altitude</th>'+
        '</tr>'+
        '</table>'+
        '<p id="info"></p></center>'+
        '</section>'+
        '<aside class="menu sb mobileonly">'+sidebar+'</aside>\n'+

        '</body></html>'
        )

        const $ = require('jquery')(dom.window)
        //do js shit here
        var nComuni=0;
        $("h1").text("Towns in "+province.Name)
        
        if (dataset[i].Comuni!=undefined){
        let list=$("#list").html();

        for (let c in dataset[i].Comuni){
            let comune = dataset[i]["Comuni"][c];
            nComuni++;
            list+="<tr>"+
            '<th><h2>'+'<a href="https://expiter.com/comuni/'+handle(province)+'/'+handle(comune)+'/">'+
            comune["Name"]+
            '</a></h2></th>'+
            '<th>'+comune["Population"]+'</th>'+
            '<th>'+comune["Density"]+'</th>'+
            '<th>'+comune["Altitude"]+'</th>'+
            "</tr>"
        }
        
        $("#list").html(list);
        

        for (var firstComune in dataset[i].Comuni) break;
        $("#info").html(
        "There are <b>"+nComuni+" municipalities</b> within the province of "+
        '<a href="https://expiter.com/it/province/'+handle(province)+'/">'+province.Name+'</a>'+
        " in "+province.Region+". </br>"+
        "<b>"+'<a href="https://expiter.com/comuni/'+handle(province)+'/'+handle(dataset[i]["Comuni"][firstComune])+'/">'+
        dataset[i]["Comuni"][firstComune]["Name"]+
        "</a></b> is the largest city by population with a total of "+dataset[i]["Comuni"][firstComune]["Population"]+" inhabitants.")
       
        var info=getInfo(province)
        
        $("#info").append(info.related)
        setNavBar($)
        }
        
        let html = dom.window.document.documentElement.outerHTML;
      
        if (!fs.existsSync("comuni")) {
            fs.mkdirSync("comuni");
            }

        if (dataset[i].Comuni!=undefined)
        fs.writeFile(dirName+fileName, html, function (err, file) {
           if (err) throw err;
           console.log(dataset[i].Name+".html"+' Saved!');
       });
    }
    })


    
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
        '<li><a href="https://expiter.com/blog/articles/">Blog</a></li>'+
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
     facts[region["Name"]].provinces=[];
    }
   for (let i = 0; i < 107; i++) {
     let province = data[i];
     provinces[province["Name"]]=province;
     provinces[province["Name"]].index=i;
     facts[province["Region"]].provinces.push(province.Name) //add province to region dictionary
    
     facts[province["Name"]]={}; //initialize "facts" dictionary with each province
     facts[province["Name"]].snippet=
     '<figure class="column is-3 related"><a href="https://expiter.com/province/'+province.Name.replace(/\s+/g,"-").replace("'","-").toLowerCase()+'/">'+
     '<img title="'+province.Name+'" load="lazy" src="'+
     'https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-280,h-140,c-at_least,q-5" '+
     'alt="Provincia di '+data[i].Name+', '+data[i].Region+'"></img>'+
     '<figcaption>'+province.Name+", "+province.Region+"</figcaption></a></figure>";
   }
   avg=data[107];
   
 }

function getInfo(province){
    let name=province.Name;
    let region=regions[province.Region];
    
    let info = {}


  let target, related1, related2, related3, related4;
       
        (region.Name=="Valle d'Aosta"?target=facts[region.Name]["provinces"].concat(facts["Piemonte"]["provinces"]):
        (region.Name=="Trentino-Alto Adige"?target=facts[region.Name]["provinces"].concat(facts["Veneto"]["provinces"]).concat(["Brescia","Sondrio"]):
        (region.Name=="Molise"?target=facts[region.Name]["provinces"].concat(facts["Abruzzo"]["provinces"]):
        (region.Name=="Abruzzo"?target=facts[region.Name]["provinces"].concat(facts["Molise"]["provinces"]):
        (region.Name=="Emilia-Romagna"?target=facts[region.Name]["provinces"].concat(["Prato","Mantova","Cremona","Rovigo","Massa-Carrara","Lucca","Pistoia","Pesaro e Urbino","Arezzo"]):
        (region.Name=="Liguria"?target=facts[region.Name]["provinces"].concat(facts["Piemonte"]["provinces"]):
        (region.Name=="Piemonte"?target=facts[region.Name]["provinces"].concat(facts["Lombardia"]["provinces"]):
        (region.Name=="Lombardia"?target=facts[region.Name]["provinces"].concat(facts["Piemonte"]["provinces"]):
        (region.Name=="Friuli-Venezia Giulia"?target=facts[region.Name]["provinces"].concat(facts["Veneto"]["provinces"]):
        (region.Name=="Basilicata"?target=facts[region.Name]["provinces"].concat(facts["Campania"]["provinces"]).concat(facts["Puglia"]["provinces"]).concat(["Cosenza"]):
        (region.Name=="Puglia"?target=facts[region.Name]["provinces"].concat(facts["Basilicata"]["provinces"]).concat(["Campobasso","Benevento","Avellino"]):
        (region.Name=="Umbria"?target=facts[region.Name]["provinces"].concat(facts["Marche"]["provinces"]).concat(["Arezzo","Siena","Viterbo","Rieti"]):
        target=facts[region.Name]["provinces"]))))))))))));
        (province.Name=="Reggio Calabria"?target=target.concat(["Messina"]):
        (province.Name=="Messina"?target=target.concat(["Reggio Calabria"]):
        (province.Name=="Torino"?target=target.concat(["Aosta"]):
        (province.Name=="Cosenza"?target=target.concat(facts["Basilicata"]["provinces"]):
        (province.Name=="Salerno"?target=target.concat(facts["Basilicata"]["provinces"]):
        ""
        )))));
        
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
          let province = dataset[i];
          let urlPath = 'comuni/province-of-'+province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
          urlPath = "https://expiter.com/"+urlPath+"/"
          comuniSiteMap+='<url>'+
          '<loc>'+urlPath+'</loc>'+
          '</url>'+'\n'
        }
  comuniSiteMap+='</urlset>'
  fs.writeFile("sitemap/comuni-sitemap.xml", comuniSiteMap, function (err, file) {
    if (err) throw err;
    console.log("comuni-sitemap.xml"+' Saved!');
});
}

function handle(comune){
  return comune.Name.replace('(*)','').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()
}
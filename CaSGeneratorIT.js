import * as pb from './js/pageBuilder.js';
import { createServer } from 'http';
import fetch from 'node-fetch';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
const require = createRequire(import.meta.url);
const jsdom = require('jsdom');
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('Ciao Mondo!');
}).listen(8080);

var dataset;
var provinces = {};
var facts = {};
var selection = [];
var region_filters = [];
var additionalFilters = [];
var avg;
var regions = {};

// Function to populate data
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
    '<figure class="column is-3 related"><a href="https://expiter.com/it/province/'+province.Name.replace(/\s+/g,"-").replace("'","-").toLowerCase()+'/crime-and-safety/">'+
    '<img title="'+(province.Name)+'" loading="lazy" src="'+
    'https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-280,h-140,c-at_least,q-5" '+
    'alt="Crimine e sicurezza in '+(data[i].Name)+', '+(data[i].Region)+'"></img>'+
    '<figcaption>'+(province.Name)+", "+(province.Region)+"</figcaption></a></figure>";
  }
  avg=data[107];
}

fetch('https://expiter.com/dataset.json', { method: 'Get' })
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    dataset = data;
    populateData(data);

    // Fetch additional crime dataset
    return fetch('https://expiter.com/dataset_crime_2023.json', { method: 'Get' });
  })
  .then(function (response) {
    return response.json();
  })
  .then(function (crimeDataset2023) {
    // Combine datasets based on Name
    const combinedData = dataset.map(entry => {
      const crimeData = crimeDataset2023.find(c => c.Name === entry.Name);
      return crimeData ? { ...entry, ...crimeData } : entry;
    });

    populateData(combinedData);
    
    for (let i = 0; i < 107; i++) {
      let province = combinedData[i];

      let dirName = 'it/province/'+province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
      let dir = path.join(__dirname, dirName);

        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)){
         fs.mkdirSync(dir);
    }

      // Create .htaccess file in the directory
let htaccessContent = `RewriteEngine on\nRewriteRule ^$ /${dirName}.html [L]\nRewriteRule ^([a-zA-Z0-9-]+)/$ $1.html [L]`;
fs.writeFileSync(path.join(dir, '.htaccess'), htaccessContent)

var fileName = ''+dirName+'/sicurezza-e-criminalita';
let seoTitle=(province.Name)+" - Scheda informativa su criminalità e sicurezza";
let seoDescription='Informazioni su criminalità e sicurezza a '+(province.Name)+', Italia. '+(province.Name)+' indice di criminalità, attività mafiosa, sicurezza e altro ancora.'
let heroImage='https://expiter.com/img/'+province.Abbreviation+'.webp'
let sidebar=pb.setSideBar(province)

const dom = new jsdom.JSDOM(
"<!DOCTYPE html>"+
"<html lang='it'>"+
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
'<link rel="stylesheet" href="https://expiter.com/style.css?v=1.1">'+

'<meta property="og:title" content="'+seoTitle+'" />'+
'<meta property="og:description" content="'+seoDescription+'" />'+
'<meta property="og:image" content="'+heroImage+'" />'+
'<meta name="description" content="'+seoDescription+'" />'+
  '<meta name="keywords" content="'+(province.Name)+' italia, '+(province.Name)+' è sicuro,'+(province.Name)+' criminalità,'+(province.Name)+' mafia" />'+
"<title>"+seoTitle+"</title>"+
'<link rel="icon" type="image/x-icon" title="Expiter - Espatriati e Nomadi in Italia" href="https://expiter.com/img/expiter-favicon.ico"></link>'           
+
'<!-- GetYourGuide Analytics -->'+
'<script async defer src="https://widget.getyourguide.com/dist/pa.umd.production.min.js" data-gyg-partner-id="56T9R2T"></script>'+
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

'<div class="hero" style="background-image:url(\'https://expiter.com/img/'+province.Abbreviation+'.webp\')" '+'title="'+province.Name+' Provincia"'+'></div>'+
'<h1 data-toc-skip id="title" class="title column is-12">  </h1></row>'+
'<div class="tabs effect-3">'+
'<input type="radio" id="tab-1" name="tab-effect-3" checked="checked">'+
'<span>Qualità della vita</span>'+
'<input type="radio" id="tab-2" name="tab-effect-3">'+
'<span>Costo della vita</span>'+
'<input type="radio" id="tab-3" name="tab-effect-3">'+
'<span>Nomadi digitali</span>'+
'<input type="radio" id="tab-4" name="tab-effect-3" disabled>'+
'<span></span>'+
'<input type="radio" id="tab-5" name="tab-effect-3" disabled>'+
'<span></span>'+
'<div class="line ease"></div>'+
'<!-- tab-content -->'+
'<div class="tab-content">'+
    '<section id="Quality-of-Life" class="columns is-mobile is-multiline">'+
        '<div class="column">'+                    
   '<!--script.js adds content here-->'+
        '</div>'+
    '<div class="column" >'+
  '<!--script.js adds content here-->'+
    '</div>'+
    '</section>'+
    '<section id="Cost-of-Living" class="columns is-mobile is-multiline">'+
        '<div class="column">'+
            '<!--script.js adds content here-->'+
                 '</div>'+
             '<div class="column" >'+
             '</div>'+
    '</section>'+
    '<section id="Digital-Nomads" class="columns is-mobile is-multiline">'+
        '<div class="column">'+
                 '</div>'+
             '<div class="column" >'+
             '</div>'+
    '</section>'+
'</div>'+
'</div></div>'+
'<div id="info" class="columns is-multiline is-mobile">'+
'<section id="Overview"><h2>Panoramica</h2><span id="overview"></span></section>'+
'<section id="Crime and Safety"><h3>Criminalità e sicurezza</h3><span id="crimeandsafety"></span></section>'+
'<section id="Thefts and Robberies"><h3>Furti e rapine</h3><span id="theftsandrobberies"></span></section>'+
'<section id="Violence"><h3>Reati violenti</h3><span id="violentcrimes"></span></section>'+
'<section id="Organized Crime"><h3>Crimine organizzato e reati legati alla droga</h3><span id="organizedcrime"></span></section>'+
'<section id="Accidents"><h3>Incidenti</h3><span id="accidents"></span></section>'+
'<section id="Discover"><h2>Scoprire</h2><span id="promo"></span></section>'+
'</div>'+
'<aside class="menu sb mobileonly">'+sidebar+'</aside>\n'+
'</body></html>'
        )


console.log(facts[province.Name])
const $ = require('jquery')(dom.window)
newPage(province, $)

let html = dom.window.document.documentElement.outerHTML;
fs.writeFile(fileName+".html", html, function (err, file) {
if (err) throw err;
console.log(dataset[i].Name+".html"+' Salvato!');
});
}
})
.catch(function (err) {
console.log('errore: ' + err);
});

function newPage(province, $){
let info = getInfo(province)
let separator='</br><span class="separator"></span></br>'
appendProvinceData(province, $);
pb.setNavBar($);

$(".title").text("Criminalità e sicurezza a "+(province.Name)+'');

$("#overview").append(pb.addBreaks(info.overview))
$("#crimeandsafety").append(pb.addBreaks(info.crimeandsafety))
$("#crimeandsafety").append(separator)
$("#theftsandrobberies").append(info.theftsandrobberies)
$("#theftsandrobberies").append(separator)
$("#violentcrimes").append(pb.addBreaks(info.violentcrimes))
$("#violentcrimes").append(separator)
$("#organizedcrime").append(pb.addBreaks(info.organizedcrime))
$("#organizedcrime").append(separator)
$("#accidents").append(pb.addBreaks(info.accidents))
$("#accidents").append(separator)
$("#promo").append(info.viator)
$("#promo").append(separator)
$("#promo").append(info.getyourguide)
$("#promo").append(separator)
$("#promo").append(info.related)

}


      function getInfo(province){
  populateFacts()

  console.log("Ottenendo informazioni su "+province.Name)
  console.log("...")

     
    let ratio = (province.Men/(Math.min(province.Men,province.Women))).toFixed(2)+":"+(province.Women/(Math.min(province.Men,province.Women))).toFixed(2);

    
    let info = {}

    let name=province.Name;
        let region=regions[province.Region];

    info.overview=""

    info.crimeandsafety="La provincia di "+(province.Name)+" si classifica <b>"+province.SafetyRank+" su 106 per sicurezza</b> secondo i nostri dati, con un <b>punteggio di sicurezza di "+province.SafetyScore+"</b>. "+
    "Ci sono stati un totale di " + province.IndiceCriminalita + " segnalazioni ufficiali di crimini per 100.000 abitanti nella provincia nel 2023. Questo è " + 
(province.IndiceCriminalita > avg.IndiceCriminalita ? "<b class='red'>superiore alla media</b> del numero di crimini segnalati per 100.000 abitanti in tutte le province italiane. Questo potrebbe essere dovuto a una varietà di fattori, tra cui condizioni socio-economiche e pratiche di law enforcement." : 
(province.IndiceCriminalita < avg.IndiceCriminalita ? "<b class='green'>inferiore alla media</b> del numero di crimini segnalati per 100.000 abitanti in tutte le province italiane. Questo potrebbe indicare pratiche efficaci di law enforcement, o altri fattori che contribuiscono a ridurre i tassi di criminalità." : 
"<b class='yellow'>in linea con la media</b> del numero di crimini segnalati per 100.000 abitanti in tutte le province italiane. Questo suggerisce che il tasso di criminalità in " + (province.Name) + " è tipico per le province italiane."))

info.theftsandrobberies = "Nella provincia di "+(province.Name)+", ci sono stati <b>"+province.FurtiDestrezza+" casi di furti con destrezza</b> (furti commessi con abilità speciale, superiore a quella normalmente utilizzata dal comune ladro), <b>"+province.FurtiStrappo+" casi di furti con strappo</b> (furti commessi da qualcuno che prende possesso di un bene mobile altrui strappandolo dalla mano o dal corpo della persona), <b>"+province.FurtiAutovettura+" furti di auto</b>, e <b>"+province.FurtiAbitazione+" furti in abitazione</b> per 100.000 abitanti nel 2023.<br><br> Di seguito è presentata una panoramica di come questi tipi di furto si confrontano con la media di tutte le province italiane: <br><br>"+
(province.FurtiDestrezza > avg.FurtiDestrezza ? "<b class='red'>I furti con destrezza sono superiori alla media</b>. Questo potrebbe essere dovuto a una varietà di fattori, tra cui condizioni socio-economiche e pratiche di law enforcement." : 
(province.FurtiDestrezza < avg.FurtiDestrezza ? "<b class='green'>I furti con destrezza sono inferiori alla media</b>. Questo potrebbe indicare pratiche efficaci di law enforcement, o altri fattori che contribuiscono a ridurre i tassi di criminalità." : 
"<b class='yellow'>I furti con destrezza sono in linea con la media</b>. Questo suggerisce che il tasso di furti con destrezza in " + (province.Name) + " è tipico per le province italiane.")) +
'<br><br>'+
(province.FurtiStrappo > avg.FurtiStrappo ? "<b class='red'> I furti con strappo sono superiori alla media</b>. Questo potrebbe essere dovuto a una varietà di fattori, tra cui condizioni socio-economiche e pratiche di law enforcement." : 
(province.FurtiStrappo < avg.FurtiStrappo ? "<b class='green'>I furti con strappo sono inferiori alla media</b>. Questo potrebbe indicare pratiche efficaci di law enforcement, o altri fattori che contribuiscono a ridurre i tassi di criminalità." : 
"<b class='yellow'>I furti con strappo sono in linea con la media</b>. Questo suggerisce che il tasso di furti con strappo in " + (province.Name) + " è tipico per le province italiane.")) +
'<br><br>'+
(province.FurtiAutovettura > avg.FurtiAutovettura ? "<b class='red'>I furti di auto sono superiori alla media</b>. Questo potrebbe essere dovuto a una varietà di fattori, tra cui condizioni socio-economiche e pratiche di law enforcement." : 
(province.FurtiAutovettura < avg.FurtiAutovettura ? "<b class='green'>I furti di auto sono inferiori alla media</b>. Questo potrebbe indicare pratiche efficaci di law enforcement, o altri fattori che contribuiscono a ridurre i tassi di criminalità." : 
"<b class='yellow'>I furti di auto sono in linea con la media</b>. Questo suggerisce che il tasso di furti di auto in " + (province.Name) + " è tipico per le province italiane.")) +
'<br><br>'+
(province.FurtiAbitazione > avg.FurtiAbitazione ? "<b class='red'>I furti in abitazione sono superiori alla media</b>. Questo potrebbe essere dovuto a una varietà di fattori, tra cui condizioni socio-economiche e pratiche di law enforcement." : 
(province.FurtiAbitazione < avg.FurtiAbitazione ? "<b class='green'>I furti in abitazione sono inferiori alla media</b>. Questo potrebbe indicare pratiche efficaci di law enforcement, o altri fattori che contribuiscono a ridurre i tassi di criminalità." : 
"<b class='yellow'>I furti in abitazione sono in linea con la media</b>. Questo suggerisce che il tasso di furti in abitazione in " + (province.Name) + " è tipico per le province italiane."));


info.violentcrimes = "Nella provincia di "+(province.Name)+", ci sono stati "+(province.Omicidi + province.ViolenzeSessuali)+" casi di crimini violenti (omicidi e aggressioni sessuali) per 100.000 abitanti nel 2023. Questo è "+
(province.Omicidi + province.ViolenzeSessuali > avg.Omicidi + avg.ViolenzeSessuali ? "<b class='red'>superiore alla media</b> del numero di crimini violenti per 100.000 abitanti in tutte le province italiane. Questo potrebbe essere dovuto a una varietà di fattori, tra cui condizioni socio-economiche e pratiche di law enforcement." : 
(province.Omicidi + province.ViolenzeSessuali < avg.Omicidi + avg.ViolenzeSessuali ? "<b class='green'>inferiore alla media</b> del numero di crimini violenti per 100.000 abitanti in tutte le province italiane. Questo potrebbe indicare pratiche efficaci di law enforcement, o altri fattori che contribuiscono a ridurre i tassi di criminalità." : 
"<b class='yellow'>in linea con la media</b> del numero di crimini violenti per 100.000 abitanti in tutte le province italiane. Questo suggerisce che il tasso di crimini violenti in " + (province.Name) + " è tipico per le province italiane."));

info.organizedcrime = "Nella provincia di "+(province.Name)+", ci sono stati "+province.Estorsioni+" casi di estorsioni, "+province.RiciclaggioDenaro+" casi di riciclaggio di denaro, e "+province.ReatiStupefacenti+" crimini legati alla droga (come spaccio, produzione, ecc.) per 100.000 abitanti nel 2023. "+
'<br><br>'+(province.Estorsioni > avg.Estorsioni ? "<b class='red'>Le estorsioni sono superiori alla media per tutte le province in Italia</b>. Questo potrebbe essere dovuto a una varietà di fattori, tra cui condizioni socio-economiche e pratiche di law enforcement." : 
(province.Estorsioni < avg.Estorsioni ? "<b class='green'>Le estorsioni sono inferiori alla media tra tutte le province italiane</b>. Questo potrebbe indicare pratiche efficaci di law enforcement, o altri fattori che contribuiscono a ridurre i tassi di criminalità." : 
"<b class='yellow'>Le estorsioni sono in linea con la media per le province in Italia</b>. Questo suggerisce che il tasso di estorsioni in " + (province.Name) + " è tipico per le province italiane.")) +
'<br><br>'+(province.RiciclaggioDenaro > avg.RiciclaggioDenaro ? "<b class='red'> I casi di riciclaggio di denaro sono superiori alla media in tutte le province del paese</b>. Questo potrebbe essere dovuto a una varietà di fattori, tra cui condizioni socio-economiche e pratiche di law enforcement." : 
(province.RiciclaggioDenaro < avg.RiciclaggioDenaro ? "<b class='green'>I casi di riciclaggio di denaro sono inferiori alla media per tutte le province del paese</b>. Questo potrebbe indicare pratiche efficaci di law enforcement, o altri fattori che contribuiscono a ridurre i tassi di criminalità." : 
"<b class='yellow'>I casi di riciclaggio di denaro sono in linea con la media nazionale</b>. Questo suggerisce che il tasso di riciclaggio di denaro in " + (province.Name) + " è tipico per le province italiane.")) +
'<br><br>'+(province.ReatiStupefacenti > avg.ReatiStupefacenti ? "<b class='red'>I crimini legati alla droga sono superiori alla media per tutte le province italiane</b>. Questo potrebbe essere dovuto a una varietà di fattori, tra cui condizioni socio-economiche e pratiche di law enforcement." : 
(province.ReatiStupefacenti < avg.ReatiStupefacenti ? "<b class='green'>I crimini legati alla droga sono inferiori alla media per tutte le province italiane</b>. Questo potrebbe indicare pratiche efficaci di law enforcement, o altri fattori che contribuiscono a ridurre i tassi di criminalità." : 
"<b class='yellow'>I crimini legati alla droga sono in linea con la media tra le province italiane</b>. Questo suggerisce che il tasso di crimini legati alla droga in " + (province.Name) + " è tipico per le province italiane."))
+(facts[province.Name].mafia?'<br><br><h3>Attività mafiosa</h3>'+facts[province.Name].mafia:"");

info.accidents = "Nella provincia di "+(province.Name)+", ci sono stati "+province.InfortuniLavoro+" casi di incidenti mortali e di invalidità permanente per 10.000 dipendenti, e "+province.MortalitàIncidenti+" morti per incidenti stradali per 10.000 residenti nel 2023. "+
(province.InfortuniLavoro > avg.InfortuniLavoro ? "<b class='red'>Gli incidenti sul lavoro sono superiori alla media per tutte le province italiane</b>. Questo potrebbe essere dovuto a una varietà di fattori, tra cui pratiche e condizioni di sicurezza sul lavoro." : 
(province.InfortuniLavoro < avg.InfortuniLavoro ? "<b class='green'>Gli incidenti sul lavoro sono inferiori rispetto alla media di tutte le province in Italia</b>. Questo potrebbe indicare pratiche efficaci di sicurezza sul lavoro." : 
"<b class='yellow'>Gli incidenti sul lavoro sono in linea con la media nazionale</b>. Questo suggerisce che il tasso di incidenti sul lavoro in " + (province.Name) + " è tipico per le province italiane.")) +
'<br><br>'+(province.MortalitàIncidenti > avg.MortalitàIncidenti ? "<b class='red'> Le morti per incidenti stradali sono superiori alla media nazionale</b>. Questo potrebbe essere dovuto a una varietà di fattori, tra cui pratiche e condizioni di sicurezza stradale." : 
(province.MortalitàIncidenti < avg.MortalitàIncidenti ? "<b class='green'>Le morti per incidenti stradali sono inferiori alla media nazionale</b>. Questo potrebbe indicare pratiche efficaci di sicurezza stradale." : 
"<b class='yellow'>Le morti per incidenti stradali sono in linea con la media nazionale</b>. Questo suggerisce che il tasso di morti per incidenti stradali in " + (province.Name) + " è tipico per le province italiane."));

info.viator='<center><h3>Tour consigliati in '+(province.Viator?name:region.Name)+'</h3></center>'+
'<div data-vi-partner-id=P00045447 data-vi-language=it data-vi-currency=EUR data-vi-partner-type="AFFILIATE" data-vi-url="'+
(region.Name=='Molise'?'':'https://www.viator.com/')+(province.Viator?province.Viator:region.Viator)+'"'+
(province.Viator.includes(",")||region.Name=='Molise'?"":' data-vi-total-products=6 ')+
' data-vi-campaign="'+name+'" ></div>'+
'<script async src="https://www.viator.com/orion/partner/widget.js"></script>'

info.getyourguide='<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>'

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

info.related='<h2>Altre Province</h2> '+
'<row class="columns is-multiline is-mobile"> '+        
facts[related1].snippet+
facts[related2].snippet+
facts[related3].snippet+
facts[related4].snippet+'</row>'


return info;
}

function en(word){
  switch (word){
    case "Sicilia":return"Sicily";case "Valle d'Aosta":case "Val d'Aosta":return"Aosta Valley";
    case "Toscana":return"Tuscany";case "Sardegna":return "Sardinia";
    case "Milano":return"Milan";case "Lombardia":return "Lombardy";
    case "Torino":return"Turin";case "Piemonte":return "Piedmont";
    case "Roma":return"Rome";case "Puglia":return "Apulia";
    case "Mantova":return"Mantua";case "Padova":return"Padua";
    case "Venezia":return"Venice";case "Firenze":return"Florence";
    case "Napoli":return"Naples";case "Genova":return"Genoa";
    default: return word;
  }
}

function appendProvinceData(province, $){
  
  let tab1=$("#Quality-of-Life > .column");
  let tab2=$("#Cost-of-Living > .column"); 
  let tab3=$("#Digital-Nomads > .column"); 
  tab1[0].innerHTML+=('<p><ej>👥</ej>Population: <b>'+province.Population.toLocaleString('en', {useGrouping:true}) +'</b>');
  tab1[0].innerHTML+=('<p><ej>🚑</ej>Healthcare: '+ qualityScore("Healthcare",province.Healthcare));
  tab1[0].innerHTML+=('<p><ej>📚</ej>Education: '+ qualityScore("Education",province.Education));
  tab1[0].innerHTML+=('<p><ej>👮🏽‍♀️</ej>Safety: '+ qualityScore("Safety",province.Safety));
  tab1[0].innerHTML+=('<p><ej>🚨</ej>Crime: '+ qualityScore("Crime",province.Crime));
  
  tab1[0].innerHTML+=('<p><ej>🚌</ej>Transport: '+ qualityScore("PublicTransport",province["PublicTransport"]));
  tab1[0].innerHTML+=('<p><ej>🚥</ej>Traffic: '+ qualityScore("Traffic",province["Traffic"]));
  tab1[0].innerHTML+=('<p><ej>🚴‍♂️</ej>Cyclable: '+ qualityScore('CyclingLanes',province['CyclingLanes']));
  tab1[0].innerHTML+=('<p><ej>🏛️</ej>Culture: '+ qualityScore("Culture",province.Culture));
  tab1[0].innerHTML+=('<p><ej>🍸</ej>Nightlife: '+ qualityScore("Nightlife",province.Nightlife));
  tab1[0].innerHTML+=('<p><ej>⚽</ej>Recreation: '+ qualityScore("Sports & Leisure",province["Sports & Leisure"]));

  tab1[1].innerHTML+=('<p><ej>🌦️</ej>Climate: '+ qualityScore("Climate",province.Climate));
  tab1[1].innerHTML+=('<p><ej>☀️</ej>Sunshine: '+ qualityScore("SunshineHours",province.SunshineHours));
  tab1[1].innerHTML+=('<p><ej>🥵</ej>Summers: '+ qualityScore("HotDays",province.HotDays));
  tab1[1].innerHTML+=('<p><ej>🥶</ej>Winters: '+ qualityScore("ColdDays",province.ColdDays));
  tab1[1].innerHTML+=('<p><ej>🌧️</ej>Rain: '+ qualityScore("RainyDays",province.RainyDays));
  tab1[1].innerHTML+=('<p><ej>🌫️</ej>Fog: '+ qualityScore("FoggyDays",province.FoggyDays));
  tab1[1].innerHTML+=('<p><ej>🍃</ej>Air quality: '+ qualityScore("AirQuality",province["AirQuality"]));

  tab1[1].innerHTML+=('<p><ej>👪</ej>For family: '+ qualityScore("Family-friendly",province["Family-friendly"]));
  tab1[1].innerHTML+=('<p><ej>👩</ej>For women: '+ qualityScore("Female-friendly",province["Female-friendly"]));
  tab1[1].innerHTML+=('<p><ej>🏳️‍🌈</ej>LGBTQ+: '+ qualityScore("LGBT-friendly",province["LGBT-friendly"]));
  tab1[1].innerHTML+=('<p><ej>🥗</ej>For vegans: '+ qualityScore("Veg-friendly",province["Veg-friendly"]));
  

  tab2[0].innerHTML+=('<p><ej>📈</ej>Cost of Living: '+ qualityScore("CostOfLiving",province["CostOfLiving"]));
  tab2[0].innerHTML+=('<p><ej>🧑🏻</ej>Expenses (single person): '+ qualityScore("Cost of Living (Individual)",province["Cost of Living (Individual)"]))
  tab2[0].innerHTML+=('<p><ej>👩🏽‍🏫</ej>Expenses (tourist): '+ qualityScore("Cost of Living (Nomad)",province["Cost of Living (Nomad)"]))
  tab2[0].innerHTML+=('<p><ej>🏠</ej>Rental (studio apt.): '+ qualityScore("StudioRental",province["StudioRental"]))
  tab2[0].innerHTML+=('<p><ej>🏘️</ej>Rental (2-room apt.): '+ qualityScore("BilocaleRent",province["BilocaleRent"]))
  tab2[0].innerHTML+=('<p><ej>🏰</ej>Rental (3-room apt.): '+ qualityScore("TrilocaleRent",province["TrilocaleRent"]))

  tab2[1].innerHTML+=('<p><ej>🏙️</ej>Housing Cost: '+ qualityScore("HousingCost",province["HousingCost"]));
  tab2[1].innerHTML+=('<p><ej>💵</ej>Local Income: '+ qualityScore("MonthlyIncome",province["MonthlyIncome"]));
  tab2[1].innerHTML+=('<p><ej>👪</ej>Expenses (small family): '+ qualityScore("Cost of Living (Family)",province["Cost of Living (Family)"]))
  tab2[1].innerHTML+=('<p><ej>🏠</ej>Sale (studio apt.): '+ qualityScore("StudioSale",province["StudioSale"]))
  tab2[1].innerHTML+=('<p><ej>🏘️</ej>Sale (2-room apt.): '+ qualityScore("BilocaleSale",province["BilocaleSale"]))
  tab2[1].innerHTML+=('<p><ej>🏰</ej>Sale (3-room apt.): '+ qualityScore("TrilocaleSale",province["TrilocaleSale"]))
 
  tab3[0].innerHTML+=('<p><ej>👩‍💻</ej>Nomad-friendly: '+qualityScore("DN-friendly",province["DN-friendly"]))
  tab3[0].innerHTML+=('<p><ej>💃</ej>Fun: '+qualityScore("Fun",province["Fun"]));
  tab3[0].innerHTML+=('<p><ej>🤗</ej>Friendliness: '+qualityScore("Friendliness",province["Friendliness"]));
  tab3[0].innerHTML+=('<p><ej>🤐</ej>English-speakers: '+qualityScore("English-speakers",province["English-speakers"]));
  tab3[0].innerHTML+=('<p><ej>😊</ej>Happiness: '+qualityScore("Antidepressants",province["Antidepressants"]));
 
  tab3[1].innerHTML+=('<p><ej>💸</ej>Nomad cost: '+ qualityScore("Cost of Living (Nomad)",province["Cost of Living (Nomad)"]))
  tab3[1].innerHTML+=('<p><ej>📡</ej>High-speed Internet: '+qualityScore("HighSpeedInternetCoverage",province["HighSpeedInternetCoverage"]));
  tab3[1].innerHTML+=('<p><ej>📈</ej>Innovation: '+qualityScore("Innovation",province["Innovation"]));
  tab3[1].innerHTML+=('<p><ej>🏖️</ej>Beach: '+qualityScore("Beach",province["Beach"]));
  tab3[1].innerHTML+=('<p><ej>⛰️</ej>Hiking: '+qualityScore("Hiking",province["Hiking"]));
}


function qualityScore(quality,score){
  let expenses=["Cost of Living (Individual)","Cost of Living (Family)","Cost of Living (Nomad)", 
  "StudioRental", "BilocaleRent", "TrilocaleRent", "MonthlyIncome", 
  "StudioSale","BilocaleSale","TrilocaleSale"]
  
  if (quality=="CostOfLiving"||quality=="HousingCost"){
    if (score<avg[quality]*.8){return "<score class='excellent short'>cheap</score>"}
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>affordable</score>"}
    else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>average</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>high</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='poor max'>expensive</score>"}
  }
  else if (expenses.includes(quality)){
    if (score<avg[quality]*.8){return "<score class='green'>"+score+"€/m</score>"}
    else if (score>=avg[quality]*0.8&&score<avg[quality]*0.95){return "<score class='green'>"+score+"€/m</score>"}
    else if (score>=avg[quality]*0.95&&score<avg[quality]*1.05){return "<score class='orange'>"+score+"€/m</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='red'>"+score+"€/m</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='red'>"+score+"€/m</score>"}
  }
  else if (quality=="HotDays"||quality=="ColdDays"){ // high score = bad; low score = good
    if (score<avg[quality]*.8){return "<score class='excellent short'>not "+(quality=="HotDays"?"hot":"cold")+"</score>"}
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>not very "+(quality=="HotDays"?"hot":"cold")+"</score>"}
    else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>a bit "+(quality=="HotDays"?"hot":"cold")+"</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>"+(quality=="HotDays"?"hot":"cold")+"</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='poor max'>very "+(quality=="HotDays"?"hot":"cold")+"</score>"}
  }
  else if (quality=="RainyDays"){ // high score = bad; low score = good
    if (score<avg[quality]*.8){return "<score class='excellent short'>very little</score>"}
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>little</score>"}
    else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>average</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>rainy</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='poor max'>a lot</score>"}
  }
  else if (quality=="FoggyDays"){ // high score = bad; low score = good
    if (score<avg[quality]*.265){return "<score class='excellent short'>no fog</score>"}
    else if (score>=avg[quality]*.265&&score<avg[quality]*.6){return "<score class='great medium'>little</score>"}
    else if (score>=avg[quality]*.6&&score<avg[quality]*1.00){return "<score class='good medium'>average</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*3){return "<score class='average long'>foggy</score>"}
    else if (score>=avg[quality]*3){return "<score class='poor max'>a lot</score>"}
  }
  else if (quality=="Crime"||quality=="Traffic"){ // high score = bad; low score = good
    if (score<avg[quality]*.8){return "<score class='excellent short'>very low</score>"}
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>low</score>"}
    else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>average</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>high</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='poor max'>too much</score>"}
  }
  else{ // high score = good; low score = bad
    if (score<avg[quality]*.8){return "<score class='poor short'>poor</score>"}
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='average medium'>okay</score>"}
    else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>good</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='great long'>great</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='excellent max'>excellent</score>"}
  }
}


function populateFacts(){
    facts.Roma.mafia="Esiste parecchia attività mafiosa a Roma. Diversi gruppi di criminalità organizzata, tra cui la 'Ndrangheta, la Camorra e famiglie criminali romane autoctone, hanno stabilito una presenza e un'influenza nella città di Roma. Roma è considerata un importante centro di riciclaggio di denaro per le organizzazioni criminali, con circa 45 diverse bande che collaborano nella corruzione e nelle attività criminali della città. La famiglia criminale dei Casamonica, radicata nella comunità Rom Sinti, controlla i sobborghi sud-orientali di Roma e le colline albane circostanti. Nel 2015, il clan Casamonica ha tenuto un funerale sfarzoso per il loro boss Vittorio Casamonica, mostrando il loro potere e la loro influenza. Nel 2018, cinque membri del clan Casamonica sono stati condannati fino a 30 anni di carcere ai sensi delle severe leggi italiane contro la mafia. Inoltre, la rete 'Mafia Capitale', scoperta nel 2014, ha coinvolto politici, uomini d'affari e funzionari corrotti che collaboravano con gruppi criminali per manipolare gli appalti pubblici. Questi episodi evidenziano la presenza di varie organizzazioni criminali di stampo mafioso che operano a Roma attraverso corruzione, estorsione, traffico di droga e altre attività illecite."
facts.Milano.mafia="C'è una significativa presenza mafiosa a Milano; la città è stata da tempo infiltrata da vari gruppi di criminalità organizzata, tra cui la 'Ndrangheta dalla Calabria, la Camorra da Napoli e famiglie criminali milanesi autoctone; le radici del problema della mafia a Milano risalgono agli anni '60, quando le organizzazioni criminali hanno iniziato a stabilire una presenza nella città e nella regione della Lombardia circostante; nel corso del tempo, hanno diversificato le loro attività dai racket tradizionali come l'estorsione e il traffico di droga, all'infiltrazione nell'economia legale attraverso il riciclaggio di denaro e la corruzione; un rapporto del 2018 commissionato dalla regione Lombardia ha rilevato che circa 45 diverse bande di tipo mafioso stavano operando a Milano, collaborando in varie attività criminali; la 'Ndrangheta in particolare è diventata una forza dominante, con il potente clan Valle con base a Milano che controlla gran parte del traffico di droga e delle operazioni di riciclaggio di denaro della città; l'infiltrazione mafiosa si è estesa anche alle sfere politiche e imprenditoriali, con politici, avvocati e funzionari corrotti che collaborano con i gruppi di criminalità organizzata; casi di alto profilo come lo scandalo 'Mafia Capitale' del 2014 hanno esposto la profondità di queste alleanze improprie a Milano; mentre la presenza mafiosa della città è stata a lungo negata o sottovalutata, recenti arresti e indagini hanno reso chiaro che Milano non è più immune dai tentacoli della criminalità organizzata in Italia; affrontare questo problema radicato rimane una sfida costante per le forze dell'ordine e le autorità."
facts.Napoli.mafia="Napoli ha una lunga storia di attività mafiosa, principalmente associata alla Camorra, una delle organizzazioni criminali più antiche e potenti d'Italia; la Camorra ha profonde radici a Napoli e nella regione della Campania circostante, controllando varie attività illegali come il traffico di droga, l'estorsione e il racket; l'influenza dell'organizzazione si estende anche alle attività legittime, permettendole di riciclare denaro e espandere i suoi affari criminali; la presenza della Camorra a Napoli ha portato a elevati livelli di violenza e corruzione, incidendo sulla vita quotidiana dei residenti e delle imprese della zona; gli sforzi per combattere la Camorra sono in corso, con le agenzie di applicazione della legge che prendono di mira figure chiave e operazioni per indebolire la presa dell'organizzazione sulla città; nonostante questi sforzi, la Camorra rimane una forza significativa a Napoli, ponendo sfide alle autorità e alla comunità nella loro lotta contro la criminalità organizzata."
facts.Bari.mafia="Bari e la regione circostante della Puglia sono da lungo tempo influenzate da vari gruppi criminali organizzati, incluso la Sacra Corona Unita, un'organizzazione di tipo mafioso emersa negli anni '80; la Sacra Corona Unita è stata coinvolta in una serie di attività criminali come il traffico di droga, l'estorsione e il riciclaggio di denaro; il gruppo ha anche infiltrato imprese legittime e circoli politici, utilizzando la corruzione e l'intimidazione per espandere il suo potere e la sua influenza; gli sforzi delle forze dell'ordine hanno portato a numerosi arresti e condanne di membri della Sacra Corona Unita, ma l'organizzazione continua a mantenere una presenza a Bari e nelle aree circostanti; oltre alla Sacra Corona Unita, altri gruppi criminali, incluso la 'Ndrangheta e la Camorra, hanno stabilito una base a Bari, complicando ulteriormente la lotta contro la criminalità organizzata nella città."

facts.Catania.mafia="Catania è stata un punto caldo per l'attività della mafia, particolarmente legata ai clan della Cosa Nostra operanti nella zona; recenti operazioni della polizia a Catania hanno portato a significativi arresti, con 40 persone detenute in un'operazione mirata ai clan della Cosa Nostra nella città; le indagini hanno scoperto collegamenti tra gruppi mafiosi e attività di traffico di droga a Catania, con figure chiave come Massimiliano Arena, Marco Turchetti, Rosario Turchetti e Angelo Patanè implicati in queste operazioni criminali; la presenza della criminalità organizzata a Catania è stata evidenziata anche dall'associazione della città con i potenti clan della 'Ndrangheta, noti per il loro coinvolgimento nel riciclaggio di denaro, nel traffico di droga e nel contrabbando di armi in tutta Europa; l'epidemia di crimine della città, inclusi scippi e rapine di auto, ha sollevato preoccupazioni sull'influenza delle famiglie mafiose della Sicilia a Catania, con gli sforzi in corso della polizia italiana per frenare queste attività criminali e smantellare le reti della mafia che operano nella regione."

facts.Palermo.mafia="Palermo, la capitale della Sicilia, è da lungo tempo considerata il luogo di nascita e il baluardo della Mafia siciliana, nota anche come Cosa Nostra. La città ha una storia radicata di influenza mafiosa, che risale alla metà del XIX secolo quando eserciti privati, o 'mafie', venivano assunti da proprietari assenti per proteggere le loro tenute dai banditi. Nel tempo, queste 'mafie' si sono evolute in un'organizzazione criminale potente che ha ampliato le sue attività oltre la semplice protezione, impegnandosi nell'estorsione, nell'arbitrato delle dispute e nella supervisione di accordi e transazioni illegali. Nel XX secolo, la Mafia si era radicata nel tessuto politico, economico e sociale di Palermo, esercitando un'influenza e un controllo significativi. La presenza della Mafia a Palermo è stata segnata da periodi sia di soppressione che di rinascita. Negli anni '20, il prefetto nominato dal dittatore fascista Benito Mussolini, Cesare Mori, ha lanciato una repressione che ha temporaneamente interrotto le operazioni della Mafia. Tuttavia, l'organizzazione ha riacquistato forza dopo l'invasione alleata della Sicilia nel 1943, quando molti mafiosi imprigionati furono rilasciati e reinsediati in posizioni di potere. Gli anni '80 e '90 sono stati particolarmente turbolenti per Palermo, poiché l'influenza e le attività criminali della Mafia sono aumentate, portando a un aumento della violenza e ad assassinii di alto profilo mirati a figure antimafia, come gli omicidi nel 1992 dei giudici Giovanni Falcone e Paolo Borsellino. Nonostante gli sforzi in corso delle forze dell'ordine e del governo italiano per combattere il controllo della Mafia su Palermo, la città rimane un baluardo della criminalità organizzata, con la Cosa Nostra che continua a esercitare il suo potere e il suo controllo su vari aspetti della vita nella capitale siciliana."

facts.Torino.mafia="Ci sono prove della presenza e dell'attività della mafia a Torino e nella regione del Piemonte. Le indagini hanno rivelato l'infiltrazione della mafia nell'economia legale, particolarmente legata a progetti edili e appalti pubblici. Gruppi criminali come la 'Ndrangheta calabrese e le organizzazioni mafiose nigeriane hanno stabilito una base a Torino, impegnandosi in attività come il traffico di droga, l'estorsione e il riciclaggio di denaro. Sebbene l'estensione dell'influenza della mafia nella città non sia del tutto chiara dalle informazioni disponibili, è evidente che gruppi criminali organizzati abbiano gestito una presenza e esercitato il loro potere a Torino."

facts.Genova.mafia="La 'Ndrangheta, un potente gruppo criminale organizzato calabrese, ha una presenza significativa e influenza a Genova e nella regione circostante della Liguria. Le indagini hanno rivelato l'infiltrazione della mafia in aziende e progetti edili, inclusa la tragedia del crollo del ponte di Genova del 2018. La presenza della mafia a Genova è ulteriormente evidenziata dall'esistenza di un'esperienza chiamata 'Mafia Tour' organizzata dall'associazione Libera, che mira a mettere in evidenza i luoghi simbolici dell'attività mafiosa nella città e a educare le persone sulle realtà della criminalità organizzata."

facts.Venezia.mafia="La mafia ha una presenza significativa a Venezia, particolarmente sotto forma della 'Ndrangheta calabrese. Il gruppo ha infiltrato vari settori dell'economia della città, inclusi costruzioni, turismo e finanza. Hanno stabilito una rete di hotel, ristoranti e altre attività orientate al turismo per riciclare denaro proveniente da attività illegali come il traffico di droga e il traffico di armi. L'influenza della mafia a Venezia è ulteriormente evidente dall'alto tasso di cambiamenti di proprietà tra hotel e pizzerie, spesso utilizzati come copertura per attività criminali. Le autorità hanno faticato a tenere il passo con le operazioni della mafia, con nuovi gruppi di cassieri di casinò e proprietari di hotel corrotti emergere dopo ogni arresto. La lotta per il potere della mafia a Venezia è in corso, con una recente esecuzione simulata di un funzionario locale che evidenzia il pericolo e l'imprevedibilità della situazione."

facts.Messina.mafia="La mafia ha una presenza significativa a Messina, particolarmente con l'influenza del clan Romeo-Santapaola. Questo clan detiene il potere nella città, con stretti legami con la Cosa Nostra a Palermo e il controllo su affari illeciti. Il panorama mafioso a Messina coinvolge varie entità criminali, con la provincia che mantiene una predominanza di gruppi mafiosi. La mafia a Messina è intrecciata con il clan Romeo-Santapaola, che svolge affari e attività criminali nella regione. La Dia riferisce che la maggior parte dei clan mafiosi a Messina, tranne uno, sono sotto l'influenza della famiglia Romeo-Santapaola con sede a Catania. Il controllo della mafia a Messina è evidenziato dalla continua evoluzione del panorama criminale, con la città che è un centro per varie entità criminali."

facts.Firenze.mafia="Ci sono prove della presenza e dell'influenza della mafia a Firenze. La città è stata colpita dalle attività mafiose, inclusa l'esplosione del 1993 a Via dei Georgofili perpetrata dalla Mafia siciliana, che ha causato cinque morti e 48 feriti. Questo attacco faceva parte di una serie di atti di terrorismo ordinati dalla Mafia in risposta a questioni interne e azioni dello stato. Inoltre, ci sono preoccupazioni per l'infiltrazione e le attività criminali della mafia a Firenze, con segnalazioni che evidenziano la lotta della città con la criminalità organizzata e le gang."
facts.Caltanissetta.mafia="A Caltanissetta e a Gela, la mafia, in particolare Cosa Nostra, ha una forte presenza. Gruppi criminali come i Rinzivillo e gli Emmanuello sono attivi nonostante le azioni delle forze dell'ordine. La mafia locale è nota per il controllo e l'influenza sul territorio, garantendo ordine e silenzio. Operazioni recenti hanno portato all'arresto di 55 persone legate alla mafia, accusate di vari reati tra cui traffico di droga ed estorsione. Inoltre, un terreno confiscato a un imprenditore legato a Cosa Nostra è stato assegnato al Comune di Caltanissetta per fini sociali e agricoli."
facts.Bologna.mafia="Bologna e la regione dell'Emilia-Romagna sono storicamente libere da significativa presenza della mafia. Tuttavia, rapporti e indagini recenti rivelano segni di infiltrazione della mafia nella zona. Un caso giudiziario storico del 2013 a Bologna ha riconosciuto l'esistenza di un gruppo criminale legato alla 'Ndrangheta operante nella provincia, coinvolto in un'operazione illegale su larga scala di gioco d'azzardo. Questo ha segnato la prima volta che il Tribunale di Bologna ha riconosciuto un gruppo legato alla mafia nella storia della regione. Le preoccupazioni sulle attività della mafia a Bologna includono il sequestro di milioni di euro da parte di individui con presunti legami con la 'Ndrangheta, indicando una crescente influenza della mafia nell'economia e nelle imprese della regione."
facts.Cosenza.mafia="Cosenza ha una storia di attività mafiosa legata alla 'Ndrangheta, una delle organizzazioni criminali più potenti in Italia. La 'Ndrangheta ha una forte presenza nella regione Calabria, dove Cosenza è situata, e controlla diverse attività illegali come il traffico di droga, l'estorsione e il racket. L'influenza della 'Ndrangheta si estende anche alle attività legittime, permettendole di riciclare denaro e espandere i suoi affari criminali. La presenza della 'Ndrangheta a Cosenza ha portato a elevati livelli di violenza e corruzione, incidendo sulla vita quotidiana dei residenti e delle imprese della zona. Gli sforzi per combattere la 'Ndrangheta sono in corso, con le agenzie di applicazione della legge che prendono di mira figure chiave e operazioni per indebolire la presa dell'organizzazione sulla città. Nonostante questi sforzi, la 'Ndrangheta rimane una forza significativa a Cosenza, ponendo sfide alle autorità e alla comunità nella loro lotta contro la criminalità organizzata."
facts.Siracusa.mafia="Siracusa ha una storia di attività mafiosa legata alla mafia siciliana, nota come Cosa Nostra. La mafia siciliana ha una forte presenza nella regione Sicilia, dove Siracusa è situata, e controlla diverse attività illegali come il traffico di droga, l'estorsione e il racket. L'influenza della mafia siciliana si estende anche alle attività legittime, permettendole di riciclare denaro e espandere i suoi affari criminali. La presenza della mafia siciliana a Siracusa ha portato a elevati livelli di violenza e corruzione, incidendo sulla vita quotidiana dei residenti e delle imprese della zona. Gli sforzi per combattere la mafia siciliana sono in corso, con le agenzie di applicazione della legge che prendono di mira figure chiave e operazioni per indebolire la presa dell'organizzazione sulla città. Nonostante questi sforzi, la mafia siciliana rimane una forza significativa a Siracusa, ponendo sfide alle autorità e alla comunità nella loro lotta contro la criminalità organizzata."
facts["Reggio Calabria"].mafia="Reggio Calabria e la regione della Calabria sono riconosciute come roccaforti della 'Ndrangheta, una delle organizzazioni mafiose più potenti d'Italia. La 'Ndrangheta ha un'influenza radicata nella Calabria, impegnandosi in varie attività criminali come il traffico di droga, l'estorsione, il riciclaggio di denaro e la corruzione. Reggio Calabria, storicamente sciolta dal governo a causa dell'infiltrazione della mafia, rimane una base operativa chiave per la 'Ndrangheta. La regione ha una storia significativa di arresti e condanne legati alla mafia, mostrando il controllo della 'Ndrangheta attraverso violenza e intimidazione per sostenere le sue imprese criminali. La dominanza della 'Ndrangheta a Reggio Calabria solidifica il suo status come una delle principali roccaforti della mafia in Italia."
facts["L'Aquila"].mafia="L'Aquila, la città capoluogo della regione Abruzzo, è stata presa di mira da varie organizzazioni mafiose. La mafia nigeriana è stata attiva nella città, portando a operazioni della polizia e arresti. L'Aquila è stata anche collegata a Matteo Messina Denaro, un prominente capo mafia siciliano che è stato ricoverato in ospedale nella città prima della sua morte. Inoltre, la 'mafia dei pascoli' ha infiltrato i settori agricoli e zootecnici locali, influenzando le imprese e l'economia regionale. Queste attività criminali mettono in evidenza la presenza e l'influenza dei gruppi criminali organizzati a L'Aquila, ponendo sfide per la città e la regione Abruzzo."
facts.Potenza.mafia="Potenza, in Basilicata, è interessata da una significativa presenza di organizzazioni criminali, tra cui la 'Ndrangheta e la Camorra. La 'Ndrangheta è attiva nella provincia di Potenza, dove i clan hanno la caratteristica di \"mimetizzarsi nel contesto economico, di svolgere attività lecite\". La Camorra è presente nella zona, con la sua influenza estesa anche alle attività illegali come il traffico di droga. La criminalità in Basilicata è caratterizzata da una forte presenza di clan gambiani e nigeriani che si dedicano al traffico di droga. La situazione criminale è aggravata dalla prossimità geografica con regioni come la Campania, la Puglia e la Calabria, dove le mafie storiche hanno una forte presenza. La regione rischia di diventare un hub per alcuni traffici criminali, tra cui il traffico di droga, che si trova inserito nell'asse Puglia-Sicilia."
}  
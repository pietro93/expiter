import * as pb from './js/pageBuilder.js'
import {es} from './js/pageBuilder.js'
import { createServer } from 'http';
import fetch from 'node-fetch';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jsdom = require('jsdom')
const https = require("follow-redirects").https;

createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Hello World!');
}).listen(8080);

var dataset;
var provinces = {};
var facts={};
var north=["Lombardia","Valle d'Aosta","Piemonte","Liguria","Trentino-Alto Adige", "Friuli-Venezia Giulia","Veneto","Emilia-Romagna"];
var center=["Lazio","Toscana","Marche","Umbria"];
var south=["Abruzzo","Molise","Campania","Puglia","Basilicata","Calabria","Sicilia","Sardegna"]
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

        let comuniSiteMap='<?xml version="1.0" encoding="UTF-8"?> '+'\n'+
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> '+'\n';
       
        for (let i = 93; i < 96; i++){
            let province = dataset[i];
            let sidebar=pb.setSideBarFR(province)
       
            if (fs.existsSync('temp/'+province.Name+'-comuni.json')){
            let parsedData = fs.readFileSync('temp/'+province.Name+'-comuni.json','utf8');
            let dic=JSON.parse(parsedData);
            dataset[i]["Comuni"]=dic
            }
            else console.log("Missing comuni: "+province.Name)

            let comuni=dataset[i]["Comuni"];

            let comdataset = fs.readFileSync('comuni.json','utf8');
            let comdata=JSON.parse(comdataset);
            let comindex = []
            for (let i=0; i<comdata.length; i++) comindex.push(comdata[i].Name)

            for (let c in comuni){
            
            let comune=comuni[c];

            comune.Name = comune.Name[0] + comune.Name.toLowerCase().slice(1); //decapitalize all letters but the first

            var dirName = 'es/municipios/'+es(province.Name).replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()+'/';
            var fileName = comune.Name.replace('(*)','').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
            let ci=-1;

            if (comindex.includes(comune.Name)) {
              ci = comindex.indexOf(comune.Name)
              console.log("found some extra info about "+comune.Name+" at position "+ ci)
            }
            if (ci>-11){ //this only updates towns in comuni.js
            console.log("Writing comune \""+comune.Name+"\" ("+province.Name+") into file")

            let urlPath = dirName+fileName;
          urlPath = "https://expiter.com/"+urlPath+"/"
          comuniSiteMap+='<url>'+
          '<loc>'+urlPath+'</loc>'+
          '</url>'+'\n'

            const dom = new jsdom.JSDOM(
            "<html lang='es'>"+
            '<head><meta charset="utf-8">'+
            '<link rel="canonical" href="https://expiter.com/'+dirName+fileName+'/"/>'+
            '<link rel="alternate" hreflang="en" href="https://expiter.com/'+dirName.replace('es/','')+fileName+'/" />'+
            '<link rel="alternate" hreflang="it" href="https://expiter.com/'+dirName.replace('es/','it')+fileName+'/" />'+
            '<meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale-1,user-scalable=0">'+
            '<script type="text/javascript" src="https://expiter.com/jquery3.6.0.js" defer></script>'+
            '<script type="text/json" src="https://expiter.com/dataset.json"></script>'+
            '<script type="text/javascript" src="https://expiter.com/script.js" defer></script>'+
            '<script type="text/javascript" src="https://expiter.com/bootstrap-toc.js" defer></script>'+
            pb.headerScripts()+
            '<link rel="stylesheet" href="https://expiter.com/fonts.css" media="print" onload="this.media=\'all\'"></link>'+
            '<link rel="stylesheet" href="https://expiter.com/bulma.min.css">'+
            '<link rel="stylesheet" href="https://expiter.com/style.css?v=1.1">'+
            '<link rel="stylesheet" href="https://expiter.com/comuni/comuni-style.css">'+
            
            '<meta name="description" content="Informaciones sobre el municipio de '+comune.Name+', en la provincia de '+province.Name+'. Población, calidad de vida, vida nocturna, turismo, etc." />'+
'<meta name="keywords" content="'+comune.Name+' '+es(province.Region)+', '+comune.Name+' '+province.Name+', población de '+comune.Name+','+comune.Name+' información, '+comune.Name+' vida nocturna, '+comune.Name+' vida" />'+
"<title>"+comune.Name+" - Informaciones sobre el municipio en la provincia de "+es(province.Name)+", "+es(province.Region)+"</title>"+
'<link rel="icon" type="image/x-icon" title="Expiter - Expatriados y nómadas en Italia" href="https://expiter.com/img/expiter-favicon.ico"></link>'+

            
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
        '<div class="hero" style="background-image:url(\'https://expiter.com/img/'+province.Abbreviation+'.webp\')" '+'title="'+comune.Name+", "+province.Name+', Italia"'+'>'+
        '</div><h1 class="title">Municipio de </h1>'+
        '<section id="'+comune.Name+' Info">'+
        '<center><table id="list">'+
        '<tr><th><b>Nombre</b></th><th>'+comune.Name+'</th></tr>'+
        '<tr><th><b>Provincia</b></th><th>'+es(province.Name)+'</th></tr>'+
        '<tr><th><b>Región</b></th><th>'+es(province.Region)+'</th></tr>'+
        '<tr><th><b>Población</b></th><th>'+comune.Population+'</th></tr>'+
        '<tr><th><b>Densidad</b></th><th>'+comune.Density+' hab./km²</th></tr>'+
        '<tr><th><b>Altitud</b></th><th>'+comune.Altitude+'m</th></tr>'+
        '<tr><th><b>Zona climática</b></th><th>'+(comune.ClimateZone ? comune.ClimateZone : "?")+'</th></tr>'+       
        '</table></center>'+
        '<p id="info"></p>'+
        '<p id="tabs"></p>'+
        '</center><p id="related"></p></center>'+
        '</section>'+
        '<aside class="menu sb mobileonly">'+sidebar+'</aside>\n'+
        '</body></html>'
        )

        const $ = require('jquery')(dom.window)

$("h1").text(es(comune.Name)+", "+es(province.Region))
if (dataset[i].Comuni!=undefined){
let list=$("#list").html();

$("#list").html(list);
let intro=comune.Name+" es un municipio de "+comune.Population+" habitantes ubicado en "+
"<a href='https://expiter.com/es/municipios/provincia-de-"+handle(es(province))+"'>la provincia de "+es(province.Name)+"</a> en la región "+
es(province.Region)+" en "+(center.includes(province.Region)?"Italia central":(south.includes(province.Region)?"Italia meridional":"Italia septentrional"))+".";

intro+='\n'+'Tiene una <b>densidad de población de '+comune.Density+' habitantes por km²</b> y una <b>altitud de '+comune.Altitude+' metros</b> sobre el nivel del mar.'+'\n'

intro+='</br></br><b>La población de '+comune.Name+"</b> representa aproximadamente "+((comune.Population.split('.').join("")*100)/province.Population).toFixed(2)+"% de la población total de la provincia de "+es(province.Name)+
" y aproximadamente "+((comune.Population.split('.').join("")*100)/60260456).toFixed(5)+"% de la población total de Italia en 2022."

if (ci>0){
  intro+='<h2>Información sobre '+comune.Name+'</h2>'+comdata[ci].Attractions+'<br><br>'+comdata[ci].Histoire
}


let zoneAtext="una de las dos municipalidades más calurosas de Italia, junto con"+(comune.Name=="Porto Empedocle"?
" las islas Pelagias de <a href='https://expiter.com/es/municipios/agrigente/lampedusa-e-linosa/>Lampedusa y Linosa</a>, que están geográficamente cerca de África":
'de la municipalidad de <a href="https://expiter.com/es/municipios/agrigente/porto-empedocle/">Porto Empedocle</a>'+
" en Sicilia 'continental', también en la provincia de Agrigento")
let climate='<h3>Clima</h3>'+
'<b>'+comune.Name+'</b> está clasificada como una <b>Zona Climática '+comune.ClimateZone+'</b>, es '+
(comune.ClimateZone==="A"?zoneAtext
:(comune.ClimateZone==="B"?"uno de los lugares más cálidos y soleados de Italia"
:(comune.ClimateZone==="C"?"una zona bastante cálida"
:(comune.ClimateZone==="D"?"con temperaturas templadas según los estándares del país"
:(comune.ClimateZone==="E"?"una municipalidad bastante fría"
:(comune.ClimateZone==="F"?"una de las municipalidades más frías en Italia"
:""))))))+"."+'\n'
climate+=
'El clima local se caracteriza por '+
(["Sicilia","Calabria","Cerdeña"].includes(province.Region)?"inviernos cortos y suaves y veranos calurosos y secos. Las precipitaciones se concentran principalmente en invierno."
:(["Liguria","Toscana","Lacio","Campania"].includes(province.Region)?"inviernos cortos y suaves con veranos calurosos y bastante ventosos y precipitaciones raras."
:(["Emilia-Romaña","Véneto","Lombardía","Piamonte"].includes(province.Region)?"inviernos largos y fríos y veranos muy calurosos y secos. Hay frecuentes precipitaciones en otoño y primavera, y neblinas bastante comunes."
:(["Friuli-Venecia Julia","Marcas","Abruzos","Apulia"].includes(province.Region)?"inviernos fríos y veranos calurosos y ventosos, con lluvias bastante frecuentes durante todo el año."
:(["Umbría","Molise","Basilicata"].includes(province.Region)?"inviernos largos y fríos con frecuentes nevadas en las zonas montañosas, y veranos calurosos y bastante secos."
:((["Trentino-Alto Adigio","Valle de Aosta"].includes(province.Region)||
["Belluno","Verbano-Cusio-Ossola","Udine","Como","Bérgamo","Varés","Biella"].includes(province.Name))?
"inviernos largos y muy fríos con muchas nevadas, y veranos cortos y no excesivamente calurosos."
:""
))))))+'\n </br></br>'+"La provincia de "+es(province.Name)+" tiene en promedio "+((province.HotDays/3.5)*12).toFixed(2)+" días de calor (temperaturas por encima de 30°C) y "+
((province.ColdDays/3.5)*12).toFixed(2)+" días de frío (temperaturas por debajo de 5°C) al año. Llueve (o nieva) aproximadamente "+(province.RainyDays*12).toFixed(2)+" días al año. "+
(province.FoggyDays<1?"Hay muy poco neblina durante el año.":"Hay "+((province.FoggyDays/3.5)*12).toFixed(2)+" días de neblina durante el año.")+
" "+comune.Name+" recibe aproximadamente "+province.SunshineHours/30+" horas de sol al día.";

$("#info").html(intro+climate)
   
var info=getInfo(comune,province)
var separator='</br><span class="separator"></span></br>'
var getyourguide='<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>'

$("#info").append(info.disclaimer)
$("#info").append("<h2>Mapa de "+comune.Name+"</h2>")
$("#info").append(info.map)
$("#info").append(separator)
$("#info").append(getyourguide)
$("#info").append(separator)
$("#info").append("<h2>Provincia de "+es(province.Name)+"</h2>")
$("#tabs").append(info.tabs)
$("#related").append(info.nearby)
$("#related").append(info.related)
appendProvinceData(province,$)
pb.setNavBarFR($)
}

let html = dom.window.document.documentElement.outerHTML;

if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName);
    }

if (dataset[i].Comuni!=undefined)
fs.writeFile(dirName+fileName+".html", html, function (err, file) {
   if (err) throw err;
   console.log(dataset[i].Name+".html"+' Saved!');
});
}
}
/*
comuniSiteMap+='</urlset>'
fs.writeFile("sitemap/towns-sitemap-4-es.xml", comuniSiteMap, function (err, file) {
if (err) throw err;
console.log("towns-sitemap"+' Saved!');
})*/
}
} 
)

    
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
 '<figure class="column is-3 related"><a href="https://expiter.com/es/provincia/'+es(province.Name).replace(/\s+/g,"-").replace("'","-").toLowerCase()+'/">'+
 '<img title="'+es(province.Name)+'" loading="lazy" src="'+
 'https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-280,h-140,c-at_least,q-5" '+
 'alt="Provincia de '+es(data[i].Name)+', '+es(data[i].Region)+'"></img>'+
 '<figcaption>'+es(province.Name)+", "+es(province.Region)+"</figcaption></a></figure>";
}

avg=data[107];

}

function getInfo(comune,province){
let name=comune.Name;

let region=regions[province.Region];

let info = {}

info.disclaimer = '</br></br><center><span id="disclaimer">Esta página contiene enlaces de afiliados. Como asociado de Amazon y Viator, podemos ganar comisiones por compras elegibles.</span></center>';

info.map='</br><center class="map"><iframe id="ggmap" src="https://maps.google.it/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>'+
'Mostrar: '+
'<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'+Cose+da+fare&output=embed")\' target="_blank"><b><ej>🎭</ej>Atracciones</b></a> '+
'<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'+Musei&output=embed")\' target="_blank"><b><ej>🏺</ej>Museos</b></a> '+
'<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'+Ristoranti&output=embed")\' target="_blank"><b><ej>🍕</ej>Restaurantes</b></a> '+
'<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'+Bar&output=embed")\' target="_blank"><b><ej>🍺</ej>Bares</b></a> '+
'<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'+Stabilimento+balneare&output=embed")\' target="_blank"><b><ej>🏖️</ej>Playas</b></a> '+
'<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'+Area+per+passeggiate&output=embed")\' target="_blank"><b><ej>⛰️</ej>Excursiones</b></a> '+
'<a href="https://www.amazon.es/ulp/view?&linkCode=ll2&tag=expiter-21&linkId=5824e12643c8300394b6ebdd10b7ba3c&language=es_ES&ref_=as_li_ss_tl" target="_blank"><b><ej>📦</ej>Puntos de recogida de Amazon</b></a> '+
'</center>'


let target, related1, related2, related3, related4;

(region.Name==="Valle d'Aosta"?target=facts[region.Name]["provinces"].concat(facts["Piemonte"]["provinces"]):
(region.Name==="Trentino-Alto Adigio"?target=facts[region.Name]["provinces"].concat(facts["Veneto"]["provinces"]).concat(["Brescia","Sondrio"]):
(region.Name==="Molise"?target=facts[region.Name]["provinces"].concat(facts["Abruzzo"]["provinces"]):
(region.Name==="Abruzzo"?target=facts[region.Name]["provinces"].concat(facts["Molise"]["provinces"]):
(region.Name==="Emilia-Romagna"?target=facts[region.Name]["provinces"].concat(["Prato","Mantova","Cremona","Rovigo","Massa-Carrara","Lucca","Pistoia","Pesaro e Urbino","Arezzo"]):
(region.Name==="Liguria"?target=facts[region.Name]["provinces"].concat(facts["Piemonte"]["provinces"]):
(region.Name==="Piemonte"?target=facts[region.Name]["provinces"].concat(facts["Lombardia"]["provinces"]):
(region.Name==="Lombardia"?target=facts[region.Name]["provinces"].concat(facts["Piemonte"]["provinces"]):
(region.Name==="Friuli-Venezia Giulia"?target=facts[region.Name]["provinces"].concat(facts["Veneto"]["provinces"]):
(region.Name==="Basilicata"?target=facts[region.Name]["provinces"].concat(facts["Campania"]["provinces"]).concat(facts["Puglia"]["provinces"]).concat(["Cosenza"]):
(region.Name==="Puglia"?target=facts[region.Name]["provinces"].concat(facts["Basilicata"]["provinces"]).concat(["Campobasso","Benevento","Avellino"]):
(region.Name==="Umbria"?target=facts[region.Name]["provinces"].concat(facts["Marche"]["provinces"]).concat(["Arezzo","Siena","Viterbo","Rieti"]):
target=facts[region.Name]["provinces"]))))))))))));
(province.Name==="Reggio Calabria"?target=target.concat(["Messina"]):
(province.Name==="Messina"?target=target.concat(["Reggio Calabria"]):
(province.Name==="Torino"?target=target.concat(["Aosta"]):
(province.Name==="Cosenza"?target=target.concat(facts["Basilicata"]["provinces"]):
(province.Name==="Salerno"?target=target.concat(facts["Basilicata"]["provinces"]):
(province.Name==="Bolzano"?target=target.concat(facts["Veneto"]["provinces"]):
(province.Name==="Bolzano"?target=target.concat(["Trento"]):
(province.Name==="Trento"?target=target.concat(["Bolzano"]):
(province.Name==="Trento"?target=target.concat(facts["Veneto"]["provinces"]):
""
)))))))));

target=target.filter(item => item !== name)
related1=target[Math.floor(Math.random()*target.length)]
target=target.filter(item => item !== related1)
related2=target[Math.floor(Math.random()*target.length)]
target=target.filter(item => item !== related2)
related3=target[Math.floor(Math.random()*target.length)]
target=target.filter(item => item !== related3)
related4=target[Math.floor(Math.random()*target.length)]
info.related='<h2>Provincias Cercanas a '+es(province.Name)+'</h2> '+
'<row class="columns is-multiline is-mobile"> '+        
facts[related1].snippet+
facts[related2].snippet+
facts[related3].snippet+
facts[related4].snippet+'</row>'

info.tabs='<div class="tabs effect-3">'+
        '<input type="radio" id="tab-1" name="tab-effect-3" checked="checked">'+
        '<span>Calidad de Vida</span>'+
        '<input type="radio" id="tab-2" name="tab-effect-3">'+
        '<span>Costo de Vida</span>'+
        '<input type="radio" id="tab-3" name="tab-effect-3">'+
        '<span>Nómadas Digitales</span>'+
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
      '</div></div>';

info.nearby='<h2>Municipios en la Provincia de '+es(province.Name)+'</h2>'+'\n'
      for (let p in province.Comuni){
        if (province.Comuni[p].Name!=comune)
        info.nearby+='<b><a href="https://expiter.com/es/municipios/'+handle(es(province))+'/'+
        handle(province.Comuni[p])+'/">'+province.Comuni[p].Name+'</a></b>'+' '
      }
       
        return info;
      }

function handle(comune){
        return comune.Name.replace('(*)','').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()
   }
   function appendProvinceData(province, $){
    let tab1=$("#Quality-of-Life > .column");
let tab2=$("#Cost-of-Living > .column"); 
let tab3=$("#Digital-Nomads > .column"); 
tab1[0].innerHTML+=('<p><ej>👥</ej>Población: <b>'+province.Population.toLocaleString('es', {useGrouping:true}) +'</b>');
tab1[0].innerHTML+=('<p><ej>🚑</ej>Salud: '+ qualityScore("Healthcare",province.Healthcare));
tab1[0].innerHTML+=('<p><ej>📚</ej>Educación: '+ qualityScore("Education",province.Istruzione));
tab1[0].innerHTML+=('<p><ej>👮🏽‍♀️</ej>Seguridad: '+ qualityScore("Safety",province.Safety));
tab1[0].innerHTML+=('<p><ej>🚨</ej>Criminalidad: '+ qualityScore("Crime",province.Crime));

tab1[0].innerHTML+=('<p><ej>🚌</ej>Transporte: '+ qualityScore("PublicTransport",province["PublicTransport"]));
tab1[0].innerHTML+=('<p><ej>🚥</ej>Tráfico: '+ qualityScore("Traffic",province["Traffic"]));
tab1[0].innerHTML+=('<p><ej>🚴‍♂️</ej>Bicicleta: '+ qualityScore('CyclingLanes',province['CyclingLanes']));
tab1[0].innerHTML+=('<p><ej>🏛️</ej>Cultura: '+ qualityScore("Culture",province.Culture));
tab1[0].innerHTML+=('<p><ej>🍸</ej>Vida Nocturna: '+ qualityScore("Nightlife",province.Nightlife));
tab1[0].innerHTML+=('<p><ej>⚽</ej>Deportes y Recreación: '+ qualityScore("Sports & Leisure",province["Sports & Leisure"]));

tab1[1].innerHTML+=('<p><ej>🌦️</ej>Clima: '+ qualityScore("Climate",province.Climate));
tab1[1].innerHTML+=('<p><ej>☀️</ej>Sol: '+ qualityScore("SunshineHours",province.SunshineHours));
tab1[1].innerHTML+=('<p><ej>🥵</ej>Veranos '+ qualityScore("HotDays",province.HotDays));
tab1[1].innerHTML+=('<p><ej>🥶</ej>Inviernos: '+ qualityScore("ColdDays",province.ColdDays));
tab1[1].innerHTML+=('<p><ej>🌧️</ej>Lluvia: '+ qualityScore("RainyDays",province.RainyDays));
tab1[1].innerHTML+=('<p><ej>🌫️</ej>Neblina: '+ qualityScore("FoggyDays",province.FoggyDays));
tab1[1].innerHTML+=('<p><ej>🍃</ej>Calidad del Aire: '+ qualityScore("AirQuality",province["AirQuality"]));

tab1[1].innerHTML+=('<p><ej>👪</ej>Para Familias: '+ qualityScore("Family-friendly",province["Family-friendly"]));
tab1[1].innerHTML+=('<p><ej>👩</ej>Para Mujeres: '+ qualityScore("Female-friendly",province["Female-friendly"]));
tab1[1].innerHTML+=('<p><ej>🏳️‍🌈</ej>LGBTQ+: '+ qualityScore("LGBT-friendly",province["LGBT-friendly"]));
tab1[1].innerHTML+=('<p><ej>🥗</ej>Vegano: '+ qualityScore("Veg-friendly",province["Veg-friendly"]));

tab2[0].innerHTML+=('<p><ej>📈</ej>Costo de Vida: '+ qualityScore("CostOfLiving",province["CostOfLiving"]));
tab2[0].innerHTML+=('<p><ej>🧑🏻</ej>Costos (Individual): '+ qualityScore("Cost of Living (Individual)",province["Cost of Living (Individual)"]))
tab2[0].innerHTML+=('<p><ej>👩🏽‍🏫</ej>Costos (Turista): '+ qualityScore("Cost of Living (Nomad)",province["Cost of Living (Nomad)"]))
tab2[0].innerHTML+=('<p><ej>🏠</ej>Alquiler (Estudio): '+ qualityScore("StudioRental",province["StudioRental"]))
tab2[0].innerHTML+=('<p><ej>🏘️</ej>Alquiler (Dos Habitaciones): '+ qualityScore("BilocaleRent",province["BilocaleRent"]))
tab2[0].innerHTML+=('<p><ej>🏰</ej>Alquiler (Tres Habitaciones): '+ qualityScore("TrilocaleRent",province["TrilocaleRent"]))

tab2[1].innerHTML+=('<p><ej>🏙️</ej>Costos de Vivienda: '+ qualityScore("HousingCost",province["HousingCost"]));
tab2[1].innerHTML+=('<p><ej>💵</ej>Salario: '+ qualityScore("MonthlyIncome",province["MonthlyIncome"]));
tab2[1].innerHTML+=('<p><ej>👪</ej>Costos (Familia): '+ qualityScore("Cost of Living (Family)",province["Cost of Living (Family)"]))
tab2[1].innerHTML+=('<p><ej>🏠</ej>Compra (Estudio): '+ qualityScore("StudioSale",province["StudioSale"]))
tab2[1].innerHTML+=('<p><ej>🏘️</ej>Compra (Dos Habitaciones): '+ qualityScore("BilocaleSale",province["BilocaleSale"]))
tab2[1].innerHTML+=('<p><ej>🏰</ej>Compra (Tres Habitaciones): '+ qualityScore("TrilocaleSale",province["TrilocaleSale"]))

tab3[0].innerHTML+=('<p><ej>👩‍💻</ej>Amigable con Nómadas: '+qualityScore("DN-friendly",province["DN-friendly"]))
tab3[0].innerHTML+=('<p><ej>💃</ej>Entretenimiento: '+qualityScore("Fun",province["Fun"]));
tab3[0].innerHTML+=('<p><ej>🤗</ej>Simpatía: '+qualityScore("Friendliness",province["Friendliness"]));
tab3[0].innerHTML+=('<p><ej>🤐</ej>Internacionalidad: '+qualityScore("English-speakers",province["English-speakers"]));
tab3[0].innerHTML+=('<p><ej>😊</ej>Felicidad: '+qualityScore("Antidepressants",province["Antidepressants"]));

tab3[1].innerHTML+=('<p><ej>💸</ej>Gastos para Nómadas: '+ qualityScore("Cost of Living (Nomad)",province["Cost of Living (Nomad)"]))
tab3[1].innerHTML+=('<p><ej>📡</ej>Conexión Ultrarrápida: '+qualityScore("HighSpeedInternetCoverage",province["HighSpeedInternetCoverage"]));
tab3[1].innerHTML+=('<p><ej>📈</ej>Innovación: '+qualityScore("Innovation",province["Innovation"]));
tab3[1].innerHTML+=('<p><ej>🏖️</ej>Playas: '+qualityScore("Beach",province["Beach"]));
tab3[1].innerHTML+=('<p><ej>⛰️</ej>Senderismo: '+qualityScore("Hiking",province["Hiking"]));

   }

   function qualityScore(quality, score) { 
    let expenses=["Cost of Living (Individual)","Cost of Living (Family)","Cost of Living (Nomad)", "StudioRental", "BilocaleRent", "TrilocaleRent", "MonthlyIncome", "StudioSale","BilocaleSale","TrilocaleSale"];
    if (quality == "CostOfLiving" || quality == "HousingCost") {
        if (score < avg[quality] * .8) {
            return "<score class='excellent short'>muy bajo</score>";
        } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
            return "<score class='great medium'>bajo</score>";
        } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
            return "<score class='good medium'>promedio</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
            return "<score class='average long'>alto</score>";
        } else if (score >= avg[quality] * 1.2) {
            return "<score class='poor max'>muy alto</score>";
        }
    } else if (expenses.includes(quality)) {
        if (score < avg[quality] * .8) {
            return "<score class='green'>"+score+"€/m</score>";
        } else if (score >= avg[quality] * 0.8 && score < avg[quality] * 0.95) {
            return "<score class='green'>"+score+"€/m</score>";
        } else if (score >= avg[quality] * 0.95 && score < avg[quality] * 1.05) {
            return "<score class='orange'>"+score+"€/m</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
            return "<score class='red'>"+score+"€/m</score>";
        } else if (score >= avg[quality] * 1.2) {
            return "<score class='red'>"+score+"€/m</score>";
        }
    } else if (quality == "HotDays" || quality == "ColdDays") { 
        if (score < avg[quality] * .8) {
            return "<score class='excellent short'>no "+(quality=="HotDays"?"caluroso":"frío")+"</score>";
        } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
            return "<score class='great medium'>no muy "+(quality=="HotDays"?"caluroso":"frío")+"</score>";
        } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
            return "<score class='good medium'>un poco "+(quality=="HotDays"?"caluroso":"frío")+"</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
            return "<score class='average long'>"+(quality=="HotDays"?"caluroso":"frío")+"</score>";
        } else if (score >= avg[quality] * 1.2) {
            return "<score class='poor max'>muy "+(quality=="HotDays"?"caluroso":"frío")+"</score>";
        }
    } else if (quality == "RainyDays") { 
        if (score < avg[quality] * .8) {
            return "<score class='excellent short'>muy poco</score>";
        } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
            return "<score class='great medium'>poco</score>";
        } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
            return "<score class='good medium'>promedio</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
            return "<score class='average long'>lluvioso</score>";
        } else if (score >= avg[quality] * 1.2) {
            return "<score class='poor max'>muy lluvioso</score>";
        }
    } else if (quality == "FoggyDays") { 
        if (score < avg[quality] * .265) {
            return "<score class='excellent short'>sin niebla</score>";
        } else if (score >= avg[quality] * .265 && score < avg[quality] * .6) {
            return "<score class='great medium'>poco</score>";
        } else if (score >= avg[quality] * .6 && score < avg[quality] * 1.00) {
            return "<score class='good medium'>promedio</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 3) {
            return "<score class='average long'>neblinoso</score>";
        } else if (score >= avg[quality] * 3) {
            return "<score class='poor max'>muy neblinoso</score>";
        }
    } else if (quality == "Crime" || quality == "Traffic") { 
        if (score < avg[quality] * .8) {
            return "<score class='excellent short'>muy bajo</score>";
        } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
            return "<score class='great medium'>bajo</score>";
        } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
            return "<score class='good medium'>medio</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
            return "<score class='average long'>alto</score>";
        } else if (score >= avg[quality] * 1.2) {
            return "<score class='poor max'>muy alto</score>";
        } 
    } else { 
        if (score < avg[quality] * .8) {
            return "<score class='poor short'>malo</score>";
        } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
            return "<score class='average medium'>correcto</score>";
        } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
            return "<score class='good medium'>bueno</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
            return "<score class='great long'>muy bueno</score>";
        } else if (score >= avg[quality] * 1.2) {
            return "<score class='excellent max'>excelente</score>";
        } 
    } 
}

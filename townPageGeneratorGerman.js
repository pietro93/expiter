import * as pb from './js/pageBuilder.js'
import {de} from './js/pageBuilder.js'
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
       
        for (let i = 50; i < 59; i++){
            let province = dataset[i];
            let sidebar=pb.setSideBarDE(province)
       
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


            var dirName = 'de/gemeinden/'+de(province.Name).replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()+'/';
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
            "<html lang='de'>"+
            '<head><meta charset="utf-8">'+
            '<link rel="canonical" href="https://expiter.com/'+dirName+fileName+'/"/>'+
            '<link rel="alternate" hreflang="en" href="https://expiter.com/'+dirName.replace('fr/','')+fileName+'/" />'+
            '<link rel="alternate" hreflang="it" href="https://expiter.com/'+dirName.replace('fr/','it')+fileName+'/" />'+
            '<meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale-1,user-scalable=0">'+
            '<script type="text/javascript" src="https://expiter.com/jquery3.6.0.js" defer></script>'+
            '<script type="text/json" src="https://expiter.com/dataset.json"></script>'+
            '<script type="text/javascript" src="https://expiter.com/script.js" defer></script>'+
            '<script type="text/javascript" src="https://expiter.com/bootstrap-toc.js" defer></script>'+
            '<link rel="stylesheet" href="https://expiter.com/fonts.css" media="print" onload="this.media=\'all\'"></link>'+
            '<link rel="stylesheet" href="https://expiter.com/bulma.min.css">'+
            '<link rel="stylesheet" href="https://expiter.com/style.css?v=1.1">'+
            '<link rel="stylesheet" href="https://expiter.com/comuni/comuni-style.css?v=1.1">'+
            
            '<meta name="description" content="Informationen über die Gemeinde ' + comune.Name + ' in der Provinz ' + de(province.Name) + '. Bevölkerung, Lebensqualität, Nachtleben, Tourismus, usw." />' +
            '<meta name="keywords" content="' + comune.Name + ' ' + de(province.Region) + ', ' + comune.Name + ' ' + de(province.Name) + ', Bevölkerung von ' + comune.Name + ', ' + comune.Name + ' Informationen, ' + comune.Name + ' Nachtleben, ' + comune.Name + ' Leben" />' +
            '<title>' + comune.Name + ' - Informationen über die Gemeinde in der Provinz ' + de(province.Name) + ', ' + de(province.Region) + '</title>' +
            '<link rel="icon" type="image/x-icon" title="Expiter - Auswanderer und digitale Nomaden in Italien" href="https://expiter.com/img/expiter-favicon.ico"></link>'+
            
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
        '<div class="hero" style="background-image:url(\'https://expiter.com/img/'+province.Abbreviation+'.webp\')" '+'title="'+comune.Name+", "+province.Name+', Italy"'+'>'+
        '</div><h1 class="title">Gemeinde von </h1>'+
        '<section id="'+comune.Name+' Info">'+
        '<center><table id="list">'+
        '<tr><th><b>Name</b></th><th>'+comune.Name+'</th></tr>'+
        '<tr><th><b>Provinz</b></th><th>'+de(province.Name)+'</th></tr>'+
        '<tr><th><b>Region</b></th><th>'+de(province.Region)+'</th></tr>'+
        '<tr><th><b>Bevölkerung</b></th><th>'+comune.Population+'</th></tr>'+
        '<tr><th><b>Bevölkerungsdichte</b></th><th>'+comune.Density+' Einwohner/km²</th></tr>'+
        '<tr><th><b>Höhe</b></th><th>'+comune.Altitude+'m</th></tr>'+
        '<tr><th><b>Klimazone</b></th><th>'+(comune.ClimateZone ? comune.ClimateZone : "?")+'</th></tr>'+
        '</table>'+
        '</center>'+
        '</section>'+
        
        '</table></center>'+
        '<p id="info"></p>'+
        '<p id="tabs"></p>'+
        '</center><p id="related"></p></center>'+
        '</section>'+
        '<aside class="menu sb mobileonly">'+sidebar+'</aside>\n'+
        '</body></html>'
        )

        

        const $ = require('jquery')(dom.window)

        
        $("h1").text(de(comune.Name)+", "+de(province.Region))
        if (dataset[i].Comuni!=undefined){
        let list=$("#list").html();
        
        $("#list").html(list);
        
        let intro = comune.Name + " ist eine Gemeinde mit " + comune.Population + " Einwohnern, die sich in " +
    "<a href='https://expiter.com/de/gemeinden/provinz-" + handle(de(province)) + "'>der Provinz " + de(province.Name) + "</a> in der Region " +
    de(province.Region) + " in " + (center.includes(province.Region) ? "Zentralitalien" : (south.includes(province.Region) ? "Süditalien" : "Norditalien")) + " befindet.";

intro += '\n' + 'Sie hat eine <b>Bevölkerungsdichte von ' + comune.Density + ' Einwohnern pro km²</b> und eine <b>Höhe von ' + comune.Altitude + ' Metern</b> über dem Meeresspiegel.' + '\n'

intro += '</br></br><b>Die Bevölkerung von ' + comune.Name + "</b> macht etwa " + ((comune.Population.split('.').join("") * 100) / province.Population).toFixed(2) + "% der Gesamtbevölkerung der Provinz " + province.Name +
    " und etwa " + ((comune.Population.split('.').join("") * 100) / 60260456).toFixed(5) + "% der Gesamtbevölkerung Italiens im Jahr 2022 aus."

if (ci > 0) {
    intro += '<h2>Informationen zu ' + comune.Name + '</h2>' + comdata[ci].Attractions + '<br><br>' + comdata[ci].Histoire
}

let zoneAtext = "eine der beiden heißesten Gemeinden in Italien neben" + (comune.Name == "Porto Empedocle" ?
    " den Pelagischen Inseln von <a href='https://expiter.com/de/gemeinden/agrigento/lampedusa-e-linosa/>Lampedusa und Linosa</a>, die geografisch nah an Afrika liegen" :
    'e Gemeinde von <a href="https://expiter.com/de/gemeinden/agrigento/porto-empedocle/">Porto Empedocle</a> in "Festland-Sizilien", ebenfalls in der Provinz Agrigento')
let climate = '<h3>Klima</h3>' +
    '<b>' + comune.Name + '</b> ist als <b>Klimazone ' + comune.ClimateZone + '</b> klassifiziert, sie ist ' +
    (comune.ClimateZone === "A" ? zoneAtext
        : (comune.ClimateZone === "B" ? "einer der heißesten und sonnigsten Orte in Italien"
            : (comune.ClimateZone === "C" ? "eine ziemlich warme Zone"
                : (comune.ClimateZone === "D" ? "gemäßigte Temperaturen nach Landesnormen"
                    : (comune.ClimateZone === "E" ? "eine ziemlich kalte Gemeinde"
                        : (comune.ClimateZone === "F" ? "eine der kältesten Gemeinden in Italien"
                            : "")))))) + "." + '\n'
    climate +=
                            'Das lokale Klima ist geprägt von ' +
                            (["Sizilien", "Kalabrien", "Sardinien"].includes(province.Region) ? "<b>kurzen und milden Wintern</b> sowie <b>heißen und trockenen Sommern. Die Niederschläge konzentrieren sich hauptsächlich im Winter.</b>" :
                                (["Ligurien", "Toskana", "Latium", "Kampanien"].includes(province.Region) ? "<b>kurzen und milden Wintern</b> mit <b>heißen und ziemlich windigen Sommern</b> und seltenen Niederschlägen." :
                                    (["Emilia-Romagna", "Venetien", "Lombardei", "Piemont"].includes(province.Region) ? "<b>langen und kalten Wintern</b> sowie <b>sehr heißen und trockenen Sommern</b>. Es gibt häufig Niederschläge im Herbst und Frühling sowie verbreiteten <b>Nebel</b>." :
                                        (["Friaul-Julisch Venetien", "Marken", "Abruzzen", "Apulien"].includes(province.Region) ? "<b>kalten Wintern</b> und <b>heißen und windigen Sommern</b> mit ziemlich häufigen Niederschlägen das ganze Jahr über." :
                                            (["Umbrien", "Molise", "Basilikata"].includes(province.Region) ? "<b>langen und kalten Wintern mit häufigem Schneefall in Bergregionen</b> und <b>heißen und ziemlich trockenen Sommern</b>." :
                                                ((["Trentino-Südtirol", "Aostatal"].includes(province.Region) ||
                                                    ["Belluno", "Verbano-Cusio-Ossola", "Udine", "Como", "Bergamo", "Varese", "Biella"].includes(province.Name)) ?
                                                    "<b>langen und sehr kalten Wintern mit viel Schneefall</b> und <b>kurzen und nicht übermäßig heißen Sommern</b>." 
                                                    :""
                                                )))))) + '\n </br></br>' + "Die Provinz " + de(province.Name) + " hat durchschnittlich etwa " + ((province.HotDays / 3.5) * 12).toFixed(2) + " heiße Tage (Temperaturen über 30°C) und " +
                            ((province.ColdDays / 3.5) * 12).toFixed(2) + " kalte Tage (Temperaturen unter 5°C) pro Jahr. Es regnet (oder schneit) etwa " + (province.RainyDays * 12).toFixed(2) + " Tage pro Jahr. " +
                            (province.FoggyDays < 1 ? "Es gibt sehr wenig Nebel im Laufe des Jahres." : "Es gibt " + ((province.FoggyDays / 3.5) * 12).toFixed(2) + " Tage mit Nebel im Jahr.") +
                            " " + comune.Name + " erhält etwa " + province.SunshineHours / 30 + " Sonnenstunden pro Tag.";
                        
                $("#info").html(intro + climate);
                
                var info = getInfo(comune, province);
                var separator = '</br><span class="separator"></span></br>';
                var getyourguide = '<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>';
                
                $("#info").append(info.disclaimer);
                $("#info").append("<h2>Karte von " + comune.Name + "</h2>");
                $("#info").append(info.map);
                $("#info").append(separator);
                $("#info").append(getyourguide);
                $("#info").append(separator);
                $("#info").append("<h2>Provinz " + province.Name + "</h2>");
                $("#tabs").append(info.tabs);
                $("#related").append(info.nearby);
                $("#related").append(info.related);
                appendProvinceData(province, $);    
        pb.setNavBarDE($)
        }
        
        let html = dom.window.document.documentElement.outerHTML;
      
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName);
            }

        if (dataset[i].Comuni!=undefined)
        fs.writeFile(dirName+fileName+".html", html, function (err, file) {
           if (err) throw err;
           console.log(dataset[i].Name+".html"+' Saved!');
       })
    }
    }
//must add </urlset> at the end manually for some reason
/*    fs.writeFile("sitemap/towns-sitemap-4-de.xml", comuniSiteMap, function (err, file) {
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
     '<figure class="column is-3 related"><a href="https://expiter.com/de/provinz/'+de(province.Name).replace(/\s+/g,"-").replace("'","-").toLowerCase()+'/">'+
     '<img title="'+de(province.Name)+'" loading="lazy" src="'+
     'https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-280,h-140,c-at_least,q-5" '+
     'alt="Provinz '+de(data[i].Name)+', '+de(data[i].Region)+'"></img>'+
     '<figcaption>'+de(province.Name)+", "+de(province.Region)+"</figcaption></a></figure>";
   }

   avg=data[107];
   
 }

function getInfo(comune,province){
    let name=comune.Name;
   
    let region=regions[province.Region];
    
    let info = {}
    
    info.disclaimer = '</br></br><center><span id="disclaimer">Diese Seite enthält Partnerlinks. Als Partner von Amazon und Viator können wir Provisionen für qualifizierte Einkäufe erhalten.</span></center>';
        
    info.map='</br><center class="map"><iframe id="ggmap" src="https://maps.google.it/maps?f=q&source=s_q&hl=it&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>'+
    'Mostra: '+
    '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=it&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'+Cose+da+fare&output=embed")\' target="_blank"><b><ej>🎭</ej>Attrazioni</b></a> '+
    '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=it&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'+Musei&output=embed")\' target="_blank"><b><ej>🏺</ej>Musei</b></a> '+
    '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=it&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'+Ristoranti&output=embed")\' target="_blank"><b><ej>🍕</ej>Ristoranti</b></a> '+
    '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=it&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'+Bar&output=embed")\' target="_blank"><b><ej>🍺</ej>Bar</b></a> '+
    '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=it&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'+Stabilimento+balneare&output=embed")\' target="_blank"><b><ej>🏖️</ej>Spiaggie</b></a> '+
    '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=it&geocode=&q='+comune.Name+'+Provincia+Di+'+province.Name+'+Area+per+passeggiate&output=embed")\' target="_blank"><b><ej>⛰️</ej>Escursioni</b></a> '+
    '<a href="https://www.amazon.it/ulp/view?&linkCode=ll2&tag=expiter-21&linkId=5824e12643c8300394b6ebdd10b7ba3c&language=it_IT&ref_=as_li_ss_tl" target="_blank"><b><ej>📦</ej>Punti Amazon Pickup</b></a> '+
    '</center>'

   
  let target, related1, related2, related3, related4;
       
        (region.Name==="Valle d'Aosta"?target=facts[region.Name]["provinces"].concat(facts["Piemonte"]["provinces"]):
        (region.Name==="Trentino-Alto Adige"?target=facts[region.Name]["provinces"].concat(facts["Veneto"]["provinces"]).concat(["Brescia","Sondrio"]):
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
        info.related = '<h2>Angrenzende Provinzen von ' + de(province.Name) + '</h2> ';
        '<row class="columns is-multiline is-mobile"> '+        
        facts[related1].snippet+
        facts[related2].snippet+
        facts[related3].snippet+
        facts[related4].snippet+'</row>'

info.tabs='<div class="tabs effect-3">'+
        '<input type="radio" id="tab-1" name="tab-effect-3" checked="checked">'+
        '<span>Lebensqualität</span>' +
'<input type="radio" id="tab-2" name="tab-effect-3">' +
'<span>Lebenskosten</span>' +
'<input type="radio" id="tab-3" name="tab-effect-3">' +
'<span>Digitaler Nomade</span>'+
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
      '</div></div>'

      info.nearby = '<h2>Gemeinden in der Provinz ' + province.Name + '</h2>' + '\n';
            for (let p in province.Comuni){
        if (province.Comuni[p].Name!=comune)
        info.nearby+='<b><a href="https://expiter.com/de/gemeinden/'+handle(de(province))+'/'+
        handle(province.Comuni[p])+'/">'+province.Comuni[p].Name+'</a></b>'+' '
      }
       
        return info;
      }

function handle(comune){
        return comune.Name.replace('(*)','').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()
   }


   function appendProvinceData(province, $) {
    let tab1 = $("#Quality-of-Life > .column");
    let tab2 = $("#Cost-of-Living > .column");
    let tab3 = $("#Digital-Nomads > .column");

    tab1[0].innerHTML += ('<p><ej>👥</ej>Bevölkerung: <b>' + province.Population.toLocaleString('de', { useGrouping: true }) + '</b>');
    tab1[0].innerHTML += ('<p><ej>🚑</ej>Gesundheitsversorgung: ' + qualityScore("Healthcare", province.Healthcare));
    tab1[0].innerHTML += ('<p><ej>📚</ej>Bildung: ' + qualityScore("Education", province.Istruzione));
    tab1[0].innerHTML += ('<p><ej>👮🏽‍♀️</ej>Sicherheit: ' + qualityScore("Safety", province.Safety));
    tab1[0].innerHTML += ('<p><ej>🚨</ej>Kriminalität: ' + qualityScore("Crime", province.Crime));

    tab1[0].innerHTML += ('<p><ej>🚌</ej>Verkehrsmittel: ' + qualityScore("PublicTransport", province["PublicTransport"]));
    tab1[0].innerHTML += ('<p><ej>🚥</ej>Verkehr: ' + qualityScore("Traffic", province["Traffic"]));
    tab1[0].innerHTML += ('<p><ej>🚴‍♂️</ej>Fahrrad: ' + qualityScore('CyclingLanes', province['CyclingLanes']));
    tab1[0].innerHTML += ('<p><ej>🏛️</ej>Kultur: ' + qualityScore("Culture", province.Culture));
    tab1[0].innerHTML += ('<p><ej>🍸</ej>Nachtleben: ' + qualityScore("Nightlife", province.Nightlife));
    tab1[0].innerHTML += ('<p><ej>⚽</ej>Freizeitangebote: ' + qualityScore("Sports & Leisure", province["Sports & Leisure"]));

    tab1[1].innerHTML += ('<p><ej>🌦️</ej>Klima: ' + qualityScore("Climate", province.Climate));
    tab1[1].innerHTML += ('<p><ej>☀️</ej>Sonnenstunden: ' + qualityScore("SunshineHours", province.SunshineHours));
    tab1[1].innerHTML += ('<p><ej>🥵</ej>Heiße Tage: ' + qualityScore("HotDays", province.HotDays));
    tab1[1].innerHTML += ('<p><ej>🥶</ej>Kalte Tage: ' + qualityScore("ColdDays", province.ColdDays));
    tab1[1].innerHTML += ('<p><ej>🌧️</ej>Niederschlag: ' + qualityScore("RainyDays", province.RainyDays));
    tab1[1].innerHTML += ('<p><ej>🌫️</ej>Nebel: ' + qualityScore("FoggyDays", province.FoggyDays));
    tab1[1].innerHTML += ('<p><ej>🍃</ej>Luftqualität: ' + qualityScore("AirQuality", province["AirQuality"]));

    tab1[1].innerHTML += ('<p><ej>👪</ej>Familienfreundlichkeit: ' + qualityScore("Family-friendly", province["Family-friendly"]));
    tab1[1].innerHTML += ('<p><ej>👩</ej>Frauenfreundlichkeit: ' + qualityScore("Female-friendly", province["Female-friendly"]));
    tab1[1].innerHTML += ('<p><ej>🏳️‍🌈</ej>LGBTQ+: ' + qualityScore("LGBT-friendly", province["LGBT-friendly"]));
    tab1[1].innerHTML += ('<p><ej>🥗</ej>Vegan-freundlich: ' + qualityScore("Veg-friendly", province["Veg-friendly"]));

    tab2[0].innerHTML += ('<p><ej>📈</ej>Lebenshaltungskosten: ' + qualityScore("CostOfLiving", province["CostOfLiving"]));
    tab2[0].innerHTML += ('<p><ej>🧑🏻</ej>Kosten (Einzelperson): ' + qualityScore("Cost of Living (Individual)", province["Cost of Living (Individual)"]))
    tab2[0].innerHTML += ('<p><ej>👩🏽‍🏫</ej>Kosten (Tourist): ' + qualityScore("Cost of Living (Nomad)", province["Cost of Living (Nomad)"]))
    tab2[0].innerHTML += ('<p><ej>🏠</ej>Mietpreise (Studio): ' + qualityScore("StudioRental", province["StudioRental"]))
    tab2[0].innerHTML += ('<p><ej>🏘️</ej>Mietpreise (Zwei-Zimmer): ' + qualityScore("BilocaleRent", province["BilocaleRent"]))
    tab2[0].innerHTML += ('<p><ej>🏰</ej>Mietpreise (Drei-Zimmer): ' + qualityScore("TrilocaleRent", province["TrilocaleRent"]))

    tab2[1].innerHTML += ('<p><ej>🏙️</ej>Wohnkosten: ' + qualityScore("HousingCost", province["HousingCost"]));
    tab2[1].innerHTML += ('<p><ej>💵</ej>Gehalt: ' + qualityScore("MonthlyIncome", province["MonthlyIncome"]));
    tab2[1].innerHTML += ('<p><ej>👪</ej>Kosten (Familie): ' + qualityScore("Cost of Living (Family)", province["Cost of Living (Family)"]))
    tab2[1].innerHTML += ('<p><ej>🏠</ej>Kauf (Studio): ' + qualityScore("StudioSale", province["StudioSale"]))
    tab2[1].innerHTML += ('<p><ej>🏘️</ej>Kauf (Zwei-Zimmer): ' + qualityScore("BilocaleSale", province["BilocaleSale"]))
    tab2[1].innerHTML += ('<p><ej>🏰</ej>Kauf (Drei-Zimmer): ' + qualityScore("TrilocaleSale", province["TrilocaleSale"]))

    tab3[0].innerHTML += ('<p><ej>👩‍💻</ej>Nomaden-freundlich: ' + qualityScore("DN-friendly", province["DN-friendly"]))
    tab3[0].innerHTML += ('<p><ej>💃</ej>Unterhaltung: ' + qualityScore("Fun", province["Fun"]));
    tab3[0].innerHTML += ('<p><ej>🤗</ej>Freundlichkeit: ' + qualityScore("Friendliness", province["Friendliness"]));
    tab3[0].innerHTML += ('<p><ej>🤐</ej>Internationalität: ' + qualityScore("English-speakers", province["English-speakers"]));
    tab3[0].innerHTML += ('<p><ej>😊</ej>Zufriedenheit: ' + qualityScore("Antidepressants", province["Antidepressants"]));

    tab3[1].innerHTML += ('<p><ej>💸</ej>Ausgaben für Nomaden: ' + qualityScore("Cost of Living (Nomad)", province["Cost of Living (Nomad)"]))
    tab3[1].innerHTML += ('<p><ej>📡</ej>Schnelle Internetverbindung: ' + qualityScore("HighSpeedInternetCoverage", province["HighSpeedInternetCoverage"]));
    tab3[1].innerHTML += ('<p><ej>📈</ej>Innovation: ' + qualityScore("Innovation", province["Innovation"]));
    tab3[1].innerHTML += ('<p><ej>🏖️</ej>Strände: ' + qualityScore("Beach", province["Beach"]));
    tab3[1].innerHTML += ('<p><ej>⛰️</ej>Wandern: ' + qualityScore("Hiking", province["Hiking"]));
}

function qualityScore(quality, score) {
    let expenses = ["Cost of Living (Individual)", "Cost of Living (Family)", "Cost of Living (Nomad)", "StudioRental", "BilocaleRent", "TrilocaleRent", "MonthlyIncome", "StudioSale", "BilocaleSale", "TrilocaleSale"];

    if (quality == "CostOfLiving" || quality == "HousingCost") {
        if (score < avg[quality] * .8) {
            return "<score class='excellent short'>sehr niedrig</score>";
        } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
            return "<score class='great medium'>niedrig</score>";
        } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
            return "<score class='good medium'>im Durchschnitt</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
            return "<score class='average long'>hoch</score>";
        } else if (score >= avg[quality] * 1.2) {
            return "<score class='poor max'>sehr hoch</score>";
        }
    } else if (expenses.includes(quality)) {
        if (score < avg[quality] * .8) {
            return "<score class='green'>" + score + "€/m</score>";
        } else if (score >= avg[quality] * 0.8 && score < avg[quality] * 0.95) {
            return "<score class='green'>" + score + "€/m</score>";
        } else if (score >= avg[quality] * 0.95 && score < avg[quality] * 1.05) {
            return "<score class='orange'>" + score + "€/m</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
            return "<score class='red'>" + score + "€/m</score>";
        } else if (score >= avg[quality] * 1.2) {
            return "<score class='red'>" + score + "€/m</score>";
        }
    } else if (quality == "HotDays" || quality == "ColdDays") {
        if (score < avg[quality] * .8) {
            return "<score class='excellent short'>nicht sehr " + (quality == "HotDays" ? "warm" : "kalt") + "</score>";
        } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
            return "<score class='great medium'>nicht sehr " + (quality == "HotDays" ? "warm" : "kalt") + "</score>";
        } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
            return "<score class='good medium'>ein wenig " + (quality == "HotDays" ? "warm" : "kalt") + "</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
            return "<score class='average long'>" + (quality == "HotDays" ? "warm" : "kalt") + "</score>";
        } else if (score >= avg[quality] * 1.2) {
            return "<score class='poor max'>sehr " + (quality == "HotDays" ? "warm" : "kalt") + "</score>";
        }
    } else if (quality == "RainyDays") {
        if (score < avg[quality] * .8) {
            return "<score class='excellent short'>sehr wenig</score>";
        } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
            return "<score class='great medium'>wenig</score>";
        } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
            return "<score class='good medium'>im Durchschnitt</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
            return "<score class='average long'>regnerisch</score>";
        } else if (score >= avg[quality] * 1.2) {
            return "<score class='poor max'>sehr regnerisch</score>";
        }
    } else if (quality == "FoggyDays") {
        if (score < avg[quality] * .265) {
            return "<score class='excellent short'>kein Nebel</score>";
        } else if (score >= avg[quality] * .265 && score < avg[quality] * .6) {
            return "<score class='great medium'>wenig</score>";
        } else if (score >= avg[quality] * .6 && score < avg[quality] * 1.00) {
            return "<score class='good medium'>im Durchschnitt</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 3) {
            return "<score class='average long'>neblig</score>";
        } else if (score >= avg[quality] * 3) {
            return "<score class='poor max'>sehr neblig</score>";
        }
    } else if (quality == "Crime" || quality == "Traffic") {
        if (score < avg[quality] * .8) {
            return "<score class='excellent short'>sehr niedrig</score>";
        } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
            return "<score class='great medium'>niedrig</score>";
        } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
            return "<score class='good medium'>mittel</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
            return "<score class='average long'>hoch</score>";
        } else if (score >= avg[quality] * 1.2) {
            return "<score class='poor max'>sehr hoch</score>";
        }
    } else { 
        if (score < avg[quality] * .8) {
            return "<score class='poor short'>schlecht</score>";
        } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
            return "<score class='average medium'>befriedigend</score>";
        } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
            return "<score class='good medium'>gut</score>";
        } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
            return "<score class='great long'>sehr gut</score>";
        } else if (score >= avg[quality] * 1.2) {
            return "<score class='excellent max'>ausgezeichnet</score>";
        }
    }
}

import * as pb from './js/pageBuilder.js'
import {fr} from './js/pageBuilder.js'
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
       
        for (let i = 96; i < 107; i++){
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


            var dirName = 'fr/municipalites/'+fr(province.Name).replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()+'/';
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
            "<html lang='fr'>"+
            '<head><meta charset="utf-8">'+
            '<link rel="canonical" href="https://expiter.com/'+dirName+fileName+'/"/>'+
            '<link rel="alternate" hreflang="en" href="https://expiter.com/'+dirName.replace('fr/','')+fileName+'/" />'+
            '<link rel="alternate" hreflang="it" href="https://expiter.com/'+dirName.replace('fr/','it')+fileName+'/" />'+
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
            
            '<meta name="description" content="Informations sur la municipalité de '+comune.Name+', dans la province de '+province.Name+'. Population, qualité de vie, vie nocturne, tourisme, etc." />'+
'<meta name="keywords" content="'+comune.Name+' '+fr(province.Region)+', '+comune.Name+' '+province.Name+', population de '+comune.Name+','+comune.Name+' informations, '+comune.Name+' vie nocturne, '+comune.Name+' vie" />'+
"<title>"+comune.Name+" - Informations sur la municipalité dans la province de "+fr(province.Name)+", "+fr(province.Region)+"</title>"+
'<link rel="icon" type="image/x-icon" title="Expiter - Expatriés et nomades en Italie" href="https://expiter.com/img/expiter-favicon.ico"></link>'+

            
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
        '</div><h1 class="title">Commune de </h1>'+
        '<section id="'+comune.Name+' Info">'+
        '<center><table id="list">'+
        '<tr><th><b>Nom</b></th><th>'+comune.Name+'</th></tr>'+
        '<tr><th><b>Province</b></th><th>'+fr(province.Name)+'</th></tr>'+
        '<tr><th><b>Région</b></th><th>'+fr(province.Region)+'</th></tr>'+
        '<tr><th><b>Population</b></th><th>'+comune.Population+'</th></tr>'+
        '<tr><th><b>Densité</b></th><th>'+comune.Density+' hab./km²</th></tr>'+
        '<tr><th><b>Altitude</b></th><th>'+comune.Altitude+'m</th></tr>'+
        '<tr><th><b>Zone climatique</b></th><th>'+(comune.ClimateZone ? comune.ClimateZone : "?")+'</th></tr>'+       
        '</table></center>'+
        '<p id="info"></p>'+
        '<p id="tabs"></p>'+
        '</center><p id="related"></p></center>'+
        '</section>'+
        '<aside class="menu sb mobileonly">'+sidebar+'</aside>\n'+
        '</body></html>'
        )

        

        const $ = require('jquery')(dom.window)

        
        $("h1").text(fr(comune.Name)+", "+fr(province.Region))
        if (dataset[i].Comuni!=undefined){
        let list=$("#list").html();
        
        $("#list").html(list);
        let intro=comune.Name+" est une municipalité de "+comune.Population+" habitants située dans "+
        "<a href='https://expiter.com/fr/municipalites/province-de-"+handle(fr(province))+"'>la province de "+fr(province.Name)+"</a> dans la région "+
        fr(province.Region)+" en "+(center.includes(province.Region)?"Italie centrale":(south.includes(province.Region)?"Italie méridionale":"Italie septentrionale"))+".";

        intro+='\n'+'Elle a une <b>densité de population de '+comune.Density+' habitants par km²</b> et une <b>altitude de '+comune.Altitude+' mètres</b> au-dessus du niveau de la mer.'+'\n'

        intro+='</br></br><b>La population de '+comune.Name+"</b> représente environ "+((comune.Population.split('.').join("")*100)/province.Population).toFixed(2)+"% de la population totale de la province de "+province.Name+
        " et environ "+((comune.Population.split('.').join("")*100)/60260456).toFixed(5)+"% de la population totale de l'Italie en 2022."

        if (ci>0){
          intro+='<h2>Informations sur '+comune.Name+'</h2>'+comdata[ci].Attractions+'<br><br>'+comdata[ci].Histoire
        }


        let zoneAtext="l'une des deux municipalités les plus chaudes d'Italie, aux côtés de"+(comune.Name=="Porto Empedocle"?
        "s îles Pelagie de <a href='https://expiter.com/fr/municipalites/agrigente/lampedusa-e-linosa/>Lampedusa et Linosa</a>, qui se trouvent géographiquement près de l'Afrique":
        'e municipalité de <a href="https://expiter.com/fr/municipalites/agrigente/porto-empedocle/">Porto Empedocle</a>'+
        " en Sicile 'continentale', également dans la province d'Agrigente")
        let climate='<h3>Climat</h3>'+
        '<b>'+comune.Name+'</b> est classée comme une <b>Zone Climatique '+comune.ClimateZone+'</b>, elle est '+
        (comune.ClimateZone==="A"?zoneAtext
        :(comune.ClimateZone==="B"?"l'un des endroits les plus chauds et ensoleillés d'Italie"
        :(comune.ClimateZone==="C"?"une zone assez chaude"
        :(comune.ClimateZone==="D"?"des températures tempérées selon les normes du pays"
        :(comune.ClimateZone==="E"?"une municipalité assez froide"
        :(comune.ClimateZone==="F"?"une des municipalités les plus froides en Italie"
        :""))))))+"."+'\n'
        climate+=
        'Le climat local se caractérise par '+
        (["Sicile","Calabre","Sardaigne"].includes(province.Region)?"des <b>hivers courts et doux</b> et des <b>étés chauds et secs. Les précipitations sont concentrées principalement en hiver.</b>"
        :(["Ligurie","Toscane","Latium","Campanie"].includes(province.Region)?"des <b>hivers courts et doux</b> avec des <b>étés chauds et assez venteux</b> et des précipitations rares."
        :(["Émilie-Romagne","Vénétie","Lombardie","Piémont"].includes(province.Region)?"des <b>hivers longs et froids</b> et des <b>étés très chauds et secs</b>. Il y a fréquemment des précipitations en automne et au printemps, et des phénomènes de <b>brume</b> assez répandus."
        :(["Frioul-Vénétie Julienne","Marches","Abruzzes","Pouilles"].includes(province.Region)?"des <b>hivers froids</b> et des <b>étés chauds et venteux</b>, avec des pluies assez fréquentes tout au long de l'année."
        :(["Ombrie","Molise","Basilicate"].includes(province.Region)?"des <b>hivers longs et froids avec des chutes de neige fréquentes dans les zones montagneuses</b>, et des <b>étés chauds et assez secs</b>."
        :((["Trentin-Haut-Adige","Vallée d'Aoste"].includes(province.Region)||
        ["Belluno","Verbano-Cusio-Ossola","Udine","Côme","Bergame","Varèse","Biella"].includes(province.Name))?
        "<b>des hivers longs et très froids avec beaucoup de chutes de neige</b>, <b>des étés courts et pas excessivement chauds</b>."
        :""
        ))))))+'\n </br></br>'+"La province de "+fr(province.Name)+" a en moyenne "+((province.HotDays/3.5)*12).toFixed(2)+" jours de chaleur (températures au-dessus de 30°C) et "+
        ((province.ColdDays/3.5)*12).toFixed(2)+" jours de froid (températures en dessous de 5°C) par an. Il pleut (ou neige) environ "+(province.RainyDays*12).toFixed(2)+" jours par an. "+
        (province.FoggyDays<1?"Il y a très peu de brouillard pendant l'année.":"Il y a "+((province.FoggyDays/3.5)*12).toFixed(2)+" jours de brouillard pendant l'année.")+
        " "+comune.Name+" reçoit environ "+province.SunshineHours/30+" heures de soleil par jour.";

        $("#info").html(intro+climate)
       
        var info=getInfo(comune,province)
        var separator='</br><span class="separator"></span></br>'
        var getyourguide='<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>'
        
        $("#info").append(info.disclaimer)
        $("#info").append("<h2>Carte de "+comune.Name+"</h2>")
        $("#info").append(info.map)
        $("#info").append(separator)
        $("#info").append(getyourguide)
        $("#info").append(separator)
        $("#info").append("<h2>Province de "+province.Name+"</h2>")
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
    fs.writeFile("sitemap/towns-sitemap-4-fr.xml", comuniSiteMap, function (err, file) {
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
     '<figure class="column is-3 related"><a href="https://expiter.com/fr/province/'+fr(province.Name).replace(/\s+/g,"-").replace("'","-").toLowerCase()+'/">'+
     '<img title="'+fr(province.Name)+'" loading="lazy" src="'+
     'https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-280,h-140,c-at_least,q-5" '+
     'alt="Province de '+fr(data[i].Name)+', '+fr(data[i].Region)+'"></img>'+
     '<figcaption>'+fr(province.Name)+", "+fr(province.Region)+"</figcaption></a></figure>";
   }

   avg=data[107];
   
 }

function getInfo(comune,province){
    let name=comune.Name;
   
    let region=regions[province.Region];
    
    let info = {}
    
    info.disclaimer = '</br></br><center><span id="disclaimer">Cette page contient des liens d\'affiliation. En tant que partenaire d\'Amazon et de Viator, nous pouvons percevoir des commissions sur des achats éligibles.</span></center>';
        
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
        info.related='<h2>Provinces Proches de '+fr(province.Name)+'</h2> '+
        '<row class="columns is-multiline is-mobile"> '+        
        facts[related1].snippet+
        facts[related2].snippet+
        facts[related3].snippet+
        facts[related4].snippet+'</row>'

info.tabs='<div class="tabs effect-3">'+
        '<input type="radio" id="tab-1" name="tab-effect-3" checked="checked">'+
        '<span>Qualité de Vie</span>'+
        '<input type="radio" id="tab-2" name="tab-effect-3">'+
        '<span>Coût de la Vie</span>'+
        '<input type="radio" id="tab-3" name="tab-effect-3">'+
        '<span>Nomade Digital</span>'+
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

      info.nearby='<h2>Communes dans la Province de '+fr(province.Name)+'</h2>'+'\n'
      for (let p in province.Comuni){
        if (province.Comuni[p].Name!=comune)
        info.nearby+='<b><a href="https://expiter.com/fr/municipalites/'+handle(fr(province))+'/'+
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
tab1[0].innerHTML+=('<p><ej>👥</ej>Population: <b>'+province.Population.toLocaleString('fr', {useGrouping:true}) +'</b>');
tab1[0].innerHTML+=('<p><ej>🚑</ej>Santé: '+ qualityScore("Healthcare",province.Healthcare));
tab1[0].innerHTML+=('<p><ej>📚</ej>Éducation: '+ qualityScore("Education",province.Istruzione));
tab1[0].innerHTML+=('<p><ej>👮🏽‍♀️</ej>Sécurité: '+ qualityScore("Safety",province.Safety));
tab1[0].innerHTML+=('<p><ej>🚨</ej>Criminalité: '+ qualityScore("Crime",province.Crime));

tab1[0].innerHTML+=('<p><ej>🚌</ej>Transports: '+ qualityScore("PublicTransport",province["PublicTransport"]));
tab1[0].innerHTML+=('<p><ej>🚥</ej>Trafic: '+ qualityScore("Traffic",province["Traffic"]));
tab1[0].innerHTML+=('<p><ej>🚴‍♂️</ej>Vélo: '+ qualityScore('CyclingLanes',province['CyclingLanes']));
tab1[0].innerHTML+=('<p><ej>🏛️</ej>Culture: '+ qualityScore("Culture",province.Culture));
tab1[0].innerHTML+=('<p><ej>🍸</ej>Vie Nocturne: '+ qualityScore("Nightlife",province.Nightlife));
tab1[0].innerHTML+=('<p><ej>⚽</ej>Loisirs: '+ qualityScore("Sports & Leisure",province["Sports & Leisure"]));

tab1[1].innerHTML+=('<p><ej>🌦️</ej>Climat: '+ qualityScore("Climate",province.Climate));
tab1[1].innerHTML+=('<p><ej>☀️</ej>Soleil: '+ qualityScore("SunshineHours",province.SunshineHours));
tab1[1].innerHTML+=('<p><ej>🥵</ej>Étés '+ qualityScore("HotDays",province.HotDays));
tab1[1].innerHTML+=('<p><ej>🥶</ej>Hivers: '+ qualityScore("ColdDays",province.ColdDays));
tab1[1].innerHTML+=('<p><ej>🌧️</ej>Pluie: '+ qualityScore("RainyDays",province.RainyDays));
tab1[1].innerHTML+=('<p><ej>🌫️</ej>Brouillard: '+ qualityScore("FoggyDays",province.FoggyDays));
tab1[1].innerHTML+=('<p><ej>🍃</ej>Qualité de l\'Air: '+ qualityScore("AirQuality",province["AirQuality"]));

tab1[1].innerHTML+=('<p><ej>👪</ej>Pour les familles: '+ qualityScore("Family-friendly",province["Family-friendly"]));
tab1[1].innerHTML+=('<p><ej>👩</ej>Pour les femmes: '+ qualityScore("Female-friendly",province["Female-friendly"]));
tab1[1].innerHTML+=('<p><ej>🏳️‍🌈</ej>LGBTQ+: '+ qualityScore("LGBT-friendly",province["LGBT-friendly"]));
tab1[1].innerHTML+=('<p><ej>🥗</ej>Vegan: '+ qualityScore("Veg-friendly",province["Veg-friendly"]));

tab2[0].innerHTML+=('<p><ej>📈</ej>Coût de la vie: '+ qualityScore("CostOfLiving",province["CostOfLiving"]));
tab2[0].innerHTML+=('<p><ej>🧑🏻</ej>Coûts (individu): '+ qualityScore("Cost of Living (Individual)",province["Cost of Living (Individual)"]))
tab2[0].innerHTML+=('<p><ej>👩🏽‍🏫</ej>Coûts (touriste): '+ qualityScore("Cost of Living (Nomad)",province["Cost of Living (Nomad)"]))
tab2[0].innerHTML+=('<p><ej>🏠</ej>Loyers (studio): '+ qualityScore("StudioRental",province["StudioRental"]))
tab2[0].innerHTML+=('<p><ej>🏘️</ej>Loyers (deux pièces): '+ qualityScore("BilocaleRent",province["BilocaleRent"]))
tab2[0].innerHTML+=('<p><ej>🏰</ej>Loyers (trois pièces): '+ qualityScore("TrilocaleRent",province["TrilocaleRent"]))

tab2[1].innerHTML+=('<p><ej>🏙️</ej>Coûts du logement: '+ qualityScore("HousingCost",province["HousingCost"]));
tab2[1].innerHTML+=('<p><ej>💵</ej>Salaire: '+ qualityScore("MonthlyIncome",province["MonthlyIncome"]));
tab2[1].innerHTML+=('<p><ej>👪</ej>Coûts (famille): '+ qualityScore("Cost of Living (Family)",province["Cost of Living (Family)"]))
tab2[1].innerHTML+=('<p><ej>🏠</ej>Achat (studio): '+ qualityScore("StudioSale",province["StudioSale"]))
tab2[1].innerHTML+=('<p><ej>🏘️</ej>Achat (deux pièces): '+ qualityScore("BilocaleSale",province["BilocaleSale"]))
tab2[1].innerHTML+=('<p><ej>🏰</ej>Achat (trois pièces): '+ qualityScore("TrilocaleSale",province["TrilocaleSale"]))

tab3[0].innerHTML+=('<p><ej>👩‍💻</ej>Nomade-friendly: '+qualityScore("DN-friendly",province["DN-friendly"]))
tab3[0].innerHTML+=('<p><ej>💃</ej>Divertissement: '+qualityScore("Fun",province["Fun"]));
tab3[0].innerHTML+=('<p><ej>🤗</ej>Sympathie: '+qualityScore("Friendliness",province["Friendliness"]));
tab3[0].innerHTML+=('<p><ej>🤐</ej>Internationalité: '+qualityScore("English-speakers",province["English-speakers"]));
tab3[0].innerHTML+=('<p><ej>😊</ej>Bonheur: '+qualityScore("Antidepressants",province["Antidepressants"]));

tab3[1].innerHTML+=('<p><ej>💸</ej>Dépenses pour les nomades: '+ qualityScore("Cost of Living (Nomad)",province["Cost of Living (Nomad)"]))
tab3[1].innerHTML+=('<p><ej>📡</ej>Connexion ultra-rapide: '+qualityScore("HighSpeedInternetCoverage",province["HighSpeedInternetCoverage"]));
tab3[1].innerHTML+=('<p><ej>📈</ej>Innovation: '+qualityScore("Innovation",province["Innovation"]));
tab3[1].innerHTML+=('<p><ej>🏖️</ej>Plages: '+qualityScore("Beach",province["Beach"]));
tab3[1].innerHTML+=('<p><ej>⛰️</ej>Randonnée: '+qualityScore("Hiking",province["Hiking"]));

}

function qualityScore(quality,score){ let expenses=["Cost of Living (Individual)","Cost of Living (Family)","Cost of Living (Nomad)", "StudioRental", "BilocaleRent", "TrilocaleRent", "MonthlyIncome", "StudioSale","BilocaleSale","TrilocaleSale"]
if (quality=="CostOfLiving"||quality=="HousingCost"){
if (score<avg[quality]*.8){return "<score class='excellent short'>très bas</score>"}
else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>bas</score>"}
else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>dans la moyenne</score>"}
else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>élevé</score>"}
else if (score>=avg[quality]*1.2){return "<score class='poor max'>très élevé</score>"}
}
else if (expenses.includes(quality)){
if (score<avg[quality]*.8){return "<score class='green'>"+score+"€/m</score>"}
else if (score>=avg[quality]*0.8&&score<avg[quality]*0.95){return "<score class='green'>"+score+"€/m</score>"}
else if (score>=avg[quality]*0.95&&score<avg[quality]*1.05){return "<score class='orange'>"+score+"€/m</score>"}
else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='red'>"+score+"€/m</score>"}
else if (score>=avg[quality]*1.2){return "<score class='red'>"+score+"€/m</score>"}
}
else if (quality=="HotDays"||quality=="ColdDays"){ // high score = bad; low score = good
if (score<avg[quality]*.8){return "<score class='excellent short'>pas "+(quality=="HotDays"?"chaud":"froid")+"</score>"}
else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>pas très "+(quality=="HotDays"?"chaud":"froid")+"</score>"}
else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>un peu "+(quality=="HotDays"?"chaud":"froid")+"</score>"}
else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>"+(quality=="HotDays"?"chaud":"froid")+"</score>"}
else if (score>=avg[quality]*1.2){return "<score class='poor max'>très "+(quality=="HotDays"?"chaud":"froid")+"</score>"}
}
else if (quality=="RainyDays"){ // high score = bad; low score = good
if (score<avg[quality]*.8){return "<score class='excellent short'>très peu</score>"}
else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>peu</score>"}
else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>dans la moyenne</score>"}
else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>pluvieux</score>"}
else if (score>=avg[quality]*1.2){return "<score class='poor max'>très pluvieux</score>"}
}
else if (quality=="FoggyDays"){ // high score = bad; low score = good
if (score<avg[quality]*.265){return "<score class='excellent short'>pas de brouillard</score>"}
else if (score>=avg[quality]*.265&&score<avg[quality]*.6){return "<score class='great medium'>peu</score>"}
else if (score>=avg[quality]*.6&&score<avg[quality]*1.00){return "<score class='good medium'>dans la moyenne</score>"}
else if (score>=avg[quality]*1.05&&score<avg[quality]*3){return "<score class='average long'>brumeux</score>"}
else if (score>=avg[quality]*3){return "<score class='poor max'>très brumeux</score>"}
}
else if (quality=="Crime"||quality=="Traffic"){ // high score = bad; low score = good 
if (score<avg[quality]*.8){
return "<score class='excellent short'>très bas</score>"} 
else if (score>=avg[quality]*.8&&score<avg[quality]*.95){
    return "<score class='great medium'>bas</score>"} 
else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){
    return "<score class='good medium'>moyen</score>"} 
else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){
    return "<score class='average long'>haut</score>"} 
else if (score>=avg[quality]*1.2){
    return "<score class='poor max'>très haut</score>"} } 
else{ // high score = good; low score = bad 
if (score<avg[quality]*.8){
    return "<score class='poor short'>mauvais</score>"} 
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){
        return "<score class='average medium'>correct</score>"} 
        else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){
            return "<score class='good medium'>bon</score>"} 
            else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){
                return "<score class='great long'>très bon</score>"} 
                else if (score>=avg[quality]*1.2){
    return "<score class='excellent max'>excellent</score>"} 
} 
}

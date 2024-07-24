import * as pb from './js/pageBuilder.js'
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
       
        for (let i = 0; i < 10; i++){
            let province = dataset[i];
            let sidebar=pb.setSideBarIT(province)

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

            var dirName = 'it/comuni/'+province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()+'/';
            var fileName = comune.Name.replace('(*)','').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
            let ci=-1;

            if (comindex.includes(comune.Name)) {
              ci = comindex.indexOf(comune.Name)
              console.log("found some extra info about "+comune.Name+" at position "+ ci)
            }
            if (ci>-1){ //this only updates towns in comuni.js
            console.log("Writing comune \""+comune.Name+"\" ("+province.Name+") into file")

            let urlPath = dirName+fileName;
          urlPath = "https://expiter.com/"+urlPath+"/"
          comuniSiteMap+='<url>'+
          '<loc>'+urlPath+'</loc>'+
          '</url>'+'\n'

            const dom = new jsdom.JSDOM(
            "<!DOCTYPE html>\n<html lang='it'>"+
            '<head><meta charset="utf-8">'+
            '<link rel="canonical" href="https://expiter.com/'+dirName+fileName+'/"/>'+
            '<link rel="alternate" hreflang="en" href="https://expiter.com/'+dirName.replace('it/','')+fileName+'/" />'+
            '<link rel="alternate" hreflang="it" href="https://expiter.com/'+dirName+fileName+'/" />'+
            '<meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale-1,user-scalable=0">'+
            '<script type="text/javascript" src="https://expiter.com/jquery3.6.0.js" defer></script>'+
            '<script type="text/json" src="https://expiter.com/dataset.json"></script>'+
            '<script type="text/javascript" src="https://expiter.com/script.js" defer></script>'+
            '<script type="text/javascript" src="https://expiter.com/bootstrap-toc.js" defer></script>'+
            pb.headerScripts()+
            '<link rel="stylesheet" href="https://expiter.com/fonts.css" media="print" onload="this.media=\'all\'"></link>'+
            '<link rel="stylesheet" href="https://expiter.com/bulma.min.css">'+
            '<link rel="stylesheet" href="https://expiter.com/style.css?v=1.3">'+
            '<link rel="stylesheet" href="https://expiter.com/comuni/comuni-style.css?v=1.12">'+
            
            '<meta name="description" content="Informazioni sul comune di '+comune.Name+', in provincia di '+province.Name+'. Popolazione, qualità della vita, movida, turismo ecc." />'+
	        '<meta name="keywords" content="'+comune.Name+' '+province.Region+', '+comune.Name+' '+province.Name+','+comune.Name+' popolazione,'+comune.Name+' info, '+comune.Name+' movida, '+comune.Name+' vita" />'+
            "<title>"+comune.Name+" - Informazioni comune in provincia di "+province.Name+", "+province.Region+"</title>"+
            '<link rel="icon" type="image/x-icon" title="Expiter - Italy Expats and Nomads" href="https://expiter.com/img/expiter-favicon.ico"></link>'+
            
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
        '</div><h1 class="title">Comuni di </h1>'+
        '<section id="'+comune.Name+' Info">'+
        '<center><table id="list">'+
        '<tr><th><b>Nome</b></th><th>'+comune.Name+'</th></tr>'+
        '<tr><th><b>Provincia</b></th><th>'+province.Name+'</th></tr>'+
        '<tr><th><b>Regione</b></th><th>'+province.Region+'</th></tr>'+
        '<tr><th><b>Popolazione</b></th><th>'+comune.Population+'</th></tr>'+
        '<tr><th><b>Densità</b></th><th>'+comune.Density+'ab./km²</th></tr>'+
        '<tr><th><b>Altitudine</b></th><th>'+comune.Altitude+'m</th></tr>'+
        '<tr><th><b>Climate Zone</b></th><th>'+(comune.ClimateZone?comune.ClimateZone:"?")+'</th></tr>'+
        '</tr>'+
        '</table></center>'+
        '<p id="info"></p>'+
        '<p id="tabs"></p>'+
        '</center><p id="related"></p></center>'+
        '</section>'+
        '<aside class="menu sb mobileonly">'+sidebar+'</aside>\n'+
        '</body></html>'
        )


        const $ = require('jquery')(dom.window)
        
        $("h1").text(comune.Name+", "+province.Region)
        if (dataset[i].Comuni!=undefined){
        let list=$("#list").html();
        
        $("#list").html(list);
        let intro=comune.Name+" è un comune di "+comune.Population+" abitanti che si trova nella "+
        "<a href='https://expiter.com/it/comuni/provincia-di-"+handle(province)+"'>provincia di "+province.Name+"</a> in "+province.Region+
        " nell'<b>italia "+(center.includes(province.Region)?"centrale":(south.includes(province.Region)?"meridionale":"settentrionale"))+"</b>."

        intro+='\n'+'Ha una <b>densità di popolazione del '+comune.Density+' abitanti per km²</b> e una <b>altitudine di '+comune.Altitude+' metri</b> al di sopra della superficie del mare.'+'\n'

        intro+='</br></br><b>La popolazione di '+comune.Name+"</b> è circa "+((comune.Population.split('.').join("")*100)/province.Population).toFixed(2)+"% della popolazione totale della provincia di "+province.Name+
        " e circa "+((comune.Population.split('.').join("")*100)/60260456).toFixed(5)+"% del totale della popolazione dell'italia nel 2022."

        if (ci>0){
          intro+='<h2>Informazioni su '+comune.Name+'</h2>'+comdata[ci].Attrazioni+'<br><br>'+comdata[ci].Storia
        }


        let zoneAtext="una delle due municipalità più calde d'Italia, insieme a"+(comune.Name=="Porto Empedocle"?
        "lle isole Pelagie di <a href='https://expiter.com/it/comuni/agrigento/lampedusa-e-linosa/>Lampedusa and Linosa</a>, che geograficamente si trovano vicino all'Africa":
        'l comune di <a href="https://expiter.com/it/comuni/agrigento/porto-empedocle/">Porto Empedocle</a>'+
        " nella Sicilia \"continentale\", anch'esso nella provincia di Agrigento")
        let climate='<h3>Clima</h3>'+
        '<p style="font-size:21px; line-height:42px"><b>'+comune.Name+'</b> viene classificato come una <b>Zona Climatica '+comune.ClimateZone+'</b>, si tratta di '+
        (comune.ClimateZone==="A"?zoneAtext
        :(comune.ClimateZone==="B"?"una delle località più calde e soleggiate d'Italia"
        :(comune.ClimateZone==="C"?"località abbastanza calde"
        :(comune.ClimateZone==="D"?"località temperate per gli standard del paese"
        :(comune.ClimateZone==="E"?"un comune abbastanza freddo"
        :(comune.ClimateZone==="F"?"uno dei comuni più freddi in Italia"
        :""))))))+"."+'\n'
        climate+=
        'Il clima locale è caratterizzato da '+
        (["Sicilia","Calabria","Sardegna"].includes(province.Region)?"<b>inverni corti e miti</b> and long, <b>estati calde e secche. Le precipitazioni sono concentrate per lo più nel periodo invernale.</b>"
        :(["Liguria","Toscana","Lazio","Campania"].includes(province.Region)?"<b>inverni corti e miti</b> con <b>estati calde e abbastanza ventose</b> e scarse precipitazioni."
        :(["Emilia-Romagna","Veneto","Lombardia","Piemonte"].includes(province.Region)?"<b>inverni lunghi e freddi</b> e <b>estati molto calde e secche</b>. Vi sono frequenti precipitazioni in autunno e primavera, e fenomeni di <b>nebbia</b> abbastanza diffusi."
        :(["Friuli-Venezia Giulia","Marche","Abruzzo","Puglia"].includes(province.Region)?"<b>inverni freddi</b> e <b>estati calde e ventose</b>, con pioggie abbastanza frequenti durante tutto l'anno."
        :(["Umbria","Molise","Basilicata"].includes(province.Region)?"<b>inverni lunghi e freddi con nevicate frequenti sulle aree montane</b>, e <b>estati calde e abbastanza secche</b>."
        :((["Trentino-Alto Adige","Val d'Aosta"].includes(province.Region)||
        ["Belluno","Verbano-Cusio-Ossola","Udine","Como","Bergamo","Varese","Biella"].includes(province.Name))?
        "<b>inverni lunghi e molto freddi con abbondanti nevicate</b>, <b>estati brevi e non eccessivamente calde</b>."
        :""
        ))))))+'\n </br></br>'+"La provincia di "+province.Name+" ha in media "+((province.HotDays/3.5)*12).toFixed(2)+" giorni di caldo (temperature oltre i 30°C) e "+
        ((province.ColdDays/3.5)*12).toFixed(2)+" giornate di freddo (temperature al di sotto dei 5°C) durante l'anno. <br><br> Piove (o nevica) circa "+(province.RainyDays*12).toFixed(2)+" giorni l'anno. "+
        (province.FoggyDays<1?"Vi è pochissima nebbia durante l'anno.":"Vi sono "+((province.FoggyDays/3.5)*12).toFixed(2)+" giorni di nebbia durante l'anno.")+
        "<br><br>"+comune.Name+" riceve circa "+province.SunshineHours/30+" ore di sole giornaliere, dunque circa "+(((province.SunshineHours/30)/9)*365).toFixed(2)+ " di giornate soleggiate in un anno.</p>";

        $("#info").html(pb.addBreaks(intro)+climate)
       
        var info=getInfo(comune,province)
        var separator='</br><span class="separator"></span></br>'
        var getyourguide='<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>'

        var expedia='<div id="searchWidget" style="width:98%;height:550px;"><iframe id="widgetIframe" src="https://www.expedia.com/marketing/widgets/searchform/widget?wtt=5&tp1=1101l3BUi9&tp2=expiter&lob=H,FH,CA,CR,A&des='
        +comune.Name+'&wbi=13&olc=000000&whf=4&hfc=C7C7C7&wif=4&ifc=000000&wbc=FFCC00&wbf=4&bfc=3D3100&wws=2&sfs=H550FW98R&langid=1033" width="100%" height="100%" scrolling="no" frameborder="0"></iframe></div>'

        expedia += '<div style="text-align:center; margin-top:20px;">Search for: ' + ['Hotel', 'Appartamenti', 'Bed & Breakfast', 'Ville'].map((lodging, index) => `<a href="https://www.expedia.it/Hotel-Search?lodging=${['HOTEL', 'APARTMENT', 'BED_AND_BREAKFAST', 'VILLA'][index]}&destination=${comune.Name}&camref=1101l3BUi9&creativeref=1100l68075" target="_blank" rel="nofollow sponsored" style="font-size:18px; margin: 0 10px;">${lodging}</a>` + (index < 3 ? ' | ' : '')).join('') + '</div>';

        
        $("#info").append(info.disclaimer)
        $("#info").append("<h2>Mappa di "+comune.Name+"</h2>")
        $("#info").append(info.map)
        $("#info").append(separator)
        $("#info").append("<h2>Esperienze e Tour Vicino a "+comune.Name+"</h2>")
        $("#info").append(getyourguide)
        $("#info").append(separator)
        $("#info").append("<h2>Hotel e pacchetti di viaggio a "+comune.Name+"</h2>")
        $("#info").append(expedia)
        $("#info").append(separator)
        $("#info").append("<h2>Provincia di "+province.Name+"</h2>")
        $("#tabs").append(info.tabs)
        $("#related").append(info.nearby)
        $("#related").append(info.related)
        appendProvinceData(province,$)
        pb.setNavBarIT($)
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

    comuniSiteMap+='</urlset>'
/*  fs.writeFile("sitemap/towns-sitemap-3-it.xml", comuniSiteMap, function (err, file) {
    if (err) throw err;
    console.log("towns-sitemap"+' Saved!');
});*/
}
} //remove this if you need to update all articles, not just those in comuni.json
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
        '<li><a href="https://expiter.com/it/">Home</a></li>'+
        '<li><a href="https://expiter.com/it/resources/">Resources</a></li>'+
        '<li><a href="https://expiter.com/it/tools/codice-fiscale-generator/">Tools</a></li>'+
        '<li><a href="https://expiter.com/it/app/#About">About</a></li>'+
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
     '<img title="'+province.Name+'" loading="lazy" src="'+
     'https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-280,h-140,c-at_least,q-5" '+
     'alt="Provincia di '+data[i].Name+', '+data[i].Region+'"></img>'+
     '<figcaption>'+province.Name+", "+province.Region+"</figcaption></a></figure>";
   }
   avg=data[107];
   
 }

function getInfo(comune,province){
    let name=comune.Name;
   
    let region=regions[province.Region];
    
    let info = {}
    
    info.disclaimer='</br></br><center><span id="disclaimer">Questa pagina contiene link di affiliazione. In quanto partner di Amazon e Viator, potremmo guadagnare commissioni su acquisti idonei.</span></center>'
        
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

        info.related='<h2>Province Vicino '+province.Name+'</h2> '+
        '<row class="columns is-multiline is-mobile"> '+        
        facts[related1].snippet+
        facts[related2].snippet+
        facts[related3].snippet+
        facts[related4].snippet+'</row>'

        info.tabs='<div class="tabs effect-3">'+
        '<input type="radio" id="tab-1" name="tab-effect-3" checked="checked">'+
        '<span>Qualità della Vita</span>'+
        '<input type="radio" id="tab-2" name="tab-effect-3">'+
        '<span>Costo della Vita</span>'+
        '<input type="radio" id="tab-3" name="tab-effect-3">'+
        '<span>Digital Nomad</span>'+
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

      info.nearby='<h2>Comuni in Provincia di '+province.Name+'</h2>'+'\n'
      for (let p in province.Comuni){
        if (province.Comuni[p].Name!=comune)
        info.nearby+='<b><a href="https://expiter.com/it/comuni/'+handle(province)+'/'+
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
    tab1[0].innerHTML+=('<p><ej>👥</ej>Popolazione: <b>'+province.Population.toLocaleString('en', {useGrouping:true}) +'</b>');
    tab1[0].innerHTML+=('<p><ej>🚑</ej>Sanità: '+ qualityScore("Healthcare",province.Healthcare));
    tab1[0].innerHTML+=('<p><ej>📚</ej>Istruzione: '+ qualityScore("Education",province.Istruzione));
    tab1[0].innerHTML+=('<p><ej>👮🏽‍♀️</ej>Sicurezza: '+ qualityScore("Safety",province.Safety));
    tab1[0].innerHTML+=('<p><ej>🚨</ej>Criminalità: '+ qualityScore("Crime",province.Crime));
    
    tab1[0].innerHTML+=('<p><ej>🚌</ej>Trasporti: '+ qualityScore("PublicTransport",province["PublicTransport"]));
    tab1[0].innerHTML+=('<p><ej>🚥</ej>Traffico: '+ qualityScore("Traffic",province["Traffic"]));
    tab1[0].innerHTML+=('<p><ej>🚴‍♂️</ej>Bici: '+ qualityScore('CyclingLanes',province['CyclingLanes']));
    tab1[0].innerHTML+=('<p><ej>🏛️</ej>Cultura: '+ qualityScore("Culture",province.Culture));
    tab1[0].innerHTML+=('<p><ej>🍸</ej>Movida: '+ qualityScore("Nightlife",province.Nightlife));
    tab1[0].innerHTML+=('<p><ej>⚽</ej>Svaghi: '+ qualityScore("Sports & Leisure",province["Sports & Leisure"]));

    tab1[1].innerHTML+=('<p><ej>🌦️</ej>Clima: '+ qualityScore("Climate",province.Climate));
    tab1[1].innerHTML+=('<p><ej>☀️</ej>Sole: '+ qualityScore("SunshineHours",province.SunshineHours));
    tab1[1].innerHTML+=('<p><ej>🥵</ej>Estati '+ qualityScore("HotDays",province.HotDays));
    tab1[1].innerHTML+=('<p><ej>🥶</ej>Inverni: '+ qualityScore("ColdDays",province.ColdDays));
    tab1[1].innerHTML+=('<p><ej>🌧️</ej>Pioggia: '+ qualityScore("RainyDays",province.RainyDays));
    tab1[1].innerHTML+=('<p><ej>🌫️</ej>Nebbia: '+ qualityScore("FoggyDays",province.FoggyDays));
    tab1[1].innerHTML+=('<p><ej>🍃</ej>Qualità dell\'Aria: '+ qualityScore("AirQuality",province["AirQuality"]));

    tab1[1].innerHTML+=('<p><ej>👪</ej>Per famiglie: '+ qualityScore("Family-friendly",province["Family-friendly"]));
    tab1[1].innerHTML+=('<p><ej>👩</ej>Per donne: '+ qualityScore("Female-friendly",province["Female-friendly"]));
    tab1[1].innerHTML+=('<p><ej>🏳️‍🌈</ej>LGBTQ+: '+ qualityScore("LGBT-friendly",province["LGBT-friendly"]));
    tab1[1].innerHTML+=('<p><ej>🥗</ej>Vegan: '+ qualityScore("Veg-friendly",province["Veg-friendly"]));
    

    tab2[0].innerHTML+=('<p><ej>📈</ej>Costo della Vita: '+ qualityScore("CostOfLiving",province["CostOfLiving"]));
    tab2[0].innerHTML+=('<p><ej>🧑🏻</ej>Costi (individuo): '+ qualityScore("Cost of Living (Individual)",province["Cost of Living (Individual)"]))
    tab2[0].innerHTML+=('<p><ej>👩🏽‍🏫</ej>Costi (turista): '+ qualityScore("Cost of Living (Nomad)",province["Cost of Living (Nomad)"]))
    tab2[0].innerHTML+=('<p><ej>🏠</ej>Affitti (monolocale): '+ qualityScore("StudioRental",province["StudioRental"]))
    tab2[0].innerHTML+=('<p><ej>🏘️</ej>Affitti (bilocale): '+ qualityScore("BilocaleRent",province["BilocaleRent"]))
    tab2[0].innerHTML+=('<p><ej>🏰</ej>Affitti (trilocale): '+ qualityScore("TrilocaleRent",province["TrilocaleRent"]))

    tab2[1].innerHTML+=('<p><ej>🏙️</ej>Costi abitativi: '+ qualityScore("HousingCost",province["HousingCost"]));
    tab2[1].innerHTML+=('<p><ej>💵</ej>Stipendi: '+ qualityScore("MonthlyIncome",province["MonthlyIncome"]));
    tab2[1].innerHTML+=('<p><ej>👪</ej>Costi (famiglia): '+ qualityScore("Cost of Living (Family)",province["Cost of Living (Family)"]))
    tab2[1].innerHTML+=('<p><ej>🏠</ej>Acquisto (monolocale): '+ qualityScore("StudioSale",province["StudioSale"]))
    tab2[1].innerHTML+=('<p><ej>🏘️</ej>Acquisto (bilocale): '+ qualityScore("BilocaleSale",province["BilocaleSale"]))
    tab2[1].innerHTML+=('<p><ej>🏰</ej>Acquisto (trilocale): '+ qualityScore("TrilocaleSale",province["TrilocaleSale"]))
    
    tab3[0].innerHTML+=('<p><ej>👩‍💻</ej>Nomad-friendly: '+qualityScore("DN-friendly",province["DN-friendly"]))
    tab3[0].innerHTML+=('<p><ej>💃</ej>Divertimento: '+qualityScore("Fun",province["Fun"]));
    tab3[0].innerHTML+=('<p><ej>🤗</ej>Simpatia: '+qualityScore("Friendliness",province["Friendliness"]));
    tab3[0].innerHTML+=('<p><ej>🤐</ej>Internazionalità: '+qualityScore("English-speakers",province["English-speakers"]));
    tab3[0].innerHTML+=('<p><ej>😊</ej>Felicità: '+qualityScore("Antidepressants",province["Antidepressants"]));
    
    tab3[1].innerHTML+=('<p><ej>💸</ej>Spese per Nomadi: '+ qualityScore("Cost of Living (Nomad)",province["Cost of Living (Nomad)"]))
    tab3[1].innerHTML+=('<p><ej>📡</ej>Connessione Ultra-veloce: '+qualityScore("HighSpeedInternetCoverage",province["HighSpeedInternetCoverage"]));
    tab3[1].innerHTML+=('<p><ej>📈</ej>Innovazione: '+qualityScore("Innovation",province["Innovation"]));
    tab3[1].innerHTML+=('<p><ej>🏖️</ej>Spiagge: '+qualityScore("Beach",province["Beach"]));
    tab3[1].innerHTML+=('<p><ej>⛰️</ej>Escursionismo: '+qualityScore("Hiking",province["Hiking"]));
  }
    
    
  function qualityScore(quality,score){
        let expenses=["Cost of Living (Individual)","Cost of Living (Family)","Cost of Living (Nomad)", 
        "StudioRental", "BilocaleRent", "TrilocaleRent", "MonthlyIncome", 
        "StudioSale","BilocaleSale","TrilocaleSale"]
        
        if (quality=="CostOfLiving"||quality=="HousingCost"){
          if (score<avg[quality]*.8){return "<score class='excellent short'>molto basso</score>"}
          else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>basso</score>"}
          else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>nella media</score>"}
          else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>alto</score>"}
          else if (score>=avg[quality]*1.2){return "<score class='poor max'>molto alto</score>"}
        }
        else if (expenses.includes(quality)){
          if (score<avg[quality]*.8){return "<score class='green'>"+score+"€/m</score>"}
          else if (score>=avg[quality]*0.8&&score<avg[quality]*0.95){return "<score class='green'>"+score+"€/m</score>"}
          else if (score>=avg[quality]*0.95&&score<avg[quality]*1.05){return "<score class='orange'>"+score+"€/m</score>"}
          else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='red'>"+score+"€/m</score>"}
          else if (score>=avg[quality]*1.2){return "<score class='red'>"+score+"€/m</score>"}
        }
        else if (quality=="HotDays"||quality=="ColdDays"){ // high score = bad; low score = good
          if (score<avg[quality]*.8){return "<score class='excellent short'>non "+(quality=="HotDays"?"caldo":"freddo")+"</score>"}
          else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>non molto "+(quality=="HotDays"?"caldo":"freddo")+"</score>"}
          else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>un po' "+(quality=="HotDays"?"caldo":"freddo")+"</score>"}
          else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>"+(quality=="HotDays"?"caldo":"freddo")+"</score>"}
          else if (score>=avg[quality]*1.2){return "<score class='poor max'>molto "+(quality=="HotDays"?"caldo":"freddo")+"</score>"}
        }
        else if (quality=="RainyDays"){ // high score = bad; low score = good
          if (score<avg[quality]*.8){return "<score class='excellent short'>molto poca</score>"}
          else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>poca</score>"}
          else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>nella media</score>"}
          else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>piovoso</score>"}
          else if (score>=avg[quality]*1.2){return "<score class='poor max'>molto piovoso</score>"}
        }
        else if (quality=="FoggyDays"){ // high score = bad; low score = good
          if (score<avg[quality]*.265){return "<score class='excellent short'>niente nebbia</score>"}
          else if (score>=avg[quality]*.265&&score<avg[quality]*.6){return "<score class='great medium'>poca</score>"}
          else if (score>=avg[quality]*.6&&score<avg[quality]*1.00){return "<score class='good medium'>nella media</score>"}
          else if (score>=avg[quality]*1.05&&score<avg[quality]*3){return "<score class='average long'>nebbioso</score>"}
          else if (score>=avg[quality]*3){return "<score class='poor max'>molto nebbioso</score>"}
        }
        else if (quality=="Crime"||quality=="Traffic"){ // high score = bad; low score = good
          if (score<avg[quality]*.8){return "<score class='excellent short'>molto basso</score>"}
          else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>basso</score>"}
          else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>nella media</score>"}
          else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>alto</score>"}
          else if (score>=avg[quality]*1.2){return "<score class='poor max'>molto alto</score>"}
        }
        else{ // high score = good; low score = bad
          if (score<avg[quality]*.8){return "<score class='poor short'>scarso</score>"}
          else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='average medium'>okay</score>"}
          else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>buono</score>"}
          else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='great long'>molto buono</score>"}
          else if (score>=avg[quality]*1.2){return "<score class='excellent max'>ottimo</score>"}
        }
      }
      
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

        for (let i = 54; i < 60; i++){
            let province = dataset[i];
       
            if (fs.existsSync('temp/'+province.Name+'-comuni.json')){
            let parsedData = fs.readFileSync('temp/'+province.Name+'-comuni.json','utf8');
            let dic=JSON.parse(parsedData);
            dataset[i]["Comuni"]=dic
            }
            else console.log("Missing comuni: "+province.Name)

            let comuni=dataset[i]["Comuni"];

            for (let c in comuni){
            
            let comune=comuni[c];
            var dirName = 'comuni/'+province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()+'/';
            var fileName = comune.Name.replace('(*)','').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
            
            console.log("Writing comune \""+comune.Name+"\" ("+province.Name+") into file")

            let urlPath = 'comuni/'+dirName+fileName;
          urlPath = "https://expiter.com/"+urlPath+"/"
          comuniSiteMap+='<url>'+
          '<loc>'+urlPath+'</loc>'+
          '</url>'+'\n'

            const dom = new jsdom.JSDOM(
            "<html lang='en'>"+
            '<head><meta charset="utf-8">'+
            '<link rel="canonical" href="https://expiter.com/'+dirName+fileName+'/"/>'+
            '<link rel="alternate" hreflang="en" href="https://expiter.com/'+dirName+fileName+'/" />'+
            '<link rel="alternate" hreflang="it" href="https://expiter.com/it/'+dirName+fileName+'/" />'+
            '<meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale-1,user-scalable=0">'+
            '<script type="text/javascript" src="https://expiter.com/jquery3.6.0.js" defer></script>'+
            '<script type="text/json" src="https://expiter.com/dataset.json"></script>'+
            '<script type="text/javascript" src="https://expiter.com/script.js" defer></script>'+
            '<script type="text/javascript" src="https://expiter.com/bootstrap-toc.js" defer></script>'+
            '<link rel="stylesheet" href="https://expiter.com/fonts.css" media="print" onload="this.media=\'all\'"></link>'+
            '<link rel="stylesheet" href="https://expiter.com/bulma.min.css">'+
            '<link rel="stylesheet" href="https://expiter.com/style.css">'+
            '<link rel="stylesheet" href="https://expiter.com/comuni/comuni-style.css">'+
            
            '<meta name="description" content="Information about living in '+comune.Name+', Italy for expats and digital nomads. '+comune.Name+' quality of life, cost of living, safety and more." />'+
	        '<meta name="keywords" content="'+comune.Name+' italy, '+comune.Name+' expat,'+comune.Name+' life,'+comune.Name+' digital nomad" />'+
            "<title>"+comune.Name+" - Quality of Life and Info Sheet for Expats </title>"+
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
        '<div class="hero" style="background-image:url(\'https://expiter.com/img/'+province.Abbreviation+'.webp\')" '+'title="'+comune.Name+", "+province.Name+', Italy"'+'>'+
        '</div><h1 class="title">Comuni di </h1>'+
        '<section id="'+en(comune.Name)+' Info Sheet">'+
        '<center><table id="list">'+
        '<tr><th><b>Name</b></th><th>'+en(comune.Name)+'</th></tr>'+
        '<tr><th><b>Province</b></th><th>'+en(province.Name)+'</th></tr>'+
        '<tr><th><b>Region</b></th><th>'+en(province.Region)+'</th></tr>'+
        '<tr><th><b>Population</b></th><th>'+comune.Population+'</th></tr>'+
        '<tr><th><b>Density</b></th><th>'+comune.Density+'</th></tr>'+
        '<tr><th><b>Altitude</b></th><th>'+comune.Altitude+'</th></tr>'+
        '</tr>'+
        '</table>'+
        '<p id="info"></p></center>'+
        '<p id="tabs"></p>'+
        '<center><p id="related"></p></center>'+
        '</section>'+
        '</body></html>'
        )

        

        const $ = require('jquery')(dom.window)

        
        $("h1").text(en(comune.Name)+", "+en(province.Region)+", Italy")
        
        if (dataset[i].Comuni!=undefined){
        let list=$("#list").html();
        
        $("#list").html(list);

        let intro="<b>"+en(comune.Name)+" is a municipality of "+comune.Population+" inhabitants located in the "+
        "<a href='https://expiter.com/comuni/province-of-"+handle(province)+"'>"+en(province.Name)+" province</a></b> in the Italian region of "+en(province.Region)+
        " in <b>"+(center.includes(province.Region)?"Central Italy":(south.includes(province.Region)?"Southern Italy":"Northern Italy"))+"</b>."

        intro+='\n'+'It has a <b>population density of '+comune.Density+'</b> and an <b>altitude of '+comune.Altitude+'</b>.'+'\n'

        intro+='</br></br><b>'+en(comune.Name)+"</b> accounts for about "+((comune.Population.split('.').join("")*100)/province.Population).toFixed(2)+"% of the total population in the province of "+en(province.Name)+
        " and about "+((comune.Population.split('.').join("")*100)/60260456).toFixed(3)+"% of the overall population of Italy as of 2022."

        $("#info").html(intro)
       
        var info=getInfo(comune,province)
        
        $("#info").append(info.disclaimer)
        $("#info").append("<h2>Map of "+en(comune.Name)+"</h2>")
        $("#info").append(info.map)
        $("#info").append("<h2>"+en(province.Name)+" Province Info</h2>")
        $("#tabs").append(info.tabs)
        $("#related").append(info.nearby)
        $("#related").append(info.related)
        appendProvinceData(province,$)
        setNavBar($)
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
 /* fs.writeFile("sitemap/towns-sitemap-3.xml", comuniSiteMap, function (err, file) {
    if (err) throw err;
    console.log("comuni-sitemap"+' Saved!');
});*/
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
     'alt="Province of '+data[i].Name+', '+data[i].Region+'"></img>'+
     '<figcaption>'+en(province.Name)+", "+en(province.Region)+"</figcaption></a></figure>";
   }
   avg=data[107];
   
 }


 function getInfo(comune,province){
  let name=comune.Name;
  let region=regions[province.Region];
  
  let info = {}
  
  info.disclaimer='</br></br><center><span id="disclaimer">This page contains affiliate links. As part of the Amazon Associates and Viator Partner programmes, we may earn a commission on qualified purchases.</span></center>'

  info.map='</br><center class="map"><iframe id="ggmap" src="https://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>'+
  'Search for: '+
  
  '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'+Attractions&output=embed")\' target="_blank"><b><ej>🎭</ej>Attractions</b></a> '+
  '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'+Museums&output=embed")\' target="_blank"><b><ej>🏺</ej>Museums</b></a> '+
  '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'+Restaurants&output=embed")\' target="_blank"><b><ej>🍕</ej>Restaurants</b></a> '+
  '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'+Bars&output=embed")\' target="_blank"><b><ej>🍺</ej>Bars</b></a> '+
  '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'+Beaches&output=embed")\' target="_blank"><b><ej>🏖️</ej>Beaches</b></a> '+
  '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'+Hikinge&output=embed")\' target="_blank"><b><ej>⛰️</ej>Hikes</b></a> '+
  '<a href="https://www.amazon.it/ulp/view?&linkCode=ll2&tag=expiter-21&linkId=5824e12643c8300394b6ebdd10b7ba3c&language=it_IT&ref_=as_li_ss_tl" target="_blank"><b><ej>📦</ej>Amazon Pickup Locations</b></a> '+
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

        info.related='<h2>Provinces Near '+province.Name+'</h2> '+
        '<row class="columns is-multiline is-mobile"> '+        
        facts[related1].snippet+
        facts[related2].snippet+
        facts[related3].snippet+
        facts[related4].snippet+'</row>'

        info.tabs='<div class="tabs effect-3">'+
        '<input type="radio" id="tab-1" name="tab-effect-3" checked="checked">'+
        '<span>Quality of Life</span>'+
        '<input type="radio" id="tab-2" name="tab-effect-3">'+
        '<span>Cost of Living</span>'+
        '<input type="radio" id="tab-3" name="tab-effect-3">'+
        '<span>Digital Nomads</span>'+
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

      info.nearby='<h2>Towns in the Province of '+province.Name+'</h2>'+'\n'
      for (let p in province.Comuni){
        if (province.Comuni[p].Name!=comune)
        info.nearby+='<b><a href="https://expiter.com/comuni/'+handle(province)+'/'+
        handle(province.Comuni[p])+'/">'+province.Comuni[p].Name+'</a></b>'+' '
      }

       
        return info;
      }


function parseGoogleMaps(comune){
    let url="https://www.google.com/maps/search/"+comune.Name
    let html;
    https.get(url, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
        
          html += data;
          
        }),
        res.on('end',function(){
            console.log("Fetching data about "+comune.Name)
            const gdom = new jsdom.JSDOM(html);
            const $ = require('jquery')(gdom.window);
            console.log($("body").html())
            console.log("!!!"+$(".wEvh0b"))
            console.log("!!!"+$(".wEvh0b"))
            console.log("!!!"+$(".wEvh0b"))

        }),
        process.on('uncaughtException', function (err) {
            console.log(err);
        })
        

    })

}


function handle(comune){
  return comune.Name.replace('(*)','').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()
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

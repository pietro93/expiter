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
var selection = ["Bari","Bologna","Cagliari","Caserta","Catania","Florence","Genoa",
"Livorno","Lucca","Padua","Palermo", "Pisa","Reggio Calabria","Rome","Milan","Naples",
"Siena","Trieste","Turin","Venice","Vicenza"]

// Fetch the first dataset
fetch('https://expiter.com/dataset.json', {method:"Get"})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        // Read the second dataset from the local file
        fs.readFile('./dataset_crime_2023.json', 'utf8', (err, jsonString) => {
            if (err) {
                console.log("Error reading file from disk:", err);
                return;
            }
            try {
                const dataset_crime_2023 = JSON.parse(jsonString);
                // Now you can use dataset_crime_2023 in your code
                dataset = data;
                populateData(data);
                for (let i = 0; i < dataset.length; i++){
                    let province = dataset[i];
                    // Find the corresponding province in the dataset_crime_2023
                    let crimeData = dataset_crime_2023.find(item => item.Name === province.Name);
                    if (crimeData) {
                        // Merge the two objects into one
                        province = {...province, ...crimeData};
                    }
                    // Now province contains data from both datasets
                    // Continue with your code...
                }
            } catch(err) {
                console.log('Error parsing JSON string:', err);
            }
        });
    });
            if (selection.includes(en(province.Name))){
                console.log(en(province.Name)+" selected")
            var fileName = 'crime-safety/-'+en(province.Name).replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
            let seoTitle=""+en(province.Name)+" Crime and Safety Index"
            let seoDescription='Is '+en(province.Name)+', Italy safe? A guide for expats. '+en(province.Name)+' crime rate, crime statistics and safety rankings.'
            let sidebar=pb.setSideBar(province)
            
            const dom = new jsdom.JSDOM(
            "<!DOCTYPE html>\n<html lang='en'>"+
            '<head><meta charset="utf-8">'+
            '<link rel="canonical" href="https://expiter.com/'+fileName+'/"/>'+
            '<link rel="alternate" hreflang="en" href="https://expiter.com/'+fileName+'/" />'+
            '<link rel="alternate" hreflang="it" href="https://expiter.com/it/criminalita/'+fileName+'/" />'+
            '<meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale-1,user-scalable=0">'+
            '<script type="text/javascript" src="https://expiter.com/jquery3.6.0.js" defer></script>'+
            '<script type="text/json" src="https://expiter.com/dataset.json"></script>'+
            '<script type="text/javascript" src="https://expiter.com/script.js" defer></script>'+
            '<script type="text/javascript" src="https://expiter.com/bootstrap-toc.js" defer></script>'+
            '<link rel="stylesheet" href="https://expiter.com/fonts.css" media="print" onload="this.media=\'all\'"></link>'+
            '<link rel="stylesheet" href="https://expiter.com/bulma.min.css">'+
            '<link rel="stylesheet" href="https://expiter.com/style.css?v=1.3">'+
            
            '<meta property="og:title" content="'+seoTitle+'" />'+
            '<meta property="og:description" content="'+seoDescription+'" />'+
            '<meta property="og:image" content="https://expiter.com/img/blog/living-in-'+en(province.Name).toLowerCase().replace(" ","-")+'.webp" />'+
            '<meta name="description" content="'+seoDescription+'" />'+
	          '<meta name="keywords" content="'+en(province.Name)+' italy, '+en(province.Name)+' expat,'+en(province.Name)+' life,'+en(province.Name)+' digital nomad" />'+
            "<title>"+seoTitle+"</title>"+
            '<link rel="icon" type="image/x-icon" title="Expiter - Italy Expats and Nomads" href="https://expiter.com/img/expiter-favicon.ico"></link>'           
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
            '<div class="hero" style="background-image:url(\'https://expiter.com/img/blog/life-in-'+en(province.Name).toLowerCase().replace(" ","-")+'.webp\')" '+'title="What is life in '+en(province.Name)+', Italy like?"'+'></div>'+
            '<h1 data-toc-skip id="title" class="title column is-12">  </h1></row>'+
            '<div class="tabs effect-3">'+
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
		'</div></div>'+
            '<div id="info" class="columns is-multiline is-mobile">'+
            '<section id="overview"><h2>Crime and Safety in '+en(province.Name)+'</h2><span id="intro"></span></section>'+
            '<section id="generalinfo"><h2>What is '+en(province.Name)+' like?</h2><span id="info"></span></section>'+
            '<section id="costofliving"><h2>Cost of living in '+en(province.Name)+'</h2><span id="CoL"></span></section>'+
            '<section id="povertyandsafety"><h2>Is '+en(province.Name)+' safe?</h2><span id="safety"></span></section>'+
            '<section id="prosandcons"><h2>Pros and cons of life in '+en(province.Name)+'</h2><span id="ProsAndCons"></span></section>'+
            '<section id="faqs"><h2>FAQs</h2><span id="faqs"></span></section>'+
            '<section id="Discover"><h2>Discover</h2><span id="promo"></span></section>'+
            '</div>'+
            '<aside class="menu sb mobileonly">'+sidebar+'</aside>\n'+
            '</body></html>'
                    )


         let parsedData = fs.readFileSync('temp/parsedDataAbout'+province.Name+'.txt','utf8');
         let provinceData = parsedData.split("%%%")[0]; (provinceData=="undefined"?provinceData="":"")
         let transportData = parsedData.split("%%%")[1]; (transportData=="undefined"?transportData="":"")
         //facts[province.Name]["provinceData"]=provinceData;
         //facts[province.Name]["transportData"]=transportData;
         console.log(facts[province.Name])
         const $ = require('jquery')(dom.window)
         newPage(province, $)
        
         let html = dom.window.document.documentElement.outerHTML;
         fs.writeFile(fileName+".html", html, function (err, file) {
            if (err) throw err;
            console.log(en(dataset[i].Name)+".html"+' Saved!');
        });
        
    }
        }
    })
    .catch(function (err) {
        console.log('error: ' + err);
    });

    function newPage(province, $){
        let info = getInfo(province)
        let separator='</br><span class="separator"></span></br>'

        let map = info.map
        ''
        
        appendProvinceData(province, $);
        setNavBar($);
        let city = en(province.Name);
        
        $(".title").text("What is it like to live in "+en(province.Name)+', Italy');
        $("#overview").append(pb.addBreaks(facts[city].introduction))
        $("#overview").append("<br><br>")
        $("#overview").append(pb.addBreaks(facts[city].overview))
        $("#promo").append(info.viator)
        $("#promo").append(separator)
        $("#promo").append(info.getyourguide)
        $("#promo").append(separator)
        $("#promo").append(info.related)

       }
       
      
  function getData(province){
    for (let i=0;i<dataset.length;i++){
      if (dataset[i].Name==province) return dataset[i];
    }
  }
      
  function getInfo(province){
     
    populateFacts();
    let name=en(province.Name);
    let region=regions[province.Region];
    
    let info = {}

    console.log("trying to retrieve facts for "+name+"...")
    console.log(facts[name].overview)
    info.overview=facts[name].introduction
    info.generalinfo=facts[name].overview;

    info.overview="The province of "+en(province.Name)+" is located in the <b>"+en(province.Region)+"</b> region and has a <b>"+province.Population.toLocaleString()+" people</b>.<br><br>"+
    en(province.Name)+ " ranks"+
    
    info.viator='<center><h3>Recommended Tours in '+(province.Viator?name:region.Name)+'</h3></center>'+
    '<div data-vi-partner-id=P00045447 data-vi-language=en data-vi-currency=EUR data-vi-partner-type="AFFILIATE" data-vi-url="'+
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

   
    info.related=relatedArticles(en(province.Name))

    return info;
  }


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
        '<li><a href="/">Home</a></li>'+
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
   '<a href="/"><div class="logo">Italy Expats & Nomads</div></a>'+
  '</div>')
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

function populateFacts(){}


function relatedArticles(city){
    let related="<h2>Related Articles</h2>"+
    "<row class='columns is-multiline is-mobile'>";
    let candidates = selection.filter(x => x !== city);
    candidates.sort( () => .5 - Math.random() );
    let r1=candidates.pop()
    let r2=candidates.pop()
    let r3=candidates.pop()
    related+='<div class="articlecard column is-4"><figure>'+
    '<a href="https://expiter.com/blog/living-in-'+r1.toLowerCase().replace(" ","-")+'/">'+
    '<img src="https://expiter.com/img/blog/living-in-'+r1.toLowerCase().replace(" ","-")+'.webp"></img>'+
  '<figcaption><h3>What is it like to live in '+r1+'?</h3></figcaption></a></figure></div>'
  related+='<div class="articlecard column is-4"><figure>'+
  '<a href="https://expiter.com/blog/living-in-'+r2.toLowerCase().replace(" ","-")+'/">'+
  '<img src="https://expiter.com/img/blog/living-in-'+r2.toLowerCase().replace(" ","-")+'.webp"></img>'+
  '<figcaption><h3>What is it like to live in '+r2+'?</h3></figcaption></a></figure></div>'
  related+='<div class="articlecard column is-4"><figure>'+
  '<a href="https://expiter.com/blog/living-in-'+r3.toLowerCase().replace(" ","-")+'/">'+
  '<img src="https://expiter.com/img/blog/living-in-'+r3.toLowerCase().replace(" ","-")+'.webp"></img>'+
  '<figcaption><h3>What is it like to live in '+r3+'?</h3></figcaption></a></figure></div></row>'
    return related;
  }

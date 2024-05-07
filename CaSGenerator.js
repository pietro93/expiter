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
  res.end('Hello World!');
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
    '<figure class="column is-3 related"><a href="https://expiter.com/province/'+province.Name.replace(/\s+/g,"-").replace("'","-").toLowerCase()+'/crime-and-safety/">'+
    '<img title="'+en(province.Name)+'" loading="lazy" src="'+
    'https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-280,h-140,c-at_least,q-5" '+
    'alt="Crime and safety in '+en(data[i].Name)+', '+en(data[i].Region)+'"></img>'+
    '<figcaption>'+en(province.Name)+", "+en(province.Region)+"</figcaption></a></figure>";
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

      let dirName = 'province/'+province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
      let dir = path.join(__dirname, dirName);

        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)){
         fs.mkdirSync(dir);
    }

      // Create .htaccess file in the directory
let htaccessContent = `RewriteEngine on\nRewriteRule ^([a-zA-Z0-9-]+)/$ $1.html [L]\nRewriteRule ^$ ${dirName}.html [L]\n`;
fs.writeFileSync(path.join(dir, '.htaccess'), htaccessContent);



      var fileName = ''+dirName+'/crime-and-safety';
            let seoTitle=en(province.Name)+" - Crime and Safety Info Sheet";
            let seoDescription='Information about crime and safety in '+en(province.Name)+', Italy. '+en(province.Name)+' crime index, mafia activity, safety and more.'
            let heroImage='https://expiter.com/img/'+province.Abbreviation+'.webp'
            let sidebar=pb.setSideBar(province)

            const dom = new jsdom.JSDOM(
            "<!DOCTYPE html>"+
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
            '<link rel="stylesheet" href="https://expiter.com/style.css?v=1.1">'+
            
            '<meta property="og:title" content="'+seoTitle+'" />'+
            '<meta property="og:description" content="'+seoDescription+'" />'+
            '<meta property="og:image" content="'+heroImage+'" />'+
            '<meta name="description" content="'+seoDescription+'" />'+
	          '<meta name="keywords" content="'+en(province.Name)+' italy, '+en(province.Name)+' is it safe,'+en(province.Name)+' crime,'+en(province.Name)+' mafia" />'+
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

            '<div class="hero" style="background-image:url(\'https://expiter.com/img/'+province.Abbreviation+'.webp\')" '+'title="'+province.Name+' Province"'+'></div>'+
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
            '<section id="Overview"><h2>Overview</h2><span id="overview"></span></section>'+
            '<section id="Crime and Safety"><h3>Crime and Safety</h3><span id="crimeandsafety"></span></section>'+
            '<section id="Thefts and Robberies"><h3>Thefts and Robberies</h3><span id="theftsandrobberies"></span></section>'+
            '<section id="Violence"><h3>Violent Crimes</h3><span id="violentcrimes"></span></section>'+
            '<section id="Organized Crime"><h3>Organized Crime & Drug-related Crimes</h3><span id="organizedcrime"></span></section>'+
            '<section id="Accidents"><h3>Accidents</h3><span id="accidents"></span></section>'+
            '<section id="Discover"><h2>Discover</h2><span id="promo"></span></section>'+
            '</div>'+
            '<aside class="menu sb mobileonly">'+sidebar+'</aside>\n'+
            '</body></html>'
                    )

      /*let parsedData = fs.readFileSync('temp/parsedDataAbout' + province.Name + '.txt', 'utf8');
      let provinceData = parsedData.split('%%%')[0];
      provinceData = provinceData === 'undefined' ? '' : provinceData;
      let transportData = parsedData.split('%%%')[1];
      transportData = transportData === 'undefined' ? '' : transportData;
      facts[province.Name]['provinceData'] = provinceData;
      facts[province.Name]['transportData'] = transportData;*/

      console.log(facts[province.Name])
         const $ = require('jquery')(dom.window)
         newPage(province, $)
        
         let html = dom.window.document.documentElement.outerHTML;
         fs.writeFile(fileName+".html", html, function (err, file) {
            if (err) throw err;
            console.log(dataset[i].Name+".html"+' Saved!');
        });
    }
  })
  .catch(function (err) {
    console.log('error: ' + err);
  });

  function newPage(province, $){
    let info = getInfo(province)
    let separator='</br><span class="separator"></span></br>'
    appendProvinceData(province, $);
    pb.setNavBar($);
        
    $(".title").text(en(province.Name)+' for Expats and Nomads');

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

}function getInfo(province){
  populateFacts()

  console.log("Getting info on "+province.Name)
  console.log("...")

     
    let ratio = (province.Men/(Math.min(province.Men,province.Women))).toFixed(2)+":"+(province.Women/(Math.min(province.Men,province.Women))).toFixed(2);

    
    let info = {}

    let name=province.Name;
        let region=regions[province.Region];

    info.overview=""

    info.crimeandsafety="The province of "+en(province.Name)+" ranks <b>"+province.SafetyRank+" out of 106 for safety</b> according to our data, with a <b>safety score of "+province.SafetyScore+"</b>. "+
    "There were a total of " + province.IndiceCriminalita + " official reports of crime per 100,000 inhabitants in the province in 2023. This is " + 
(province.IndiceCriminalita > avg.IndiceCriminalita ? "<b class='red'>higher than the average</b> number of reported crimes per 100,000 inhabitants across all Italian provinces. This could be due to a variety of factors, including socio-economic conditions, and law enforcement practices." : 
(province.IndiceCriminalita < avg.IndiceCriminalita ? "<b class='green'>lower than the average</b> number of reported crimes per 100,000 inhabitants across all Italian provinces. This could indicate effective law enforcement practices, or other factors that contribute to lower crime rates." : 
"<b class='yellow'>in line with the average</b> number of reported crimes per 100,000 inhabitants across all Italian provinces. This suggests that the crime rate in " + en(province.Name) + " is typical for Italian provinces."))

info.theftsandrobberies = "In the province of "+en(province.Name)+", there were <b>"+province.FurtiDestrezza+" instances of thefts with dexterity</b> (thefts committed with special skill, superior to that normally used by the common thief), <b>"+province.FurtiStrappo+" instances of snatch thefts</b> (thefts committed by someone who takes possession of another's movable property by snatching it from the person's hand or body), <b>"+province.FurtiAutovettura+" car thefts</b>, and <b>"+province.FurtiAbitazione+" home burglaries</b> per 100,000 inhabitants in 2023.<br><br> Below is an overview of how these types of theft compare with the average across all Italian provinces: <br><br>"+
(province.FurtiDestrezza > avg.FurtiDestrezza ? "<b class='red'>Thefts with dexterity are higher than the average</b>. This could be due to a variety of factors, including socio-economic conditions, and law enforcement practices." : 
(province.FurtiDestrezza < avg.FurtiDestrezza ? "<b class='green'>Thefts with dexterity are lower than the average</b>. This could indicate effective law enforcement practices, or other factors that contribute to lower crime rates." : 
"<b class='yellow'>Thefts with dexterity are in line with the average</b>. This suggests that the rate of thefts with dexterity in " + en(province.Name) + " is typical for Italian provinces.")) +
'<br><br>'+
(province.FurtiStrappo > avg.FurtiStrappo ? "<b class='red'> Snatch thefts are higher than the average</b>. This could be due to a variety of factors, including socio-economic conditions, and law enforcement practices." : 
(province.FurtiStrappo < avg.FurtiStrappo ? "<b class='green'>Snatch thefts are lower than the average</b>. This could indicate effective law enforcement practices, or other factors that contribute to lower crime rates." : 
"<b class='yellow'>Snatch thefts are in line with the average</b>. This suggests that the rate of snatch thefts in " + en(province.Name) + " is typical for Italian provinces.")) +
'<br><br>'+
(province.FurtiAutovettura > avg.FurtiAutovettura ? "<b class='red'>Car thefts are higher than the average</b>. This could be due to a variety of factors, including socio-economic conditions, and law enforcement practices." : 
(province.FurtiAutovettura < avg.FurtiAutovettura ? "<b class='green'>Car thefts are lower than the average</b>. This could indicate effective law enforcement practices, or other factors that contribute to lower crime rates." : 
"<b class='yellow'>Car thefts are in line with the average</b>. This suggests that the rate of car thefts in " + en(province.Name) + " is typical for Italian provinces.")) +
'<br><br>'+
(province.FurtiAbitazione > avg.FurtiAbitazione ? "<b class='red'>Home burglaries are higher than the average</b>. This could be due to a variety of factors, including socio-economic conditions, and law enforcement practices." : 
(province.FurtiAbitazione < avg.FurtiAbitazione ? "<b class='green'>Home burglaries are lower than the average</b>. This could indicate effective law enforcement practices, or other factors that contribute to lower crime rates." : 
"<b class='yellow'>Home burglaries are in line with the average</b>. This suggests that the rate of home burglaries in " + en(province.Name) + " is typical for Italian provinces."));


info.violentcrimes = "In the province of "+en(province.Name)+", there were "+(province.Omicidi + province.ViolenzeSessuali)+" instances of violent crimes (homicides and sexual assaults) per 100,000 inhabitants in 2023. This is "+
(province.Omicidi + province.ViolenzeSessuali > avg.Omicidi + avg.ViolenzeSessuali ? "<b class='red'>higher than the average</b> number of violent crimes per 100,000 inhabitants across all Italian provinces. This could be due to a variety of factors, including socio-economic conditions, and law enforcement practices." : 
(province.Omicidi + province.ViolenzeSessuali < avg.Omicidi + avg.ViolenzeSessuali ? "<b class='green'>lower than the average</b> number of violent crimes per 100,000 inhabitants across all Italian provinces. This could indicate effective law enforcement practices, or other factors that contribute to lower crime rates." : 
"<b class='yellow'>in line with the average</b> number of violent crimes per 100,000 inhabitants across all Italian provinces. This suggests that the violent crime rate in " + en(province.Name) + " is typical for Italian provinces."));

info.organizedcrime = "In the province of "+en(province.Name)+", there were "+province.Estorsioni+" instances of extortions, "+province.RiciclaggioDenaro+" instances of money laundering, and "+province.ReatiStupefacenti+" drug-related crimes (such as dealing, production, etc.) per 100,000 inhabitants in 2023. "+
'<br><br>'+(province.Estorsioni > avg.Estorsioni ? "<b class='red'>Extortions are higher than the average for all provinces in Italy</b>. This could be due to a variety of factors, including socio-economic conditions, and law enforcement practices." : 
(province.Estorsioni < avg.Estorsioni ? "<b class='green'>Extortions are lower than the average amongst all Italian provinces</b>. This could indicate effective law enforcement practices, or other factors that contribute to lower crime rates." : 
"<b class='yellow'>Extortions are in line with the average for provinces in Italy</b>. This suggests that the rate of extortions in " + en(province.Name) + " is typical for Italian provinces.")) +
'<br><br>'+(province.RiciclaggioDenaro > avg.RiciclaggioDenaro ? "<b class='red'> Money laundering instances are higher than the average across all provinces in the country</b>. This could be due to a variety of factors, including socio-economic conditions, and law enforcement practices." : 
(province.RiciclaggioDenaro < avg.RiciclaggioDenaro ? "<b class='green'>Money laundering instances are lower than the average for all the provinces in the country</b>. This could indicate effective law enforcement practices, or other factors that contribute to lower crime rates." : 
"<b class='yellow'>Money laundering instances are in line with the national average</b>. This suggests that the rate of money laundering in " + en(province.Name) + " is typical for Italian provinces.")) +
'<br><br>'+(province.ReatiStupefacenti > avg.ReatiStupefacenti ? "<b class='red'>Drug-related crimes are higher than the average for all Italian provinces</b>. This could be due to a variety of factors, including socio-economic conditions, and law enforcement practices." : 
(province.ReatiStupefacenti < avg.ReatiStupefacenti ? "<b class='green'>Drug-related crimes are lower than the average for all Italian provinces</b>. This could indicate effective law enforcement practices, or other factors that contribute to lower crime rates." : 
"<b class='yellow'>Drug-related crimes are in line with the average amongst Italian provinces</b>. This suggests that the rate of drug-related crimes in " + en(province.Name) + " is typical for Italian provinces."))
+(facts[province.Name].mafia?'<br><br><h3>Mafia Activity</h3>'+facts[province.Name].mafia:"");

info.accidents = "In the province of "+en(province.Name)+", there were "+province.InfortuniLavoro+" instances of fatal and permanent disability accidents per 10,000 employees, and "+province.MortalitàIncidenti+" road accident deaths per 10,000 residents in 2023. "+
(province.InfortuniLavoro > avg.InfortuniLavoro ? "<b class='red'>Workplace accidents are higher than the average for all Italian provinces</b>. This could be due to a variety of factors, including workplace safety practices and conditions." : 
(province.InfortuniLavoro < avg.InfortuniLavoro ? "<b class='green'>Workplace accidents are lower compared to the average of all provinces in Italy</b>. This could indicate effective workplace safety practices." : 
"<b class='yellow'>Workplace accidents are in line with the national average average</b>. This suggests that the rate of workplace accidents in " + en(province.Name) + " is typical for Italian provinces.")) +
'<br><br>'+(province.MortalitàIncidenti > avg.MortalitàIncidenti ? "<b class='red'> Road accident deaths are higher than the national average</b>. This could be due to a variety of factors, including road safety practices and conditions." : 
(province.MortalitàIncidenti < avg.MortalitàIncidenti ? "<b class='green'>Road accident deaths are lower than the national average</b>. This could indicate effective road safety practices." : 
"<b class='yellow'>Road accident deaths are in line with the national average</b>. This suggests that the rate of road accident deaths in " + en(province.Name) + " is typical for Italian provinces."));

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

info.related='<h2>Crime and Safety of Provinces Nearby</h2> '+
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
  facts.Roma.mafia="There is mafia activity in Rome. Several organized crime groups, including the 'Ndrangheta, Camorra, and homegrown Roman crime families, have established a presence and influence in the city of Rome. Rome is considered a major money laundering center for criminal organizations, with an estimated 45 different gangs collaborating in the city's corruption and criminal activities. The Casamonica crime family, rooted in the Sinti Roma community, controls the southeastern suburbs of Rome and the surrounding Alban hills. In 2015, the Casamonica clan held a lavish funeral for their boss Vittorio Casamonica, showcasing their power and influence. In 2018, five members of the Casamonica clan were sentenced to up to 30 years in prison under Italy's strict mafia laws. Additionally, the 'Mafia Capitale' network, uncovered in 2014, involved corrupt politicians, businessmen, and officials colluding with criminal groups to rig public contracts. These instances highlight the presence of various mafia-style criminal organizations operating in Rome through corruption, extortion, drug trafficking, and other illicit activities."
  facts.Milano.mafia="There is a significant mafia presence in Milan; the city has long been infiltrated by various organized crime groups, including the 'Ndrangheta from Calabria, the Camorra from Naples, and homegrown Milanese crime families;the roots of Milan's mafia problem date back to the 1960s, when criminal organizations began establishing a foothold in the city and surrounding Lombardy region;over time, they have diversified their activities from traditional rackets like extortion and drug trafficking to infiltrating the legal economy through money laundering and corruption;a 2018 report commissioned by the Lombardy region found that an estimated 45 different mafia-type gangs were operating in Milan, collaborating in various criminal enterprises;the 'Ndrangheta in particular has become a dominant force, with the powerful Valle clan based in Milan controlling much of the city's drug trade and money laundering operations; mafia infiltration has extended to the political and business spheres as well, with corrupt politicians, lawyers, and officials colluding with organized crime groups;high-profile cases like the 'Mafia Capitale' scandal in 2014 have exposed the depth of these unholy alliances in Milan;while the city's mafia presence was long denied or downplayed, recent arrests and investigations have made it clear that Milan is no longer immune to the tentacles of organized crime in Italy;tackling this entrenched problem remains an ongoing challenge for law enforcement and authorities."
  facts.Napoli.mafia="Naples has a long history of mafia activity, primarily associated with the Camorra, one of Italy's oldest and most powerful criminal organizations; the Camorra has deep roots in Naples and the surrounding Campania region, controlling various illegal activities such as drug trafficking, extortion, and racketeering; the organization's influence extends into legitimate businesses, allowing them to launder money and expand their criminal enterprises; the Camorra's presence in Naples has led to high levels of violence and corruption, impacting the daily lives of residents and businesses in the area; efforts to combat the Camorra have been ongoing, with law enforcement agencies targeting key figures and operations to weaken the organization's grip on the city; despite these efforts, the Camorra remains a significant force in Naples, posing challenges to authorities and the community in their fight against organized crime."
  facts.Bari.mafia="Bari and the surrounding Puglia region have long been influenced by various organized crime groups, including the Sacra Corona Unita, a mafia-type organization that emerged in the 1980s; the Sacra Corona Unita has been involved in a range of criminal activities such as drug trafficking, extortion, and money laundering; the group has also infiltrated legitimate businesses and political circles, using corruption and intimidation to expand its power and influence; law enforcement efforts have led to numerous arrests and convictions of Sacra Corona Unita members, but the organization continues to maintain a presence in Bari and the surrounding area; in addition to the Sacra Corona Unita, other criminal groups, including the 'Ndrangheta and Camorra, have also established a foothold in Bari, further complicating the fight against organized crime in the city."
facts.Catania.mafia="Catania has been a hotspot for mafia activity, particularly linked to the Cosa Nostra clans operating in the area; recent police operations in Catania have led to significant arrests, with 40 people detained in a sweep targeting Cosa Nostra clans in the city; investigations have uncovered connections between mafia groups and drug trafficking activities in Catania, with key figures like Massimiliano Arena, Marco Turchetti, Rosario Turchetti, and Angelo Patanè implicated in these criminal operations; the presence of organized crime in Catania has also been highlighted by the city's association with the powerful 'Ndrangheta mafia clans, known for their involvement in money laundering, drug dealing, and arms smuggling across Europe; the city's crime epidemic, including street muggings and carjackings, has raised concerns about the influence of Sicily's Mafia families in Catania, with ongoing efforts by Italian police to curb these criminal activities and dismantle mafia networks operating in the region."
facts.Palermo.mafia="Palermo, the capital of Sicily, has long been considered the birthplace and stronghold of the Sicilian Mafia, also known as the Cosa Nostra. The city has a deep-rooted history of mafia influence, dating back to the mid-19th century when private armies, or 'mafie', were hired by absentee landlords to protect their estates from bandits. Over time, these 'mafie' evolved into a powerful criminal organization that expanded its activities beyond just providing protection, engaging in extortion, arbitration of disputes, and the oversight of illegal agreements and transactions. By the 20th century, the Mafia had become entrenched in Palermo's political, economic, and social fabric, wielding significant influence and control. The Mafia's presence in Palermo has been marked by periods of both suppression and resurgence. In the 1920s, Fascist dictator Benito Mussolini's appointed prefect, Cesare Mori, launched a crackdown that temporarily disrupted the Mafia's operations. However, the organization regained strength after the Allied invasion of Sicily in 1943, when many imprisoned mafiosi were released and reinstated in positions of power. The 1980s and 1990s were particularly turbulent years for Palermo, as the Mafia's influence and criminal activities escalated, leading to an increase in violence and high-profile assassinations targeting anti-Mafia figures, such as the 1992 killings of judges Giovanni Falcone and Paolo Borsellino. Despite ongoing efforts by law enforcement and the Italian government to combat the Mafia's grip on Palermo, the city remains a stronghold of organized crime, with the Cosa Nostra continuing to exert its power and control over various aspects of life in the Sicilian capital."
facts.Torino.mafia="There is evidence of mafia presence and activity in Turin and the Piedmont region. Investigations have revealed mafia infiltration into the legal economy, particularly related to construction projects and public contracts. Criminal groups like the 'Ndrangheta from Calabria and Nigerian mafia organizations have established a foothold in Turin, engaging in activities such as drug trafficking, extortion, and money laundering. While the extent of the mafia's influence in the city is not fully clear from the available information, it is evident that organized crime groups have managed to gain a presence and exert their power in Turin."
facts.Genova.mafia="The 'Ndrangheta, a powerful organized crime group from Calabria, has a significant presence and influence in Genoa and the surrounding Liguria region. Investigations have revealed mafia infiltration into construction companies and projects, including the 2018 Genoa bridge collapse. The mafia's presence in Genoa is further evidenced by the existence of a 'Mafia Tour' experience organized by the Libera association, which aims to highlight the symbolic places of mafia activity in the city and educate people about the realities of organized crime."
facts.Venezia.mafia="The mafia has a significant presence in Venice, particularly in the form of the 'Ndrangheta from Calabria. The group has infiltrated various sectors of the city's economy, including construction, tourism, and finance. They have established a network of hotels, restaurants, and other tourist-oriented businesses to launder money from illegal activities such as drug trafficking and arms dealing. The mafia's influence in Venice is further evident in the high rate of ownership changes among hotels and pizzerias, which are often used as fronts for criminal activities. The authorities have struggled to keep up with the mafia's operations, with new batches of crooked casino cashiers and hotel owners emerging after each arrest. The mafia's power struggle in Venice is ongoing, with a recent mock execution of a local official highlighting the danger and unpredictability of the situation."
facts.Messina.mafia="The mafia has a significant presence in Messina, particularly with the influence of the Romeo-Santapaola clan. This clan holds power in the city, with close ties to Cosa Nostra in Palermo and control over illicit affairs. The mafia landscape in Messina involves various criminal entities, with the province maintaining a dominance of mafia groups. The mafia in Messina is intertwined with the Romeo-Santapaola clan, which conducts business and criminal activities in the region. The Dia reports that most of the mafia clans in Messina, except one, are under the influence of the Catania-based Romeo-Santapaola family. The mafia control in Messina is highlighted by the continuous evolution of the criminal landscape, with the city being a hub for various criminal entities."
facts.Firenze.mafia="There is evidence of mafia presence and influence in Florence. The city has been impacted by mafia activities, including the 1993 Via dei Georgofili bombing carried out by the Sicilian Mafia, which resulted in five deaths and 48 injuries. This attack was part of a series of terror acts ordered by the Mafia in response to internal issues and state actions. Additionally, there are concerns about mafia infiltration and criminal activities in Florence, with reports highlighting the city's struggle with organized crime and gangs."
facts.Bologna.mafia="Bologna and the Emilia-Romagna region have historically been free from significant mafia presence. However, recent reports and investigations reveal signs of mafia infiltration in the area. A landmark court case in 2013 in Bologna acknowledged the existence of a 'Ndrangheta-linked criminal group operating in the province, involved in a large-scale illegal gambling operation. This marked the first time the Court in Bologna recognized a mafia-linked group in the region's history. Concerns about mafia activities in Bologna include the confiscation of millions of euros from individuals with suspected ties to the 'Ndrangheta, indicating a growing mafia influence in the region's economy and businesses."
facts["Reggio Calabria"].mafia="Reggio Calabria and the Calabria region are recognized as strongholds of the 'Ndrangheta, one of Italy's most powerful mafia organizations. The 'Ndrangheta has deep-rooted influence in Calabria, engaging in various criminal activities such as drug trafficking, extortion, money laundering, and corruption. Reggio Calabria, historically dissolved by the government due to mafia infiltration, remains a key operational base for the 'Ndrangheta. The region has a significant history of mafia-related arrests and convictions, showcasing the 'Ndrangheta's control through violence and intimidation to uphold its criminal enterprises. The 'Ndrangheta's dominance in Reggio Calabria solidifies its status as a major mafia stronghold in Italy."
facts["L'Aquila"].mafia="L\'Aquila, the capital city of the Abruzzo region, has been targeted by various mafia organizations. The Nigerian mafia has been active in the city, leading to police operations and arrests. L\'Aquila was also linked to Matteo Messina Denaro, a prominent Sicilian mafia boss who was hospitalized in the city before his death. Additionally, the \"mafia dei pascoli\" has infiltrated the local agricultural and livestock sectors, impacting businesses and the regional economy. These criminal activities highlight the presence and influence of organized crime groups in L\'Aquila, posing challenges for the city and the Abruzzo region."
facts.Foggia.mafia="The Foggia mafia, also known as the 'fourth mafia' among law enforcement, is a syndicate comprised of different groups involved in a wide array of crimes. The main activities of the Foggia mafia include racketeering, extortion targeting local businesses, and the use of arson and bomb attacks to intimidate businesses into paying protection money. The mafia in Foggia has been involved in drug trafficking, illegal weapons possession, and systematic extortion of rivals and locals. The criminal organization is characterized by its high degree of aggression and violence, making it one of the most dangerous and violent criminal groups in Italy. The Foggia mafia has a stranglehold on cocaine sales in the southeast region and is known for its aggressive tactics, including bombings and murders to assert control over the territory."
facts.Catanzaro.mafia="The 'Ndrangheta, one of Italy's most powerful mafia organizations, has a significant presence and influence in Catanzaro and the surrounding Calabria region. Authorities have uncovered numerous examples of the 'Ndrangheta's criminal activities in the area, including arrests of individuals with ties to the mafia group for crimes such as kidnapping and drug trafficking. Investigations have also led to the seizure of over 2.5 million euros worth of assets belonging to suspected 'Ndrangheta members, highlighting the mafia's infiltration into the local economy. Furthermore, a deadly arsenal of weapons, including pistols, rifles, machine guns, and Kalashnikovs, was discovered hidden by 'Ndrangheta clans operating in the Catanzaro area, demonstrating the criminal organization's access to significant firepower. The 'Ndrangheta's presence in Catanzaro has also been linked to providing protection and assistance to a high-profile fugitive from a major mafia investigation, showcasing the group's extensive criminal network in the region."
facts.Verona.mafia="Verona has faced significant mafia infiltration, particularly from the 'Ndrangheta criminal organization. The city is the second province in the Veneto region for the number of assets confiscated from mafia groups. The mafia has been accused of infiltrating the construction sector in Verona, with over 1 billion euros in value and more than 13,600 companies affected. This has led to calls from local mayors for the establishment of an anti-mafia investigative unit in the region to combat the criminal activities."
facts.Pisa.mafia="Pisa has been a target for mafia activities, with incidents such as the confiscation of 250,000 euros worth of assets from a mafia clan in the area. Additionally, the mafia in Pisa has been linked to supporting the electoral campaign of the mayor of Rosarno, Giuseppe Idà, in exchange for political favors. These events highlight the significant presence and involvement of the mafia in Pisa, engaging in criminal activities and exerting influence in the region."
}
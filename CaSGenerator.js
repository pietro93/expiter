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
let htaccessContent = `RewriteEngine on\nRewriteRule ^$ /${dirName}.html [L]\nRewriteRule ^([a-zA-Z0-9-]+)/$ $1.html [L]`;
fs.writeFileSync(path.join(dir, '.htaccess'), htaccessContent);





      var fileName = ''+dirName+'/crime-and-safety';
            let seoTitle=en(province.Name)+" - Crime and Safety Info Sheet";
            let seoDescription='Information about crime and safety in '+en(province.Name)+', Italy. '+en(province.Name)+' crime index, mafia activity, safety and more.'
            let heroImage='https://expiter.com/img/safety/'+province.Abbreviation+'.webp'
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

            '<div class="hero" style="background-image:url(\'https://expiter.com/img/safety/'+province.Abbreviation+'.webp\')" '+'title="'+province.Name+' Province"'+'></div>'+
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
            '<section id="FAQs"><h3>Frequently Asked Questions</h3><span id="faqs"></span></section>'+
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
        
    $(".title").text("Crime and Safety in "+en(province.Name)+'');

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
    $("#faqs").append(pb.addBreaks(info.faqs))
    $("#faqs").append(separator)
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

let separator='</br><span class="separator"></span></br>'

info.faqs = facts[province.Name]?.safeToLive 
    ? "<h3>Is " + province.Name + " safe to live?</h3>" + 
    facts[province.Name].safeToLive
    : "";

    info.faqs += facts[province.Name]?.forTourists
    ? separator + "<h3>Is " + province.Name + " safe for tourists and travelers?</h3>" + 
    facts[province.Name].forTourists
    : "";

    info.faqs += facts[province.Name]?.safeAtNight
    ? separator + "<h3>Is " + province.Name + " safe at night?</h3>" + 
    facts[province.Name].safeAtNight
    : "";

    info.faqs += facts[province.Name]?.forStudents
    ? separator + "<h3>Is " + province.Name + " safe for students?</h3>" + 
    facts[province.Name].forStudents
    : "";

info.faqs += facts[province.Name]?.forWomen
    ? separator + "<h3>Is " + province.Name + " safe for female solo travellers?</h3>" + 
    facts[province.Name].forWomen
    : "";

info.faqs += facts[province.Name]?.forMuslims
    ? separator + "<h3>Is " + province.Name + " safe for Muslims?</h3>" + 
    facts[province.Name].forMuslims
    : "";

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
  facts.Milano.mafia="There is a significant mafia presence in Milan. The city has long been infiltrated by various organized crime groups, including the 'Ndrangheta from Calabria, the Camorra from Naples, and homegrown Milanese crime families. The roots of Milan's mafia problem date back to the 1960s, when criminal organizations began establishing a foothold in the city and surrounding Lombardy region. Over time, they have diversified their activities from traditional rackets like extortion and drug trafficking to infiltrating the legal economy through money laundering and corruption. A 2018 report commissioned by the Lombardy region found that an estimated 45 different mafia-type gangs were operating in Milan, collaborating in various criminal enterprises. The 'Ndrangheta in particular has become a dominant force, with the powerful Valle clan based in Milan controlling much of the city's drug trade and money laundering operations. Mafia infiltration has extended to the political and business spheres as well, with corrupt politicians, lawyers, and officials colluding with organized crime groups. High-profile cases like the 'Mafia Capitale' scandal in 2014 have exposed the depth of these unholy alliances in Milan. While the city's mafia presence was long denied or downplayed, recent arrests and investigations have made it clear that Milan is no longer immune to the tentacles of organized crime in Italy. Tackling this entrenched problem remains an ongoing challenge for law enforcement and authorities."
  facts.Napoli.mafia="Naples has a long history of mafia activity, primarily associated with the Camorra, one of Italy's oldest and most powerful criminal organizations. The Camorra has deep roots in Naples and the surrounding Campania region, controlling various illegal activities such as drug trafficking, extortion, and racketeering. The organization's influence extends into legitimate businesses, allowing them to launder money and expand their criminal enterprises. The Camorra's presence in Naples has led to high levels of violence and corruption, impacting the daily lives of residents and businesses in the area. Efforts to combat the Camorra have been ongoing, with law enforcement agencies targeting key figures and operations to weaken the organization's grip on the city. Despite these efforts, the Camorra remains a significant force in Naples, posing challenges to authorities and the community in their fight against organized crime."
  facts.Bari.mafia="Bari and the surrounding Puglia region have long been influenced by various organized crime groups, including the Sacra Corona Unita, a mafia-type organization that emerged in the 1980s. The Sacra Corona Unita has been involved in a range of criminal activities such as drug trafficking, extortion, and money laundering. The group has also infiltrated legitimate businesses and political circles, using corruption and intimidation to expand its power and influence. Law enforcement efforts have led to numerous arrests and convictions of Sacra Corona Unita members, but the organization continues to maintain a presence in Bari and the surrounding area. In addition to the Sacra Corona Unita, other criminal groups, including the 'Ndrangheta and Camorra, have also established a foothold in Bari, further complicating the fight against organized crime in the city."
facts.Catania.mafia="Catania has been a hotspot for mafia activity, particularly linked to the Cosa Nostra clans operating in the area. Recent police operations in Catania have led to significant arrests, with 40 people detained in a sweep targeting Cosa Nostra clans in the city. Investigations have uncovered connections between mafia groups and drug trafficking activities in Catania, with key figures like Massimiliano Arena, Marco Turchetti, Rosario Turchetti, and Angelo Patanè implicated in these criminal operations. The presence of organized crime in Catania has also been highlighted by the city's association with the powerful 'Ndrangheta mafia clans, known for their involvement in money laundering, drug dealing, and arms smuggling across Europe. The city's crime epidemic, including street muggings and carjackings, has raised concerns about the influence of Sicily's Mafia families in Catania, with ongoing efforts by Italian police to curb these criminal activities and dismantle mafia networks operating in the region."
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
facts.Brindisi.mafia = "The Sacra Corona Unita, a powerful mafia-type criminal organization, is actively present and engaged in various illicit activities in Brindisi. This group has been heavily involved in cigarette smuggling, earning Brindisi the nickname 'Marlboro City' in the 1990s. The Sacra Corona Unita has also been linked to a violent feud between criminal clans in the Brindisi area between 1989 and 1991, resulting in over 100 deaths. Recent law enforcement operations have also targeted extortion, drug trafficking, and robbery activities by the Sacra Corona Unita clan in Brindisi. Law enforcement has taken action, arresting 13 suspected members of the Sacra Corona Unita, including some in leadership positions. However, the mafia's presence and criminal activities continue to be a significant problem in Brindisi."
facts.Rimini.mafia = "The mafia presence in Rimini has been a concern, with instances of anti-mafia measures being taken against businesses suspected of having ties to organized crime. The local prefect has issued interdicts against certain enterprises in Rimini, indicating ongoing efforts to combat mafia influence in the city. These actions reflect a proactive stance to prevent mafia infiltration in the economic fabric of Rimini and maintain the dominance of legitimate economic activities in the region."

facts["Milano"].safeToLive="According to the ranking by Il Sole 24 Ore based on data from the Ministry of the Interior, Milan is considered one of the most dangerous cities in Italy for living. The city holds the unfortunate top spot, with 6,991.3 reports per 100,000 inhabitants. Milan has seen a significant increase in robberies, rising from 103.4 to 128.1 per 100,000 inhabitants. While Milan is generally considered a safe city, there are some safety concerns that residents should be aware of. Petty crimes like pickpocketing and bag snatching are common, especially in crowded areas and on public transportation. Violent crimes, though less frequent, do occur, and residents should exercise caution, particularly in certain neighborhoods. Certain areas of Milan, such as Tor Bella Monaca, Romanina, San Basilio, and Corviale, are known to have higher crime rates, especially at night. Residents are advised to avoid these neighborhoods or exercise extra vigilance when traveling through them. The city's public transportation system is generally safe, but it's recommended to book taxis from reputable companies and travel in groups when possible. To stay safe in Milan, residents should follow basic safety precautions, such as keeping personal belongings secure, avoiding carrying large amounts of cash, and being aware of their surroundings, especially at night. Solo female residents may face unwanted attention and should be prepared to react assertively if necessary. While Milan's safety challenges are concerning, it's important to note that the majority of crimes are property-related, such as theft and robbery, rather than violent crimes. However, the city's high ranking in the safety index highlights the need for targeted interventions to improve overall security and quality of life for residents."
facts["Roma"].safeToLive="Rome is generally considered a somewhat safe city to live in, but there are some safety considerations residents should be aware of. Petty crimes like pickpocketing are common, especially in crowded tourist areas and on public transportation, so it's important to keep personal belongings secure. Scams targeting residents and visitors, such as taxi overcharging and fake petitions, are also prevalent, so caution is advised when dealing with unfamiliar individuals or situations. Certain neighborhoods in Rome, like Tor Bella Monaca, Romanina, San Basilio, and Corviale, are known to have higher crime rates, particularly at night. Residents should exercise extra caution when traveling through these areas and consider avoiding them if possible. While the city's public transportation system is generally safe, it's advisable to book taxis from reputable companies, travel in groups, and plan routes to minimize risks. To stay safe in Rome, residents should follow basic precautions, such as avoiding carrying large amounts of cash, being aware of their surroundings, and trusting their instincts. Solo female residents may face unwanted attention and should be prepared to react assertively if necessary."
facts.Napoli.safeToLive="While Naples is generally considered safe, it does have some unique safety challenges compared to other major Italian cities. The city has a relatively high crime rate, especially for petty crimes like pickpocketing and scams targeting tourists. Travelers need to be vigilant with their belongings, especially in crowded areas. Naples also has a significant mafia presence, which can lead to issues with organized crime and corruption in certain neighborhoods. Some areas like Museo, Garibaldi Square, and Forcella are considered less safe, especially at night. Traveling after dark requires more caution, as the city center and tourist areas that are safe during the day can attract a less desirable crowd in the evening. Avoiding unlit side streets and being aware of your surroundings is advised. However, the reputation of Naples as an extremely dangerous city is somewhat exaggerated. With basic safety measures, the majority of tourists and residents can navigate the city safely, especially in the well-policed and busy tourist areas. Exercising common sense and avoiding high-risk areas, especially at night, can allow travelers to safely experience the city's vibrant culture and attractions."
facts.Bari.safeToLive="Bari is generally considered a safe city to live in, with a relatively low crime rate compared to other major Italian cities. While petty crimes like pickpocketing and bag-snatching do occur, especially in crowded areas and near transportation hubs, the chances of tourists becoming victims of violent crime are highly unlikely. Residents and visitors are advised to take normal precautions to secure their belongings. Some neighborhoods in Bari, such as San Paolo, San Pio-Enziteto, and Fesca, are considered higher-crime areas and should be avoided, especially at night. Other areas like Japigia, Libertà, and Madonnella are also noted as less safe for tourists. The safest neighborhoods in Bari are said to be Carassi, Murattiano, and Bari-Palese, which are quieter and more residential. The historic city center has also seen improvements in safety in recent years. Overall, with basic safety measures, Bari can be navigated safely as a resident. The city's cultural attractions, cuisine, and coastal location make it an appealing place to live for many."
facts.Catania.safeToLive="Catania is generally considered a relatively safe city to live in, but it does have some safety considerations that residents should be aware of. The city has a medium overall risk, with concerns about petty crimes like pickpocketing, muggings, and scams being common, especially in crowded areas and near transportation hubs. Residents are advised to be vigilant with their belongings, avoid wearing expensive jewelry, and not carry large amounts of cash. It is recommended to stay alert and avoid walking alone at night, particularly in poorly lit areas and around the train station. The city is prone to natural disasters like earthquakes and floods due to its location on the eastern Sicily coast, making it important for residents to stay informed about weather conditions and follow local advisories."
facts.Palermo.safeToLive="Palermo can be considered a relatively safe city to live in, especially compared to its notorious past. While the city has a history associated with the mafia, organized crime has been significantly reduced in recent decades due to efforts by the judiciary and population. Palermo is no longer dominated by organized crime. Petty crimes like pickpocketing and thefts do occur, especially in crowded tourist areas, but are not excessively high compared to other Italian cities. Residents are advised to take basic precautions, such as keeping valuables secure and avoiding isolated areas at night. As with any large city, some neighborhoods in Palermo are safer than others. Certain areas like the historic center have seen improvements in safety in recent years. However, residents should still exercise normal precautions."
facts.Torino.safeToLive="Turin is generally considered a safe city to live in, with low crime rates compared to other cities in Italy. The city's strong economy, developed infrastructure, and quality of life attract people from all over the world. While Turin is generally safe, it is advisable to take basic precautions, such as avoiding dark and isolated areas at night and keeping valuables out of sight. Petty theft can occur in busy tourist areas, so it's best to be vigilant and aware of your surroundings. The city excels in safety with its excellent healthcare system, boasting some of the best hospitals in Italy, and efficient emergency services. Overall, Turin is a fantastic place to live, with its rich history, stunning architecture, delicious cuisine, and proximity to the mountains. Safety should not be a significant concern when considering living in Turin, as long as you exercise common sense and take precautions like in any other city."
facts.Genova.safeToLive="Genoa is a relatively safe city for tourists and residents, with a moderate crime rate compared to other major cities in Italy and Europe. During the day, the main inconvenience that may arise is pickpocketing, especially in crowded tourist areas like squares, viewpoints, and markets. As darkness falls, some precautions should be taken. Walks alone, especially for women, should be avoided in certain areas. It's best not to go to some coastal areas that run parallel to Via Gramschi unless absolutely necessary. However, the city center is generally safe and busy with people walking around. Genoa has both safer and more dangerous neighborhoods, but the city center is considered very safe, especially during the day. The wealthiest and safest part of Genoa is the area around the university, where many students live. The historical center and other safe neighborhoods are well-connected by public transport, even at night. In general, Genoa is a beautiful city with a lot to offer, and safety should not be a major concern for residents or visitors who take normal precautions, especially in crowded areas and at night."
facts.Venezia.safetoLive="Venice is generally considered a safe city for travelers and residents, with a low overall crime rate. While there have been reports of petty theft and scams targeting tourists, the city's crime rate is relatively low. It is safe to walk around Venice and use public transportation, but visitors should be cautious of pickpockets in crowded areas. Solo travelers can feel secure in Venice, especially with the well-developed tourism infrastructure and busy city streets that offer a sense of security. Americans visiting Venice should exercise basic caution and common sense, as the city is generally safe for tourists. Families planning a vacation to Venice can enjoy a safe experience by taking normal precautions and being aware of their surroundings. Overall, Venice is a beautiful and rewarding city to visit or live in, as long as visitors and residents remain vigilant and take common-sense safety measures."
facts.Firenze.safeToLive="Florence is generally considered a safe city, with a lower crime rate compared to other major Italian cities. However, there are some areas and situations where extra precautions should be taken: the city center is mostly safe, especially during the day due to the lively nightlife. The area around the Santa Maria Novella train station can be a hotspot for pickpockets, especially at night. It's best to keep an eye on your belongings in crowded tourist areas. Some neighborhoods like Le Piagge in the northwest part of the city have higher poverty and social exclusion levels, with some reports of gang-related activities. However, the city has been making efforts to improve safety in these areas. Overall, Florence is a very safe city for expats and tourists who take normal precautions. The police are professional, and the community is welcoming. The city also has good infrastructure and public transportation."
facts.Bologna.safeToLive="Bologna is generally considered a very safe city, both for residents and tourists. There are practically no dangerous areas in Bologna, even considering its rather large size. However, some areas outside the city center may be less recommended at night. The main types of crime affecting tourists are petty pickpocketing, currency exchange fraud, and attempts to scam tourists on the price of a taxi ride. Pickpocketing is more common in crowded tourist areas and on public transportation. Bologna is a city full of students and young people, with an important nightlife. The city center is mostly safe, especially during the day due to the lively atmosphere. As with any city, it's important to take normal precautions, keep valuables safe, and avoid wandering alone in isolated areas at night. But overall, Bologna is considered one of the safest cities in Italy and Europe, with a very low rate of violent crime. Tourists can visit and live in Bologna without major safety concerns by taking standard precautions."
facts["Reggio Calabria"].safeToLive="Reggio Calabria is generally safe for both residents and tourists, despite the presence of organized crime in the form of the 'ndrangheta mafia. While the mafia's influence is still felt in terms of corruption and extortion, violent crimes rarely involve expats or tourists. As with any city, it's important for expats and tourists to take normal precautions, keep valuables safe, and avoid wandering alone in isolated areas at night. While the 'ndrangheta's presence may be a deterrent for some, Reggio Calabria remains a relatively safe destination for those who exercise caution. The city offers a mild climate, a privileged geographical location, and a relatively low cost of living compared to other Italian cities. These factors, combined with its rich culture and history, make Reggio Calabria an attractive place to live and visit."
facts["L'Aquila"].safeToLive="Living in L'Aquila is considered relatively safe, despite challenges related to quality of life and security. The city offers a lower cost of living compared to other Italian cities, making it more affordable for students and those seeking a peaceful environment and connection with nature. Despite the presence of organized crime and corruption issues, violent crimes rarely involve expats or tourists. Taking normal precautions, as in any other city, by keeping belongings safe and avoiding isolated areas at night is advisable. Despite the challenges, L'Aquila offers a unique experience enriched by its history, culture, and breathtaking landscapes, making it a special place for those who choose to live there."
facts["Foggia"].safeToLive="Foggia presents some challenges in terms of safety and crime. The city has a high rate of violent crime, with the province of Foggia having Italy's third-highest homicide rate. The local mafia, known as the \"Foggia mafia\", is very active in the area and involved in racketeering, extortion, arson attacks, and bombings targeting local businesses. Corruption is a major issue, with several local governments in the province being dissolved due to mafia infiltration. Certain neighborhoods like Rione Biccari are considered more problematic. Farmers and businesses in the area face threats like arson, theft of equipment, and pressure to pay extortion money to the mafia. While the city is working to address these challenges, with increased police presence and arrests of mafia bosses, the high levels of violent crime and mafia influence make Foggia a relatively unsafe place to live compared to other Italian cities. Residents and businesses face significant risks related to organized crime in the area."
facts.Perugia.safeToLive="Perugia is considered a safe city, with a low crime rate and a focus on property crimes like vandalism and theft rather than violent crimes. The city is safer compared to other major European cities, making it a secure destination for travelers. Some precautions are still advised, such as being vigilant in crowded areas, securing belongings, and choosing official modes of transport. That said, Perugia is considered extremely safe, even for solo travelers and women, thanks to its low crime rate and secure atmosphere."
facts.Rimini.safeToLive="Rimini is generally considered a safe city, with a low crime rate that may increase during certain periods but is no more dangerous than other major Italian cities like Milan or Florence. The northern part of Rimini is the safest area, and the city ranks well in terms of safety for solo female travelers, with well-maintained public spaces and a welcoming atmosphere; however, as in any city, it is advisable to be cautious, especially in less frequented areas where scams and attempted fraud may occur, although violent crimes are rare. Overall, Rimini offers a safe and pleasant experience with a good quality of life, and by taking normal precautions, residents and visitors can fully enjoy this vibrant seaside city."
facts.Bergamo.safeToLive="Bergamo is generally considered a safe city for residents, with a low crime rate that primarily involves petty crimes like pickpocketing and fraud rather than violent offenses. The city offers a pleasant living environment, with well-maintained public spaces and a welcoming atmosphere. While tourists need to be cautious of scams and petty theft, residents can enjoy a relatively secure lifestyle by taking normal precautions and using common sense. The city's charming neighborhoods, such as Citta Bassa, Borgo Santa Caterina, and Borgo Pignolo, provide safe and vibrant settings for residents to explore and live in, contributing to a high quality of life in Bergamo."
facts.Siena.safeToLive="Siena is generally considered a safe city for expats, with a low crime rate compared to other major Italian cities. Petty crimes like pickpocketing and theft do occur, especially in crowded tourist areas, but are not excessively high compared to other Italian cities. Residents are advised to take basic precautions, such as keeping valuables secure and avoiding isolated areas at night. The city's well-preserved historical center is largely pedestrianized, making it easy to explore on foot and reducing the risk of traffic-related accidents. The local police presence contributes to the overall safety and security of the area. Overall, Siena is a safe and welcoming city for expats who take normal precautions and are aware of their surroundings."
facts.Cremona.safeToLive = "Cremona is generally considered a safe city for expats and residents. Petty theft, such as pickpocketing and bag snatching, can occur in crowded tourist areas and major cities, but overall, the city is considered safe. Staying vigilant and taking common-sense precautions, such as keeping valuables secure and avoiding dark areas at night, can ensure a safe experience."
facts.Prato.safeToLive = "Prato is a relatively safe city for expats and tourists. While petty theft and scams can occur in tourist areas, the city is generally considered safe. Expats should exercise caution in crowded areas and at night, but overall, Prato is a safe place to live and visit."
facts.Treviso.safeToLive = "Treviso is a safe city for expats and residents. Petty theft can occur in crowded areas, but overall, the city is considered safe. Staying vigilant and taking normal precautions can ensure a safe experience."
facts.Messina.safeToLive = "Messina is generally a safe city for expats to live, but it has a moderate crime rate due to mafia activity. The majority of crimes in Messina are related to mafia operations, which can be a concern for visitors and residents alike. However, the city has a strong police presence and various safety measures in place to ensure the well-being of tourists and residents. Petty theft and scams can occur in tourist areas, but overall, Messina is considered a safe city for expats to live, especially during the day. It is advisable to take normal precautions at night and avoid leaving valuables unattended."
facts["Verona"].safeToLive = "Verona is considered a safe city for residents, with a low crime rate. Petty crimes like pickpocketing and scams are relatively rare, and violent crimes are even less common. The city center is well-patrolled and secure, and residents can feel comfortable walking around during the day. However, as with any city, there are some areas that are considered less safe at night, such as isolated alleys and unlit side streets. Residents should exercise caution when walking alone at night and avoid these areas if possible. Overall, Verona is a safe and pleasant place to live."
facts["Vicenza"].safeToLive = "Vicenza is generally considered a safe city for residents, with a low crime rate. Petty crimes like pickpocketing and scams are relatively rare, and violent crimes are even less common. The city has a good public transportation system, and residents can feel comfortable using it. However, there are some areas that are considered less safe at night, such as certain parks where drug dealers may gather. Residents should exercise caution when walking alone at night and avoid these areas if possible. Additionally, some residents may experience petty theft or vandalism, but these incidents are relatively rare. Overall, Vicenza is a safe and pleasant place to live."
facts["Catanzaro"].safeToLive = "Catanzaro is a safe city for residents, with a moderate crime rate. Petty crimes like pickpocketing and theft from vehicles are common, but violent crimes are rare. The city center is well-patrolled and secure, making it a pleasant place to live."

facts.Roma.forMuslims="Rome is generally considered safe for Muslim travelers and expats. The city boasts a large Muslim community from various regions, including North Africa and Asia, and offers numerous halal dining options. With approximately 20 mosques in Rome, the Centro Islamico Culturale d'Italia - Grande Moschea di Roma stands out as a prominent place of worship. While Rome warmly welcomes Muslims, it is advisable for travelers to avoid certain areas like Termini station at night for safety precautions. Muslim visitors are encouraged to maintain politeness, safeguard valuables, stay connected to the internet, and recite prayers for protection while navigating the city. The presence of a diverse Muslim community, along with facilities such as mosques and halal restaurants, contributes to Rome being a generally safe and hospitable destination for Muslim visitors."
facts.Milano.forMuslims="Milan is generally considered a safe city for Muslim travelers. The city has a diverse population, and Muslims are free to practice their religion openly. Additionally, wearing a hijab in Milan is safe as long as the face is shown, as it is a multicultural city that welcomes diversity. Despite some social tensions and concerns about Islamic concentration in certain areas, Milan remains a relatively safe destination for Muslims and travelers in general."
facts.Napoli.forMuslims="Naples appears to be reasonably safe for Muslim travelers, with a growing and active Muslim community. The Islamic Center of Naples has expanded significantly since the appointment of their first imam in 2016, enhancing the community's ability to practice their faith. The imam conducts sermons in English and offers Quran classes for both children and adults. Despite this progress, some Muslims in Naples have expressed feelings of fear, with concerns about safety during prayer times. Instances like doors being opened unexpectedly have heightened these concerns among worshippers. Additionally, general safety precautions are advised for travelers in Naples, including avoiding dark alleys and being cautious about late-night outings, as certain areas of the city can pose risks regardless of one's religious background. While Naples offers a welcoming environment for Muslim travelers with its active community and religious facilities, it is important for visitors to be mindful of safety concerns and take necessary precautions during their stay."

facts.Milano.forWomen="Milan is generally considered safe for solo female travelers, though precautions should be taken. During the day, safety perceptions are similar between genders, but at night women feel significantly less secure walking alone. Public transport has a medium risk of pickpocketing, so valuables should be kept secure. Accommodations in well-lit, busy areas like Brera and Tortona are advised, with secure entrances. Staying alert, avoiding isolated spots, and using a money belt can enhance safety. While challenges exist, solo female travelers can confidently experience Milan's culture and attractions by dressing modestly and using common sense."
facts.Roma.forWomen="Rome cannot be considered a safe city for women, especially at night, with some areas perceived as more dangerous than others. 96% of women do not feel comfortable walking the streets of Rome at night, and even when the sun is up, eight out of ten do not feel safe even when in the company of others. During the day, 20% do not feel safe in company, and 56% are afraid to walk alone even in broad daylight. Areas perceived as most at risk include San Basilio, the outskirts of Torri (Tor Bella Monaca, Torre Angela, and Torre Maura), Tiburtino, Ostiense, and Stazione Termini. Quieter neighborhoods include Della Vittoria, Giuliano Dalmata, Parioli, Pinciano, and Appio Claudio. On a scale of 1 to 7, women's perceived safety in Rome is only 3.67. 81% of respondents do not feel adequately represented in neighborhood institutional relationships and political life. The Municipality of Rome has initiated projects like \"Safe Streets for Women\" to map areas perceived as dangerous and take concrete actions to enhance safety. The State Police also organize safety awareness meetings in schools. Despite these efforts, Rome still has much to do to ensure women's safety, especially in the outskirts and at night. Targeted interventions on lighting, urban decor, and territorial control, along with a cultural shift to combat gender violence, are needed."
facts.Napoli.forWomen="Naples is generally considered somewhat unsafe for female solo travelers compared to other cities in Italy, with varying experiences reported. While some visitors felt safe and enjoyed their time in Naples, others expressed concerns about safety, especially at night. The city's reputation for crime and the presence of the Camorra mafia organization can create unease, but incidents of physical violence are rare. Precautions recommended include keeping valuables secure, avoiding dimly lit areas, and staying vigilant against pickpocketing.  Areas like Miano, Piscinola, Scampia, and Chiaiano are highlighted as particularly risky. The safety perception in Napoli is notably low, with women feeling insecure and inadequately represented in institutional and political relationships."
facts["Bari"].forWomen="Bari is generally considered safe for solo female travelers. The city offers a well-connected and easy-to-navigate environment with plenty of public transportation options. While there may be some challenges like microcriminality and certain areas to avoid walking alone at night, overall, Bari is perceived as a safe destination for women traveling solo. It is recommended to exercise normal precautions, avoid dark streets alone, and enjoy the beautiful beaches, delicious cuisine, and vibrant cultural scene that Bari has to offer."

facts.Bologna.safeAtNight="Bologna is generally safe to walk at night, with the city center and main tourist areas being well-lit and populated, reducing the risk of crime. However, it's best to avoid isolated or poorly lit areas, and petty crimes like pickpocketing can occur, especially around the train station and on public transport. The university district and areas around major party streets can get noisy and crowded with drunk students at night, but walking from the train station to your accommodation late at night is generally safe, as the station area is well-lit and populated."
facts.Milano.safeAtNight="Milan is generally safe to walk at night, particularly in well-known tourist areas like Brera, Navigli, and the City Center, which are well-lit and frequented by many people, reducing the likelihood of encountering safety issues. While Milan has areas where caution is advised, such as Stazione Centrale and Porta Venezia, exercising vigilance, avoiding poorly lit or isolated areas, and following general safety tips like staying in groups, using reliable transportation, and being aware of surroundings can help ensure a worry-free experience while exploring Milan after dark."
facts.Roma.safeAtNight="In Rome, safety at night varies across different areas. While the city center generally sees a fair amount of foot traffic and is well-lit, certain neighborhoods like Esquilino and the vicinity around Roma Termini station are known for higher levels of petty crime, particularly pickpocketing. These areas can be less secure after dark, with increased risks of encountering unsavory characters or falling victim to theft. It's advisable to exercise caution, avoid poorly lit or isolated spots, and remain vigilant of your surroundings, especially when navigating through these more questionable areas. Opting for reputable transportation options like taxis or public transport can provide a safer alternative to walking alone at night in these potentially riskier parts of Rome."
facts.Napoli.safeAtNight="Naples at night presents varying safety levels across different areas. While the city center and popular tourist spots are generally considered safe with bustling activity and well-lit streets, neighborhoods like Museo, Garibaldi Square, Spaccanapoli, and Forcella are noted for higher risks of pickpocketing and scams. The vicinity around Garibaldi Station, although monitored by police, is still advised to be approached cautiously, especially in poorly lit or secluded locations. Travelers are encouraged to remain vigilant, avoid isolated areas, secure their belongings, and be mindful of their surroundings when exploring Naples after dark."
facts.Bari.safeAtNight="While Bari is considered a relatively safe city overall, with low risks of violent crime, tourists should exercise caution when exploring the city at night. The city center and well-lit, populated areas are generally secure, but certain neighborhoods like San Paolo, San Pio-Enziteto, Fesca, Japigia, Libertà, and Madonnella are known to have higher crime rates and should be avoided after dark. Petty crimes such as pickpocketing are a concern, especially near train stations, so travelers are advised to remain vigilant, secure their belongings, and be mindful of their surroundings when visiting Bari at night."
facts.Palermo.safeAtNight="Palermo is generally safe to walk around at night, particularly in well-lit, populated areas like the city center, via Maqueda, Teatro Massimo, and Piazza Olivella. While the main tourist areas are bustling and secure, caution is advised in neighborhoods with higher crime rates such as Albergheria, Borgo Vecchio, Zen, Brancaccio, and Sperone, where sticking to well-traveled streets is recommended. It's important to stay vigilant, avoid isolated or dimly lit areas, secure valuables, and consider using taxis, especially for longer walks or as a solo traveler. By exercising common sense and awareness, visitors can enjoy Palermo's nightlife safely."
facts.Venezia.safeAtNight="Venice is considered one of the safest cities in Europe, with a very low crime rate that extends into the evening hours. While petty crimes like pickpocketing can occur in crowded areas, the risk is low, and the city takes on a tranquil, secure atmosphere at night as most tourists depart. Exploring Venice's dimly lit alleyways is not a major concern due to the extremely low crime rate and likelihood of encountering locals, cleaning crews, or other tourists rather than any trouble. As with any city, exercising common sense precautions is advised, but Venice is considered extremely safe, even for solo travelers and women, thanks to the lack of cars and quiet streets that contribute to a secure atmosphere at all hours."
facts.Bergamo.safeAtNight="Bergamo is generally safe to walk around at night, with well-lit and bustling areas like the city center and popular neighborhoods offering a secure environment for walking even by yourself. While the city has a low crime rate focused on petty offenses, it's advisable to stay cautious and stick to busy areas, such as Borgo Santa Caterina, known for its nightlife."
facts.Siena.safeAtNight="Siena is generally considered a safe city at night, with a low crime rate compared to larger Italian cities. The city's well-preserved historical center is largely pedestrianized, making it easy to explore on foot and reducing the risk of traffic-related accidents. Petty crimes like pickpocketing can occur in crowded areas, but the risk is low, and the city takes on a tranquil, secure atmosphere at night. It is advisable to exercise caution and follow common sense safety tips, such as being aware of your surroundings, avoiding poorly lit or isolated areas late at night, and securing your belongings. Many travelers have reported feeling safe walking alone at night, especially within the city walls where there are many pedestrians."
facts.Cremona.safeAtNight = "Cremona is generally considered a safe city for walking alone at night. Petty theft, such as pickpocketing and bag snatching, can occur in crowded tourist areas and major cities, but overall, the city is considered safe. Staying vigilant and taking common-sense precautions, such as keeping valuables secure and avoiding dark areas at night, can ensure a safe experience."
facts.Prato.safeAtNight = "Prato is a relatively safe city for walking alone at night. While petty theft and scams can occur in tourist areas, the city is generally considered safe. Expats should exercise caution in crowded areas and at night, but overall, Prato is a safe place to live and visit."
facts.Treviso.safeAtNight = "Treviso is a safe city for walking alone at night. Petty theft can occur in crowded areas, but overall, the city is considered safe. Staying vigilant and taking normal precautions can ensure a safe experience."
facts["Verona"].safeAtNight = "Verona is generally considered safe to walk around at night, especially in the well-lit and populated city center. However, as with any city, it's advisable to exercise caution and avoid isolated or unlit areas after dark. Petty crimes like pickpocketing can occur, so residents should keep valuables secure and be aware of their surroundings. Overall, Verona has a low crime rate and the city center is well-patrolled, making it relatively safe for nighttime activities and exploration."
facts["Vicenza"].safeAtNight = "Vicenza's city center is generally safe to walk around at night, but residents should exercise more caution in certain areas. While the main streets and tourist areas tend to be well-lit and populated, some parks and more isolated neighborhoods can be less safe after dark due to concerns about drug activity and petty crimes. It's recommended for Vicenza residents to avoid walking alone in unlit or secluded areas at night and to stick to busier, well-lit streets and public spaces."
facts["Catania"].safeAtNight = "Catania is generally considered safe to walk around at night, especially in the well-lit and populated city center. However, as with any city, it's advisable to exercise caution and avoid isolated or unlit areas after dark. Petty crimes like pickpocketing can occur, so residents should keep valuables secure and be aware of their surroundings. Overall, Catania has a low crime rate and the city center is well-patrolled, making it relatively safe for nighttime activities and exploration."

facts.Milano.forStudents="Milan is generally considered a safe city for students, offering a variety of neighborhoods suitable for university life. Areas like Porta Lodovica/Bocconi/Bligny, Porta Romana, Porta Genova/Navigli and Bicocca are among the best choices for students, providing a combination of convenience, services and liveliness. Rental prices vary depending on the area, but the city has an efficient public transportation system that facilitates commuting. However, as in any large city, it is advisable to take basic precautions, avoid isolated areas at night and maintain awareness of your surroundings to ensure a safe and pleasant stay in Milan."
facts.Roma.forStudents="Rome offers several safe areas suitable for student life. Neighborhoods like Porta Lodovica/Bocconi/Bligny, Porta Romana, Porta Genova/Navigli and Bicocca are among the best choices, combining convenience, services and liveliness. Rental prices vary depending on the area, but the city has an efficient public transportation system that facilitates student commuting. However, as in any large city, it is advisable to take basic precautions, avoid isolated areas at night and maintain awareness of your surroundings to ensure a safe and pleasant stay in Rome. Local authorities also organize meetings and awareness programs on safety for high school students, providing them with useful tools and advice. Overall, with due care, Rome can offer students a stimulating and safe university environment in which to live and study."
facts.Napoli.forStudents="Students who live in the city center usually do not have safety issues. However, some neighborhoods like Forcella are considered more difficult and dangerous. In general, Naples is not a very dangerous city, but like any big city, it is important to be cautious and take normal precautions, especially at night and in less central areas."

facts["Milano"].forTourists="Milan is generally considered a safe city for tourists and solo travelers, with a low crime rate and a strong police presence. While petty crimes like pickpocketing can occur, especially in crowded areas and on public transport, violent crimes are rare. The city offers a vibrant cultural scene, landmarks like the Duomo and La Scala, and a renowned fashion and culinary scene, making it an attractive destination for visitors. It is advisable for travelers to exercise caution, especially in tourist areas and crowded places, and to keep valuables secure to avoid pickpocketing. Milan has implemented safety measures, such as surveillance cameras in public spaces and a visible police presence, to ensure the well-being of visitors. Solo female travelers are advised to stay aware of their surroundings, stick to well-lit areas at night, and avoid carrying expensive jewelry. By staying vigilant and following safety tips, visitors can enjoy a memorable and safe experience in this vibrant Italian city."
facts["Roma"].forTourists="Rome is generally considered a safe city for tourists and travelers, with a low crime rate and a strong police presence. While petty crimes like pickpocketing can occur, especially in crowded tourist areas, violent crimes are rare. The city offers a vibrant cultural scene, iconic landmarks like the Colosseum and Vatican Museums, and a renowned culinary scene, making it an attractive destination for visitors. It is advisable for travelers to exercise caution and keep valuables secure to avoid falling victim to common scams. These include restaurant scams with inflated prices, overcharging taxis at the airport, and individuals posing as friendly locals who may be attempting to distract or mislead tourists. Beware of fake hotel calls requesting personal information and be cautious of child beggars, as they may be part of larger schemes. Rome has implemented safety measures, such as surveillance cameras and a visible police force, to ensure the well-being of tourists. By staying vigilant and following basic safety tips, visitors can enjoy a memorable and safe experience exploring the Eternal City. Avoid walking alone in isolated or poorly lit areas at night, and be cautious of pickpocketing, especially in crowded areas and on public transportation. Overall, with some precautions and awareness of common scams, Rome remains a safe and welcoming destination for tourists and travelers alike, offering a unique blend of history, culture, and culinary delights."
facts["Bari"].forTourists="Bari is considered a safe city for tourists, including solo travelers, with low overall crime rates and a reputation as one of the safest cities globally. The city offers a well-connected and easy-to-navigate environment, making it accessible for tourists to explore on their own. While pickpocketing can be a concern, especially in crowded tourist areas, violent crimes are rare, allowing tourists to feel secure during their travels. Public transportation is reliable and safe, with many visitors using trains and buses to get around the city. It is advisable for tourists, even those traveling solo, to exercise normal precautions, such as keeping valuables secure and avoiding walking alone in dark or isolated areas at night. Overall, Bari offers a welcoming and friendly atmosphere for tourists to enjoy its attractions, cuisine, and cultural offerings, whether traveling in a group or solo."
facts["Napoli"].forTourists="Naples is generally considered a safe city for tourists, but it's important to take some precautions to avoid potential issues: petty crimes like pickpocketing and bag snatching can occur, especially in crowded tourist areas and on public transportation. Keep valuables secure and avoid flashing expensive jewelry or electronics. Certain neighborhoods like Piazza Garibaldi (near the central station), Centro Direzionale, and parts of Quartieri Spagnoli are best avoided at night to prevent muggings and scams. Exercise caution when walking in isolated or poorly lit areas, especially after dark. Stick to main streets and well-populated areas when possible. Be aware of common scams targeting tourists, such as the bracelet scam, overcharging taxis, and receiving incorrect change. Only buy from reputable vendors. Use the Campania Express train, which connects major tourist sites, as it's less crowded and safer than the regular Circumvesuviana line. Dress down to avoid appearing as an obvious tourist target. Walk with confidence and purpose. Stay alert and keep your head up when walking, avoiding headphones or texting that can distract you. By taking basic precautions and using common sense, tourists can safely explore Naples' vibrant culture, cuisine, and historic sites. The city offers a unique experience for visitors willing to look past minor safety concerns."
facts["Venezia"].forTourists="Venice is generally safe for tourists and solo travelers, but it's essential to be cautious and aware of potential risks. Petty crimes like pickpocketing and bag snatching are common, especially in crowded areas. Scams targeting tourists, such as overcharging for goods or services, are prevalent, so it's crucial to deal with reputable businesses. While the overall crime rate is low, it's advisable to stay vigilant, particularly in tourist hotspots, and keep valuables secure. Venice is susceptible to flooding, known as 'acqua alta,' during high tides, which can disrupt transportation. Travelers should check weather forecasts and be prepared for potential disruptions. Additionally, the city's unique location in the Venetian Lagoon makes it prone to natural disasters like flooding and occasional earthquakes. By staying informed, taking precautions, and being mindful of surroundings, tourists can enjoy Venice's beauty and charm with peace of mind."
facts["Firenze"].forTourists="Florence is generally considered a safe city for tourists and solo travelers, with a low crime rate and a strong police presence. While violent incidents are rare, theft and pickpocketing can occur, especially in crowded areas like the Duomo, Piazza della Signoria, and the Uffizi Gallery. It is essential for visitors to stay vigilant, keep valuables secure, and be cautious of common scams targeting tourists, such as overcharging for goods or services. The city is well-connected and easy to navigate, with a reliable public transportation system that includes buses and trams. Taxis are also readily available, but it's advisable to use only licensed cabs to avoid scams. Walking is a popular and safe way to explore Florence's compact city center, but caution should be exercised in dimly lit or isolated areas at night. Florence is generally considered a safe destination for solo female travelers, but it's always wise to exercise common sense precautions, such as avoiding walking alone at night, keeping an eye on drinks in bars and clubs, and trusting one's instincts."
facts.Messina.forTourists = "Messina is generally a safe city for tourists, with a low occurrence of violent crimes. Petty theft and scams can occur, but overall, the city is considered safe. It is advisable to take normal precautions such as keeping valuables secure, avoiding dark areas at night, and being vigilant about personal safety. Additionally, Taormina, a popular tourist destination known for its ancient Greek theater and stunning views of the Mediterranean, is also a safe place to visit. Visitors can feel comfortable walking around during the day and night, but it is always recommended to exercise caution and be aware of surroundings. Overall, Messina and Taormina are safe destinations for tourists, with a low risk of crime and a high level of security."
facts["Verona"].forTourists = "Verona is considered one of the safest Italian cities for tourists. The historic city center, home to famous landmarks like the Roman Arena, has a strong police presence and low crime rates. Violent crimes against visitors are very rare, and even petty theft like pickpocketing is not common compared to other tourist hotspots. Tourists should still be cautious in crowded areas and on public transportation, keeping valuables secure. At night, it's best to stick to the well-lit main streets and plazas, as quieter side streets may carry slightly higher risks. Overall, Verona provides a very safe and enjoyable experience for tourists who use standard precautions."
facts["Vicenza"].forTourists = "Vicenza is a very safe destination for tourists, with a low overall crime rate. The historic city center, a UNESCO World Heritage site, is well-patrolled and secure, making it easy for visitors to explore without major safety concerns. Tourists should still be alert for petty crimes like pickpocketing, which can occasionally occur in crowded areas. At night, it's best to avoid dimly lit parks on the city's outskirts, as there have been some reports of drug-related activity in these more isolated locations. Otherwise, the city center remains quite safe for tourists at night, with lively cafes, restaurants, and plazas providing a secure environment. With basic awareness, Vicenza offers a very safe and rewarding experience for visitors."
facts["Palermo"].forTourists = "Palermo is generally considered a safe city for tourists, though it does require some additional precautions compared to smaller Sicilian towns. The historic city center is well-patrolled and secure, but tourists should still be alert for petty crimes like pickpocketing, especially in crowded tourist areas and on public transportation. Violent crimes against visitors are rare, but tourists should avoid isolated or poorly lit side streets, especially at night. With basic situational awareness and by keeping valuables out of sight, Palermo can be navigated safely. Tourists should also be cautious of potential scams and overcharging, particularly in touristy areas. Overall, Palermo is a vibrant and rewarding destination for visitors who exercise standard safety measures."
facts["Catania"].forTourists = "Catania is considered moderately safe for tourists, though it does require more caution than some smaller Sicilian cities. Petty crimes like pickpocketing and bag snatching can occur, especially in crowded areas and on public transit. Tourists should keep valuables secure and avoid flaunting expensive items. Violent crimes against visitors are not common, but tourists should still avoid isolated or poorly lit areas, especially at night. Corruption is also a concern in Catania, so tourists should be wary of potential scams. With basic precautions, most of Catania's historic center and popular tourist sites can be safely explored during the day. However, extra vigilance is advised, particularly for solo travelers, when venturing out at night."
}
import * as pb from './js/pageBuilder.js';
import { createServer } from 'http';
import fetch from 'node-fetch';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jsdom = require('jsdom');

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
function populateData(data) {
  // Implement your logic to populate data as needed
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
    // Combine datasets based on province.Name
    const combinedData = dataset.map(entry => {
      const crimeData = crimeDataset2023.find(c => c.province.Name === entry.Name);
      return crimeData ? { ...entry, ...crimeData } : entry;
    });

    populateData(combinedData);
    
    for (let i = 0; i < 107; i++) {
      let province = combinedData[i];
      

      let dirName = province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
      let dir = path.join(__dirname, dirName);

        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)){
         fs.mkdirSync(dir);
    }

      // Create .htaccess file in the directory
      let htaccessContent = `RewriteEngine on\nRewriteRule ^$ ${dirName}.html [L]`;
      fs.writeFileSync(path.join(dir, '.htaccess'), htaccessContent);

      var fileName = ''+dirName+'/crime-and-safety';
            let seoTitle=en(province.Name)+" - Quality of Life and Info Sheet for Expats";
            let seoDescription='Information about living in '+en(province.Name)+', Italy for expats and digital nomads. '+en(province.Name)+' quality of life, cost of living, safety and more.'
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
            '<section id="Thefts and Robberies"><h3>Crime and Safety</h3><span id="theftsandrobberies"></span></section>'+
            '</div>'+
            '<aside class="menu sb mobileonly">'+sidebar+'</aside>\n'+
            '</body></html>'
                    )

      let parsedData = fs.readFileSync('temp/parsedDataAbout' + province.Name + '.txt', 'utf8');
      let provinceData = parsedData.split('%%%')[0];
      provinceData = provinceData === 'undefined' ? '' : provinceData;
      let transportData = parsedData.split('%%%')[1];
      transportData = transportData === 'undefined' ? '' : transportData;
      facts[province.Name]['provinceData'] = provinceData;
      facts[province.Name]['transportData'] = transportData;

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
    pb.setNavBar($);
        
    $(".title").text(en(province.Name)+' for Expats and Nomads');

    $("#overview").append(pb.addBreaks(info.overview))



}function getInfo(province){
     
    let ratio = (province.Men/(Math.min(province.Men,province.Women))).toFixed(2)+":"+(province.Women/(Math.min(province.Men,province.Women))).toFixed(2);

    
    let info = {}

    info.overview=""

    info.crimeandsafety="The province of "+en(province.Name)+" ranks <b>"+province.SafetyRank+" out of 106 for safety<b> according to our data, with a <b>safety score of "+province.SafetyScore+"</b>."+
    "There were a total of " + province.IndiceCriminalita + " official reports of crime per 100,000 inhabitants in the province in 2023. This is " + 
(province.IndiceCriminalita > avg.IndiceCriminalita ? "<b class='red'>higher than the average</b> number of reported crimes per 100,000 inhabitants across all Italian provinces. This could be due to a variety of factors, including socio-economic conditions, and law enforcement practices." : 
(province.IndiceCriminalita < avg.IndiceCriminalita ? "<b class='green'>lower than the average</b> number of reported crimes per 100,000 inhabitants across all Italian provinces. This could indicate effective law enforcement practices, or other factors that contribute to lower crime rates." : 
"<b class='yellow'>in line with the average</b> number of reported crimes per 100,000 inhabitants across all Italian provinces. This suggests that the crime rate in " + en(province.Name) + " is typical for Italian provinces.")) + "."

let thefts = province.FurtiDestrezza + province.FurtiStrappo + province.FurtiAutovettura + province.FurtiAbitazione;
let avgthefts = avg.FurtiDestrezza + avg.FurtiStrappo + avg.FurtiAutovettura + avg.FurtiAbitazione;

let message = `There were ${province.RapinePubblico} reported robberies and a total of ${thefts} reported thefts per 100,000 inhabitants in 2023. Of these, ${province.FurtiDestrezza} were pickpocketing incidents, ${province.FurtiStrappo} were grab-and-run thefts, ${province.FurtiAutovettura} were car thefts, and ${province.FurtiAbitazione} were home burglaries.`;

// Check if the overall number of robberies is less, in line with or higher than the average
if (province.RapinePubblico < avg.RapinePubblico) {
    message += ` The number of reported robberies is less than the average amongst all Italian provinces.`;
} else if (province.RapinePubblico === avg.RapinePubblico) {
    message += ` The number of reported robberies is in line with the average amongst all Italian provinces.`;
} else {
    message += ` The number of reported robberies is higher than the average amongst all Italian provinces.`;
}

// Check if the overall number of thefts is less, in line with or higher than the average
if (thefts < avgthefts) {
    message += ` The total number of reported thefts is less than the average amongst all Italian provinces.`;
} else if (thefts === avg.thefts) {
    message += ` The total number of reported thefts is in line with the average amongst all Italian provinces.`;
} else {
    message += ` The total number of reported thefts is higher than the average amongst all Italian provinces.`;
}

// Check if any of the specific types of theft are MUCH higher than the average for that type of theft
if (province.FurtiDestrezza > 2 * avg.FurtiDestrezza) {
    message += ` The number of pickpocketing incidents is considerably higher than the average.`;
}
if (province.FurtiStrappo > 2 * avg.FurtiStrappo) {
    message += ` The number of grab-and-run thefts is considerably higher than the average.`;
}
if (province.FurtiAutovettura > 2 * avg.FurtiAutovettura) {
    message += ` The number of car thefts is considerably higher than the average.`;
}
if (province.FurtiAbitazione > 2 * avg.FurtiAbitazione) {
    message += ` The number of home burglaries is considerably higher than the average.`;
}

info.theftsandrobberies = message;
return info;
}
import * as pb from './js/pageBuilder.js'
import {de} from './js/pageBuilder.js'
import { createServer } from 'http';
import fetch from 'node-fetch';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jsdom = require('jsdom')

createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Bonjour le monde !');
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

fetch('https://expiter.com/dataset.json', {method:"Get"})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        //console.log(dom.window.document.querySelector("body").textContent)
        dataset=data;  
        populateData(data);
        for (let i = 0; i < 107; i++){
            let province = dataset[i];
            let sidebar=pb.setSideBarDE(province)
            
            var fileName = 'de/provinz/'+de(province.Name).replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
            let seoTitle = de(province.Name) + " - Lebensqualität und Lebenshaltungskosten";
            let seoDescription = 'Informationen über das Leben in ' + de(province.Name) + ' (' + de(province.Region) + ') für Expatriates, Studenten und digitale Nomaden. ' + de(province.Name) + ' Lebensqualität, Lebenshaltungskosten, Sicherheit und andere nützliche Informationen.';
            let heroImage = 'https://expiter.com/img/' + province.Abbreviation + '.webp';
            
            const dom = new jsdom.JSDOM(
            "<html lang='de'>"+
            '<head><meta charset="utf-8">'+
            '<link rel="canonical" href="https://expiter.com/'+fileName+'/"/>'+
            '<link rel="alternate" hreflang="en" href="https://expiter.com/'+fileName.replace('de/','')+'/" />'+
            '<link rel="alternate" hreflang="fr" href="https://expiter.com/'+fileName.replace('de/','fr/')+'/" />'+
            '<link rel="alternate" hreflang="it" href="https://expiter.com/'+fileName.replace('de/','it/')+'/" />'+
            '<meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale-1,user-scalable=0">'+
            '<script type="text/javascript" src="https://expiter.com/jquery3.6.0.js" defer></script>'+
            '<script type="text/json" src="https://expiter.com/dataset.json"></script>'+
            '<script type="text/javascript" src="https://expiter.com/script.js" defer></script>'+
            '<script type="text/javascript" src="https://expiter.com/bootstrap-toc.js" defer></script>'+
            '<link rel="stylesheet" href="https://expiter.com/fonts.css" media="print" onload="this.media=\'all\'"></link>'+
            '<link rel="stylesheet" href="https://expiter.com/bulma.min.css">'+
            '<link rel="stylesheet" href="https://expiter.com/style.css?v=1.0">'+

            
            '<!-- Journey by Mediavine -->'+
            '<script type="text/javascript" async="async" data-noptimize="1" data-cfasync="false" src="//scripts.scriptwrapper.com/tags/1cce7071-25c6-48c1-b7ee-1da5674b8bfd.js"></script>'+       
            "</head>"+

            '<meta property="og:title" content="'+seoTitle+'" />'+
            '<meta property="og:description" content="'+seoDescription+'" />'+
            '<meta property="og:image" content="'+heroImage+'" />'+
            '<meta name="description" content="'+seoDescription+'" />'+
            "<title>"+seoTitle+"</title>"+
           
            '<meta name="keywords" content="Leben in ' + de(province.Name) + ', ' + de(province.Name) + ' digitale Nomaden, ' + de(province.Name) + ' Lebensqualität, ' + de(province.Name) + ' Nachtleben" />' +

            '<link rel="icon" type="image/x-icon" title="Expiter - Expatriates and Nomads in Italy" href="https://expiter.com/img/expiter-favicon.ico"></link>' +
            "</head>" +
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
            '<div class="hero" style="background-image:url(\'https://expiter.com/img/'+province.Abbreviation+'.webp\')" '+'title="Provincia di '+de(province.Name)+'"'+'></div>'+
            '<h1 data-toc-skip id="title" class="title column is-12">  </h1></row>'+
            '<div class="tabs effect-3">'+
            '<input type="radio" id="tab-1" name="tab-effect-3" checked="checked">' +
            '<span>Lebensqualität</span>' +
            '<input type="radio" id="tab-2" name="tab-effect-3">' +
            '<span>Lebenshaltungskosten</span>' +
            '<input type="radio" id="tab-3" name="tab-effect-3">' +
            '<span>Digitale Nomaden</span>' +
            
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
        '<div id="info" class="columns is-multiline is-mobile">' +
        '<section id="Allgemeine Informationen"><h2>Allgemeine Informationen</h2><span id="overview"></span></section>' +
        '<section id="Klima"><h2>Klima</h2><span id="climate"></span></section>' +
        '<section id="Lebenshaltungskosten"><h2>Lebenshaltungskosten</h2><span id="CoL"></span></section>' +
        '<section id="Lebensqualität"><h2>Lebensqualität</h2>' +
            '<section id="Gesundheit"><h3>Gesundheit</h3><span id="healthcare"></span></section>' +
            '<section id="Bildung"><h3>Bildung</h3><span id="education"></span></section>' +
            '<section id="Freizeit"><h3>Freizeit</h3><span id="leisure"></span></section>' +
            '<section id="Kriminalität und Sicherheit"><h3>Kriminalität und Sicherheit</h3><span id="crimeandsafety"></span></section>' +
            '<section id="Verkehr"><h3>Verkehr</h3><span id="transport"></span></section>' +
        '</section>' +
        '<section id="Tourismus"><h2>Tourismus</h2><span id="promo"></span></section>' +
    '</div>' +
    
'<aside class="menu sb mobileonly">'+sidebar+'</aside>\n'+
'</body></html>'
)


let parsedData = fs.readFileSync('temp/de-parsedDataAbout'+province.Name+'.txt','utf8');
let provinceData = parsedData.split("%%%")[0]; (provinceData==undefined?provinceData="":"")
let transportData = parsedData.split("%%%")[1]; (transportData==undefined?transportData="":"")
facts[province.Name]["provinceData"]=provinceData;
facts[province.Name]["transportData"]=transportData;
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
        
            let map =
    '<figure>' +
        '<img alt="Karte der Provinz ' + de(province.Name) + ' in ' + de(province.Region) + '"' +
        'src="https://ik.imagekit.io/cfkgj4ulo/map/' + province["Region"].replace(/\s+/g, "-").replace("'", "-") + '-provinces.webp?tr=w-250' +
        'loading="lazy"></img>' +
        '<figcaption>Karte der Provinzen der Region ' + de(province.Region) + ' einschließlich ' + de(province.Name) + '</figcaption>' +
    '</figure>';

appendProvinceData(province, $);
pb.setNavBarFR($);

$(".title").text('Wie man in ' + de(province.Name) + ' lebt - Lebensqualität, Kosten und Wissenswertes');
            $("#overview").append(map)
            $("#overview").append(info.overview)
            $("#overview").append(info.disclaimer)
            $("#overview").append(info.map)
            $("#CoL").append(info.CoL)
            $("#climate").append(info.climate)
            $("#climate").append(separator)
            $("#climate").append(info.weather)
            $("#lgbtq").append(info.lgbtq)
            $("#leisure").append(info.leisure)
            $("#leisure").append(separator)
            $("#healthcare").append(info.healthcare)
            $("#healthcare").append(separator)
            $("#crimeandsafety").append(info.crimeandsafety)
            $("#crimeandsafety").append(separator)
            $("#education").append(info.education)
            $("#education").append(separator)
            $("#transport").append(info.transport)
            $("#transport").append(separator)
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
            let ratio = (province.Men/(Math.min(province.Men,province.Women))).toFixed(2)+":"+(province.Women/(Math.min(province.Men,province.Women))).toFixed(2);
            let name=province.Name;
            let region=regions[province.Region];
            
            let info = {}
        
            info.overview = "Die Provinz " + de(province.Name) + " ist die <b>" + province.SizeByPopulation + ". größte italienische Provinz nach Bevölkerung</b> mit <b>" + province.Population.toLocaleString() + " Einwohnern</b> in der Region <b>" + de(province.Region) + "</b>. " +
    (facts[name].overview ? facts[name].overview : "") +
    "</br></br>" +
    "<a href='https://expiter.com/de/communes/province-de-" + de(province.Name).replace(/\s+/g, "-").replace("'", "-").toLowerCase() + "/'>" + "Das Ballungsgebiet von " + de(province.Name) + " umfasst <b>" +
    +province.Towns + " Gemeinden</b> und erstreckt sich über eine Fläche von " + province.Size.toLocaleString() + " km<sup>2</sup>. "
    + "Die <b>Bevölkerungsdichte beträgt " + province.Density + " Einwohner pro km<sup>2</sup></b>, was sie " +
    (province.Density < 100 ? "wenig bevölkert macht." : (province.Density > 500 ? "sehr dicht besiedelt macht." : "ziemlich dicht besiedelt macht.")) +
    " Das Verhältnis zwischen Männern und Frauen beträgt " + ratio + ".";

(facts[name]["provinceData"] != "" ? (info.overview += '</br></br>' + facts[name]["provinceData"]) : "")

info.CoL = "Das <b>durchschnittliche monatliche Gehalt in " + de(province.Name) + " beträgt " + province.MonthlyIncome + "€</b>, was " +
    (province.MonthlyIncome > 1500 && province.MonthlyIncome < 1800 ? "im landesweiten Durchschnitt liegt" : (province.MonthlyIncome >= 1800 ? "<b class='green'>über dem Durchschnitt</b> für Italien" : "<b class='red'>unter dem Durchschnitt</b> für Italien")) +
    "</br></br>" +
    "Die Lebenshaltungskosten werden auf " + province["Cost of Living (Individual)"] + "€ pro Monat für eine Einzelperson oder " + province["Cost of Living (Family)"] + "€ pro Monat für eine vierköpfige Familie geschätzt. Die Kosten für die Miete eines " +
    "kleinen Apartments (zwei oder drei Zimmer) in einem Wohnviertel der Stadt betragen etwa " + province["MonthlyRental"] + "€ pro Monat." + "</br></br>" +
    "Im Allgemeinen ist das Leben in " + (province["Cost of Living (Individual)"] > avg["Cost of Living (Individual)"] ? "<b class='red'>" + de(province.Name) + " ist sehr teuer" : (province["Cost of Living (Individual)"] < 1150 ? "<b class='green'>" + de(province.Name) + " ist überhaupt nicht teuer" : "<b class='green'>" + de(province.Name) + " ist nicht sehr teuer")) + "</b> im Vergleich zu anderen italienischen Provinzen."
    + " Das Leben in " + de(province.Name) + " ist ungefähr " + (province['Cost of Living (Individual)'] > avg["Cost of Living (Individual)"] ? "<b class='red'>" + (province['Cost of Living (Individual)'] / avg["Cost of Living (Individual)"] * 100 - 100).toFixed(2) + "% teurer als der Durchschnitt</b> aller italienischen Städte" : "<b class='green'>" + (100 - province['Cost of Living (Individual)'] / avg["Cost of Living (Individual)"] * 100).toFixed(2) + "% günstiger als der Durchschnitt</b> aller anderen italienischen Provinzen.")
    + ".";
  
info.climate = "Die Provinz " + de(province.Name) + " erhält durchschnittlich <b>" + province.SunshineHours + " Stunden Sonnenschein</b> pro Monat, was " +
    province.SunshineHours / 30 + " Stunden Helligkeit pro Tag entspricht." +
    " Das entspricht " + (province.SunshineHours > 236 ? "<b class='green'>" + (province.SunshineHours / 236 * 100 - 100).toFixed(2) + "% mehr</b> als der italienische Durchschnitt" : "<b class='red'>" + (100 - (province.SunshineHours / 236) * 100).toFixed(2) + "% weniger</b> als der italienische Durchschnitt") + " und " +
    (province.SunshineHours > region.SunshineHours ? "<b class='green'>" + (province.SunshineHours / region.SunshineHours * 100 - 100).toFixed(2) + "% mehr</b> als der Durchschnitt der Region " : "<b class='red'>" + (100 - (province.SunshineHours / region.SunshineHours) * 100).toFixed(2) + "% weniger</b> als der Durchschnitt der Region ") + de(province.Region) + "." +
    "</br></br>"
info.lgbtq = "<b>" + de(province.Name) + " ist " + (province['LGBT-friendly'] > 7.9 ? "eine der LGBTQ-freundlichsten Provinzen Italiens" : (province['LGBT-friendly'] > 6 ? "ziemlich LGBTQ-freundlich nach italienischen Standards" : "nicht besonders LGBTQ-freundlich im Vergleich zu anderen italienischen Provinzen")) +
    ".</b> " + (province.LGBTQAssociations > 1 ? "Es gibt " + province.LGBTQAssociations + " lokale LGBTQ+ (Arcigay) -Vereine in dieser Provinz." : (province.LGBTQAssociations == 1 ? "Es gibt 1 LGBTQ+ (Arcigay) -Verein in dieser Provinz." : ""))
  
info.leisure = de(province.Name) + " hat <b>" + (province.Nightlife > 7.5 ? "ein ausgezeichnetes Nachtleben" : "ein ziemlich lebhaftes Nachtleben") + "</b> mit " +
    province.Bars + " Bars und " + province.Restaurants + " Restaurants pro zehntausend Einwohnern. "
   
info.healthcare = "<b>Die Gesundheitsversorgung in " + de(province.Name) + " ist " + (province.Healthcare > 6.74 ? "<b class='green'>über dem Durchschnitt" : "<b class='red'>unter dem Durchschnitt") + "</b></b>. " +
    "Auf zehntausend Einwohner kommen etwa " + province.pharmacies + " Apotheken, " + province.GeneralPractitioners + " Allgemeinärzte und " + province.SpecializedDoctors + " Fachärzte. " +
    "<b>Die durchschnittliche Lebenserwartung in " + de(province.Name) + " beträgt " + (province.LifeExpectancy > 82.05 ? "sehr hoch mit " : "von ") + province.LifeExpectancy + " Jahren.</b>"

    info.crimeandsafety = "Die Provinz " + de(province.Name) + " ist in der Regel " + (province.Safety > 7.33 ? "<b class='green'>sehr sicher" : (province.Safety > 6 ? "<b class='green'>mäßig sicher" : "<b class='red'>weniger sicher als andere italienische Provinzen")) + "</b>. " +
    "Im Jahr 2021 gab es <b>" + province.ReportedCrimes + " Beschwerden über Verbrechen pro Hunderttausend Einwohner</b>. Das entspricht " + (province.ReportedCrimes > 2835.76 ? "<b class='red'>" + (((province.ReportedCrimes / 2835.76) * 100) - 100).toFixed(2) + "% über dem nationalen Durchschnitt</b>" : "<b class='green'>" + ((100 - (province.ReportedCrimes / 2835.76) * 100).toFixed(2)) + "% unter dem nationalen Durchschnitt</b>") + "." +
    "<br><br>" +
    "Es gab ungefähr <b>" + province.RoadFatalities + " Todesfälle durch Verkehrsunfälle</b> und <b>" + province.WorkAccidents + " schwere Arbeitsunfälle</b> pro zehntausend Personen in " + de(province.Name) + ". Das sind jeweils " +
    (province.RoadFatalities > 0.54 ? "<b class='red'>" + (((province.RoadFatalities / 0.54) * 100 - 100).toFixed(2)) + "% mehr Verkehrsunfälle als der Durchschnitt" : "<b class='green'>" + (((100 - (province.RoadFatalities / 0.54) * 100).toFixed(2)) + "% weniger Verkehrsunfälle als der Durchschnitt")) + "</b> und " +
    (province.RoadFatalities > 12.90 ? "<b class='red'>" + (((province.WorkAccidents / 12.90) * 100 - 100).toFixed(2)) + "% mehr Arbeitsunfälle als der Durchschnitt" : "<b class='green'>" + (((100 - (province.WorkAccidents / 12.90) * 100).toFixed(2)) + "% weniger Arbeitsunfälle als der Durchschnitt")) + "</b>." +
    "<br><br>"
info.crimeandsafety += (province.CarTheft > 70.53 ? "Autodiebstahl wird auf <b class='red'>" + (((province.CarTheft / 70.53) * 100) - 100).toFixed(2) + "% über dem Durchschnitt geschätzt</b> mit " + province.CarTheft + " Fällen pro Hunderttausend Einwohner." : "Autodiebstähle werden <b class='green'>" + ((100 - (province.CarTheft / 70.53) * 100)).toFixed(2) + "% seltener als der Durchschnitt</b> mit nur " + province.CarTheft + " gemeldeten Fällen pro Hunderttausend Einwohner.") + " " +
    (province.HouseTheft > 175.02 ? "Die gemeldeten Fälle von Einbruchdiebstahl sind <b class='red'>" + (((province.HouseTheft / 175.02) * 100) - 100).toFixed(2) + "% höher als der Durchschnitt</b> mit " + province.HouseTheft + " Beschwerden pro Hunderttausend Einwohner." : "Einbruchdiebstähle werden <b class='green'>" + ((100 - (province.HouseTheft / 175.02) * 100)).toFixed(2) + "% seltener als der Durchschnitt</b> mit nur " + province.HouseTheft + " Fällen pro Hunderttausend Einwohner.") + " " +
    (province.Robberies > 22.14 ? "Bewaffnete Raubüberfälle sind nicht ganz ungewöhnlich, es gibt <b class='red'>" + (((province.Robberies / 22.14) * 100) - 100).toFixed(2) + "% mehr gemeldete Fälle als der nationale Durchschnitt</b> mit " + province.Robberies + " Beschwerden pro Hunderttausend Einwohner" : "Bewaffnete Raubüberfälle sind nicht sehr häufig mit " + province.Robberies + " gemeldeten Fällen pro Hunderttausend Einwohner, etwa <b class='green'>" + ((100 - (province.Robberies / 22.14) * 100)).toFixed(2) + "% weniger als der nationale Durchschnitt</b>") + ". "
info.education = de(province.Name) + " hat " + (province.HighSchoolGraduates > avg.HighSchoolGraduates ? "<b class='green'>eine höhere Absolventenquote als der Durchschnitt" : "<b class='red'>eine niedrigere Absolventenquote als der Durchschnitt") + "</b>, etwa " + province.HighSchoolGraduates + "%; und " + (province.UniversityGraduates > avg.UniversityGraduates ? "<b class='green'>eine höhere Abschlussquote als der Durchschnitt" : "<b class='red'>einen niedrigeren Prozentsatz von Abschlüssen als der Durchschnitt") + "</b>, etwa " + province.UniversityGraduates + "%." +
    " Die durchschnittliche Anzahl der <b>abgeschlossenen Schuljahre</b> für Personen über 25 Jahre beträgt " + province.YearsOfIstruzione + ", was " + (province.YearsOfIstruzione > avg.YearsOfIstruzione * 1.05 ? "<b class='green'>über dem nationalen Durchschnitt liegt</b>" : (province.YearsOfIstruzione < avg.YearsOfIstruzione * 0.95 ? "<b class='red'>unter dem nationalen Durchschnitt liegt</b>" : "nahe dem nationalen Durchschnitt")) + " von " + avg.YearsOfIstruzione + ". " +
    +"<h3>Wie viele Universitäten gibt es in " + de(province.Name) + "?</h3>";
(province.Universities > 1 ? " Es gibt <b>" + province.Universities + " Universitäten</b> in der Provinz von" : (province.Universities == 1 ? " Es gibt <b>eine einzige Universität</b> in der Provinz von" : " <b>Es gibt keine Universität</b> in der Provinz von ")) + de(province.Name) + "."
info.transport = "<b>Das Angebot an öffentlichen Verkehrsmitteln in " + de(name) + "</b> ist " + (province.PublicTransport < avg.PublicTransport * 0.9 ? "<b class='red'>unzureichend" : (province.PublicTransport > avg.PublicTransport * 1.1 ? "<b class='green'>zufriedenstellend" : "<b class='green'>mehr als zufriedenstellend")) + "</b>, und " +
    (province.Traffic < avg.Traffic * 0.85 ? "<b class='green'>der Verkehr ist leicht" : (province.Traffic < avg.Traffic ? "<b class='green'>der Verkehr liegt unter dem Durchschnitt" : (province.Traffic > avg.Traffic * 1.1 ? "<b class='red'>der Verkehr ist hoch" : "<b class='red'>der Verkehr ist ziemlich hoch"))) + "</b>. " +
    "Es gibt im Durchschnitt " + province.VehiclesPerPerson + " Fahrzeuge pro Person, verglichen mit dem nationalen Durchschnitt von " + avg.VehiclesPerPerson + ". " + (province.Subway > 0 ? "Die Stadt " + name + " ist eine der wenigen italienischen Städte mit einem Metrosystem, der <b>U-Bahn von " + name + "</b>. " : "") +
    "<br><br>" +
    (facts[name]["transportData"] != "" ? (info.transport += '</br></br>' + facts[name]["transportData"]) : "")
info.disclaimer = '</br></br><center><span id="disclaimer">Diese Seite enthält Partnerlinks. Als Partner von Amazon und Viator können wir Provisionen für qualifizierte Käufe verdienen.</span></center>'

            info.map='</br><center class="map"><iframe id="ggmap" src="https://maps.google.it/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+'+name+'&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>'+
            'Afficher: '+
            '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+'+name+'+Cose+da+fare&output=embed")\' target="_blank"><b><ej>🎭</ej>Attractions</b></a> '+
            '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+'+name+'+Musei&output=embed")\' target="_blank"><b><ej>🏺</ej>Musées</b></a> '+
            '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+'+name+'+Ristoranti&output=embed")\' target="_blank"><b><ej>🍕</ej>Restaurants</b></a> '+
            '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+'+name+'+Bar&output=embed")\' target="_blank"><b><ej>🍺</ej>Bars</b></a> '+
            '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+'+name+'+Stabilimento+balneare&output=embed")\' target="_blank"><b><ej>🏖️</ej>Plages</b></a> '+
            '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+'+name+'+Area+per+passeggiate&output=embed")\' target="_blank"><b><ej>⛰️</ej>Randonnées</b></a> '+
            '<a href="https://www.amazon.it/ulp/view?&linkCode=ll2&tag=expiter-21&linkId=5824e12643c8300394b6ebdd10b7ba3c&language=fr_FR&ref_=as_li_ss_tl" target="_blank"><b><ej>📦</ej>Points de retrait Amazon</b></a> '+
            '</center>'
          
            info.weather = (province.WeatherWidget ? '<center><h3>Wetter</h3><a class="weatherwidget-io" href="https://forecast7.com/de/' + province.WeatherWidget + '" data-label_1="' + name + '" data-label_2="' + region.Name + '"' +
    'data-font="Roboto" data-icons="Climacons Animated" data-mode="Forecast" data-theme="clear"  data-basecolor="rgba(155, 205, 245, 0.59)" data-textcolor="#000441" >' + name + ' ' + region.Name + '</a>' +
    '<script>' +
    "!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');" +
    '</script>' : '');

info.viator = '<center><h3>Empfohlene Erlebnisse in ' + (province.Viator ? name : region.Name) + '</h3></center>' +
    '<div data-vi-partner-id=P00045447 data-vi-language=de data-vi-currency=EUR data-vi-partner-type="AFFILIATE" data-vi-url="' +
    (region.Name == 'Molise' ? '' : 'https://www.viator.com/') + (province.Viator ? province.Viator : region.Viator) + '"' +
    (province.Viator.includes(",") || region.Name == 'Molise' ? "" : ' data-vi-total-products=6 ') +
    ' data-vi-campaign="' + name + '" ></div>'

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
            info.related='<h2>In der Nähe</h2> '+
            '<row class="columns is-multiline is-mobile"> '+        
            facts[related1].snippet+
            facts[related2].snippet+
            facts[related3].snippet+
            facts[related4].snippet+'</row>'
           
            return info;
          }

           
          function populateFacts() {
            facts.Roma.overview = "Die <b>Stadt Rom</b> mit 2.761.632 Einwohnern ist die bevölkerungsreichste Stadt und die <b>Hauptstadt Italiens</b>.";
            facts.Milano.overview = "Die <b>Stadt Mailand</b> mit 1.371.498 Einwohnern ist die zweitgrößte Stadt und die <b>industrielle, kommerzielle und finanzielle Hauptstadt Italiens</b>.";
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
                  
              facts[province["Name"]]={}; //initialiser le dictionnaire "facts" avec chaque province
              facts[province["Name"]].snippet=
              '<figure class="column is-3 related"><a href="https://expiter.com/de/provinz/'+province.Name.replace(/\s+/g,"-").replace("'","-").toLowerCase()+'/">'+
              '<img title="'+de(province.Name)+'" loading="lazy" src="'+
              'https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-280,h-140,c-at_least,q-5" '+
              'alt="Province de '+data[i].Name+', '+data[i].Region+'"></img>'+
              '<figcaption>'+de(province.Name)+", "+de(province.Region)+"</figcaption></a></figure>";
            }
            avg=data[107];

        }

        function appendProvinceData(province, $) {
          let tab1 = $("#Quality-of-Life > .column");
          let tab2 = $("#Cost-of-Living > .column");
          let tab3 = $("#Digital-Nomads > .column");
          
          tab1[0].innerHTML += ('<p><ej>👥</ej>Bevölkerung: <b>' + province.Population.toLocaleString('de', { useGrouping: true }) + '</b>');
          tab1[0].innerHTML += ('<p><ej>🚑</ej>Gesundheit: ' + qualityScore("Healthcare", province.Healthcare));
          tab1[0].innerHTML += ('<p><ej>📚</ej>Bildung: ' + qualityScore("Education", province.Istruzione));
          tab1[0].innerHTML += ('<p><ej>👮🏽‍♀️</ej>Sicherheit: ' + qualityScore("Safety", province.Safety));
          tab1[0].innerHTML += ('<p><ej>🚨</ej>Kriminalität: ' + qualityScore("Crime", province.Crime));
      
          tab1[0].innerHTML += ('<p><ej>🚌</ej>Verkehr: ' + qualityScore("PublicTransport", province["PublicTransport"]));
          tab1[0].innerHTML += ('<p><ej>🚥</ej>Verkehr: ' + qualityScore("Traffic", province["Traffic"]));
          tab1[0].innerHTML += ('<p><ej>🚴‍♂️</ej>Fahrrad: ' + qualityScore('CyclingLanes', province['CyclingLanes']));
          tab1[0].innerHTML += ('<p><ej>🏛️</ej>Kultur: ' + qualityScore("Culture", province.Culture));
          tab1[0].innerHTML += ('<p><ej>🍸</ej>Nachtleben: ' + qualityScore("Nightlife", province.Nightlife));
          tab1[0].innerHTML += ('<p><ej>⚽</ej>Freizeit: ' + qualityScore("Sports & Leisure", province["Sports & Leisure"]));
      
          tab1[1].innerHTML += ('<p><ej>🌦️</ej>Klima: ' + qualityScore("Climate", province.Climate));
          tab1[1].innerHTML += ('<p><ej>☀️</ej>Sonnenstunden: ' + qualityScore("SunshineHours", province.SunshineHours));
          tab1[1].innerHTML += ('<p><ej>🥵</ej>Sommer ' + qualityScore("HotDays", province.HotDays));
          tab1[1].innerHTML += ('<p><ej>🥶</ej>Winter: ' + qualityScore("ColdDays", province.ColdDays));
          tab1[1].innerHTML += ('<p><ej>🌧️</ej>Regen: ' + qualityScore("RainyDays", province.RainyDays));
          tab1[1].innerHTML += ('<p><ej>🌫️</ej>Nebel: ' + qualityScore("FoggyDays", province.FoggyDays));
          tab1[1].innerHTML += ('<p><ej>🍃</ej>Luftqualität: ' + qualityScore("AirQuality", province["AirQuality"]));
      
          tab1[1].innerHTML += ('<p><ej>👪</ej>Für Familien: ' + qualityScore("Family-friendly", province["Family-friendly"]));
          tab1[1].innerHTML += ('<p><ej>👩</ej>Für Frauen: ' + qualityScore("Female-friendly", province["Female-friendly"]));
          tab1[1].innerHTML += ('<p><ej>🏳️‍🌈</ej>LGBTQ+: ' + qualityScore("LGBT-friendly", province["LGBT-friendly"]));
          tab1[1].innerHTML += ('<p><ej>🥗</ej>Vegan: ' + qualityScore("Veg-friendly", province["Veg-friendly"]));
      
          tab2[0].innerHTML += ('<p><ej>📈</ej>Lebenshaltungskosten: ' + qualityScore("CostOfLiving", province["CostOfLiving"]));
          tab2[0].innerHTML += ('<p><ej>🧑🏻</ej>Kosten (Einzelne Person): ' + qualityScore("Cost of Living (Individual)", province["Cost of Living (Individual)"]))
          tab2[0].innerHTML += ('<p><ej>👩🏽‍🏫</ej>Kosten (Tourist): ' + qualityScore("Cost of Living (Nomad)", province["Cost of Living (Nomad)"]))
          tab2[0].innerHTML += ('<p><ej>🏠</ej>Mieten (Studio): ' + qualityScore("StudioRental", province["StudioRental"]))
          tab2[0].innerHTML += ('<p><ej>🏘️</ej>Mieten (Zwei Zimmer): ' + qualityScore("BilocaleRent", province["BilocaleRent"]))
          tab2[0].innerHTML += ('<p><ej>🏰</ej>Mieten (Drei Zimmer): ' + qualityScore("TrilocaleRent", province["TrilocaleRent"]))
      
          tab2[1].innerHTML += ('<p><ej>🏙️</ej>Wohnungskosten: ' + qualityScore("HousingCost", province["HousingCost"]));
          tab2[1].innerHTML += ('<p><ej>💵</ej>Gehalt: ' + qualityScore("MonthlyIncome", province["MonthlyIncome"]));
          tab2[1].innerHTML += ('<p><ej>👪</ej>Kosten (Familie): ' + qualityScore("Cost of Living (Family)", province["Cost of Living (Family)"]))
          tab2[1].innerHTML += ('<p><ej>🏠</ej>Kauf (Studio): ' + qualityScore("StudioSale", province["StudioSale"]))
          tab2[1].innerHTML += ('<p><ej>🏘️</ej>Kauf (Zwei Zimmer): ' + qualityScore("BilocaleSale", province["BilocaleSale"]))
          tab2[1].innerHTML += ('<p><ej>🏰</ej>Kauf (Drei Zimmer): ' + qualityScore("TrilocaleSale", province["TrilocaleSale"]))
      
          tab3[0].innerHTML += ('<p><ej>👩‍💻</ej>Nomade-freundlich: ' + qualityScore("DN-friendly", province["DN-friendly"]))
          tab3[0].innerHTML += ('<p><ej>💃</ej>Unterhaltung: ' + qualityScore("Fun", province["Fun"]));
          tab3[0].innerHTML += ('<p><ej>🤗</ej>Freundlichkeit: ' + qualityScore("Friendliness", province["Friendliness"]));
          tab3[0].innerHTML += ('<p><ej>🤐</ej>Internationalität: ' + qualityScore("English-speakers", province["English-speakers"]));
          tab3[0].innerHTML += ('<p><ej>😊</ej>Glück: ' + qualityScore("Antidepressants", province["Antidepressants"]));
      
          tab3[1].innerHTML += ('<p><ej>💸</ej>Ausgaben für Nomaden: ' + qualityScore("Cost of Living (Nomad)", province["Cost of Living (Nomad)"]))
          tab3[1].innerHTML += ('<p><ej>📡</ej>Ultra-schnelles Internet: ' + qualityScore("HighSpeedInternetCoverage", province["HighSpeedInternetCoverage"]));
          tab3[1].innerHTML += ('<p><ej>📈</ej>Innovation: ' + qualityScore("Innovation", province["Innovation"]));
          tab3[1].innerHTML += ('<p><ej>🏖️</ej>Strände: ' + qualityScore("Beach", province["Beach"]));
          tab3[1].innerHTML += ('<p><ej>⛰️</ej>Wandern: ' + qualityScore("Hiking", province["Hiking"]));
      }
      
      function qualityScore(quality, score) {
        let expenses = ["Cost of Living (Individual)", "Cost of Living (Family)", "Cost of Living (Nomad)", "StudioRental", "BilocaleRent", "TrilocaleRent", "MonthlyIncome", "StudioSale", "BilocaleSale", "TrilocaleSale"];
    
        if (quality == "CostOfLiving" || quality == "HousingCost") {
            if (score < avg[quality] * 0.8) {
                return "<score class='excellent short'>sehr niedrig</score>";
            } else if (score >= avg[quality] * 0.8 && score < avg[quality] * 0.95) {
                return "<score class='great medium'>niedrig</score>";
            } else if (score >= avg[quality] * 0.95 && score < avg[quality] * 1.05) {
                return "<score class='good medium'>im Durchschnitt</score>";
            } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
                return "<score class='average long'>hoch</score>";
            } else if (score >= avg[quality] * 1.2) {
                return "<score class='poor max'>sehr hoch</score>";
            }
        } else if (expenses.includes(quality)) {
            if (score < avg[quality] * 0.8) {
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
            if (score < avg[quality] * 0.8) {
                return "<score class='excellent short'>nicht " + (quality == "HotDays" ? "heiß" : "kalt") + "</score>";
            } else if (score >= avg[quality] * 0.8 && score < avg[quality] * 0.95) {
                return "<score class='great medium'>nicht sehr " + (quality == "HotDays" ? "heiß" : "kalt") + "</score>";
            } else if (score >= avg[quality] * 0.95 && score < avg[quality] * 1.05) {
                return "<score class='good medium'>etwas " + (quality == "HotDays" ? "heiß" : "kalt") + "</score>";
            } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
                return "<score class='average long'>" + (quality == "HotDays" ? "heiß" : "kalt") + "</score>";
            } else if (score >= avg[quality] * 1.2) {
                return "<score class='poor max'>sehr " + (quality == "HotDays" ? "heiß" : "kalt") + "</score>";
            }
        } else if (quality == "RainyDays") {
            if (score < avg[quality] * 0.8) {
                return "<score class='excellent short'>sehr wenig</score>";
            } else if (score >= avg[quality] * 0.8 && score < avg[quality] * 0.95) {
                return "<score class='great medium'>wenig</score>";
            } else if (score >= avg[quality] * 0.95 && score < avg[quality] * 1.05) {
                return "<score class='good medium'>im Durchschnitt</score>";
            } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
                return "<score class='average long'>regnerisch</score>";
            } else if (score >= avg[quality] * 1.2) {
                return "<score class='poor max'>sehr regnerisch</score>";
            }
        } else if (quality == "FoggyDays") {
            if (score < avg[quality] * 0.265) {
                return "<score class='excellent short'>kein Nebel</score>";
            } else if (score >= avg[quality] * 0.265 && score < avg[quality] * 0.6) {
                return "<score class='great medium'>wenig</score>";
            } else if (score >= avg[quality] * 0.6 && score < avg[quality] * 1.00) {
                return "<score class='good medium'>im Durchschnitt</score>";
            } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 3) {
                return "<score class='average long'>neblig</score>";
            } else if (score >= avg[quality] * 3) {
                return "<score class='poor max'>sehr neblig</score>";
            }
        } else if (quality == "Crime" || quality == "Traffic") { // high score = bad; low score = good 
          if (score < avg[quality] * 0.8) {
              return "<score class='excellent short'>sehr niedrig</score>";
          } else if (score >= avg[quality] * 0.8 && score < avg[quality] * 0.95) {
              return "<score class='great medium'>niedrig</score>";
          } else if (score >= avg[quality] * 0.95 && score < avg[quality] * 1.05) {
              return "<score class='good medium'>mittel</score>";
          } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
              return "<score class='average long'>hoch</score>";
          } else if (score >= avg[quality] * 1.2) {
              return "<score class='poor max'>sehr hoch</score>";
          }
      } else { // high score = good; low score = bad 
          if (score < avg[quality] * 0.8) {
              return "<score class='poor short'>schlecht</score>";
          } else if (score >= avg[quality] * 0.8 && score < avg[quality] * 0.95) {
              return "<score class='average medium'>ausreichend</score>";
          } else if (score >= avg[quality] * 0.95 && score < avg[quality] * 1.05) {
              return "<score class='good medium'>gut</score>";
          } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
              return "<score class='great long'>sehr gut</score>";
          } else if (score >= avg[quality] * 1.2) {
              return "<score class='excellent max'>ausgezeichnet</score>";}
          }
        }   
                
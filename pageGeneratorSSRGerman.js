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
            
            var fileName = 'de/provinz/'+de(province.Name).replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
            let seoTitle=de(province.Name)+" - Qualité et Coût de la Vie"
            let seoDescription='Informations sur la vie à '+de(province.Name)+' '+'('+de(province.Region)+') pour les expatriés, les étudiants et les nomades digitaux. '+de(province.Name)+' qualité de vie, coût de la vie, sécurité et autres infos utiles.'
            let heroImage='https://expiter.com/img/'+province.Abbreviation+'.webp'

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
            '<link rel="stylesheet" href="https://expiter.com/style.css">'+

            
            '<!-- GetYourGuide Analytics -->'+
            '<script async defer src="https://widget.getyourguide.com/dist/pa.umd.production.min.js" data-gyg-partner-id="56T9R2T"></script>'+
            "</head>"+

            '<meta property="og:title" content="'+seoTitle+'" />'+
            '<meta property="og:description" content="'+seoDescription+'" />'+
            '<meta property="og:image" content="'+heroImage+'" />'+
            '<meta name="description" content="'+seoDescription+'" />'+
            "<title>"+seoTitle+"</title>"+
           
	        '<meta name="keywords" content="vivre à '+de(province.Name)+', '+de(province.Name)+' nomades digitaux,'+de(province.Name)+' qualité de vie,'+de(province.Name)+' vie nocturne" />'+

            '<link rel="icon" type="image/x-icon" title="Expiter - Expatriés et Nomades en Italie" href="https://expiter.com/img/expiter-favicon.ico"></link>'+
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
            '<div class="hero" style="background-image:url(\'https://expiter.com/img/'+province.Abbreviation+'.webp\')" '+'title="Provincia di '+de(province.Name)+'"'+'></div>'+
            '<h1 data-toc-skip id="title" class="title column is-12">  </h1></row>'+
            '<div class="tabs effect-3">'+
			'<input type="radio" id="tab-1" name="tab-effect-3" checked="checked">'+
            '<span>Qualité de Vie</span>'+
            '<input type="radio" id="tab-2" name="tab-effect-3">'+
            '<span>Coût de la Vie</span>'+
            '<input type="radio" id="tab-3" name="tab-effect-3">'+
            '<span>Nomades Numériques</span>'+    
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
'<section id="Informations Générales"><h2>Informations Générales</h2><span id="overview"></span></section>'+ 
'<section id="Climat"><h2>Climat</h2><span id="climate"></span></section>'+ '<section id="Coût de la Vie"><h2>Coût de la Vie</h2><span id="CoL"></span></section>'+
'<section id="Qualité de la Vie"><h2>Qualité de la Vie</h2>'+ 
'<section id="Santé"><h3>Santé</h3><span id="healthcare"></span></section>'+ 
'<section id="Éducation"><h3>Éducation</h3><span id="education"></span></section>'+
'<section id="Loisirs"><h3>Loisirs</h3><span id="leisure"></span></section>'+
'<section id="Criminalité et Sécurité"><h3>Criminalité et Sécurité</h3><span id="crimeandsafety"></span></section>'+
'<section id="Transports"><h3>Transports</h3><span id="transport"></span></section></section>'+ 
'<section id="Tourisme"><h2>Tourisme</h2><span id="promo"></span></section>'+
'</div>'+ '</body></html>'
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
            '<figure>'+
            '<img alt="Carte de la province de '+de(province.Name)+' dans '+de(province.Region)+'"'+
            'src="https://ik.imagekit.io/cfkgj4ulo/map/'+province["Region"].replace(/\s+/g,"-").replace("'","-")+'-provinces.webp?tr=w-250'+
            'load="lazy"></img>'+
            '<figcaption>Carte des provinces de la région '+de(province.Region)+' incluant '+de(province.Name)+'</figcaption>'+
            '</figure>'
            
            appendProvinceData(province, $);
            pb.setNavBarFR($);
            
            $(".title").text('Comment vivre à '+de(province.Name)+' - Qualité de vie, coûts et choses à savoir');
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
        
            info.overview="La province de "+de(province.Name)+" est la <b>"+province.SizeByPopulation+"e plus grande province italienne par population</b> avec <b>"+province.Population.toLocaleString()+" habitants</b>, dans la région <b>"+de(province.Region)+"</b>. "+
            (facts[name].overview?facts[name].overview:"")+
            "</br></br>"+
            "<a href='https://expiter.com/de/communes/province-de-"+de(province.Name).replace(/\s+/g,"-").replace("'","-").toLowerCase()+"/'>"+"L'aire métropolitaine de "+de(province.Name)+" comprend <b>"+
            +province.Towns+" communes</b></a> et couvre une superficie de "+province.Size.toLocaleString()+" km<sup>2</sup>. "
            +"La <b>densité de population est de "+province.Density+" habitants par km<sup>2</sup></b>, ce qui la rend "+
            (province.Density<100?"peu peuplée.":(province.Density>500?"très peuplée." : "assez densément peuplée."))+
            " Le rapport entre hommes et femmes est de "+ratio+".";
            
            (facts[name]["provinceData"]!=""?(info.overview+='</br></br>'+facts[name]["provinceData"])
            :"")
          
            info.CoL="Le <b>salaire moyen mensuel à "+de(province.Name)+" est de "+province.MonthlyIncome+"€</b>, ce qui est "+
            (province.MonthlyIncome>1500&&province.MonthlyIncome<1800?"dans la moyenne du pays":(province.MonthlyIncome>=1800?"<b class='green'>au-dessus de la moyenne</b> pour l'Italie":"<b class='red'>en dessous de la moyenne</b> pour l'Italie"))+"."+
            "</br></br>"+
            "Le coût de la vie est estimé à "+province["Cost of Living (Individual)"]+"€ par mois pour une personne seule ou "+province["Cost of Living (Family)"]+"€ par mois pour une famille de quatre personnes. Le coût pour louer "+
            "un petit appartement (deux ou trois pièces) dans un quartier résidentiel de la ville est d'environ "+province["MonthlyRental"]+"€ par mois."+"</br></br>"+
            "En général, vivre à "+(province["Cost of Living (Individual)"]>avg["Cost of Living (Individual)"]?"<b class='red'>"+de(province.Name)+" est très coûteux":(province["Cost of Living (Individual)"]<1150?"<b class='green'>"+de(province.Name)+" n'est pas du tout coûteux":"<b class='green'>"+de(province.Name)+" n'est pas très coûteux"))+"</b> par rapport aux autres provinces italiennes."
            +" Vivre à "+de(province.Name)+" est environ "+(province['Cost of Living (Individual)']>avg["Cost of Living (Individual)"]?"<b class='red'>"+(province['Cost of Living (Individual)']/avg["Cost of Living (Individual)"]*100-100).toFixed(2)+"% plus coûteux que la moyenne</b> de toutes les villes italiennes":"<b class='green'>"+(100-province['Cost of Living (Individual)']/avg["Cost of Living (Individual)"]*100).toFixed(2)+"% moins cher que la moyenne</b> de toutes les autres provinces italiennes.")
            +".";
          
            info.climate="La province de "+de(province.Name)+" reçoit en moyenne <b>"+province.SunshineHours+" heures de soleil</b> par mois, soit "+province.SunshineHours/30+" heures de lumière par jour."+
            " Cela représente "+(province.SunshineHours>236?"<b class='green'>"+(province.SunshineHours/236*100-100).toFixed(2)+"% de plus</b> que la moyenne italienne":"<b class='red'>"+(100-(province.SunshineHours/236)*100).toFixed(2)+"% de moins</b> que la moyenne italienne")+" et "+
            (province.SunshineHours>region.SunshineHours?"<b class='green'>"+(province.SunshineHours/region.SunshineHours*100-100).toFixed(2)+"% de plus</b> que la moyenne de la région ":"<b class='red'>"+(100-(province.SunshineHours/region.SunshineHours)*100).toFixed(2)+"% de moins</b> que la moyenne de la région ")+de(province.Region)+"."+
            "</br></br>"
            info.lgbtq="<b>"+de(province.Name)+" est "+(province['LGBT-friendly']>7.9?"l'une des provinces les plus LGBTQ-friendly d'Italie":(province['LGBT-friendly']>6?"assez LGBTQ-friendly selon les normes italiennes":"pas particulièrement LGBTQ-friendly par rapport aux autres provinces italiennes"))+
            ".</b> "+(province.LGBTQAssociations>1?"Il y a "+province.LGBTQAssociations+" associations locales LGBTQ+ (Arcigay) dans cette province.":(province.LGBTQAssociations==1?"Il y a 1 association LGBTQ+ (Arcigay) dans cette province.":""))
          
            info.leisure=de(province.Name)+" a <b>"+(province.Nightlife>7.5?"une excellente vie nocturne":"une vie nocturne assez animée")+"</b> avec "+
            province.Bars+" bars et "+province.Restaurants+" restaurants pour dix mille habitants. "
           
            info.healthcare="<b>La santé à "+de(province.Name)+" est "+(province.Healthcare>6.74?"<b class='green'>au-dessus de la moyenne":"<b class='red'>en dessous de la moyenne")+"</b></b>. "+
            "Pour dix mille habitants, il y a environ "+province.pharmacies+" pharmacies, "+province.GeneralPractitioners+" médecins généralistes et "+province.SpecializedDoctors+" médecins spécialisés. "+
            "<b>L'espérance de vie moyenne à "+de(province.Name)+" est "+(province.LifeExpectancy>82.05?" très élevée avec ":"de ")+province.LifeExpectancy+" ans.</b>"
            
            info.crimeandsafety="La province de "+de(province.Name)+" est généralement "+(province.Safety>7.33?"<b class='green'>très sûre":(province.Safety>6?"<b class='green'>modérément sûre":"<b class='red'>moins sûre que les autres provinces italiennes"))+"</b>. "+
            "En 2021, il y a eu <b>"+province.ReportedCrimes+" plaintes pour crimes pour cent mille habitants</b>. Cela représente "+(province.ReportedCrimes>2835.76?"<b class='red'>"+(((province.ReportedCrimes/2835.76)*100)-100).toFixed(2)+"% de plus que la moyenne nationale</b>":"<b class='green'>"+((100-(province.ReportedCrimes/2835.76)*100).toFixed(2))+"% de moins que la moyenne nationale</b>")+"."+
            "<br><br>"+
            "Il y a eu environ <b>"+province.RoadFatalities+" décès dus à des accidents de la route</b> et <b>"+province.WorkAccidents+" accidents graves au travail</b> pour dix mille personnes à "+de(province.Name)+". Il s'agit respectivement de "+
            (province.RoadFatalities>0.54?"<b class='red'>"+(((province.RoadFatalities/0.54)*100-100).toFixed(2))+"% d'accidents de la route en plus que la moyenne":"<b class='green'>"+(((100-(province.RoadFatalities/0.54)*100).toFixed(2))+"% d'accidents de la route en moins que la moyenne"))+"</b> et de "+
            (province.RoadFatalities>12.90?"<b class='red'>"+(((province.WorkAccidents/12.90)*100-100).toFixed(2))+"% d'accidents au travail en plus que la moyenne":"<b class='green'>"+(((100-(province.WorkAccidents/12.90)*100).toFixed(2))+"% d'accidents au travail en moins que la moyenne"))+"</b>."+
            "<br><br>"
            info.crimeandsafety+=(province.CarTheft>70.53?"Le vol de voitures est estimé être <b class='red'>"+(((province.CarTheft/70.53)*100)-100).toFixed(2)+"% plus élevé que la moyenne</b> avec "+province.CarTheft+" cas pour cent mille habitants.":"Les vols de voitures sont signalés être <b class='green'>"+((100-(province.CarTheft/70.53)*100)).toFixed(2)+"% moins nombreux que la moyenne</b> avec seulement "+province.CarTheft+" cas signalés pour cent mille habitants.")+" "+ (province.HouseTheft>175.02?"Les cas signalés de vols dans les habitations sont <b class='red'>"+(((province.HouseTheft/175.02)*100)-100).toFixed(2)+"% plus élevés que la moyenne</b> avec "+province.HouseTheft+" plaintes pour cent mille habitants.":"Les cas de vols dans les habitations sont signalés <b class='green'>"+((100-(province.HouseTheft/175.02)*100)).toFixed(2)+"% moins nombreux</b> que la moyenne avec "+province.HouseTheft+" cas pour cent mille habitants.")+" "+ (province.Robberies>22.14?"Les événements de vol à main armée ne sont pas tout à fait inhabituels, il y a <b class='red'>"+(((province.Robberies/22.14)*100)-100).toFixed(2)+"% plus de cas signalés que la moyenne nationale</b> avec "+province.Robberies+" plaintes pour cent mille habitants":"Les vols à main armée ne sont pas très fréquents avec "+province.HouseTheft+" cas signalés pour cent mille habitants, environ <b class='green'>"+((100-(province.Robberies/22.14)*100)).toFixed(2)+"% moins que la moyenne nationale</b>")+". "
            info.education=de(province.Name)+" a "+(province.HighSchoolGraduates>avg.HighSchoolGraduates?"<b class='green'>un nombre de diplômés plus élevé que la moyenne":"<b class='red'>un taux de diplômés plus bas que la moyenne")+"</b>, environ "+province.HighSchoolGraduates+"%; et "+(province.UniversityGraduates>avg.UniversityGraduates?"<b class='green'>un taux de diplômés plus élevé que la moyenne":"<b class='red'>un pourcentage de diplômés plus bas que la moyenne")+"</b>, environ "+province.UniversityGraduates+"%."+
            " Le nombre moyen d'<b>années d'études</b> achevées pour les personnes de plus de 25 ans est de "+province.YearsOfIstruzione+", ce qui est "+(province.YearsOfIstruzione>avg.YearsOfIstruzione*1.05?"<b class='green'>au-dessus de la moyenne nationale</b>":(province.YearsOfIstruzione<avg.YearsOfIstruzione*.95?"<b class='red'>en dessous de la moyenne nationale</b>":"pas loin de la moyenne nationale"))+" de "+avg.YearsOfIstruzione+". "+
            +"<h3>Combien d'universités y a-t-il à "+de(province.Name)+"?</h3>";
            (province.Universities>1?" Il y a <b>"+province.Universities+" universités</b> dans la province de":(province.Universities==1?" Il y a <b>une seule université</b> dans la province de":" <b>Il n'y a pas d'université</b> dans la province de "))+de(province.Name)+"."
          
            info.transport="<b>L'offre de transport public à "+name+"</b> est "+(province.PublicTransport<avg.PublicTransport*.9?"<b class='red'>insuffisante":(province.PublicTransport>avg.PublicTransport*1.1?"<b class='green'>assez bonne":"<b class='green'>plus que satisfaisante"))+"</b>, et "+
            (province.Traffic<avg.Traffic*.85?"<b class='green'>le trafic est faible":(province.Traffic<avg.Traffic?"<b class='green'>le trafic est en dessous de la moyenne":(province.Traffic>avg.Traffic*1.1?"<b class='red'>il y a beaucoup de trafic automobile":"<b class='red'>il y a des niveaux de trafic assez élevés")))+"</b>. "+
            "Il y a en moyenne "+province.VehiclesPerPerson+" véhicules par personne, par rapport à la moyenne nationale de "+avg.VehiclesPerPerson+". "+(province.Subway>0?"La ville de "+name+" est l'une des rares villes italiennes dotées d'un système de transport métropolitain, le <b>Métro de "+name+"</b>. ":"")+
            "<br><br>"+
            (facts[name]["transportData"]!=""?(info.transport+='</br></br>'+facts[name]["transportData"])
            :"")
        
            info.disclaimer='</br></br><center><span id="disclaimer">Cette page contient des liens d\'affiliation. En tant que partenaire d\'Amazon et de Viator, nous pouvons gagner des commissions sur les achats éligibles.</span></center>'
            
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
          
            info.weather=(province.WeatherWidget?'<center><h3>Climat</h3><a class="weatherwidget-io" href="https://forecast7.com/de/'+province.WeatherWidget+'" data-label_1="'+name+'" data-label_2="'+region.Name+'"'+
            'data-font="Roboto" data-icons="Climacons Animated" data-mode="Forecast" data-theme="clear"  data-basecolor="rgba(155, 205, 245, 0.59)" data-textcolor="#000441" >name Region.Name</a>'+
            '<script>'+
            "!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');"+
            '</script>':"")
          
            info.viator='<center><h3>Expériences recommandées à '+(province.Viator?name:region.Name)+'</h3></center>'+
            '<div data-vi-partner-id=P00045447 data-vi-language=fr data-vi-currency=EUR data-vi-partner-type="AFFILIATE" data-vi-url="'+
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
            info.related='<h2>A proximité</h2> '+
            '<row class="columns is-multiline is-mobile"> '+        
            facts[related1].snippet+
            facts[related2].snippet+
            facts[related3].snippet+
            facts[related4].snippet+'</row>'
           
            return info;
          }

           
              function populateFacts(){
                facts.Roma.overview="La <b>ville de Rome</b>, avec 2.761.632 habitants, est la ville la plus peuplée et la <b>capitale de l'Italie</b>."
              facts.Milano.overview="La <b>ville de Milan</b>, avec 1.371.498 habitants, est la deuxième ville la plus peuplée et la <b>capitale industrielle, commerciale et financière de l'Italie</b>."
              
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
              '<img title="'+de(province.Name)+'" load="lazy" src="'+
              'https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-280,h-140,c-at_least,q-5" '+
              'alt="Province de '+data[i].Name+', '+data[i].Region+'"></img>'+
              '<figcaption>'+de(province.Name)+", "+de(province.Region)+"</figcaption></a></figure>";
            }
            avg=data[107];

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

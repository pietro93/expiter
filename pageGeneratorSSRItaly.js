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
            
            var fileName = './it/province/'+province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
            
            const dom = new jsdom.JSDOM(
            "<html lang='it'>"+
            '<head><meta charset="utf-8">'+
            '<link rel="canonical" href="https://expiter.com/province/'+province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()+'/"/>'+
            '<meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale-1,user-scalable=0">'+
            '<script type="text/javascript" src="https://expiter.com/jquery3.6.0.js" defer></script>'+
            '<script type="text/json" src="https://expiter.com/dataset.json"></script>'+
            '<script type="text/javascript" src="https://expiter.com/script.js" defer></script>'+
            '<script type="text/javascript" src="https://expiter.com/bootstrap-toc.js" defer></script>'+
            '<link rel="stylesheet" href="https://expiter.com/fonts.css" media="print" onload="this.media=\'all\'"></link>'+
            '<link rel="stylesheet" href="https://expiter.com/bulma.min.css">'+
            '<link rel="stylesheet" href="https://expiter.com/style.css">'+
            
            '<meta name="description" content="Informazion sulla vita a '+province.Name+' '+'('+province.Region+') per fuori sede e nomadi digitali. '+province.Name+' qualità della vita, costo della via, sicurezza e altre info utili." />'+
	        '<meta name="keywords" content="vivere a'+province.Name+', '+province.Name+' nomadi digitali,'+province.Name+' qualità della vita,'+province.Name+' digital nomad" />'+
            "<title>"+province.Name+" - Qualità e Costo della Vita </title>"+
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
            '<div class="hero" style="background-image:url(\'https://expiter.com/img/'+province.Abbreviation+'.webp\')" '+'title="'+province.Name+' Province"'+'></div>'+
            '<h1 data-toc-skip id="title" class="title column is-12">  </h1></row>'+
            '<div class="tabs effect-3">'+
			'<input type="radio" id="tab-1" name="tab-effect-3" checked="checked">'+
			'<span>Qualità della Vita</span>'+
			'<input type="radio" id="tab-2" name="tab-effect-3">'+
			'<span>Costo della Vita</span>'+
			'<input type="radio" id="tab-3" name="tab-effect-3">'+
			'<span>Nomadi Digitali</span>'+
			'<input type="radio" id="tab-4" name="tab-effect-3" disabled>'+
			'<span></span>'+
			'<input type="radio" id="tab-5" name="tab-effect-3" disabled>'+
			'<span></span>'+
			'<div class="line ease"></div>'+
			'<!-- tab-content -->'+
			'<div class="tab-content">'+
				'<section id="tab-item-1" class="columns is-mobile is-multiline">'+
                    '<div class="column">'+                    
               '<!--script.js adds content here-->'+
                    '</div>'+
                '<div class="column" >'+
              '<!--script.js adds content here-->'+
                '</div>'+
				'</section>'+
				'<section id="tab-item-2" class="columns is-mobile is-multiline">'+
				    '<div class="column">'+
                        '<!--script.js adds content here-->'+
                             '</div>'+
                         '<div class="column" >'+
                         '</div>'+
				'</section>'+
				'<section id="tab-item-3" class="columns is-mobile is-multiline">'+
				    '<div class="column">'+
                             '</div>'+
                         '<div class="column" >'+
                         '</div>'+
				'</section>'+
			'</div>'+
		'</div></div>'+
            '<div id="info" class="columns is-multiline is-mobile">'+
            '<section id="Informazioni Generali"><h2>Informazioni Generali</h2><span id="overview"></span></section>'+
            '<section id="Clima"><h2>Clima</h2><span id="climate"></span></section>'+
            '<section id="Costo della Vita"><h2>Costo della Vita</h2><span id="CoL"></span></section>'+
            '<section id="Qualità della Vita"><h2>Qualità della Vita</h2>'+
            '<section id="Sanità"><h3>Healthcare</h3><span id="healthcare"></span></section>'+
            '<section id="Istruzione"><h3>Istruzione</h3><span id="education"></span></section>'+
            '<section id="Svago"><h3>Svago</h3><span id="leisure"></span></section>'+
            '<section id="Crimine e Sicurezza"><h3>Crimine e Sicurezza</h3><span id="crimeandsafety"></span></section>'+
            '<section id="Trasporti"><h3>Trasporti</h3><span id="transport"></span></section></section>'+
            '<section id="Scopri"><h2>Scopri</h2><span id="promo"></span></section>'+
            '</div>'+
            '</body></html>'
                    )


         let parsedData = fs.readFileSync('temp/it-parsedDataAbout'+province.Name+'.txt','utf8');
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
        '<img alt="Mappa della provincia di '+province.Name+' in '+province.Region+'"'+
        'src="https://ik.imagekit.io/cfkgj4ulo/map/'+province["Region"].replace(/\s+/g,"-").replace("'","-")+'-provinces.webp?tr=w-250'+
        'load="lazy"></img>'+
        '<figcaption>Mappa delle province della regione '+province.Region+' inclusa '+province.Name+'</figcaption>'+
        '</figure>'
        
        appendProvinceData(province, $);
        setNavBar($);
        
        $(".title").text('Vivere a '+province.Name);
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
  
        info.overview="La provincia di "+province.Name+" è la <b>"+province.SizeByPopulation+"° più grande provincia Italiana per popolazione</b> con <b>"+province.Population.toLocaleString()+" abitanti</b>, nella regione <b>"+province.Region+"</b>. "+
        (facts[name].overview?facts[name].overview:"")+
        "</br></br>"+
        "L'area metropolitana di "+province.Name+" comprende <b>"+province.Towns+" comuni</b> e ricopre un'area di "+province.Size.toLocaleString()+" km<sup>2</sup>. "
        +"La <b>densità di popolazione è di "+province.Density+" abitanti per km<sup>2</sup></b>, il ché la rende "+
        (province.Density<100?"scarsamente popolata.":(province.Density>500?"molto affollata." : "abbastanza densamente popolata."))+
        " Il rapporto tra uomini e donne è di "+ratio+".";
        
        (facts[name]["provinceData"]!=""?(info.overview+='</br></br>'+facts[name]["provinceData"])
        :"")
      
        info.CoL="Lo <b>stipendio medio mensile a "+province.Name+" è di "+province.MonthlyIncome+"€</b>, che è "+
        (province.MonthlyIncome>1500&&province.MonthlyIncome<1800?"nella media per il paese":(province.MonthlyIncome>=1800?"<b class='green'>sopra la media</b> per l'Italia":"<b class='red'>al di sotto della media</b> per l'Italia"))+"."+
        "</br></br>"+
        "Il costo della vita si stima attorno a "+province["Cost of Living (Individual)"]+"€ al mese per persona singola o "+province["Cost of Living (Family)"]+"€ al mese per una famiglia di quattro persone. Il costo per affittare "+
        "un piccolo appartamento (bilocale o trilocale) in un'area residenziale di città è di circa "+province["MonthlyRental"]+"€ al mese."+"</br></br>"+
        "In generale, vivere a "+(province["Cost of Living (Individual)"]>avg["Cost of Living (Individual)"]?"<b class='red'>"+province.Name+" è molto costoso":(province["Cost of Living (Individual)"]<1150?"<b class='green'>"+province.Name+" non è affatto costoso":"<b class='green'>"+province.Name+" non è molto costoso"))+"</b> in confronto ad altre province italiane."
        +" Vivere a "+province.Name+" è all'incirca "+(province['Cost of Living (Individual)']>avg["Cost of Living (Individual)"]?"<b class='red'>"+(province['Cost of Living (Individual)']/avg["Cost of Living (Individual)"]*100-100).toFixed(2)+"% più costoso rispetto alla media</b> di tutte le città italiane":"<b class='green'>"+(100-province['Cost of Living (Individual)']/avg["Cost of Living (Individual)"]*100).toFixed(2)+"% più economico della media</b> di tutte le altre province italiane.")
        +".";
      
        info.climate="La provincia di "+province.Name+" riceve in media <b>"+province.SunshineHours+" ore di sole</b> al mese, o "+province.SunshineHours/30+" ore di luce giornaliere."+
        " Si tratta del "+(province.SunshineHours>236?"<b class='green'>"+(province.SunshineHours/236*100-100).toFixed(2)+"% in più</b> rispetto alla media italiana":"<b class='red'>"+(100-(province.SunshineHours/236)*100).toFixed(2)+"% di meno</b> rispetto alla media italiana")+" e "+
        (province.SunshineHours>region.SunshineHours?"<b class='green'>"+(province.SunshineHours/region.SunshineHours*100-100).toFixed(2)+"% in più</b> rispetto alla media per la regione ":"<b class='red'>"+(100-(province.SunshineHours/region.SunshineHours)*100).toFixed(2)+"% di meno</b> rispetto alla media per la regione ")+province.Region+"."+
        "</br></br>"
        info.climate+=" Durante l'anno, <b>piove in media "+province.RainyDays+" giorni al mese</b>, che è "+
        (province.RainyDays>8?"<b class='red'>molto al di sopra della media":(province.RainyDays<7?"<b class='green'>al di sotto della media</b>":"<b>un regolare ammontare di precipitazione"))+"</b> per una provincia italiana."+
        "</br></br>"+
        "Durante la stagione autunnale e invernale, ci sono generalmente "+(province.FoggyDays>5?"<b class='red'>":"<b class='green'>")+province.FoggyDays+" giorni di nebbia al mese</b> e <b>"+province.ColdDays+" giornate molto fredde</b> con temperatura percepita la di sotto dei 3°C nell'arco di un mese. "+
        " In estate, ci sono in media <b>"+province.HotDays+" giornate afose al mese</b>, con temperature percepite al di sopra dei 30°C."
        
        info.lgbtq="<b>"+province.Name+" is "+(province['LGBT-friendly']>7.9?"one of the most LGBTQ-friendly provinces in Italy":(province['LGBT-friendly']>6?"somewhat LGBTQ+ friendly by Italian standards":"not particularly LGBTQ-friendly as far as Italian provinces go"))+
        ".</b> "+(province.LGBTQAssociations>1?"There are "+province.LGBTQAssociations+" local LGBTQ+ associations (Arcigay) in this province.":(province.LGBTQAssociations==1?"There is 1 LGBTQ+ association (Arcigay) in this province.":""))
      
        info.leisure=province.Name+" has <b>"+(province.Nightlife>7.5?"pretty good nightlife":"somewhat decent nightlife")+"</b> with "+
        province.Bars+" bars and "+province.Restaurants+" restaurants per 10k inhabitants. "
       
        info.healthcare="<b>Healthcare in "+province.Name+" is "+(province.Healthcare>6.74?"<b class='green'>above average":"<b class='red'>below average")+"</b></b>. "+
        "For every 10k inhabitants, there are around "+province.pharmacies+" pharmacies, "+province.GeneralPractitioners+" general practitioners and "+province.SpecializedDoctors+" specialized doctors per 10k inhabitants. "+
        "<b>Average life expectancy in "+province.Name+" is "+(province.LifeExpectancy>82.05?" very high at ":"")+province.LifeExpectancy+" years of age.</b>"
        
        info.crimeandsafety="La provincia di "+province.Name+" is overall "+(province.Safety>7.33?"<b class='green'>very safe for expats":(province.Safety>6?"<b class='green'>moderately safe for expats":"<b class='red'>less safe than other Italian provinces for expats"))+"</b>. "+
        "As of 2021, there are an average of <b>"+province.ReportedCrimes+" reported crimes per 100k inhabitants</b>. This is "+(province.ReportedCrimes>2835.76?"<b class='red'>"+(((province.ReportedCrimes/2835.76)*100)-100).toFixed(2)+"% higher than the national average</b>":"<b class='green'>"+((100-(province.ReportedCrimes/2835.76)*100).toFixed(2))+"% lower than the national average</b>")+"."+
        "<br><br>"+
        "There have been around <b>"+province.RoadFatalities+" deadly road accidents</b> and <b>"+province.WorkAccidents+" serious work-related injuries</b> per 10k people in "+province.Name+". This is respectively "+
        (province.RoadFatalities>0.54?"<b class='red'>"+(((province.RoadFatalities/0.54)*100-100).toFixed(2))+"% more driving accidents than average":"<b class='green'>"+(((100-(province.RoadFatalities/0.54)*100).toFixed(2))+"% less driving accidents than average"))+"</b> and "+
        (province.RoadFatalities>12.90?"<b class='red'>"+(((province.WorkAccidents/12.90)*100-100).toFixed(2))+"% more work accidents than average":"<b class='green'>"+(((100-(province.WorkAccidents/12.90)*100).toFixed(2))+"% less work accidents than average"))+"</b>."+
        "<br><br>"
        info.crimeandsafety+=(province.CarTheft>70.53?"Car theft is reportedly <b class='red'>"+(((province.CarTheft/70.53)*100)-100).toFixed(2)+"% higher than average</b> with "+province.CarTheft+" cases per 100k inhabitants.":"Car theft is reportedly <b class='green'>"+((100-(province.CarTheft/70.53)*100)).toFixed(2)+"% lower than average</b> with only "+province.CarTheft+" cases per 100k inhabitants.")+" "+
      (province.HouseTheft>175.02?"Reports of house thefts are <b class='red'>"+(((province.HouseTheft/175.02)*100)-100).toFixed(2)+"% higher than average</b> with "+province.HouseTheft+" cases per 100k inhabitants.":"Reports of house thefts are <b class='green'>"+((100-(province.HouseTheft/175.02)*100)).toFixed(2)+"% lower</b> than average with "+province.HouseTheft+" cases per 100k inhabitants.")+" "+
      (province.Robberies>22.14?"Cases of robbery are not totally uncommon, around <b class='red'>"+(((province.Robberies/22.14)*100)-100).toFixed(2)+"% higher than average</b> with "+province.Robberies+" reports per 100k inhabitants":"Cases of robbery are uncommon with "+province.HouseTheft+" reported cases per 100k inhabitants, about <b class='green'>"+((100-(province.Robberies/22.14)*100)).toFixed(2)+"% less the national average</b>")+". "
      
        info.education=province.Name+" has a "+(province.HighSchoolGraduates>avg.HighSchoolGraduates?"<b class='green'>higher-than-average percentage of high school graduates":"<b class='red'>lower-than-average percentage of high school graduates")+"</b>, around "+province.HighSchoolGraduates+"%; and a "+(province.UniversityGraduates>avg.UniversityGraduates?"<b class='green'>higher-than-average percentage of university graduates":"<b class='red'>lower-than-average percentage of university graduates")+"</b>, around "+province.UniversityGraduates+"%."+
        " The average number of completed <b>years of schooling</b> for people over 25 is "+province.YearsOfIstruzione+", which is "+(province.YearsOfIstruzione>avg.YearsOfIstruzione*1.05?"<b class='green'>above the national average</b>":(province.YearsOfIstruzione<avg.YearsOfIstruzione*.95?"<b class='red'>lower than the national average</b>":"not far from the national average"))+" of "+avg.YearsOfIstruzione+". "+
        (province.Universities>1?" There are <b>"+province.Universities+" universities</b> within the province":(province.Universities==1?" There is <b>one university</b> in the province":" There are <b>no universities</b> in this province"))+"."
      
        info.transport="<b>Public transport in "+name+"</b> is "+(province.PublicTransport<avg.PublicTransport*.9?"<b class='red'>lacking":(province.PublicTransport>avg.PublicTransport*1.1?"<b class='green'>quite good":"<b class='green'>fairly decent"))+"</b>, and "+
        (province.Traffic<avg.Traffic*.85?"<b class='green'>traffic is low":(province.Traffic<avg.Traffic?"<b class='green'>traffic is below average":(province.Traffic>avg.Traffic*1.1?"<b class='red'>traffic is very high":"<b class='red'>traffic is somewhat high")))+"</b>. "+
        "There are on average "+province.VehiclesPerPerson+" active vehicles per person, against a national average of "+avg.VehiclesPerPerson+". "+(province.Subway>0?"The city of "+name+" is one of the very few places in Italy with an urban metro system, the <b>Metropolitana di "+name+"</b>. ":"")+
        "<br><br>"+
        "Around "+(province.CyclingLanes/10).toFixed(2)+"km per 10k inhabitants of the main city in "+name+" consist of bicycle lanes. This makes "+name+" "+(province.CyclingLanes>avg.CyclingLanes*.8?"<b class='green'>somewhat bike-friendly by Italian standards":(province.CyclingLanes>avg.CyclingLanes*1.2?"<b class='green'>very bike-friendly by Italian standards":"<b class='red'>not very bike-friendly"))+"</b>. ";
        
        (facts[name]["transportData"]!=""?(info.transport+='</br></br>'+facts[name]["transportData"])
        :"")

        info.disclaimer='</br></br><center><span id="disclaimer">This page contains affiliate links. As part of the Amazon Associates and Viator Partner programmes, we may earn a commission on qualified purchases.</span></center>'
        
        info.map='</br><center class="map"><iframe src="https://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=Province%20Of%20'+name+'&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>'+
        'Search for: '+
        '<a href="https://www.amazon.it/ulp/view?&linkCode=ll2&tag=expiter-21&linkId=5824e12643c8300394b6ebdd10b7ba3c&language=it_IT&ref_=as_li_ss_tl" target="_blank"><b>📦Amazon Pickup Locations</b></a> '+
        '<a href="https://www.google.com/maps/search/Province+Of+'+name+'+Attractions/" target="_blank"><b>🎭Attractions</b></a> '+
        '<a href="https://www.google.com/maps/search/Province+Of+'+name+'+Museums/" target="_blank"><b>🏺Museums</b></a> '+
        '<a href="https://www.google.com/maps/search/Province+Of+'+name+'+Restaurants/" target="_blank"><b>🍕Restaurants</b></a> '+
        '<a href="https://www.google.com/maps/search/Province+Of+'+name+'+Beaches/" target="_blank"><b>🏖️Beach</b></a> '+
        '<a href="https://www.google.com/maps/search/Province+Of+'+name+'+Hiking/" target="_blank"><b>⛰️Hiking</b></a> '+
        '</center>'
      
        info.weather=(province.WeatherWidget?'<center><h3>Weather Now</h3><a class="weatherwidget-io" href="https://forecast7.com/en/'+province.WeatherWidget+'" data-label_1="'+name+'" data-label_2="'+region.Name+'"'+
        'data-font="Roboto" data-icons="Climacons Animated" data-mode="Forecast" data-theme="clear"  data-basecolor="rgba(155, 205, 245, 0.59)" data-textcolor="#000441" >name Region.Name</a>'+
        '<script>'+
        "!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');"+
        '</script>':"")
      
        info.viator='<center><h3>Recommended Tours in '+(province.Viator?name:region.Name)+'</h3></center>'+
        '<div data-vi-partner-id=P00045447 data-vi-language=en data-vi-currency=USD data-vi-partner-type="AFFILIATE" data-vi-url="'+
        (region.Name=='Molise'?'':'https://www.viator.com/')+(province.Viator?province.Viator:region.Viator)+'"'+
        (province.Viator.includes(",")||region.Name=='Molise'?"":' data-vi-total-products=6 ')+
        ' data-vi-campaign="'+name+'" ></div>'+
        '<script async src="https://www.viator.com/orion/partner/widget.js"></script>'

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

        info.related='<h2>Provinces Nearby</h2> '+
        '<row class="columns is-multiline is-mobile"> '+        
        facts[related1].snippet+
        facts[related2].snippet+
        facts[related3].snippet+
        facts[related4].snippet+'</row>'
       
        return info;
      }

      

function populateFacts(){
  
    facts.Roma.overview="La <b>città di Roma</b>, con 2.761.632 abitanti, è la città più popolosa nonché <b>capitale d'Italia</b>."
    facts.Milano.overview="The <b>city of Milan</b>, with 1,371,498 residents, is the second-most popolous city and <b>industrial, commercial and financial capital of Italy</b>."
    
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
            '<li><a href="../resources/">Resources</a></li>'+
            '<li><a href="../tools/codice-fiscale-generator/">Tools</a></li>'+
            '<li><a href="../app/#About">About</a></li>'+
            '<li><a href="https://forms.gle/WiivbZg8336TmeUPA" target="_blank">Take Survey</a></li>'+
            '</ul>'+
            '  <label class="switch" id="switch">'+
            '<input type="checkbox">'+
            '<span class="slider round"></span>'+
          '</label>'+
       '<a href="/"><div class="logo">Italy Expats & Nomads</div></a>'+
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
      'alt="Provincia di '+data[i].Name+', '+data[i].Region+'"></img>'+
      '<figcaption>'+province.Name+", "+province.Region+"</figcaption></a></figure>";
    }
    avg=data[107];
    
  }

  function appendProvinceData(province, $){
  
    let tab1=$("#tab-item-1 > .column");
    let tab2=$("#tab-item-2 > .column"); 
    let tab3=$("#tab-item-3 > .column"); 
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
  
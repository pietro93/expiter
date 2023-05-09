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
            
            var fileName = 'province/'+province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
            
            const dom = new jsdom.JSDOM(
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
            '<link rel="stylesheet" href="https://expiter.com/style.css">'+
            
            '<meta name="description" content="Information about living in '+en(province.Name)+', Italy for expats and digital nomads. '+en(province.Name)+' quality of life, cost of living, safety and more." />'+
	          '<meta name="keywords" content="'+en(province.Name)+' italy, '+en(province.Name)+' expat,'+en(province.Name)+' life,'+en(province.Name)+' digital nomad" />'+
            "<title>"+en(province.Name)+" - Quality of Life and Info Sheet for Expats </title>"+
            '<link rel="icon" type="image/x-icon" title="Expiter - Italy Expats and Nomads" href="https://expiter.com/img/expiter-favicon.ico"></link>'           
            +
            '<!-- GetYourGuide Analytics -->'+
            '<script async defer src="https://widget.getyourguide.com/dist/pa.umd.production.min.js" data-gyg-partner-id="56T9R2T"></script>'+
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
            '<section id="Climate"><h2>Climate</h2><span id="climate"></span></section>'+
            '<section id="Cost of Living"><h2>Cost of Living</h2><span id="CoL"></span></section>'+
            '<section id="Quality of Life"><h2>Quality of Life</h2>'+
            '<section id="Healthcare"><h3>Healthcare</h3><span id="healthcare"></span></section>'+
            '<section id="Education"><h3>Education</h3><span id="education"></span></section>'+
            '<section id="Leisure"><h3>Leisure</h3><span id="leisure"></span></section>'+
            '<section id="Crime and Safety"><h3>Crime and Safety</h3><span id="crimeandsafety"></span></section>'+
            '<section id="Transport"><h3>Transport</h3><span id="transport"></span></section></section>'+
            '<section id="Discover"><h2>Discover</h2><span id="promo"></span></section>'+
            '</div>'+
            '</body></html>'
                    )


         let parsedData = fs.readFileSync('temp/parsedDataAbout'+province.Name+'.txt','utf8');
         let provinceData = parsedData.split("%%%")[0]; (provinceData=="undefined"?provinceData="":"")
         let transportData = parsedData.split("%%%")[1]; (transportData=="undefined"?transportData="":"")
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
        '<img alt="Map of the '+en(province.Name)+' province in '+en(province.Region)+'"'+
        'src="https://ik.imagekit.io/cfkgj4ulo/map/'+province["Region"].replace(/\s+/g,"-").replace("'","-")+'-provinces.webp?tr=w-250'+
        'load="lazy"></img>'+
        '<figcaption>Map of the provinces of '+en(province.Region)+' including '+en(province.Name)+'</figcaption>'+
        '</figure>'
        
        appendProvinceData(province, $);
        setNavBar($);
        
        $(".title").text(en(province.Name)+' for Expats and Nomads');
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
  
        info.overview="The province of "+en(province.Name)+" is the <b>"+province.SizeByPopulation+(province.SizeByPopulation%10==1?"st":(province.SizeByPopulation%10==2?"nd":province.SizeByPopulation%10==3?"rd":"th"))+" largest Italian province by population</b> with <b>"+province.Population.toLocaleString()+" people</b>, located in the <b>"+en(province.Region)+"</b> region. "+
        (facts[name].overview?facts[name].overview:"")+
        "</br></br>"+
        "<a href='https://expiter.com/comuni/province-of-"+province.Name.replace(/\s+/g,"-").replace("'","-").toLowerCase()+"/'>"+"The larger "+province.Name+" metropolitan area comprises <b>"+province.Towns+" towns</b> (comuni)</a> and covers an area of "+province.Size.toLocaleString()+" km<sup>2</sup>. "
        +"The <b>population density is "+province.Density+" inhabitants per km<sup>2</sup></b>, making it "+
        (province.Density<100?"sparcely populated.":(province.Density>500?"highly densely populated." : "somewhat densely populated."))+
        " The male to female ratio is "+ratio+".";
        
        (facts[name]["provinceData"]!=""?(info.overview+='</br></br>'+facts[name]["provinceData"])
        :"")
      
        info.CoL="The <b>average monthly income in "+en(province.Name)+" is around "+province.MonthlyIncome+"€</b>, which is "+
        (province.MonthlyIncome>1500&&province.MonthlyIncome<1800?"close to the average for Italy":(province.MonthlyIncome>=1800?"<b class='green'>higher than the average</b> for Italy":"<b class='red'>lower than the average</b> for Italy"))+"."+
        "</br></br>"+
        "The estimated cost of living is around "+province["Cost of Living (Individual)"]+"€ per month for an individual or "+province["Cost of Living (Family)"]+"€ per month for a family of 4. The cost for renting "+
        "a small apartment (2-3 bedrooms) in a main city area is around "+province["MonthlyRental"]+"€ per month."+"</br></br>"+
        "Overall, "+(province["Cost of Living (Individual)"]>avg["Cost of Living (Individual)"]?"<b class='red'>"+province.Name+" is expensive":(province["Cost of Living (Individual)"]<1150?"<b class='green'>"+en(province.Name)+" is cheap":"<b class='green'>"+en(province.Name)+" is affordable"))+"</b> compared to other Italian provinces."
        +" Living in "+en(province.Name)+" is around "+(province['Cost of Living (Individual)']>avg["Cost of Living (Individual)"]?"<b class='red'>"+(province['Cost of Living (Individual)']/avg["Cost of Living (Individual)"]*100-100).toFixed(2)+"% more expensive than the average</b> of all Italian provinces":"<b class='green'>"+(100-province['Cost of Living (Individual)']/avg["Cost of Living (Individual)"]*100).toFixed(2)+"% cheaper than the average</b> of all Italian provinces")
        +".";
      
        info.climate="The province of "+en(province.Name)+" receives on average <b>"+province.SunshineHours+" hours of sunshine</b> per month, or "+province.SunshineHours/30+" hours of sunshine per day."+
        " This is "+(province.SunshineHours>236?"<b class='green'>"+(province.SunshineHours/236*100-100).toFixed(2)+"% more</b> than the average for Italy":"<b class='red'>"+(100-(province.SunshineHours/236)*100).toFixed(2)+"% less</b> than the average for Italy")+" and "+
        (province.SunshineHours>region.SunshineHours?"<b class='green'>"+(province.SunshineHours/region.SunshineHours*100-100).toFixed(2)+"% more</b> than the average for the region of ":"<b class='red'>"+(100-(province.SunshineHours/region.SunshineHours)*100).toFixed(2)+"% less</b> than the average for the region of ")+en(province.Region)+"."+
        "</br></br>"
        info.climate+=" Throughout the year, <b>it rains on average "+province.RainyDays+" days per month</b>, which is "+
        (province.RainyDays>8?"<b class='red'>well above average":(province.RainyDays<7?"<b class='green'>below average</b>":"<b>an ordinary amount of precipitation"))+"</b> for an Italian province."+
        "</br></br>"+
        "Throughout the autumn and winter season, there are usually "+(province.FoggyDays>5?"<b class='red'>":"<b class='green'>")+province.FoggyDays+" days per month with fog</b> and <b>"+province.ColdDays+" cold days per month</b> with perceived temperatures below 3°C. "+
        " In the summer, there are on average <b>"+province.HotDays+" hot days per month</b> with perceived temperatures above 30°C."
        
        info.lgbtq="<b>"+en(province.Name)+" is "+(province['LGBT-friendly']>7.9?"one of the most LGBTQ-friendly provinces in Italy":(province['LGBT-friendly']>6?"somewhat LGBTQ+ friendly by Italian standards":"not particularly LGBTQ-friendly as far as Italian provinces go"))+
        ".</b> "+(province.LGBTQAssociations>1?"There are "+province.LGBTQAssociations+" local LGBTQ+ associations (Arcigay) in this province.":(province.LGBTQAssociations==1?"There is 1 LGBTQ+ association (Arcigay) in this province.":""))
      
        info.leisure=en(province.Name)+" has <b>"+(province.Nightlife>7.5?"pretty good nightlife":"somewhat decent nightlife")+"</b> with "+
        province.Bars+" bars and "+province.Restaurants+" restaurants per 10k inhabitants. "
       
        info.healthcare="<b>Healthcare in "+en(province.Name)+" is "+(province.Healthcare>6.74?"<b class='green'>above average":"<b class='red'>below average")+"</b></b>. "+
        "For every 10k inhabitants, there are around "+province.pharmacies+" pharmacies, "+province.GeneralPractitioners+" general practitioners and "+province.SpecializedDoctors+" specialized doctors per 10k inhabitants. "+
        "<b>Average life expectancy in "+en(province.Name)+" is "+(province.LifeExpectancy>82.05?" very high at ":"")+province.LifeExpectancy+" years of age.</b>"
        
        info.crimeandsafety="The province of "+en(province.Name)+" is overall "+(province.Safety>7.33?"<b class='green'>very safe for expats":(province.Safety>6?"<b class='green'>moderately safe for expats":"<b class='red'>less safe than other Italian provinces for expats"))+"</b>. "+
        "As of 2021, there are an average of <b>"+province.ReportedCrimes+" reported crimes per 100k inhabitants</b>. This is "+(province.ReportedCrimes>2835.76?"<b class='red'>"+(((province.ReportedCrimes/2835.76)*100)-100).toFixed(2)+"% higher than the national average</b>":"<b class='green'>"+((100-(province.ReportedCrimes/2835.76)*100).toFixed(2))+"% lower than the national average</b>")+"."+
        "<br><br>"+
        "There have been around <b>"+province.RoadFatalities+" deadly road accidents</b> and <b>"+province.WorkAccidents+" serious work-related injuries</b> per 10k people in "+province.Name+". This is respectively "+
        (province.RoadFatalities>0.54?"<b class='red'>"+(((province.RoadFatalities/0.54)*100-100).toFixed(2))+"% more driving accidents than average":"<b class='green'>"+(((100-(province.RoadFatalities/0.54)*100).toFixed(2))+"% less driving accidents than average"))+"</b> and "+
        (province.RoadFatalities>12.90?"<b class='red'>"+(((province.WorkAccidents/12.90)*100-100).toFixed(2))+"% more work accidents than average":"<b class='green'>"+(((100-(province.WorkAccidents/12.90)*100).toFixed(2))+"% less work accidents than average"))+"</b>."+
        "<br><br>"
        info.crimeandsafety+=(province.CarTheft>70.53?"Car theft is reportedly <b class='red'>"+(((province.CarTheft/70.53)*100)-100).toFixed(2)+"% higher than average</b> with "+province.CarTheft+" cases per 100k inhabitants.":"Car theft is reportedly <b class='green'>"+((100-(province.CarTheft/70.53)*100)).toFixed(2)+"% lower than average</b> with only "+province.CarTheft+" cases per 100k inhabitants.")+" "+
      (province.HouseTheft>175.02?"Reports of house thefts are <b class='red'>"+(((province.HouseTheft/175.02)*100)-100).toFixed(2)+"% higher than average</b> with "+province.HouseTheft+" cases per 100k inhabitants.":"Reports of house thefts are <b class='green'>"+((100-(province.HouseTheft/175.02)*100)).toFixed(2)+"% lower</b> than average with "+province.HouseTheft+" cases per 100k inhabitants.")+" "+
      (province.Robberies>22.14?"Cases of robbery are not totally uncommon, around <b class='red'>"+(((province.Robberies/22.14)*100)-100).toFixed(2)+"% higher than average</b> with "+province.Robberies+" reports per 100k inhabitants":"Cases of robbery are uncommon with "+province.HouseTheft+" reported cases per 100k inhabitants, about <b class='green'>"+((100-(province.Robberies/22.14)*100)).toFixed(2)+"% less the national average</b>")+". "
      
      info.crimeandsafety+="<br><br>"+"Overall, "+en(province.Name)+" is "+(province.Safety>7.33?"<b class='green'>a very safe place to visit and live in":(province.Safety>6?"<b class='green'>quite safe to live and travel to":"<b class='red'>somewhat unsafe compared to other cities in Italy"))+"</b>. "

        info.education=en(province.Name)+" has a "+(province.HighSchoolGraduates>avg.HighSchoolGraduates?"<b class='green'>higher-than-average percentage of high school graduates":"<b class='red'>lower-than-average percentage of high school graduates")+"</b>, around "+province.HighSchoolGraduates+"%; and a "+(province.UniversityGraduates>avg.UniversityGraduates?"<b class='green'>higher-than-average percentage of university graduates":"<b class='red'>lower-than-average percentage of university graduates")+"</b>, around "+province.UniversityGraduates+"%."+
        " The average number of completed <b>years of schooling</b> for people over 25 is "+province.YearsOfEducation+", which is "+(province.YearsOfEducation>avg.YearsOfEducation*1.05?"<b class='green'>above the national average</b>":(province.YearsOfEducation<avg.YearsOfEducation*.95?"<b class='red'>lower than the national average</b>":"not far from the national average"))+" of "+avg.YearsOfEducation+". "+
        (province.Universities>1?" There are <b>"+province.Universities+" universities</b> within the province":(province.Universities==1?" There is <b>one university</b> in the province":" There are <b>no universities</b> in this province"))+"."
      
        info.transport="<b>Public transport in "+en(name)+"</b> is "+(province.PublicTransport<avg.PublicTransport*.9?"<b class='red'>lacking":(province.PublicTransport>avg.PublicTransport*1.1?"<b class='green'>quite good":"<b class='green'>fairly decent"))+"</b>, and "+
        (province.Traffic<avg.Traffic*.85?"<b class='green'>traffic is low":(province.Traffic<avg.Traffic?"<b class='green'>traffic is below average":(province.Traffic>avg.Traffic*1.1?"<b class='red'>traffic is very high":"<b class='red'>traffic is somewhat high")))+"</b>. "+
        "There are on average "+province.VehiclesPerPerson+" active vehicles per person, against a national average of "+avg.VehiclesPerPerson+". "+(province.Subway>0?"The city of "+name+" is one of the very few places in Italy with an urban metro system, the <b>Metropolitana di "+name+"</b>. ":"")+
        "<br><br>"+
        "Around "+(province.CyclingLanes/10).toFixed(2)+"km per 10k inhabitants of the main city in "+name+" consist of bicycle lanes. This makes "+name+" "+(province.CyclingLanes>avg.CyclingLanes*.8?"<b class='green'>somewhat bike-friendly by Italian standards":(province.CyclingLanes>avg.CyclingLanes*1.2?"<b class='green'>very bike-friendly by Italian standards":"<b class='red'>not very bike-friendly"))+"</b>. ";
        
        (facts[name]["transportData"]!=""?(info.transport+='</br></br>'+facts[name]["transportData"])
        :"")

        info.disclaimer='</br></br><center><span id="disclaimer">This page contains affiliate links. As part of the Amazon Associates and Viator Partner programmes, we may earn a commission on qualified purchases.</span></center>'
        
        info.map='</br><center class="map"><iframe id="ggmap" src="https://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q=Province%20Of%20'+name+'&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>'+
        'Search for: '+
        
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q=Provincia+di+'+name+'+Attractions&output=embed")\' target="_blank"><b><ej>🎭</ej>Attractions</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q=Provincia+di+'+name+'+Museums&output=embed")\' target="_blank"><b><ej>🏺</ej>Museums</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q=Provincia+di+'+name+'+Restaurants&output=embed")\' target="_blank"><b><ej>🍕</ej>Restaurants</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q=Provincia+di+'+name+'+Bars&output=embed")\' target="_blank"><b><ej>🍺</ej>Bars</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q=Provincia+di+'+name+'+Beaches&output=embed")\' target="_blank"><b><ej>🏖️</ej>Beaches</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q=Provincia+di+'+name+'+Hikinge&output=embed")\' target="_blank"><b><ej>⛰️</ej>Hikes</b></a> '+
        '<a href="https://www.amazon.it/ulp/view?&linkCode=ll2&tag=expiter-21&linkId=5824e12643c8300394b6ebdd10b7ba3c&language=it_IT&ref_=as_li_ss_tl" target="_blank"><b><ej>📦</ej>Amazon Pickup Locations</b></a> '+
        '</center>'
      
        info.weather=(province.WeatherWidget?'<center><h3>Weather Now</h3><a class="weatherwidget-io" href="https://forecast7.com/en/'+province.WeatherWidget+'" data-label_1="'+name+'" data-label_2="'+region.Name+'"'+
        'data-font="Roboto" data-icons="Climacons Animated" data-mode="Forecast" data-theme="clear"  data-basecolor="rgba(155, 205, 245, 0.59)" data-textcolor="#000441" >name Region.Name</a>'+
        '<script>'+
        "!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');"+
        '</script>':"")
      
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

        info.related='<h2>Provinces Nearby</h2> '+
        '<row class="columns is-multiline is-mobile"> '+        
        facts[related1].snippet+
        facts[related2].snippet+
        facts[related3].snippet+
        facts[related4].snippet+'</row>'
       
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
      '<img title="'+en(province.Name)+'" load="lazy" src="'+
      'https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-280,h-140,c-at_least,q-5" '+
      'alt="Province of '+en(data[i].Name)+', '+en(data[i].Region)+'"></img>'+
      '<figcaption>'+en(province.Name)+", "+en(province.Region)+"</figcaption></a></figure>";
    }
    avg=data[107];
    
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
      default: return word;
    }
  }

  function populateFacts(){
  
facts.Roma.overview="The <b>city of Rome</b>, with 2.761.632 residents, is the most popolous city and <b>capital of Italy</b>. Rome is not only known for its historical significance but also as a vibrant and cosmopolitan city. It offers a unique blend of ancient ruins, such as the Colosseum and Roman Forum, alongside Renaissance and Baroque architecture, magnificent churches, and picturesque piazzas. Rome is also home to the Vatican City, an independent city-state and the spiritual center of the Roman Catholic Church, where visitors can explore St. Peter's Basilica and the Vatican Museums, including the Sistine Chapel with its famous ceiling painted by Michelangelo."

facts.Milano.overview="The <b>city of Milan</b>, with 1,371,498 residents, is the second-most popolous city and <b>industrial, commercial and financial capital of Italy</b>. Milan is a global center for fashion, design, and business. It is home to prestigious fashion houses, luxury brands, and renowned design studios. The city hosts major international fashion events, including Milan Fashion Week. Milan's financial district houses Italy's stock exchange and important financial institutions. The city is also rich in artistic and cultural heritage, with iconic landmarks such as the Milan Cathedral (Duomo di Milano), the Galleria Vittorio Emanuele II, and the Sforza Castle. Additionally, Milan is known for its thriving nightlife, diverse culinary scene, and vibrant street markets."
    
facts.Firenze.overview="The <b>city of Florence</b> is a historic city in Italy and the capital of the Tuscany region. Florence is renowned for its art and architecture, with iconic landmarks such as the Florence Cathedral (Duomo), Ponte Vecchio, and the Uffizi Gallery. It is considered the birthplace of the Renaissance, with a rich cultural heritage and numerous museums and art galleries."

facts.Palermo.overview="The <b>city of Palermo</b> is the capital of Sicily, an island region of Italy. It is a vibrant and lively city with a fascinating history that spans several centuries. Palermo is known for its bustling street markets, vibrant neighborhoods, and architectural landmarks such as the Palermo Cathedral and the Norman Palace. The city offers a mix of different cultures and influences, reflected in its diverse cuisine and vibrant street life."

facts.Catania.overview="The <b>city of Catania</b> is located on the eastern coast of Sicily, Italy. It is the second-largest city in Sicily and serves as a major transportation hub. Catania is known for its Baroque architecture, including the famous Elephant Fountain and the Catania Cathedral. The city is also situated at the foot of Mount Etna, an active volcano, offering stunning natural scenery and opportunities for outdoor activities."

facts.Pisa.overview="The <b>city of Pisa</b> is located in the Tuscany region of Italy. It is famous for its iconic leaning tower, part of the Piazza dei Miracoli (Square of Miracles), which also includes the Pisa Cathedral and the Baptistry. Pisa is a historic city with a rich cultural heritage, known for its prestigious university, the University of Pisa, which was established in the 12th century."

facts.Livorno.overview="The <b>city of Livorno</b> is a major port city located on the western coast of Tuscany, Italy. It is known for its beautiful waterfront, historic fortresses, and Renaissance-era canals. Livorno has a rich maritime history and offers a variety of attractions, including museums, art galleries, and picturesque squares. The city is also a gateway to the picturesque Tuscan countryside and the nearby islands of Elba and Capraia."

facts.Genova.overview="The <b>city of Genoa</b> (Genova) is located on the northwest coast of Italy, in the region of Liguria. It is a historic port city and birthplace of Christopher Columbus. Genoa is known for its charming old town, with narrow streets (known as caruggi), historic palaces, and medieval architecture. The city has a rich maritime heritage and is home to the largest aquarium in Italy, the Genoa Aquarium."
  
facts.Napoli.overview="The <b>city of Naples</b>, with a population of approximately 962,003 residents, is a vibrant and bustling city located in southern Italy. Naples is known for its rich history, stunning architecture, and mouthwatering cuisine. The city is home to numerous historical sites, including the ancient city of Pompeii, which was preserved by the eruption of Mount Vesuvius in 79 AD. Naples is also famous for its pizza, with Neapolitan-style pizza being recognized as a UNESCO intangible cultural heritage. Visitors to Naples can explore the narrow streets of the historic center, visit the Royal Palace of Naples, and enjoy breathtaking views from the hillside neighborhood of Posillipo."

facts.Torino.overview="The <b>city of Turin</b>, with a population of approximately 878,074 residents, is located in the Piedmont region of northern Italy. Turin is known for its rich cultural heritage, elegant architecture, and as the birthplace of Italian cinema. The city is home to several royal residences, including the Palazzo Reale and the Palazzo Madama. Turin is also renowned for its culinary delights, with famous dishes such as agnolotti pasta and gianduja chocolate originating from the region. Additionally, the city is home to the iconic Mole Antonelliana, which houses the National Cinema Museum and offers panoramic views of the city."

facts.Venezia.overview="The <b>city of Venice</b>, with a population of approximately 261,905 residents, is located in northeastern Italy and is renowned for its unique and picturesque canal network. Venice is composed of 118 islands connected by a network of canals and bridges, with the Grand Canal serving as its main waterway. The city is famous for its stunning architecture, including landmarks like St. Mark's Square, the Doge's Palace, and the Rialto Bridge. Visitors can explore the narrow streets, take gondola rides, and admire the beautiful Venetian Gothic and Renaissance-style buildings."

facts.Ragusa.overview="The <b>city of Ragusa</b>, with a population of approximately 73,635 residents, is located in southeastern Sicily, Italy. Ragusa is renowned for its captivating Baroque architecture, which has earned it a coveted UNESCO World Heritage status. Divided into two parts, Ragusa Ibla and Ragusa Superiore, the city offers a fascinating contrast of historic charm and modernity. Visitors can wander through the enchanting streets of Ragusa Ibla, marvel at the ornate facades of its churches and palaces, and soak in the breathtaking views from the panoramic viewpoints. Ragusa is a true gem of Sicily, inviting travelers to discover its cultural heritage and picturesque beauty."

facts.Perugia.overview="The <b>city of Perugia</b>, with a population of approximately 168,066 residents, is the capital of the Umbria region in central Italy. Perugia is a city rich in history, art, and culture. It is known for its well-preserved medieval architecture, Renaissance art, and prestigious universities. The city's historic center features charming cobblestone streets, ancient Etruscan walls, and iconic landmarks such as the stunning Palazzo dei Priori and the magnificent Cathedral of San Lorenzo. Perugia also hosts the renowned Umbria Jazz Festival, attracting music enthusiasts from around the world. Visitors can indulge in the city's culinary delights, including the famous Perugina chocolates."

facts["Reggio Calabria"].overview="The <b>city of Reggio Calabria</b>, with a population of approximately 181,082 residents, is located in the southern region of Calabria. Reggio Calabria is situated on the coast of the Ionian Sea and offers stunning views of the Strait of Messina, which separates Italy from Sicily. The city is known for its beautiful seaside promenade, the Lungomare Falcomatà, and its impressive collection of ancient Greek artifacts at the National Archaeological Museum of Magna Grecia. Visitors can explore the historic center, visit the Cathedral of Reggio Calabria, and enjoy the local cuisine, which includes traditional Calabrian dishes such as 'nduja and swordfish."

facts["Reggio Emilia"].overview="The <b>city of Reggio Emilia</b>, with a population of approximately 172,419 residents, is located in the Emilia-Romagna region of northern Italy. Reggio Emilia is known for its rich history, beautiful architecture, and cultural heritage. The city is renowned for its educational philosophy, the Reggio Emilia approach, which emphasizes creativity and child-centered learning. Visitors can explore the historic center of Reggio Emilia, visit the Teatro Municipale Valli, and indulge in the region's famous culinary specialties, including Parmigiano Reggiano cheese and balsamic vinegar."

facts.Trieste.overview="The <b>city of Trieste</b>, with a population of approximately 205,535 residents, is located in the northeastern part of Italy, near the border with Slovenia. Trieste is a unique city that combines Italian, Slavic, and Austrian influences due to its historical past. The city is situated on the Adriatic Sea and offers a picturesque waterfront, charming cafés, and a relaxed Mediterranean atmosphere. Trieste is known for its elegant architecture, including the Miramare Castle overlooking the sea and the beautiful Piazza Unità d'Italia, which is one of the largest seafront squares in Europe."

facts.Trento.overview="The <b>city of Trento</b>, with a population of approximately 117,417 residents, is located in the Trentino-Alto Adige/Südtirol region of northern Italy. Surrounded by the stunning Dolomite Mountains, Trento offers a perfect blend of natural beauty and historical charm. The city is known for its well-preserved medieval architecture, including the Buonconsiglio Castle and the Duomo di Trento. Trento is also a hub for outdoor enthusiasts, with opportunities for hiking, skiing, and mountain biking in the nearby mountains."

facts.Foggia.overview="The <b>city of Foggia</b>, with a population of approximately 151,246 residents, is located in the Apulia region of southern Italy. Foggia is a vibrant city known for its agricultural heritage and picturesque landscapes. Surrounded by vast plains, olive groves, and vineyards, Foggia offers a serene and idyllic setting. The city boasts historical treasures such as the Romanesque-style Foggia Cathedral and the impressive Arco di Federico II. Foggia is also a gateway to the beautiful Gargano National Park, renowned for its stunning coastline, charming villages, and lush forests. Visitors can savor the authentic flavors of Apulian cuisine, including delicious pasta dishes and fresh seafood specialties."

facts.Verona.overview="The <b>city of Verona</b>, with a population of approximately 257,275 residents, is located in the Veneto region of northern Italy. Verona is known for its well-preserved ancient Roman architecture, including the Arena di Verona, a spectacular Roman amphitheater that hosts world-renowned opera performances. The city is also famous for being the setting of Shakespeare's Romeo and Juliet, with Juliet's House being a popular tourist attraction. Verona's historic center, a UNESCO World Heritage site, offers charming streets, elegant palaces, and a vibrant atmosphere."

facts.Vicenza.overview="The <b>city of Vicenza</b>, with a population of approximately 115,927 residents, is situated in the Veneto region of northern Italy. Vicenza is renowned for its architectural masterpieces designed by the famous Renaissance architect Andrea Palladio. The city's historic center showcases Palladian villas, palaces, and churches, including the iconic Basilica Palladiana and the Villa Capra, also known as 'La Rotonda.' Vicenza's architecture and urban design have had a significant influence on Western architecture. Visitors can explore the city's rich cultural heritage and enjoy the beauty of Palladian architecture."

facts.Cosenza.overview="The <b>city of Cosenza</b>, with a population of approximately 69,393 residents, is located in the Calabria region of southern Italy. Cosenza is known for its historical and artistic heritage, featuring a mix of medieval, Renaissance, and Baroque architecture. The city is dominated by its ancient hilltop Norman-Swabian Castle, which offers panoramic views of the surrounding area. Cosenza's historic center is a labyrinth of narrow streets and picturesque squares, such as Piazza XV Marzo and Piazza Duomo. The city also serves as a gateway to the scenic Sila National Park."

facts.Catanzaro.overview="The <b>city of Catanzaro</b>, with a population of approximately 91,492 residents, is the capital of the Calabria region in southern Italy. Perched on a hilltop overlooking the Gulf of Squillace, Catanzaro offers stunning panoramic views of the surrounding landscapes. The city is known for its historic center, with medieval and Baroque architecture, including the Cathedral of Santa Maria Assunta and the Norman Castle. Catanzaro is also a cultural hub, hosting events such as the Catanzaro Jazz Festival and the International Folklore Festival."

facts.Crotone.overview="The <b>city of Crotone</b>, with a population of approximately 62,949 residents, is located on the Ionian Sea in the Calabria region of southern Italy. With a rich history dating back to ancient times as a Greek colony, Crotone offers a unique blend of archaeological wonders and natural beauty. Visitors can explore the Capo Colonna Archaeological Park, home to the remains of a Doric temple dedicated to Hera Lacinia. The city also boasts beautiful beaches, including Le Castella and Capo Rizzuto, where visitors can relax and enjoy the crystal-clear waters of the Ionian Sea."

facts["La Spezia"].overview="The <b>city of La Spezia</b>, with a population of approximately 94,641 residents, is situated on the Ligurian Sea in northern Italy. It serves as a major port city and gateway to the breathtaking Cinque Terre region. La Spezia offers a picturesque waterfront promenade, lined with colorful buildings and charming cafes. Visitors can explore the historic old town, visit the Naval Museum, and take boat trips to the scenic villages of Cinque Terre, known for their vibrant pastel houses and stunning coastal views."

facts.Asti.overview="The <b>city of Asti</b>, with a population of approximately 76,163 residents, is located in the Piedmont region of northern Italy. Asti is renowned for its sparkling wine, known as Asti Spumante, and its annual wine festival, the Palio di Asti. The city boasts well-preserved medieval towers, such as the Torre Troyana, and a charming historic center with narrow streets and lively piazzas. Asti is also home to beautiful churches and palaces, including the Collegiata di San Secondo and the Palazzo Mazzetti, which houses an art museum."

facts.Ravenna.overview="The <b>city of Ravenna</b>, with a population of approximately 79,938 residents, is located in the Emilia-Romagna region of northeastern Italy. Ravenna is known for its extraordinary Byzantine mosaics, which adorn several UNESCO World Heritage sites. The city was once the capital of the Western Roman Empire and later the Ostrogothic Kingdom. Visitors can explore the stunning mosaics in the Basilica of San Vitale and the Mausoleum of Galla Placidia, among others. Ravenna also offers a rich cultural heritage, with historic buildings, charming streets, and a vibrant arts scene."

facts.Rimini.overview="The <b>city of Rimini</b>, with a population of approximately 150,590 residents, is located on the Adriatic Sea in the Emilia-Romagna region of northern Italy. Rimini is renowned for its long sandy beaches, vibrant nightlife, and lively atmosphere. The city boasts a rich history, dating back to Roman times, with iconic landmarks such as the Arch of Augustus and the Tiberius Bridge. Rimini offers a wide range of entertainment options, including water sports, theme parks, and cultural events. It is a popular destination for beach lovers and partygoers alike."

facts.Agrigento.overview="The <b>city of Agrigento</b>, with a population of approximately 59,489 residents, is situated on the southern coast of Sicily, Italy. Agrigento is renowned for its exceptional archaeological site, the Valley of the Temples, which is a UNESCO World Heritage site. Visitors can marvel at the remarkably preserved ancient Greek temples, including the Temple of Concordia and the Temple of Juno. The city also offers picturesque views of the Mediterranean Sea and beautiful sandy beaches. Agrigento's historic center features charming streets, medieval architecture, and delightful local cuisine, making it a captivating destination for history enthusiasts and beach lovers alike."

facts.Messina.overview="The <b>city of Messina</b>, with a population of approximately 234,570 residents, is located in northeastern Sicily, Italy. Positioned on the Strait of Messina, it serves as a vital transportation hub between Sicily and mainland Italy. Messina boasts a rich cultural heritage, blending Byzantine, Norman, and Baroque influences. The city's main square, Piazza del Duomo, is home to the magnificent Messina Cathedral with its renowned astronomical clock. Visitors can explore the picturesque streets, visit historical landmarks such as the Fountain of Orion and the Church of Santa Maria Alemanna, and enjoy panoramic views of the strait and the surrounding mountains."

facts.Bologna.overview="The <b>city of Bologna</b>, with a population of approximately 389,261 residents, is the capital of the Emilia-Romagna region in northern Italy. Bologna is renowned for its rich history, vibrant culture, and culinary traditions. The city is home to one of the oldest universities in the world, the University of Bologna, which contributes to its youthful and dynamic atmosphere. Bologna is famous for its beautiful medieval architecture, including the iconic Two Towers, the historic Piazza Maggiore, and the intricate Basilica di San Petronio. Visitors can indulge in the city's gastronomic delights, such as authentic Bolognese cuisine and the renowned local specialty, tortellini."

facts.Matera.overview="The <b>city of Matera</b>, with a population of approximately 60,156 residents, is located in the Basilicata region of southern Italy. Matera is known for its remarkable Sassi di Matera, a complex of cave dwellings that is a UNESCO World Heritage site. The city's ancient cave dwellings, known as sassi, are a testament to its unique history and architectural significance. Matera's Sassi district offers a mesmerizing labyrinth of narrow streets, stone houses, and ancient churches carved into the rock. The city has gained international recognition for its cultural heritage and has been a popular filming location for movies. Matera invites visitors to step back in time and experience its fascinating cave-dwelling culture."
   }
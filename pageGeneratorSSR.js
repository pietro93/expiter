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
            let seoTitle=en(province.Name)+" - Quality of Life and Info Sheet for Expats";
            let seoDescription='Information about living in '+en(province.Name)+', Italy for expats and digital nomads. '+en(province.Name)+' quality of life, cost of living, safety and more.'
            let heroImage='https://expiter.com/img/'+province.Abbreviation+'.webp'
            let sidebar=pb.setSideBar(province)

            const dom = new jsdom.JSDOM(
            "<!DOCTYPE html><html lang='en'>"+
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
            '<aside class="menu sb mobileonly">'+sidebar+'</aside>\n'+
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
        'src="https://ik.imagekit.io/cfkgj4ulo/map/'+province["Region"].replace(/\s+/g,"-").replace("'","-")+'-provinces.webp?tr=w-340,'+
        'load="lazy"></img>'+
        '<figcaption>Map of the provinces of '+en(province.Region)+' including '+en(province.Name)+'</figcaption>'+
        '</figure>'
        
        appendProvinceData(province, $);
        pb.setNavBar($);
        
        $(".title").text(en(province.Name)+' for Expats and Nomads');
        $("#overview").append(map)
        $("#overview").append(pb.addBreaks(info.overview))
        $("#overview").append(info.disclaimer)
        $("#overview").append(info.map)
        $("#CoL").append(pb.addBreaks(info.CoL))
        $("#climate").append(pb.addBreaks(info.climate))
        $("#climate").append(separator)
        $("#climate").append(pb.addBreaks(info.weather))
        $("#lgbtq").append(pb.addBreaks(info.lgbtq))
        $("#leisure").append(pb.addBreaks(info.leisure))
        $("#leisure").append(separator)
        $("#healthcare").append(pb.addBreaks(info.healthcare))
        $("#healthcare").append(separator)
        $("#crimeandsafety").append(pb.addBreaks(info.crimeandsafety))
        $("#crimeandsafety").append(separator)
        $("#education").append(pb.addBreaks(info.education))
        $("#education").append(separator)
        $("#transport").append(pb.addBreaks(info.transport))
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
        populateNightlifeFacts()
        populateSafetyFacts()
        let ratio = (province.Men/(Math.min(province.Men,province.Women))).toFixed(2)+":"+(province.Women/(Math.min(province.Men,province.Women))).toFixed(2);
        let name=province.Name;
        let region=regions[province.Region];
        
        let info = {}
  
        info.overview="The province of "+en(province.Name)+" is the <b>"+province.SizeByPopulation+(province.SizeByPopulation%10==1?"st":(province.SizeByPopulation%10==2?"nd":province.SizeByPopulation%10==3?"rd":"th"))+" largest Italian province by population</b> with <b>"+province.Population.toLocaleString()+" people</b>, located in the <b>"+en(province.Region)+"</b> region.<br><br>"+
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
        "The estimated cost of living is around "+province["Cost of Living (Individual)"]+"€ per month for an individual or "+province["Cost of Living (Family)"]+"€ per month for a family of 4. <br><br> The cost for renting "+
        "a small apartment (2-3 bedrooms) in a main city area is around "+province["MonthlyRental"]+"€ per month."+"</br></br>"+
        "Overall, "+(province["Cost of Living (Individual)"]>avg["Cost of Living (Individual)"]?"<b class='red'>"+province.Name+" is expensive":(province["Cost of Living (Individual)"]<1150?"<b class='green'>"+en(province.Name)+" is cheap":"<b class='green'>"+en(province.Name)+" is affordable"))+"</b> compared to other Italian provinces."
        +" Living in "+en(province.Name)+" is around "+(province['Cost of Living (Individual)']>avg["Cost of Living (Individual)"]?"<b class='red'>"+(province['Cost of Living (Individual)']/avg["Cost of Living (Individual)"]*100-100).toFixed(2)+"% more expensive than the average</b> of all Italian provinces":"<b class='green'>"+(100-province['Cost of Living (Individual)']/avg["Cost of Living (Individual)"]*100).toFixed(2)+"% cheaper than the average</b> of all Italian provinces")
        +".";
      
        info.climate="The province of "+en(province.Name)+" receives on average <b>"+province.SunshineHours+" hours of sunshine</b> per month, or "+province.SunshineHours/30+" hours of sunshine per day."+
        +"<br><br>"+
        " This is "+(province.SunshineHours>236?"<b class='green'>"+(province.SunshineHours/236*100-100).toFixed(2)+"% more</b> than the average for Italy":"<b class='red'>"+(100-(province.SunshineHours/236)*100).toFixed(2)+"% less</b> than the average for Italy")+" and "+
        (province.SunshineHours>region.SunshineHours?"<b class='green'>"+(province.SunshineHours/region.SunshineHours*100-100).toFixed(2)+"% more</b> than the average for the region of ":"<b class='red'>"+(100-(province.SunshineHours/region.SunshineHours)*100).toFixed(2)+"% less</b> than the average for the region of ")+en(province.Region)+"."+
        "</br></br>"
        info.climate+=" Throughout the year, <b>it rains on average "+province.RainyDays+" days per month</b>, which is "+
        (province.RainyDays>8?"<b class='red'>well above average":(province.RainyDays<7?"<b class='green'>below average</b>":"<b>an ordinary amount of precipitation"))+"</b> for an Italian province."+
        "</br></br>"+
        "During the autumn and winter season, there are usually "+(province.FoggyDays>5?"<b class='red'>":"<b class='green'>")+province.FoggyDays+" days per month with fog</b> and <b>"+province.ColdDays+" cold days per month</b> with perceived temperatures below 3°C. "+
        " In the summer, there are on average <b>"+province.HotDays+" hot days per month</b> with perceived temperatures above 30°C."
        
        info.lgbtq="<b>"+en(province.Name)+" is "+(province['LGBT-friendly']>7.9?"one of the most LGBTQ-friendly provinces in Italy":(province['LGBT-friendly']>6?"somewhat LGBTQ+ friendly by Italian standards":"not particularly LGBTQ-friendly as far as Italian provinces go"))+
        ".</b> "+(province.LGBTQAssociations>1?"There are "+province.LGBTQAssociations+" local LGBTQ+ associations (Arcigay) in this province.":(province.LGBTQAssociations==1?"There is 1 LGBTQ+ association (Arcigay) in this province.":""))
      
        info.leisure=(facts[name].nightlife?facts[name].nightlife:"")+
        "</br></br> Overall, "+en(province.Name)+" has <b>"+(province.Nightlife>7.5?"pretty good nightlife":"somewhat decent nightlife")+"</b> with "+
        province.Bars+" bars and "+province.Restaurants+" restaurants per 10k inhabitants. "
       
        info.healthcare="<b>Healthcare in "+en(province.Name)+" is "+(province.Healthcare>6.74?"<b class='green'>above average":"<b class='red'>below average")+"</b></b>. "+
        "For every 10k inhabitants, there are around "+province.pharmacies+" pharmacies, "+province.GeneralPractitioners+" general practitioners and "+province.SpecializedDoctors+" specialized doctors per 10k inhabitants. "+
        +"<br><br>"+
        "<b>Average life expectancy in "+en(province.Name)+" is "+(province.LifeExpectancy>82.05?" very high at ":"")+province.LifeExpectancy+" years of age.</b>"
        
        info.crimeandsafety="The province of "+en(province.Name)+" is overall "+(province.Safety>7.33?"<b class='green'>very safe for expats":(province.Safety>6?"<b class='green'>moderately safe for expats":"<b class='red'>less safe than other Italian provinces for expats"))+"</b>. "+
        "As of 2021, there are an average of <b>"+province.ReportedCrimes+" reported crimes per 100k inhabitants</b>. This is "+(province.ReportedCrimes>2835.76?"<b class='red'>"+(((province.ReportedCrimes/2835.76)*100)-100).toFixed(2)+"% higher than the national average</b>":"<b class='green'>"+((100-(province.ReportedCrimes/2835.76)*100).toFixed(2))+"% lower than the national average</b>")+"."+
        "<br><br>"+
        "There have been around <b>"+province.RoadFatalities+" deadly road accidents</b> and <b>"+province.WorkAccidents+" serious work-related injuries</b> per 10k people in "+province.Name+". This is respectively "+
        (province.RoadFatalities>0.54?"<b class='red'>"+(((province.RoadFatalities/0.54)*100-100).toFixed(2))+"% more driving accidents than average":"<b class='green'>"+(((100-(province.RoadFatalities/0.54)*100).toFixed(2))+"% less driving accidents than average"))+"</b> and "+
        (province.RoadFatalities>12.90?"<b class='red'>"+(((province.WorkAccidents/12.90)*100-100).toFixed(2))+"% more work accidents than average":"<b class='green'>"+(((100-(province.WorkAccidents/12.90)*100).toFixed(2))+"% less work accidents than average"))+"</b>."+
        "<br><br>"
        info.crimeandsafety+=(province.CarTheft>70.53?"Car theft is reportedly <b class='red'>"+(((province.CarTheft/70.53)*100)-100).toFixed(2)+"% higher than average</b> with "+province.CarTheft+" cases per 100k inhabitants.":"Car theft is reportedly <b class='green'>"+((100-(province.CarTheft/70.53)*100)).toFixed(2)+"% lower than average</b> with only "+province.CarTheft+" cases per 100k inhabitants.")+" "+
        +"<br><br>"+
        (province.HouseTheft>175.02?"Reports of house thefts are <b class='red'>"+(((province.HouseTheft/175.02)*100)-100).toFixed(2)+"% higher than average</b> with "+province.HouseTheft+" cases per 100k inhabitants.":"Reports of house thefts are <b class='green'>"+((100-(province.HouseTheft/175.02)*100)).toFixed(2)+"% lower</b> than average with "+province.HouseTheft+" cases per 100k inhabitants.")+" "+
        +"<br><br>"+
        (province.Robberies>22.14?"Cases of robbery are not totally uncommon, around <b class='red'>"+(((province.Robberies/22.14)*100)-100).toFixed(2)+"% higher than average</b> with "+province.Robberies+" reports per 100k inhabitants":"Cases of robbery are uncommon with "+province.HouseTheft+" reported cases per 100k inhabitants, about <b class='green'>"+((100-(province.Robberies/22.14)*100)).toFixed(2)+"% less the national average</b>")+". "
      
      info.crimeandsafety+="<br><br>"+(facts[name].safety?facts[name].safety:"Overall, "+en(province.Name)+" is "+(province.Safety>7.33?"<b class='green'>a very safe place to visit and live in":(province.Safety>6?"<b class='green'>quite safe to live and travel to":"<b class='red'>somewhat unsafe compared to other cities in Italy"))+"</b>. ");

        info.education=en(province.Name)+" has a "+(province.HighSchoolGraduates>avg.HighSchoolGraduates?"<b class='green'>higher-than-average percentage of high school graduates":"<b class='red'>lower-than-average percentage of high school graduates")+"</b>, around "+province.HighSchoolGraduates+"%; and a "+(province.UniversityGraduates>avg.UniversityGraduates?"<b class='green'>higher-than-average percentage of university graduates":"<b class='red'>lower-than-average percentage of university graduates")+"</b>, around "+province.UniversityGraduates+"%."+
        +"<br><br>"+
        " The average number of completed <b>years of schooling</b> for people over 25 is "+province.YearsOfEducation+", which is "+(province.YearsOfEducation>avg.YearsOfEducation*1.05?"<b class='green'>above the national average</b>":(province.YearsOfEducation<avg.YearsOfEducation*.95?"<b class='red'>lower than the national average</b>":"not far from the national average"))+" of "+avg.YearsOfEducation+". "+
        +"<br><br>"+
        (province.Universities>1?" There are <b>"+province.Universities+" universities</b> within the province":(province.Universities==1?" There is <b>one university</b> in the province":" There are <b>no universities</b> in this province"))+"."
      
        info.transport="<b>Public transport in "+en(name)+"</b> is "+(province.PublicTransport<avg.PublicTransport*.9?"<b class='red'>lacking":(province.PublicTransport>avg.PublicTransport*1.1?"<b class='green'>quite good":"<b class='green'>fairly decent"))+"</b>, and "+
        (province.Traffic<avg.Traffic*.85?"<b class='green'>traffic is low":(province.Traffic<avg.Traffic?"<b class='green'>traffic is below average":(province.Traffic>avg.Traffic*1.1?"<b class='red'>traffic is very high":"<b class='red'>traffic is somewhat high")))+"</b>. "+
        +"<br><br>"+
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
      case "Napoli":return"Naples";case "Genova":return"Genoa";
      default: return word;
    }
  }

  function populateFacts(){
  
facts.Roma.overview="The <b>city of Rome</b>, with 2.761.632 residents, is the most popolous city and <b>capital of Italy</b>.<br><br> Rome is not only known for its historical significance but also as a vibrant and cosmopolitan city. It offers a unique blend of ancient ruins, such as the Colosseum and Roman Forum, alongside Renaissance and Baroque architecture, magnificent churches, and picturesque piazzas.<br><br> Rome is also home to the Vatican City, an independent city-state and the spiritual center of the Roman Catholic Church, where visitors can explore St. Peter's Basilica and the Vatican Museums, including the Sistine Chapel with its famous ceiling painted by Michelangelo."

facts.Milano.overview="The <b>city of Milan</b>, with 1,371,498 residents, is the second-most popolous city and <b>industrial, commercial and financial capital of Italy</b>.<br><br> Milan is a global center for fashion, design, and business. It is home to prestigious fashion houses, luxury brands, and renowned design studios.<br><br> The city hosts major international fashion events, including Milan Fashion Week.<br><br> Milan's financial district houses Italy's stock exchange and important financial institutions. The city is also rich in artistic and cultural heritage, with iconic landmarks such as the Milan Cathedral (Duomo di Milano), the Galleria Vittorio Emanuele II, and the Sforza Castle.<br><br> Additionally, Milan is known for its thriving nightlife, diverse culinary scene, and vibrant street markets."
    
facts.Firenze.overview="The <b>city of Florence</b> is a historic city in Italy and the capital of the Tuscany region.<br><br> Florence is renowned for its art and architecture, with iconic landmarks such as the Florence Cathedral (Duomo), Ponte Vecchio, and the Uffizi Gallery.<br><br> It is considered the birthplace of the Renaissance, with a rich cultural heritage and numerous museums and art galleries."

facts.Palermo.overview="The <b>city of Palermo</b> is the capital of Sicily, an island region of Italy.<br><br> It is a vibrant and lively city with a fascinating history that spans several centuries.<br><br> Palermo is known for its bustling street markets, vibrant neighborhoods, and architectural landmarks such as the Palermo Cathedral and the Norman Palace.<br><br> The city offers a mix of different cultures and influences, reflected in its diverse cuisine and vibrant street life."

facts.Catania.overview="The <b>city of Catania</b> is located on the eastern coast of Sicily, Italy.<br><br> It is the second-largest city in Sicily and serves as a major transportation hub.<br><br> Catania is known for its Baroque architecture, including the famous Elephant Fountain and the Catania Cathedral.<br><br> The city is also situated at the foot of Mount Etna, an active volcano, offering stunning natural scenery and opportunities for outdoor activities."

facts.Pisa.overview="The <b>city of Pisa</b> is located in the Tuscany region of Italy. It is famous for its iconic leaning tower, part of the Piazza dei Miracoli (Square of Miracles), which also includes the Pisa Cathedral and the Baptistry. Pisa is a historic city with a rich cultural heritage, known for its prestigious university, the University of Pisa, which was established in the 12th century."

facts.Livorno.overview="The <b>city of Livorno</b> is a major port city located on the western coast of Tuscany, Italy. It is known for its beautiful waterfront, historic fortresses, and Renaissance-era canals. <br><br>Livorno has a rich maritime history and offers a variety of attractions, including museums, art galleries, and picturesque squares. <br><br>The city is also a gateway to the picturesque Tuscan countryside and the nearby islands of Elba and Capraia."

facts.Genova.overview="The <b>city of Genoa</b> (Genova) is located on the northwest coast of Italy, in the region of Liguria. It is a historic port city and birthplace of Christopher Columbus.<br><br> Genoa is known for its charming old town, with narrow streets (known as caruggi), historic palaces, and medieval architecture. <br><br>The city has a rich maritime heritage and is home to the largest aquarium in Italy, the Genoa Aquarium."
  
facts.Napoli.overview="The <b>city of Naples</b>, with a population of approximately 962,003 residents, is a vibrant and bustling city located in southern Italy.<br><br> Naples is known for its rich history, stunning architecture, and mouthwatering cuisine. The city is home to numerous historical sites, including the ancient city of Pompeii, which was preserved by the eruption of Mount Vesuvius in 79 AD.<br><br> Naples is also famous for its pizza, with Neapolitan-style pizza being recognized as a UNESCO intangible cultural heritage.<br><br> Visitors to Naples can explore the narrow streets of the historic center, visit the Royal Palace of Naples, and enjoy breathtaking views from the hillside neighborhood of Posillipo."

facts.Torino.overview="The <b>city of Turin</b>, with a population of approximately 878,074 residents, is located in the Piedmont region of northern Italy. <br><br>Turin is known for its rich cultural heritage, elegant architecture, and as the birthplace of Italian cinema. The city is home to several royal residences, including the Palazzo Reale and the Palazzo Madama. <br><br>Turin is also renowned for its culinary delights, with famous dishes such as agnolotti pasta and gianduja chocolate originating from the region. <br><br>Additionally, the city is home to the iconic Mole Antonelliana, which houses the National Cinema Museum and offers panoramic views of the city."

facts.Venezia.overview="The <b>city of Venice</b>, with a population of approximately 261,905 residents, is located in northeastern Italy and is renowned for its unique and picturesque canal network.<br><br> Venice is composed of 118 islands connected by a network of canals and bridges, with the Grand Canal serving as its main waterway. <br><br>The city is famous for its stunning architecture, including landmarks like St. Mark's Square, the Doge's Palace, and the Rialto Bridge. Visitors can explore the narrow streets, take gondola rides, and admire the beautiful Venetian Gothic and Renaissance-style buildings."

facts.Ragusa.overview="The <b>city of Ragusa</b>, with a population of approximately 73,635 residents, is located in southeastern Sicily, Italy. <br><br>Ragusa is renowned for its captivating Baroque architecture, which has earned it a coveted UNESCO World Heritage status.<br><br> Divided into two parts, Ragusa Ibla and Ragusa Superiore, the city offers a fascinating contrast of historic charm and modernity. <br><br>Visitors can wander through the enchanting streets of Ragusa Ibla, marvel at the ornate facades of its churches and palaces, and soak in the breathtaking views from the panoramic viewpoints. <br><br>Ragusa is a true gem of Sicily, inviting travelers to discover its cultural heritage and picturesque beauty."

facts.Perugia.overview="The <b>city of Perugia</b>, with a population of approximately 168,066 residents, is the capital of the Umbria region in central Italy.<br><br> Perugia is a city rich in history, art, and culture. It is known for its well-preserved medieval architecture, Renaissance art, and prestigious universities. <br><br>The city's historic center features charming cobblestone streets, ancient Etruscan walls, and iconic landmarks such as the stunning Palazzo dei Priori and the magnificent Cathedral of San Lorenzo. <br><br>Perugia also hosts the renowned Umbria Jazz Festival, attracting music enthusiasts from around the world. Visitors can indulge in the city's culinary delights, including the famous Perugina chocolates."

facts["Reggio Calabria"].overview="The <b>city of Reggio Calabria</b>, with a population of approximately 181,082 residents, is located in the southern region of Calabria. <br><br>Reggio Calabria is situated on the coast of the Ionian Sea and offers stunning views of the Strait of Messina, which separates Italy from Sicily. <br><br>The city is known for its beautiful seaside promenade, the Lungomare Falcomatà, and its impressive collection of ancient Greek artifacts at the National Archaeological Museum of Magna Grecia.<br><br> Visitors can explore the historic center, visit the Cathedral of Reggio Calabria, and enjoy the local cuisine, which includes traditional Calabrian dishes such as 'nduja and swordfish."

facts["Reggio Emilia"].overview="The <b>city of Reggio Emilia</b>, with a population of approximately 172,419 residents, is located in the Emilia-Romagna region of northern Italy. Reggio Emilia is known for its rich history, beautiful architecture, and cultural heritage.<br><br> The city is renowned for its educational philosophy, the Reggio Emilia approach, which emphasizes creativity and child-centered learning. Visitors can explore the historic center of Reggio Emilia, visit the Teatro Municipale Valli, and indulge in the region's famous culinary specialties, including Parmigiano Reggiano cheese and balsamic vinegar."

facts.Trieste.overview="The <b>city of Trieste</b>, with a population of approximately 205,535 residents, is located in the northeastern part of Italy, near the border with Slovenia. <br><br>Trieste is a unique city that combines Italian, Slavic, and Austrian influences due to its historical past.<br><br> The city is situated on the Adriatic Sea and offers a picturesque waterfront, charming cafés, and a relaxed Mediterranean atmosphere. Trieste is known for its elegant architecture, including the Miramare Castle overlooking the sea and the beautiful Piazza Unità d'Italia, which is one of the largest seafront squares in Europe."

facts.Trento.overview="The <b>city of Trento</b>, with a population of approximately 117,417 residents, is located in the Trentino-Alto Adige/Südtirol region of northern Italy.<br><br> Surrounded by the stunning Dolomite Mountains, Trento offers a perfect blend of natural beauty and historical charm.<br><br> The city is known for its well-preserved medieval architecture, including the Buonconsiglio Castle and the Duomo di Trento. Trento is also a hub for outdoor enthusiasts, with opportunities for hiking, skiing, and mountain biking in the nearby mountains."

facts.Foggia.overview="The <b>city of Foggia</b>, with a population of approximately 151,246 residents, is located in the Apulia region of southern Italy.<br><br> Foggia is a vibrant city known for its agricultural heritage and picturesque landscapes. Surrounded by vast plains, olive groves, and vineyards, Foggia offers a serene and idyllic setting.<br><br> The city boasts historical treasures such as the Romanesque-style Foggia Cathedral and the impressive Arco di Federico II. Foggia is also a gateway to the beautiful Gargano National Park, renowned for its stunning coastline, charming villages, and lush forests. Visitors can savor the authentic flavors of Apulian cuisine, including delicious pasta dishes and fresh seafood specialties."

facts.Verona.overview="The <b>city of Verona</b>, with a population of approximately 257,275 residents, is located in the Veneto region of northern Italy. <br><br>Verona is known for its well-preserved ancient Roman architecture, including the Arena di Verona, a spectacular Roman amphitheater that hosts world-renowned opera performances.<br><br> The city is also famous for being the setting of Shakespeare's Romeo and Juliet, with Juliet's House being a popular tourist attraction. Verona's historic center, a UNESCO World Heritage site, offers charming streets, elegant palaces, and a vibrant atmosphere."

facts.Vicenza.overview="The <b>city of Vicenza</b>, with a population of approximately 115,927 residents, is situated in the Veneto region of northern Italy.<br><br> Vicenza is renowned for its architectural masterpieces designed by the famous Renaissance architect Andrea Palladio.<br><br> The city's historic center showcases Palladian villas, palaces, and churches, including the iconic Basilica Palladiana and the Villa Capra, also known as 'La Rotonda.' Vicenza's architecture and urban design have had a significant influence on Western architecture.<br><br> Visitors can explore the city's rich cultural heritage and enjoy the beauty of Palladian architecture."

facts.Cosenza.overview="The <b>city of Cosenza</b>, with a population of approximately 69,393 residents, is located in the Calabria region of southern Italy.<br><br> Cosenza is known for its historical and artistic heritage, featuring a mix of medieval, Renaissance, and Baroque architecture.<br><br> The city is dominated by its ancient hilltop Norman-Swabian Castle, which offers panoramic views of the surrounding area. Cosenza's historic center is a labyrinth of narrow streets and picturesque squares, such as Piazza XV Marzo and Piazza Duomo.<br><br> The city also serves as a gateway to the scenic Sila National Park."

facts.Catanzaro.overview="The <b>city of Catanzaro</b>, with a population of approximately 91,492 residents, is the capital of the Calabria region in southern Italy.<br><br> Located on a hilltop overlooking the Gulf of Squillace, Catanzaro offers stunning panoramic views of the surrounding landscapes.<br><br> The city is known for its historic center, with medieval and Baroque architecture, including the Cathedral of Santa Maria Assunta and the Norman Castle. Catanzaro is also a cultural hub, hosting events such as the Catanzaro Jazz Festival and the International Folklore Festival."

facts.Crotone.overview="The <b>city of Crotone</b>, with a population of approximately 62,949 residents, is located on the Ionian Sea in the Calabria region of southern Italy.<br><br> With a rich history dating back to ancient times as a Greek colony, Crotone offers a unique blend of archaeological wonders and natural beauty.<br><br> Visitors can explore the Capo Colonna Archaeological Park, home to the remains of a Doric temple dedicated to Hera Lacinia. The city also boasts beautiful beaches, including Le Castella and Capo Rizzuto, where visitors can relax and enjoy the crystal-clear waters of the Ionian Sea."

facts["La Spezia"].overview="The <b>city of La Spezia</b>, with a population of approximately 94,641 residents, is situated on the Ligurian Sea in northern Italy.<br><br> It serves as a major port city and gateway to the breathtaking Cinque Terre region. La Spezia offers a picturesque waterfront promenade, lined with colorful buildings and charming cafes.<br><br> Visitors can explore the historic old town, visit the Naval Museum, and take boat trips to the scenic villages of Cinque Terre, known for their vibrant pastel houses and stunning coastal views."

facts.Asti.overview="The <b>city of Asti</b>, with a population of approximately 76,163 residents, is located in the Piedmont region of northern Italy.<br><br> Asti is renowned for its sparkling wine, known as Asti Spumante, and its annual wine festival, the Palio di Asti.<br><br> The city boasts well-preserved medieval towers, such as the Torre Troyana, and a charming historic center with narrow streets and lively piazzas. Asti is also home to beautiful churches and palaces, including the Collegiata di San Secondo and the Palazzo Mazzetti, which houses an art museum."

facts.Ravenna.overview="The <b>city of Ravenna</b>, with a population of approximately 79,938 residents, is located in the Emilia-Romagna region of northeastern Italy.<br><br> Ravenna is known for its extraordinary Byzantine mosaics, which adorn several UNESCO World Heritage sites.<br><br> The city was once the capital of the Western Roman Empire and later the Ostrogothic Kingdom.<br><br> Visitors can explore the stunning mosaics in the Basilica of San Vitale and the Mausoleum of Galla Placidia, among others.<br><br> Ravenna also offers a rich cultural heritage, with historic buildings, charming streets, and a vibrant arts scene."

facts.Rimini.overview="The <b>city of Rimini</b>, with a population of approximately 150,590 residents, is located on the Adriatic Sea in the Emilia-Romagna region of northern Italy.<br><br> Rimini is renowned for its long sandy beaches, vibrant nightlife, and lively atmosphere.<br><br> The city boasts a rich history, dating back to Roman times, with iconic landmarks such as the Arch of Augustus and the Tiberius Bridge. Rimini offers a wide range of entertainment options, including water sports, theme parks, and cultural events.<br><br> It is a popular destination for beach lovers and partygoers alike."

facts.Agrigento.overview="The <b>city of Agrigento</b>, with a population of approximately 59,489 residents, is situated on the southern coast of Sicily, Italy.<br><br> Agrigento is renowned for its exceptional archaeological site, the Valley of the Temples, which is a UNESCO World Heritage site. Visitors can marvel at the remarkably preserved ancient Greek temples, including the Temple of Concordia and the Temple of Juno.<br><br> The city also offers picturesque views of the Mediterranean Sea and beautiful sandy beaches. Agrigento's historic center features charming streets, medieval architecture, and delightful local cuisine, making it a captivating destination for history enthusiasts and beach lovers alike."

facts.Messina.overview="The <b>city of Messina</b>, with a population of approximately 234,570 residents, is located in northeastern Sicily, Italy.<br><br> Positioned on the Strait of Messina, it serves as a vital transportation hub between Sicily and mainland Italy.<br><br> Messina boasts a rich cultural heritage, blending Byzantine, Norman, and Baroque influences.<br><br> The city's main square, Piazza del Duomo, is home to the magnificent Messina Cathedral with its renowned astronomical clock. Visitors can explore the picturesque streets, visit historical landmarks such as the Fountain of Orion and the Church of Santa Maria Alemanna, and enjoy panoramic views of the strait and the surrounding mountains."

facts.Bologna.overview="The <b>city of Bologna</b>, with a population of approximately 389,261 residents, is the capital of the Emilia-Romagna region in northern Italy.<br><br> Bologna is renowned for its rich history, vibrant culture, and culinary traditions.<br><br> The city is home to one of the oldest universities in the world, the University of Bologna, which contributes to its youthful and dynamic atmosphere.<br><br> Bologna is famous for its beautiful medieval architecture, including the iconic Two Towers, the historic Piazza Maggiore, and the intricate Basilica di San Petronio.<br><br> Visitors can indulge in the city's gastronomic delights, such as authentic Bolognese cuisine and the renowned local specialty, tortellini."

facts.Matera.overview="The <b>city of Matera</b>, with a population of approximately 60,156 residents, is located in the Basilicata region of southern Italy.<br><br> Matera is known for its remarkable Sassi di Matera, a complex of cave dwellings that is a UNESCO World Heritage site. The city's ancient cave dwellings, known as sassi, are a testament to its unique history and architectural significance.<br><br> Matera's Sassi district offers a mesmerizing labyrinth of narrow streets, stone houses, and ancient churches carved into the rock.<br><br> The city has gained international recognition for its cultural heritage and has been a popular filming location for movies. Matera invites visitors to step back in time and experience its fascinating cave-dwelling culture."
   }


function populateNightlifeFacts(){
  facts.Matera.nightlife="<b>Matera offers a charming and intimate nightlife scene.</b> While not as bustling as larger cities, it has its own unique appeal.<br><br> Travelers can enjoy cozy cave bars and quaint taverns, where they can unwind with a glass of local wine or a refreshing cocktail. The ambiance is relaxed, allowing visitors to soak in the historic surroundings and enjoy a leisurely evening in this captivating city."

facts.Roma.nightlife="As the capital city of Italy, <b>Rome boasts a vibrant and thriving nightlife.</b> With countless bars, clubs, and entertainment venues, the city offers something for every taste and preference. From trendy rooftop bars and chic lounges to energetic nightclubs, Rome's nightlife scene is bustling and diverse.<br><br> Visitors can dance the night away, enjoy live music performances, or simply soak up the lively atmosphere of the city after dark."

facts.Palermo.nightlife="<b>Palermo offers a lively and authentic nightlife experience.</b> While not as large as some other cities, it has a vibrant atmosphere and plenty of options for an enjoyable evening. Travelers can explore the city's lively squares and narrow streets, discovering charming bars and cozy taverns.<br><br> Palermo's nightlife scene is known for its friendly ambiance, where locals and visitors can mingle and enjoy the city's warm hospitality."

facts.Torino.nightlife="<b>Turin offers a diverse and eclectic nightlife,</b> blending historical charm with modern entertainment.<br><br> While not as well-known for its nightlife as some other cities, Turin has a growing scene that caters to different preferences.<br><br> Visitors can find trendy bars, live music venues, and clubs that offer a range of experiences.<br><br> Turin's nightlife is characterized by its cultural events, themed parties, and unique venues, providing an exciting night out for those seeking something different."

facts.Crotone.nightlife="<b>Crotone may be a smaller city, but it still offers a pleasant and laid-back nightlife experience.</b><br><br> Travelers can enjoy the local bars and pubs, which provide a cozy and friendly atmosphere.<br><br> While not as bustling as larger cities, Crotone's nightlife scene allows visitors to unwind, socialize with locals, and enjoy the city's charm at a more relaxed pace."

facts.Bolzano.nightlife="<b>Bolzano offers a delightful and intimate nightlife scene.</b> As a smaller city nestled in the picturesque South Tyrolean region, Bolzano's nightlife is characterized by cozy wine bars, charming cafes, and local hangouts.<br><br> Visitors can enjoy sipping regional wines, indulging in traditional dishes, and engaging in relaxed conversations.<br><br> Bolzano's nightlife offers a tranquil and enjoyable experience for those seeking a more intimate setting."

facts.Asti.nightlife="<b>Asti may be a smaller city, but it is known for its vibrant wine culture and lively atmosphere.</b><br><br> Travelers can explore the local wine bars, enotecas, and taverns, where they can sample a variety of wines and immerse themselves in the region's viticulture.<br><br> While not as bustling as larger cities, Asti's nightlife scene comes alive during festivals and events, offering a glimpse into the city's lively spirit and cultural heritage."

facts.Pisa.nightlife="<b>Pisa offers a vibrant nightlife scene</b> that caters to both locals and tourists. The city is dotted with lively bars, pubs, and clubs where visitors can enjoy a variety of drinks and music genres.<br><br> Regardless of whether you're looking for a casual evening with friends or a night of dancing, Pisa has options to suit different tastes and preferences.<br><br> The historic surroundings add a charming backdrop to the city's nightlife, creating a memorable experience."

facts["Reggio Calabria"].nightlife="<b>Reggio Calabria boasts a lively and energetic nightlife</b> that reflects the region's vibrant culture. From bustling bars to energetic nightclubs, the city offers a range of venues to enjoy after dark.<br><br> Visitors can dance to the rhythm of local music, indulge in traditional Calabrian cuisine, and immerse themselves in the lively atmosphere.<br><br> Reggio Calabria's nightlife scene is known for its warmth, friendliness, and a touch of southern Italian charm."

facts["Reggio Emilia"].nightlife="<b>Reggio Emilia offers a diverse and vibrant nightlife scene</b> that caters to different tastes.<br><br> The city has a wide selection of bars, pubs, and clubs where visitors can enjoy live music, DJ performances, and a variety of drinks. Whether you're seeking a relaxed evening with friends or a lively night out, Reggio Emilia has options to suit all preferences.<br><br> The city's welcoming ambiance and lively atmosphere contribute to a memorable nightlife experience."

facts["La Spezia"].nightlife="<b>La Spezia has a lively nightlife scene</b> that combines coastal charm with entertainment options.<br><br> The city offers a range of bars, pubs, and clubs where visitors can enjoy live music, dance, and socialize.<br><br> From beachfront venues to hidden gems in the city center, La Spezia has something for everyone. The nightlife in La Spezia provides a lively and enjoyable experience for both locals and tourists."

facts["L'Aquila"].nightlife="<b>L'Aquila offers a vibrant nightlife scene</b> that reflects the city's youthful energy.<br><br> The streets come alive after dark with a variety of bars, pubs, and clubs catering to different tastes.<br><br> Visitors can enjoy live music performances, DJ sets, and a bustling atmosphere.<br><br> L'Aquila's nightlife scene embraces the city's cultural heritage while providing an exciting and energetic experience for its visitors."

facts.Novara.nightlife="<b>Novara offers a lively and diverse nightlife scene</b> that caters to locals and visitors alike.<br><br> The city features a range of bars, clubs, and entertainment venues where people can enjoy live music, dance, and socialize.<br><br> From trendy cocktail bars to energetic nightclubs, Novara provides a variety of options for a fun night out. The city's vibrant atmosphere and welcoming locals contribute to a memorable nightlife experience."

facts.Milano.nightlife="<b>Milan is renowned for its vibrant and world-class nightlife</b>.<br><br> The city offers an extensive array of bars, clubs, and venues where visitors can enjoy an unforgettable night out.<br><br> From fashionable rooftop bars and stylish lounges to pulsating nightclubs, Milan caters to diverse tastes and preferences. The city's nightlife scene is known for its trendsetting atmosphere, cutting-edge music, and a vibrant mix of locals and international visitors."

facts["Napoli"].nightlife="<b>Naples (Napoli) is famous for its vibrant and lively nightlife</b>.<br><br> The city comes alive after dark, with an abundance of bars, clubs, and entertainment venues scattered throughout its streets.<br><br> Visitors can immerse themselves in the energetic atmosphere, indulge in delicious street food, and experience the city's vibrant music and dance culture. <br><br>From intimate jazz clubs to bustling nightclubs, Naples offers a diverse and unforgettable nightlife experience."

facts["Bologna"].nightlife="<b>Bologna is well-known for its student life and vibrant nightlife scene</b> that attracts locals, students, and visitors alike. The city is filled with an eclectic mix of bars, pubs, and clubs offering a diverse range of experiences.<br><br> Visitors can enjoy live music performances, DJ sets, and a lively atmosphere that extends into the early hours of the morning. <br><br>Bologna's vibrant and inclusive nightlife showcases the city's youthful energy and cultural diversity."

facts["Firenze"].nightlife="<b>Florence (Firenze) offers a captivating nightlife scene</b> that blends history, art, and entertainment. The city features a mix of traditional wine bars, trendy clubs, and live music venues where visitors can unwind and socialize.<br><br> Whether it's enjoying a glass of Tuscan wine, dancing to the rhythm of live music, or exploring the vibrant streets at night, Florence provides a magical and memorable nightlife experience."

facts["Venezia"].nightlife="<b>Venice (Venezia) offers a unique and enchanting nightlife experience</b> that reflects the city's romantic ambiance. While Venice is known for its serene canals and historic landmarks, it also has a vibrant after-dark scene.<br><br> Visitors can discover cozy wine bars, lively taverns, and hidden cocktail lounges as they explore the city's narrow streets and squares.<br><br> Venice's nightlife combines elegance, charm, and a touch of mystery."

facts["Bergamo"].nightlife="<b>Bergamo offers a vibrant nightlife scene</b> with a variety of bars, clubs, and entertainment options. Visitors can explore the city's diverse range of bars, each with its own unique atmosphere and drink selection.<br><br> From traditional pubs to modern cocktail bars, Bergamo has something to suit every taste. <br><br>The city also hosts theatrical performances and cultural events, providing a well-rounded nightlife experience."

facts["Bari"].nightlife="<b>Bari offers a lively and vibrant nightlife scene</b> that showcases the city's southern Italian charm. The city features a variety of bars, clubs, and music venues where visitors can enjoy live music performances, traditional Puglian cuisine, and a bustling atmosphere.<br><br> From seaside cocktail bars to energetic nightclubs, Bari provides entertainment options for every taste. The city's warm hospitality and vibrant atmosphere create a memorable nightlife experience."

facts["Foggia"].nightlife="<b>Foggia may be a smaller city, but it offers a vibrant and lively nightlife scene</b> that caters to locals and visitors. The city features a selection of bars, pubs, and clubs where people can enjoy live music, dance, and socialize.<br><br> Foggia's nightlife scene showcases a mix of traditional and contemporary venues, providing a charming and intimate atmosphere for a night out."

facts["Catania"].nightlife="<b>Catania is known for its vibrant and energetic nightlife</b>, often referred to as 'movida' in Italian. The city offers a wide range of bars, clubs, and entertainment venues that cater to diverse tastes and preferences. Visitors can enjoy live music performances, DJ sets, and a lively atmosphere that lasts until the early hours of the morning. Catania's nightlife scene is characterized by its energetic vibe, bustling streets, and a mix of locals and tourists enjoying the city's vibrant social scene."

facts["Messina"].nightlife="<b>Messina boasts a lively nightlife scene</b> that offers a mix of traditional charm and modern entertainment. The city features a variety of bars, pubs, and clubs where locals and visitors can enjoy drinks, live music, and dancing. Messina's nightlife is known for its friendly and welcoming atmosphere, allowing guests to experience the local culture and socialize with the friendly Sicilian crowd."

facts["Mantova"].nightlife="<b>Mantova, although a smaller city, has a vibrant nightlife scene</b> that attracts locals and tourists alike. The city's historic center comes alive after dark with cozy wine bars, trendy pubs, and lively music venues. Visitors can enjoy live performances, cultural events, and a vibrant atmosphere that blends the city's rich history with contemporary entertainment. Mantova's nightlife offers a charming and intimate experience for those seeking a memorable night out."

facts["Nuoro"].nightlife="<b>Nuoro may be a smaller city, but it has a vibrant and lively nightlife scene</b> that celebrates Sardinian culture and traditions. The city offers a mix of traditional bars, clubs, and live music venues where visitors can immerse themselves in the island's lively atmosphere. Nuoro's nightlife showcases traditional Sardinian music, dance, and cuisine, providing a unique and authentic experience for those seeking to explore the local culture."

facts["Cosenza"].nightlife="<b>Cosenza offers a vibrant nightlife scene</b> that blends traditional and modern entertainment. The city features a range of bars, pubs, and clubs where visitors can enjoy live music, DJ sets, and a lively atmosphere. Cosenza's nightlife is known for its warm hospitality, friendly locals, and a variety of venues that cater to different tastes and preferences. Whether it's enjoying local wines, dancing to the rhythm of traditional music, or experiencing the city's contemporary music scene, Cosenza has something for everyone."

facts["Viterbo"].nightlife="<b>Viterbo, a charming medieval city, has a vibrant and lively nightlife</b> that combines its rich historical atmosphere with modern entertainment. The city features a selection of bars, wine cellars, and clubs where visitors can enjoy a diverse range of experiences. Viterbo's nightlife scene offers a mix of traditional wine tastings, live music performances, and a bustling atmosphere in its picturesque streets and squares. Visitors can immerse themselves in the city's unique blend of history and contemporary entertainment."

facts["Varese"].nightlife="<b>Varese is known for its vibrant nightlife scene</b> that caters to locals and visitors. The city features a variety of bars, pubs, and clubs offering a range of entertainment options. Visitors can enjoy live music, DJ sets, and a bustling atmosphere that extends into the late hours of the night. <br><br>Varese's nightlife scene offers a mix of trendy venues, energetic crowds, and a diverse music scene, ensuring an enjoyable and memorable night out in the city."

facts["Lucca"].nightlife="<b>Lucca, a charming medieval town in Tuscany, offers a lively nightlife scene</b> that combines historical ambiance with modern entertainment. The city's narrow streets are lined with cozy wine bars, lively pubs, and trendy clubs where locals and visitors gather. Lucca's nightlife comes alive during special events like the Lucca Comics & Games festival, one of the largest comic conventions in Europe. The festival attracts thousands of enthusiasts, cosplayers, and gamers who immerse themselves in the vibrant atmosphere of the city, making it an exciting time to experience Lucca's nightlife."

facts["Siena"].nightlife="<b>Siena, famous for its Palio horse race and medieval charm, offers a vibrant nightlife scene</b> that reflects the city's energetic spirit. The city features a mix of traditional wine bars, trendy clubs, and live music venues. Siena's nightlife is particularly lively during special events and festivals, such as the Palio celebrations, when the streets are filled with festivities and revelry. Whether you're interested in enjoying a relaxing evening at a wine bar or dancing the night away, Siena has a diverse range of options to suit different tastes."

facts["Prato"].nightlife="<b>Prato, a city in the heart of Tuscany, offers a diverse nightlife scene</b> that blends tradition with modern trends. The city boasts a range of bars, pubs, and clubs catering to different preferences. Prato's nightlife is known for its lively atmosphere and vibrant social scene, with locals and visitors enjoying evenings filled with music, drinks, and socializing."

facts["Cagliari"].nightlife="<b>Cagliari, the vibrant capital of Sardinia, offers a lively and diverse nightlife</b> that caters to different tastes. The city is dotted with numerous bars, clubs, and lounges, where locals and visitors gather to enjoy the evening. Cagliari's vibrant atmosphere and stunning coastal views add to the allure of its nightlife scene, making it a memorable experience."

facts["Perugia"].nightlife="<b>Perugia, the picturesque capital of Umbria, offers a vibrant and eclectic nightlife</b> that reflects its youthful energy and artistic vibe. The city is known for its thriving student population, which contributes to a lively atmosphere after dark. Perugia's historic center is filled with a mix of traditional taverns, trendy bars, and music venues, providing a diverse nightlife experience."

facts["Rimini"].nightlife="<b>Rimini, a popular seaside destination on the Adriatic coast, boasts a vibrant and energetic nightlife</b> that attracts both locals and tourists. The city's long stretch of sandy beaches is lined with beach clubs and bars, offering a unique setting for daytime and evening entertainment. Rimini's city center comes alive with a wide range of bars, clubs, and discos, creating a lively atmosphere."

facts["Lecce"].nightlife="<b>Lecce, a captivating city in southern Italy's Apulia region, offers a vibrant and charming nightlife</b> that reflects its rich cultural heritage. Lecce's historic center comes alive in the evening, offering traditional wine bars, chic cocktail lounges, and lively squares for socializing and entertainment. <br><br>The city is renowned for its vibrant music scene, showcasing traditional folk music and contemporary acts."

facts["Sassari"].nightlife="<b>Sassari, a lively city in northern Sardinia, offers a vibrant and energetic nightlife</b> that reflects its youthful population and dynamic atmosphere. The city's historic center is filled with charming bars, pubs, and clubs, creating a lively social scene after dark. Sassari hosts various cultural events, music festivals, and live performances throughout the year, attracting both locals and visitors."

facts["Catanzaro"].nightlife="<b>Catanzaro, the capital of the Calabria region, offers a diverse and lively nightlife</b> that combines traditional charm with modern entertainment. The city features a variety of bars, pubs, and clubs catering to different preferences. Catanzaro's historic center is a popular spot for locals and tourists to enjoy the vibrant atmosphere and experience the city's nightlife."

facts["Padova"].nightlife="<b>Padua (Padova) offers a lively and dynamic nightlife</b> that caters to the city's vibrant student population. The streets are lined with a variety of bars, pubs, and clubs where visitors can enjoy live music, DJ sets, and a bustling atmosphere. Padua's nightlife scene is known for its energetic vibe, friendly crowds, and a mix of traditional and contemporary venues."

facts["Trento"].nightlife="<b>Trento, nestled in the stunning Trentino region, offers a charming and vibrant nightlife scene</b>. The city features a mix of cozy wine bars, craft beer pubs, and trendy clubs where visitors can unwind and socialize. Trento's nightlife is influenced by its location in the heart of the Dolomites, with a focus on local produce and a warm, welcoming atmosphere."

facts["Pescara"].nightlife="<b>Pescara, a coastal city in the Abruzzo region, offers a lively and diverse nightlife</b> that combines beachfront entertainment with urban charm. The city features a variety of bars, clubs, and beach clubs where visitors can enjoy live music, DJ sets, and a vibrant atmosphere. Pescara's nightlife scene is known for its fusion of beach parties, trendy venues, and a bustling social scene."

facts["Como"].nightlife="<b>Como, nestled on the shores of Lake Como, offers a sophisticated and elegant nightlife experience</b>. <br><br>The city features a mix of stylish wine bars, rooftop lounges, and upscale clubs where visitors can enjoy a refined evening. Como's nightlife scene is characterized by its stunning lake views, exclusive venues, and a blend of international and local clientele."

facts["Frosinone"].nightlife="<b>Frosinone offers a lively and energetic nightlife scene</b> that reflects the city's southern Italian spirit. The city features a range of bars, pubs, and clubs where locals and visitors can enjoy live music, DJ sets, and a bustling atmosphere. Frosinone's nightlife scene is known for its warm hospitality, friendly locals, and a variety of venues that cater to different tastes and preferences."

facts["Aosta"].nightlife="<b>Aosta, nestled in the scenic Aosta Valley, offers a charming and cozy nightlife experience</b>. <br><br>The city features a variety of bars, wine cellars, and traditional taverns where visitors can enjoy local wines, delicious cuisine, and a relaxed atmosphere. Aosta's nightlife scene embraces the region's Alpine charm, providing a tranquil and enjoyable experience for those seeking a laid-back evening."

facts["Monza e Brianza"].nightlife="<b>Monza e Brianza, a province in the Lombardy region, offers a diverse and vibrant nightlife scene</b> that caters to different preferences. The province features a range of bars, pubs, and clubs where locals and visitors can enjoy live music, DJ performances, and a lively atmosphere. Monza e Brianza's nightlife scene is known for its energetic vibe, trendy venues, and a mix of music genres to suit various tastes."

facts["Lodi"].nightlife="<b>Lodi, a city located in the Lombardy region, offers a charming and lively nightlife experience</b>. The city features a selection of bars, wine bars, and pubs where visitors can enjoy drinks, socialize, and unwind. Lodi's nightlife scene embraces a relaxed and friendly ambiance, often showcasing local musicians and performers. With its cozy atmosphere and welcoming establishments, Lodi provides an enjoyable evening for locals and tourists alike."

facts["Ancona"].nightlife="<b>Ancona has a lively and well-organized nightlife</b> with plenty of options for entertainment. <br><br>The main hub for nightlife in Ancona is <b>Piazza del Plebiscito (also known as Piazza del Papa)</b>, considered the 'living room' of the city. It is always bustling with activity, and numerous bars, pubs, and restaurants can be found in this area. Some recommended places to enjoy an aperitivo or an apericena in Ancona include <b>Ravaletto Wine Bar & Drink</b>, <b>Raval Tapas & Spirits Bar</b>, <b>Zazie</b>, and <b>King Edward Pub</b>. <br><br>For those interested in dancing and clubbing, <b>Sui Suite Club</b> and <b>Naif Club Food & Music Experience</b> are popular venues in Ancona."

facts["Macerata"].nightlife="<b>Macerata also offers a vibrant nightlife scene</b> with various venues to suit different tastes. <br><br>One of the well-known nightlife spots in Macerata is <b>Strada del Castellano</b>, where you can find the <b>Naif Club</b>. It hosts special events and guest performances. Additionally, <b>Komedia</b> in Castelfidardo, located a short distance from Macerata, is a beautiful nightclub worth visiting. <br><br>These places provide an exciting atmosphere for partygoers and those seeking a memorable nightlife experience in Macerata."

facts["Oristano"].nightlife="<b>Oristano offers a variety of nightlife venues, including bars, clubs, and pubs in the city center and along the waterfront of Marina di Torre Grande</b>. These places offer diverse atmospheres, catering to different preferences. Visitors can explore these areas to experience the vibrant nightlife scene in Oristano, characterized by a lively and enjoyable ambiance for socializing and entertainment."

facts["Livorno"].nightlife="<b>Livorno, a port city on the Tuscan coast, offers a lively and authentic nightlife experience</b>.<br><br> The city features a range of bars, pubs, and taverns where visitors can enjoy local drinks, seafood, and live music. <br><br>Livorno’s nightlife scene reflects the city’s maritime heritage, multicultural influences, and artistic flair.<br><br> With its casual and friendly atmosphere, Livorno provides a unique and enjoyable evening for those seeking a taste of the real Tuscany."
}

function populateSafetyFacts(){
facts["Roma"].safety="As with any big city, <b>Rome has areas that can be less safe</b>, particularly at night. However, the city has a strong police presence and security measures in place to ensure the safety of residents and visitors.<br><br> The most common types of crime in Rome are pickpocketing, bag snatching, and scams targeting tourists. Travelers, especially women, should be cautious of their belongings and avoid displaying valuable items openly.<br><br> It is advisable to stay in well-lit areas and use reputable transportation services. Rome has a relatively low murder rate compared to other major cities.<br><br> However, it is always recommended to stay alert and exercise common sense to stay safe on the roads and when crossing streets due to heavy traffic and occasional reckless driving."

facts["Siena"].safety="<b>Siena is considered a very safe city with a low crime rate</b>. It is known for its welcoming and friendly atmosphere, making it a popular destination for tourists and travelers.<br><br> Siena experiences minimal crime, with incidents mainly limited to petty theft or pickpocketing in crowded areas. Women generally feel safe walking alone in Siena, especially in the well-trafficked tourist areas.<br><br> However, it is still recommended to take basic precautions, such as being aware of your surroundings and securing personal belongings.<br><br> Siena has a low murder rate, and road accidents are infrequent, but it's always important to be cautious and follow traffic rules when driving or crossing roads."

facts["Asti"].safety="<b>Asti is a relatively safe city with a low crime rate</b>. The city maintains a peaceful and secure atmosphere, making it a favorable destination for travelers.<br><br> Crime in Asti is generally low, with incidents primarily involving petty theft or property crimes. Women generally feel safe in Asti, but it's always advisable to exercise caution and common sense, especially when walking alone at night.<br><br> Asti has a low murder rate, contributing to its overall safety. Road accidents in the city are infrequent, but it is still important to follow traffic rules and drive defensively.<br><br> Overall, Asti provides a safe environment for visitors, and taking basic safety precautions will enhance your experience in the city."

facts["Firenze"].safety="<b>Florence is generally a safe city for residents and tourists</b>. The historic center and main tourist areas are well-policed, and the city has a relatively low crime rate.<br><br> The most common types of crime in Florence are pickpocketing and theft, particularly in crowded areas and public transportation. Travelers, especially women, should remain vigilant and take precautions to secure their belongings. It is also recommended to avoid walking alone in quiet or poorly lit areas at night. Florence has a low murder rate, and road accidents are generally infrequent, but it is still important to exercise caution when crossing roads and follow traffic rules."

facts["Milano"].safety="<b>Milan has experienced an increase in crime rate in the last couple of years</b>. In 2021, Milan ranked first in terms of crime rate among North Italian cities.<br><br> Milan has seen an increase in several types of crimes, <b>including property crimes such as theft and burglary, as well as violent crimes such as assault and robbery.<br><br> Pickpocketing and bag snatching are common in crowded areas</b> such as train stations and tourist attractions, particularly during peak tourist season. Additionally, there has been an increase in drug-related crimes in certain parts of the city.<br><br>Despite the increase in crime rate, <b>Milan is still considered a relatively safe city compared to other large European cities</b>. The city maintains a strong police presence and has implemented effective safety measures such as surveillance cameras and increased lighting in certain areas. Visitors can also take measures to enhance their safety such as using well-lit and busy streets, avoiding isolated areas, and being cautious of strangers."

facts["Napoli"].safety="<b>Napoli has a higher crime rate compared to other provinces in the Campania region</b>. The city is known for its historical challenges with crime, including instances of violent crimes such as robberies and homicides.<br><br> <b>It is advisable to exercise caution and take extra precautions when visiting Napoli</b>, particularly in certain problematic areas."

facts["Livorno"].safety="<b>Livorno is generally a safe city with a low crime rate</b>. Located in the Tuscany region, Livorno maintains a peaceful environment for residents and visitors.<br><br> Petty theft and pickpocketing can occur in crowded tourist areas, so it is advisable to remain vigilant and take necessary precautions to safeguard personal belongings.<br><br> Women usually feel safe walking alone in Livorno, but it is always recommended to exercise caution, particularly at night and in less-populated areas. Livorno has a low murder rate, and road accidents are infrequent. However, it is still important to adhere to traffic regulations and drive defensively."

facts["Palermo"].safety="<b>Palermo has seen improvements in safety and security in recent years</b>.<br><br> While the city has dealt with organized crime in the past, efforts have been made to enhance safety for residents and visitors.<br><br> Tourists should be cautious of pickpocketing and bag snatching, particularly in crowded areas and tourist attractions.<br><br> Women should take extra precautions when traveling alone at night.<br><br> It is advisable to stay in well-populated areas and use reputable transportation. Palermo has a relatively higher crime rate compared to other cities in Italy, including occasional instances of violent crimes. However, the majority of visitors enjoy their time in Palermo without any issues. Road accidents and reckless driving can occur, so it is important to exercise caution when on the roads."

facts["Reggio Calabria"].safety="<b>Reggio Calabria has a mixed safety reputation</b>. While the majority of tourists and residents enjoy their time in the city without any issues, it is important to be aware of certain safety concerns.<br><br> Reggio Calabria has experienced organized crime activities in the past, mainly associated with local mafia groups.<br><br> However, these incidents typically do not directly affect tourists or visitors.<br><br> Travelers should be cautious of pickpocketing and theft, particularly in crowded areas and tourist sites. It is advisable to stay in well-populated areas and use reputable transportation. Women should take extra precautions when traveling alone at night.<br><br> Reggio Calabria has a relatively low murder rate, and road accidents are infrequent. However, it is important to follow traffic regulations and drive defensively."

facts["Reggio Emilia"].safety="<b>Reggio Emilia is generally considered a safe city with a low crime rate</b>.<br><br> Located in the Emilia-Romagna region, the city maintains a peaceful environment for residents and visitors.<br><br> The most common types of crime in Reggio Emilia are related to petty theft and pickpocketing, which can occur in crowded tourist areas. Travelers should remain vigilant and take necessary precautions to safeguard personal belongings.<br><br> Women usually feel safe walking alone in Reggio Emilia, but it is always recommended to exercise caution, particularly at night and in less-populated areas. Reggio Emilia has a low murder rate, and road accidents are infrequent. However, it is still important to adhere to traffic regulations and drive responsibly."

facts["La Spezia"].safety="<b>La Spezia is generally a safe city for residents and tourists</b>. Located in the Liguria region, the city has a relatively low crime rate.<br><br> Common crimes in La Spezia are pickpocketing and theft, particularly in crowded tourist areas and public transportation. Travelers, especially women, should remain vigilant and take precautions to secure their belongings.<br><br> It is also recommended to avoid walking alone in quiet or poorly lit areas at night. La Spezia has a low murder rate, and road accidents are generally infrequent. However, it is still important to exercise caution when crossing roads and follow traffic rules."

facts["L'Aquila"].safety="<b>L'Aquila is generally considered a safe city with a low crime rate</b>.<br><br> Located in the Abruzzo region, the city maintains a peaceful environment for residents and visitors. The most common types of crime in L'Aquila are related to petty theft and pickpocketing, which can occur in crowded tourist areas. Travelers should remain vigilant and take necessary precautions to safeguard personal belongings.<br><br> Women usually feel safe walking alone in L'Aquila, but it is always recommended to exercise caution, particularly at night and in less-populated areas. L'Aquila has a low murder rate, and road accidents are infrequent. However, it is still important to adhere to traffic regulations and drive responsibly."

facts["Messina"].safety="<b>Messina is generally considered a safe city with a moderate crime rate</b>.<br><br> While the majority of tourists and residents enjoy their time in the city without any issues, it is important to be aware of certain safety concerns. Pickpocketing and theft can occur in crowded areas and tourist attractions, so it is advisable to remain vigilant and keep belongings secure.<br><br> Women should take extra precautions when traveling alone at night. It is recommended to stay in well-populated areas and use reputable transportation. Messina has a moderate murder rate compared to other cities in Italy. Road accidents and reckless driving can occur, so it is important to exercise caution when on the roads."

facts["Varese"].safety="<b>Varese is generally considered a safe city with a low crime rate</b>.<br><br> Located in the Lombardy region, the city maintains a peaceful environment for residents and visitors. The most common types of crime in Varese are related to petty theft and pickpocketing, which can occur in crowded tourist areas. Travelers should remain vigilant and take necessary precautions to safeguard personal belongings.<br><br> Women usually feel safe walking alone in Varese, but it is always recommended to exercise caution, particularly at night and in less-populated areas. Varese has a low murder rate, and road accidents are infrequent. However, it is still important to adhere to traffic regulations and drive responsibly."

facts["Agrigento"].safety="Agrigento has had a history of <b>higher crime rates compared to other Italian cities</b>.<br><br> While the majority of tourists and residents visit Agrigento without incident, it's important to be aware of certain areas that may have higher crime rates. The city has made efforts to improve safety and has a police presence. Tourists should be cautious of pickpocketing and bag snatching in crowded areas and tourist attractions. Women should take extra precautions when traveling alone at night. It is advisable to stay in well-populated areas and use reputable transportation. Agrigento has a relatively higher murder rate compared to other cities in Italy. Additionally, road accidents and reckless driving can occur, so it is important to exercise caution when on the roads."

facts["Cosenza"].safety="<b>Cosenza is generally considered a safe city with a low crime rate</b>.<br><br> Located in the Calabria region, the city maintains a peaceful environment for residents and visitors. The most common types of crime in Cosenza are related to petty theft and pickpocketing, which can occur in crowded tourist areas. Travelers should remain vigilant and take necessary precautions to safeguard personal belongings. Women usually feel safe walking alone in Cosenza, but it is always recommended to exercise caution, particularly at night and in less-populated areas. Cosenza has a low murder rate, and road accidents are infrequent. However, it is still important to adhere to traffic regulations and drive responsibly."

facts["Bari"].safety="<b>Bari is generally a safe city for residents and tourists</b>. The city has a relatively low crime rate compared to other urban centers.<br><br> Over the past few years, the crime rate in Bari has been decreasing. However, it is still important to take precautions against petty theft and pickpocketing, especially in crowded areas and around the train station. Additionally, it is recommended to avoid walking alone at night, particularly in underground areas."

facts["Lecce"].safety="<b>Lecce is generally a safe city for residents and tourists</b>. The city is known for its welcoming atmosphere. Lecce has maintained a relatively low crime rate, and there have been no significant increases in recent years. However, like any other place, it is always wise to remain cautious. Visitors are advised to be mindful of pickpocketing and keep a close eye on their belongings, especially in crowded areas. By taking these precautions, you can enjoy the charms of Lecce with peace of mind."

facts["Foggia"].safety="Foggia has a relatively high crime rate compared to other cities in Italy, and caution is advised when visiting. According to reports, crime in Foggia has been increasing over the past few years. Visitors are strongly discouraged from walking at night and should take extra precautions to safeguard their belongings. The risk of robbery and theft is significant, and leaving valuables unattended in cars is not recommended. It is advisable to consult local advice and exercise vigilance when exploring the city."

facts["Avellino"].safety="<b>Avellino is known for its low crime rate and safe environment</b>. Incidents of petty theft and pickpocketing are rare, contributing to a secure experience for residents and visitors. The town has a strong police presence, further enhancing safety. Road accidents are infrequent, but it is always recommended to adhere to traffic regulations."

facts["Rimini"].safety="<b>Rimini is recognized as a safe coastal town with a low crime rate</b>. Incidents of petty theft and pickpocketing are infrequent, ensuring a secure experience for residents and tourists. Rimini has implemented effective safety measures and maintains a visible police presence. Road safety is generally good, but it is important to follow traffic rules and drive responsibly."

facts["Viterbo"].safety="<b>Viterbo offers a safe and secure experience with a low crime rate</b>. Incidents of petty theft and pickpocketing are rare but can occur in crowded tourist areas. The town benefits from a peaceful atmosphere and has a reliable police presence. Road accidents are relatively uncommon, but it is still important to drive responsibly and follow traffic regulations."

facts["Pescara"].safety="<b>Pescara is a safe coastal city with a low crime rate</b>.<br><br> Instances of petty theft and pickpocketing are rare, ensuring a secure environment for residents and tourists. Pescara has a strong focus on safety and maintains a visible police presence. Road accidents are infrequent, but it is essential to adhere to traffic laws and drive responsibly."

facts["Mantova"].safety="<b>Mantova is known for its safety and low crime rate</b>.<br><br> Instances of petty theft and pickpocketing are uncommon, contributing to a secure experience for visitors. Mantova benefits from effective safety measures and has a visible police presence. Road accidents are infrequent, but it is important to exercise caution and follow traffic regulations when driving."

facts["Padova"].safety="<b>Padova is recognized as a safe city with a low crime rate</b>. Incidents of petty theft and pickpocketing are infrequent but can occur in crowded tourist areas. The town maintains a peaceful atmosphere and has a reliable police presence. Road accidents are relatively uncommon, but it is still important to drive responsibly and adhere to traffic rules."

facts["Pistoia"].safety="<b>Pistoia is known for its safety and low crime rate</b>. Instances of petty theft and pickpocketing are uncommon, ensuring a secure experience for residents and tourists. Pistoia benefits from effective safety measures and a reliable police presence. Road accidents are relatively infrequent, but it is important to exercise caution and follow traffic regulations when driving."

facts["Pesaro e Urbino"].safety="<b>Pesaro e Urbino provides a safe and secure environment with a low crime rate</b>. Incidents of petty theft and pickpocketing are rare, contributing to a peaceful experience for residents and visitors. The region maintains effective safety measures and has a visible police presence. Road accidents are relatively infrequent, but it is advisable to drive responsibly and follow traffic regulations."

facts["Salerno"].safety="<b>Salerno has a moderate crime rate compared to other provinces in the Campania region. Visitors should exercise caution and be aware of their surroundings, particularly in busy tourist areas and public transportation. It is recommended to secure personal belongings, avoid isolated areas at night, and use reputable transportation services. By staying vigilant and following common safety practices, visitors can have a pleasant and secure experience in Salerno.</b>"

facts["Rovigo"].safety="<b>Rovigo offers a safe and secure experience with a low crime rate</b>. Incidents of petty theft and pickpocketing are rare, contributing to a peaceful environment for residents and visitors. The town maintains effective safety measures and has a visible police presence. Road accidents are infrequent, but it is advisable to drive responsibly and follow traffic regulations."

facts["Torino"].safety="<b>Torino is considered a safe city with a relatively low crime rate</b>. Instances of petty theft and pickpocketing can occur, especially in crowded tourist areas, so it is advisable to remain vigilant and keep personal belongings secure. Torino has implemented effective safety measures and has a visible police presence. Road accidents are infrequent, but it is important to exercise caution and adhere to traffic regulations."

facts["Pordenone"].safety="<b>Pordenone is known for its safety and low crime rate</b>. Instances of petty theft and pickpocketing are uncommon, ensuring a secure experience for residents and visitors. Pordenone benefits from effective safety measures and a reliable police presence. Road accidents are relatively infrequent, but it is important to exercise caution and follow traffic regulations when driving."

facts["Catania"].safety="<b>Catania prioritizes safety and offers a secure environment for residents and visitors</b>. The city maintains a relatively low crime rate, including a low murder rate, ensuring a peaceful experience for tourists. While instances of petty theft and pickpocketing may occur, they are infrequent. However, it's important to be aware of the historical presence of organized crime, particularly the notorious mafia group 'Cosa Nostra,' in Sicily, including Catania. The influence of the mafia in Catania has significantly diminished over the years, and their criminal activities are primarily focused on internal affairs. These activities are generally not targeted at tourists or visitors. Catania has implemented effective safety measures, including a visible police presence, to ensure the well-being of its residents and tourists. Road accidents are relatively uncommon, but it is still advisable to drive responsibly and adhere to traffic regulations."

facts["Vibo Valentia"].safety="Vibo Valentia has had issues with safety and crime rates in the past. The province has experienced the influence of organized crime, including the 'Ndrangheta.<br><br> While efforts have been made to improve safety, it is important to exercise caution when visiting Vibo Valentia. Instances of petty theft and pickpocketing can occur, particularly in crowded areas and tourist sites. It is advisable to stay in well-populated areas, use reputable transportation, and keep personal belongings secure. Vibo Valentia has made progress in enhancing safety measures, but it is still recommended to remain vigilant and aware of your surroundings. Road accidents and reckless driving can also pose risks, so it is crucial to drive defensively and adhere to traffic regulations."

facts["Catanzaro"].safety="<b>Catanzaro is considered a relatively safe province in Calabria</b>. While it may have had higher crime rates in the past, there have been significant improvements in safety and security measures. Visitors and residents generally enjoy their time in Catanzaro without major safety concerns. However, it is still recommended to exercise caution and be aware of your surroundings, particularly in crowded areas or tourist spots. Keeping your belongings secure and following any local safety guidelines will contribute to a safe and enjoyable experience in Catanzaro."

facts["Caserta"].safety="<b>Caserta is associated with a relatively high crime rate. Visitors should be aware of the potential for criminal activities and take necessary precautions to ensure their safety. It is advisable to stay in well-populated areas, avoid walking alone at night, and secure personal belongings. By staying vigilant and following common safety practices, visitors can enjoy their time in Caserta.</b>"

facts["Benevento"].safety="<b>Benevento generally maintains a safe environment for residents and visitors. The city has a lower crime rate compared to other provinces in the Campania region.<br><br> However, it is still recommended to exercise caution and be mindful of personal belongings, especially in crowded tourist areas. By staying aware of your surroundings and following basic safety measures, you can have a pleasant and safe experience in Benevento.</b>"

facts["Brescia"].safety="<b>Brescia has a moderate crime rate</b>.<br><br> The most common types of crimes in Brescia include petty theft, pickpocketing, and property-related offenses.<br><br> It is advisable to exercise caution and be aware of your surroundings, particularly in crowded areas and tourist spots. Taking precautions such as securing personal belongings, avoiding isolated areas at night, and using well-lit and populated streets can contribute to a safer experience in Brescia."

facts["Bergamo"].safety="<b>Bergamo is considered a relatively safe city with a low crime rate</b>. Instances of petty theft and pickpocketing can occur, especially in crowded tourist areas, but they are relatively uncommon. The city maintains effective safety measures and has a visible police presence, contributing to a secure environment. Road accidents are infrequent, but it is important to exercise caution and adhere to traffic regulations when driving in Bergamo."

facts["Varese"].safety="<b>Varese offers a safe and secure environment with a low crime rate</b>. Instances of petty theft, pickpocketing, and property-related offenses are rare, contributing to a peaceful atmosphere for residents and visitors. The city maintains effective safety measures and has a visible police presence, which further enhances safety.<br><br> Road accidents are infrequent, but it is advisable to drive responsibly and follow traffic regulations when traveling in Varese."

facts["Como"].safety="<b>Como generally maintains a low crime rate</b>. Visitors should still exercise caution and take necessary precautions to ensure personal safety and the security of their belongings.<br><br> Common types of crimes include petty theft and property-related offenses. Being aware of your surroundings, using well-lit and populated areas, and securing personal belongings can contribute to a safer experience in Como."

facts["Cremona"].safety="<b>Cremona has a moderate crime rate</b>, with common offenses including theft and property-related crimes. Visitors should remain vigilant and take necessary precautions to ensure personal safety.<br><br> It is advisable to secure personal belongings, particularly in crowded areas and tourist attractions. Following basic safety practices can help enhance your security while in Cremona."

facts["Lecco"].safety="<b>Lecco maintains a relatively low crime rate</b>, but it is advisable to take precautions against petty theft and ensure personal safety.<br><br> Visitors should be mindful of their surroundings and keep personal belongings secure, particularly in crowded areas and popular tourist destinations. Enjoying the scenic landscapes while practicing basic safety measures can contribute to a secure experience in Lecco."

facts["Lodi"].safety="<b>Lodi generally maintains a low crime rate</b>, providing a safe environment for residents and visitors. However, it is still important to exercise caution and follow standard safety practices. Being aware of your surroundings, particularly in crowded areas, and securing personal belongings can contribute to a safe and enjoyable experience in Lodi."

facts["Mantova"].safety="<b>Mantova has a moderate crime rate</b>, with common offenses including theft and property-related crimes. Visitors should remain cautious and take necessary precautions to ensure personal safety. It is advisable to secure personal belongings and be aware of your surroundings, particularly in crowded areas and tourist attractions. By practicing basic safety measures, you can enhance your security while exploring Mantova."

facts["Pavia"].safety="<b>Pavia generally maintains a low crime rate</b>. However, visitors should still exercise caution and be mindful of their surroundings, particularly in crowded areas and tourist spots. It is advisable to secure personal belongings, avoid isolated areas at night, and use well-lit and populated streets. By taking necessary precautions, you can have a safer experience in Pavia."

facts["Sondrio"].safety="<b>Sondrio is known for its stunning mountain scenery and outdoor activities</b>. The province generally maintains a low crime rate, providing a safe environment for residents and visitors. However, it is always important to exercise caution and follow standard safety practices. Enjoying the natural beauty of Sondrio while practicing basic safety measures can contribute to a secure experience."

facts["Cuneo"].safety="<b>Cuneo generally maintains a low crime rate</b>, providing a safe environment for residents and visitors. However, it is advisable to exercise caution and follow basic safety practices. Being aware of your surroundings, particularly in crowded areas and tourist spots, can contribute to a safer experience in Cuneo."

facts["Asti"].safety="<b>Asti offers a safe and secure environment with a relatively low crime rate</b>. Instances of petty theft and pickpocketing can occur, especially in crowded areas and tourist attractions, so it is important to remain vigilant and keep personal belongings secure. Asti maintains effective safety measures and has a visible police presence. Road accidents are infrequent, but it is advisable to drive responsibly and follow traffic regulations."

facts["Alessandria"].safety="<b>Alessandria generally maintains a low crime rate</b>. Visitors should still exercise caution and be aware of their surroundings, particularly in crowded areas and tourist attractions. It is advisable to secure personal belongings and follow basic safety practices to ensure a safer experience in Alessandria."

facts["Novara"].safety="<b>Novara has a moderate crime rate</b>. Common types of crimes in Novara include theft and property-related offenses. Visitors should exercise caution and be aware of their surroundings, particularly in crowded areas. It is advisable to secure personal belongings and take necessary precautions to ensure personal safety while in Novara."

facts["Biella"].safety="<b>Biella generally maintains a low crime rate</b>. However, visitors should still exercise caution and follow standard safety practices. Being aware of your surroundings, particularly in crowded areas, and securing personal belongings can contribute to a safe and enjoyable experience in Biella."

facts["Verbano-Cusio-Ossola"].safety="<b>Verbano-Cusio-Ossola is known to be very safe</b>. The province generally maintains a low crime rate, providing a safe environment for residents and visitors. However, it is always important to exercise caution and follow standard safety practices. Enjoying the natural beauty of Verbano-Cusio-Ossola while practicing basic safety measures can contribute to a secure experience."

facts["Aosta"].safety="<b>Aosta is generally considered a safe, peaceful city with a very low crime rate</b>. Instances of petty theft and pickpocketing can occur, especially in crowded tourist areas, so it is advisable to remain vigilant and keep personal belongings secure. Aosta maintains effective safety measures and has a visible police presence.<br><br> Road accidents are infrequent, but it is important to exercise caution and adhere to traffic regulations."

facts["Campobasso"].safety="<b>Campobasso is considered a safe city with a relatively low crime rate</b>. Instances of petty theft and pickpocketing can occur, especially in crowded tourist areas, so it is advisable to remain vigilant and keep personal belongings secure. Campobasso maintains effective safety measures and has a visible police presence.<br><br> Road accidents are infrequent, but it is important to exercise caution and adhere to traffic regulations."

facts["Isernia"].safety="<b>Isernia generally maintains a low crime rate</b>, providing a safe environment for residents and visitors. However, it is advisable to exercise caution and follow basic safety practices. Being aware of your surroundings, particularly in crowded areas and tourist spots, can contribute to a safer experience in Isernia."

facts["Trapani"].safety="<b>Trapani has a moderate crime rate</b>. The city has struggled with mafia-related issues in the past, but this is unlikely to create any trouble for tourists or expats. Visitors should exercise caution and be aware of their surroundings, particularly in crowded tourist areas and public transportation. It is recommended to secure personal belongings, avoid isolated areas at night, and use reputable transportation services. By staying vigilant and following common safety practices, visitors can have a pleasant and secure experience in Trapani."

facts["Lucca"].safety="<b>Lucca offers a safe and secure environment with a low crime rate</b>. Instances of petty theft and pickpocketing can occur, especially in crowded tourist areas, but they are relatively uncommon. The city maintains effective safety measures and has a visible police presence, contributing to a secure environment.<br><br> Road accidents are infrequent, but it is important to exercise caution and adhere to traffic regulations when driving in Lucca."

facts["Cagliari"].safety="<b>Cagliari has a moderate crime rate</b>. The most common types of crimes in Cagliari include petty theft, pickpocketing, and property-related offenses. It is advisable to exercise caution and be aware of your surroundings, particularly in crowded areas and tourist spots. Taking precautions such as securing personal belongings, avoiding isolated areas at night, and using well-lit and populated streets can contribute to a safer experience in Cagliari."

facts["Perugia"].safety="<b>Perugia is considered a relatively safe city with a low crime rate</b>. Instances of petty theft and pickpocketing can occur, especially in crowded tourist areas, but they are relatively uncommon. The city maintains effective safety measures and has a visible police presence, contributing to a secure environment.<br><br> Road accidents are infrequent, but it is important to exercise caution and adhere to traffic regulations when driving in Perugia."

facts["Trento"].safety="<b>Trento is considered a safe city with a low crime rate</b>. Instances of petty theft and pickpocketing can occur, especially in crowded tourist areas, but they are relatively uncommon. The city maintains effective safety measures and has a visible police presence, contributing to a secure environment. Road accidents are infrequent, but it is important to exercise caution and adhere to traffic regulations when driving in Trento."

facts["Pescara"].safety="<b>Pescara offers a safe and secure environment with a low crime rate</b>. Instances of petty theft, pickpocketing, and property-related offenses are rare, contributing to a peaceful atmosphere for residents and visitors. The city maintains effective safety measures and has a visible police presence, which further enhances safety.<br><br> Road accidents are infrequent, but it is advisable to drive responsibly and follow traffic regulations when traveling in Pescara."

facts["Savona"].safety="<b>Savona is considered a relatively safe city with a low crime rate</b>. Instances of petty theft and pickpocketing can occur, especially in crowded tourist areas, but they are relatively uncommon. The city maintains effective safety measures and has a visible police presence, contributing to a secure environment.<br><br> Road accidents are infrequent, but it is important to exercise caution and adhere to traffic regulations when driving in Savona."

facts["Bolzano"].safety="<b>Bolzano has a relatively low overall crime rate, but property crimes are more prevalent</b>. Instances of petty theft and property-related offenses can occur, which may affect residents and visitors. It is recommended to take necessary precautions such as securing personal belongings and being aware of your surroundings.<br><br> The city maintains effective safety measures and has a visible police presence.<br><br> Road accidents are infrequent, but it is advisable to drive responsibly and follow traffic regulations when traveling in Bolzano."

facts["Messina"].safety="<b>Messina is generally a safe city for tourists, but it has a moderate crime rate due to mafia activity</b>. The majority of crimes in Messina are related to mafia operations rather than directly targeting tourists. However, it is still important to exercise caution and be aware of your surroundings, especially in crowded areas and tourist spots.<br><br> Taking precautions such as securing personal belongings, avoiding isolated areas at night, and using well-lit and populated streets can contribute to a safer experience in Messina."

facts["Venezia"].safety="<b>Venice is generally a safe city for residents and tourists</b>.<br><br> However, like any popular tourist destination, there are certain safety considerations to keep in mind.<br><br> The most common types of crime in Venice are pickpocketing and bag snatching, especially in crowded tourist areas such as St. Mark's Square and on public transportation.<br><br> Travelers should be cautious of their belongings and avoid displaying valuable items openly. It is advisable to stay in well-lit and populated areas, particularly at night. Venice has a low murder rate, and road accidents are infrequent due to the absence of cars in most parts of the city.<br><br> Nonetheless, it is important to be mindful of your surroundings and exercise caution to ensure a safe visit to Venice."

facts["Verona"].safety="<b>Verona is considered a relatively safe city with a low crime rate</b>. The city maintains a secure environment for residents and visitors.<br><br> Instances of crime in Verona are generally limited to petty theft and pickpocketing, which can occur in crowded tourist areas or on public transportation. Travelers should take basic precautions such as securing personal belongings and being aware of their surroundings. Verona has a low murder rate, and road accidents are infrequent. However, it is always recommended to follow traffic rules and exercise caution when crossing roads."

facts["Padova"].safety="<b>Padua is an extremely safe city and ranks as one of the most secure parts of Italy</b>.<br><br> However, like all places, there are some areas that should be avoided, such as the Stanga/Via Venezia and Centro Giotto region. There are also higher crime rates close to the Stazione di Padova, the city's main railway station. The majority of incidents in Padua are related to petty theft and pickpocketing, particularly in crowded areas and public transportation. It is advisable to take basic precautions such as keeping an eye on personal belongings and avoiding isolated or poorly lit areas at night. Padua has a low murder rate, and road accidents are relatively infrequent.<br><br> Nonetheless, it is always important to remain vigilant and aware of your surroundings."

facts["Mantova"].safety="<b>Mantua is known as La Bella Addormentata, a sleeping beauty that hasn't changed since the Middle Ages</b>. The city is generally considered safe for residents and visitors.<br><br> However, it is always advisable to exercise caution and common sense when exploring any destination. Mantua has a lower crime rate compared to more populated areas, and incidents of theft or other crimes are relatively rare.<br><br> Nonetheless, it is recommended to take basic precautions such as securing personal belongings and staying in well-lit and populated areas, especially at night. Mantua has a low murder rate, and road accidents are infrequent.<br><br> Overall, it provides a safe environment for tourists to enjoy."

facts["Trieste"].safety="<b>Trieste is considered a relatively safe city with a low crime rate</b>.<br><br> The city maintains a secure environment for residents and visitors.<br><br> Instances of crime in Trieste are generally limited to petty theft and pickpocketing, which can occur in crowded tourist areas or on public transportation. Travelers should take basic precautions such as securing personal belongings and being aware of their surroundings. Trieste has a low murder rate, and road accidents are infrequent. However, it is always recommended to follow traffic rules and exercise caution when crossing roads."

facts["Ferrara"].safety="<b>Ferrara is known for being a safe city with a low crime rate</b>. <br><br>The city provides a secure environment for residents and tourists.<br><br> Instances of crime in Ferrara are relatively rare, with the most common offenses being related to property crimes such as theft and burglary. It is advisable to take basic precautions such as securing personal belongings and being aware of your surroundings, especially in crowded tourist areas. Ferrara has a low violent crime rate, and road accidents are relatively infrequent. Nonetheless, it is always important to follow traffic rules and stay cautious while moving around the city."

facts["Sassari"].safety="<b>Sassari is generally considered a safe city to visit</b>. <br><br>While it maintains a relatively low crime rate, like any urban area, instances of petty theft and pickpocketing can occur, especially in crowded places and public transportation. Travelers are advised to take basic precautions such as keeping personal belongings secure and remaining vigilant in tourist areas. Sassari has a moderate level of street crime, but violent crimes are relatively rare. Road accidents are infrequent, but it's important to adhere to traffic regulations and exercise caution while driving."

facts["Sud Sardegna"].safety="<b>The Sud Sardegna region is known for its overall safety</b>. <br><br>While some areas may experience higher crime rates, the region as a whole maintains a secure environment for residents and tourists. Instances of crime in Sud Sardegna are generally low, with petty theft being the most common type of offense. It is advisable to take basic precautions such as keeping personal belongings secure and being aware of your surroundings, particularly in crowded tourist areas. Sud Sardegna has a low violent crime rate, and road accidents are relatively infrequent. However, it's always recommended to follow traffic rules and exercise caution while exploring the region."

facts["Oristano"].safety="<b>Oristano is considered a relatively safe city with a low crime rate</b>.<br><br> The city maintains a secure environment for its residents and visitors.<br><br> Instances of crime in Oristano are generally limited to petty theft and pickpocketing, which can occur in crowded areas or tourist spots. Travelers should take basic precautions such as securing personal belongings and being aware of their surroundings. Oristano has a low violent crime rate, and road accidents are infrequent. However, it's always important to follow traffic rules and exercise caution while moving around the city."

facts["Bologna"].safety="<b>Bologna is generally considered a safe city with a moderate crime rate</b>.<br><br> Instances of petty theft and pickpocketing can occur, particularly in crowded areas and tourist spots, so it is advisable to remain vigilant and keep personal belongings secure. The city has been associated with drug-related issues, including drug use and trafficking. Bologna maintains effective safety measures and has a visible police presence, contributing to a secure environment for residents and visitors. Road accidents are relatively infrequent, but it is important to exercise caution and adhere to traffic regulations when driving in Bologna."

facts["Ferrara"].safety="<b>Ferrara is known for its safety and low crime rate</b>.<br><br> Instances of petty theft and pickpocketing are uncommon, ensuring a secure experience for residents and visitors.<br><br> Ferrara benefits from effective safety measures and a reliable police presence. Road accidents are relatively infrequent, but it is important to exercise caution and follow traffic regulations when driving in Ferrara."

facts["Forlì-Cesena"].safety="<b>Forlì-Cesena offers a safe and secure environment with a low crime rate</b>. Incidents of petty theft and pickpocketing are rare, contributing to a peaceful atmosphere for residents and visitors. The province maintains effective safety measures and has a visible police presence. Road accidents are infrequent, but it is advisable to drive responsibly and follow traffic regulations."

facts["Ancona"].safety="<b>Ancona is generally considered a safe city with a moderate crime rate</b>. <br><br>The city maintains a relatively secure environment for its residents and visitors. Instances of petty theft and pickpocketing can occur, especially in crowded areas and tourist spots. It is advisable to remain vigilant and take necessary precautions to secure personal belongings. Ancona has local law enforcement agencies, such as the Prefecture, actively working to ensure public safety and combat crime. Road accidents are relatively infrequent, but it is important to exercise caution and follow traffic rules while driving in Ancona."

facts["Macerata"].safety="<b>Macerata is regarded as a safe city with a low crime rate</b>. <br><br>The province of Macerata has been recognized as one of the safest provinces in Italy. While specific data on crime rates in Macerata are not available, the local law enforcement, such as the State Police, is committed to maintaining public order and security. Efforts are made to address urban decay, widespread crime, and youth discomfort through urban security services. Macerata has seen instances of organized crime in the past, but initiatives have been undertaken to combat it and maintain safety. As with any city, it is recommended to exercise general caution and be aware of your surroundings."

facts["Pesaro e Urbino"].safety="<b>Pesaro e Urbino is considered one of the safest provinces in Italy with a low crime rate</b>. <br><br>The province maintains a secure environment for its residents and visitors. Instances of crime, particularly violent crime, are relatively rare in Pesaro e Urbino. The local authorities prioritize public safety and employ measures to prevent and combat crime. As with any area, it is recommended to exercise basic precautions, such as safeguarding personal belongings and being mindful of your surroundings. Road accidents are infrequent, but it is essential to follow traffic regulations and drive responsibly."

}
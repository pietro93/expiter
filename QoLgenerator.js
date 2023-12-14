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
var selection = ["Agrigento","Bari","Rome","Milan","Naples"]

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
            if (selection.includes(en(province.Name))){
                console.log(en(province.Name)+" selected")
            var fileName = 'blog/living-in-'+en(province.Name).replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
            
            const dom = new jsdom.JSDOM(
            "<html lang='en'>"+
            '<head><meta charset="utf-8">'+
            '<link rel="canonical" href="https://expiter.com/blog/living-in-'+fileName+'/"/>'+
            '<link rel="alternate" hreflang="en" href="https://expiter.com/blog/living-in-'+fileName+'/" />'+
            '<link rel="alternate" hreflang="it" href="https://expiter.com/it/vivere-a-'+fileName+'/" />'+
            '<meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale-1,user-scalable=0">'+
            '<script type="text/javascript" src="https://expiter.com/jquery3.6.0.js" defer></script>'+
            '<script type="text/json" src="https://expiter.com/dataset.json"></script>'+
            '<script type="text/javascript" src="https://expiter.com/script.js" defer></script>'+
            '<script type="text/javascript" src="https://expiter.com/bootstrap-toc.js" defer></script>'+
            '<link rel="stylesheet" href="https://expiter.com/fonts.css" media="print" onload="this.media=\'all\'"></link>'+
            '<link rel="stylesheet" href="https://expiter.com/bulma.min.css">'+
            '<link rel="stylesheet" href="https://expiter.com/style.css">'+
            
            '<meta name="description" content="What is it like to live in '+en(province.Name)+', Italy for expats and digital nomads. '+en(province.Name)+' quality of life, cost of living, safety and more." />'+
	          '<meta name="keywords" content="'+en(province.Name)+' italy, '+en(province.Name)+' expat,'+en(province.Name)+' life,'+en(province.Name)+' digital nomad" />'+
            "<title>What is it like to live in "+en(province.Name)+", Italy </title>"+
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
            '<div class="hero" style="background-image:url(\'https://expiter.com/img/blog/vivere-a-'+en(province.Name).toLowerCase+'.webp\')" '+'title="What is life in '+en(province.Name)+', Italy like?"'+'></div>'+
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
            '<section id="overview"><h2>Living in '+en(province.Name)+'</h2><span id="intro"></span></section>'+
            '<section id="generalinfo"><h2>What is '+en(province.Name)+' like?</h2><span id="info"></span></section>'+
            '<section id="costofliving"><h2>Cost of living in '+en(province.Name)+'</h2><span id="CoL"></span></section>'+
            '<section id="povertyandsafety"><h2>Is '+en(province.Name)+' safe?</h2><span id="safety"></span></section>'+
            '<section id="prosandcons"><h2>Pros and cons of life in '+en(province.Name)+'</h2><span id="ProsAndCons"></span></section>'+
            '<section id="faqs"><h2>FAQs</h2><span id="faqs"></span></section>'+
            '<section id="Discover"><h2>Discover</h2><span id="promo"></span></section>'+
            '</div>'+
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
        $("#overview").append(facts[city].introduction)
        $("#overview").append(facts[city].overview)
        $("#overview").append(info.disclaimer)
        $("#overview").append(map)
        $("#overview").append(separator)
        $("#generalinfo").append(facts[city].culture)
        $("#generalinfo").append("<h3>Climate<h3>")
        $("#generalinfo").append(facts[city].climate)
        $("#generalinfo").append("<h3>Economy<h3>")
        $("#generalinfo").append(facts[city].economy)
        $("#generalinfo").append("<h3>Education<h3>")
        $("#generalinfo").append(facts[city].education)
        $("#generalinfo").append('<center><figure class="column is-6 related">'+
        '<img title="'+en(province.Name)+'" load="lazy" src="'+
        'https://expiter.com/img/blog/vivere-a-'+en(province.Name).toLowerCase+'.webp" '+
        'alt="Life in '+en(province.Name)+', '+en(province.Region)+'"></img>'+
        '<figcaption>'+en(province.Name)+", "+en(province.Region)+"</figcaption></figure></center>")
        $("#generalinfo").append(separator)
        $("#costofliving").append(facts[city].costofliving)
        $("#costofliving").append(separator)
        $("#povertyandsafety").append(facts[city].safety)
        $("#prosandcons").append(facts[city].prosandconstable)
        $("#prosandcons").append("<h3>Advantages of Living in "+city+" <h3>")
        $("#prosandcons").append(facts[city].pros)
        $("#prosandcons").append("<h3>Disadvantages of Living in "+city+" <h3>")
        $("#prosandcons").append(facts[city].cons)
        $("#prosandcons").append('<center><figure class="column is-6 related">'+
        '<img title="'+en(province.Name)+'" load="lazy" src="'+
        'https://expiter.com/img/blog/vita-a-'+en(province.Name).toLowerCase+'.webp" '+
        'alt="Pros and cons of living in '+en(province.Name)+', Italy"></img>'+
        '<figcaption>'+en(province.Name)+", "+en(province.Region)+"</figcaption></figure></center>")
        $("#prosandcons").append(separator)
        $("#faqs").append("<h3>What is "+city+" like for foreigners? <h3>")
        $("#faqs").append(facts[city].forExpats)
        $("#faqs").append("<h3>What is "+city+" like for students? <h3>")
        $("#faqs").append(facts[city].forStudents)
        $("#faqs").append("<h3>What is "+city+" like for women? <h3>")
        $("#faqs").append(facts[city].forWomen)
        $("#faqs").append("<h3>What is "+city+" like for LGBTQ people? <h3>")
        $("#faqs").append(facts[city].forLGBTQ)
        $("#promo").append(info.viator)
        $("#promo").append(separator)
        $("#promo").append(info.getyourguide)
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
        info.povertyandsafety=facts[name].safety;
      
        info.CoL="";
      
        info.climate=""
        
        info.lgbtq="<b>"+en(province.Name)+" is "+(province['LGBT-friendly']>7.9?"one of the most LGBTQ-friendly provinces in Italy":(province['LGBT-friendly']>6?"somewhat LGBTQ+ friendly by Italian standards":"not particularly LGBTQ-friendly as far as Italian provinces go"))+
        ".</b> "+(province.LGBTQAssociations>1?"There are "+province.LGBTQAssociations+" local LGBTQ+ associations (Arcigay) in this province.":(province.LGBTQAssociations==1?"There is 1 LGBTQ+ association (Arcigay) in this province.":""))


        info.disclaimer='</br></br><center><span id="disclaimer">This page contains affiliate links. As part of the Amazon Associates and Viator Partner programmes, we may earn a commission on qualified purchases.</span></center>'
        
        info.map='</br><center class="map"><iframe id="ggmap" src="https://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q='+en(province.Name)+'&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>'+
        'Search for: '+
        
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+en(province.Name)+'+Province+Of+'+province.Name+'+Attractions&output=embed")\' target="_blank"><b><ej>🎭</ej>Attractions</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+en(province.Name)+'+Province+Of+'+province.Name+'+Museums&output=embed")\' target="_blank"><b><ej>🏺</ej>Museums</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+en(province.Name)+'+Province+Of+'+province.Name+'+Restaurants&output=embed")\' target="_blank"><b><ej>🍕</ej>Restaurants</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+en(province.Name)+'+Province+Of+'+province.Name+'+Bars&output=embed")\' target="_blank"><b><ej>🍺</ej>Bars</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+en(province.Name)+'+Province+Of+'+province.Name+'+Beaches&output=embed")\' target="_blank"><b><ej>🏖️</ej>Beaches</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+en(province.Name)+'+Province+Of+'+province.Name+'+Hikinge&output=embed")\' target="_blank"><b><ej>⛰️</ej>Hikes</b></a> '+
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
     
      facts[en(province["Name"])]={}; //initialize "facts" dictionary with each province
      facts[en(province["Name"])].snippet=
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
      case "Napoli":return"Naples";
      default: return word;
    }
  }

  function populateFacts(){

facts["Agrigento"].overview=""

facts.Milan.introduction="Milan is one of the most popular and dynamic cities in Italy, attracting millions of visitors and expats every year.<br><br>It is the economic, financial and fashion capital of the country, offering a variety of opportunities and experiences for those who live there.<br><br>Living in Milan as an expat can be both exciting and challenging. You can enjoy the benefits of living in a vibrant and cosmopolitan city that offers a lot of opportunities and experiences, but the price for this is that the city has the highest cost of living in the entire country."
facts.Milan.overview="Milan is the second most populous city in Italy, after Rome, with about 1.4 million inhabitants.<br><br>It is also the core of the wider Milan metropolitan area, which is estimated to have between 8.2 million and 12.5 million people.<br><br>Milan is the economic capital of Italy and a global financial centre. It is known for its industries, especially in the fields of fashion, design, media, and commerce.<br><br>It has a GDP of about €400 billion ($493 billion), making it the richest city in Italy and one of the richest in Europe."
facts.Milan.costofliving="The cost of living in Milan is high compared to other Italian cities. It is the most expensive city in Italy and one of the most expensive in Europe.<br><br>A family of four estimated monthly costs are €5,036 without rent, and a single person estimated monthly costs are €3,007 without rent.<br><br>Rent in Milan is also high, especially in the city centre. For example, a one-bedroom apartment in the city centre costs about €1,000 per month, while a three-bedroom apartment costs about €2,000 per month3.<br><br>The prices of food, transportation, utilities, and entertainment are also higher than the national average."
facts.Milan.culture="Milan is a cosmopolitan and multicultural city, with a diverse and vibrant population.<br><br>It is home to people from different countries, cultures and backgrounds, who contribute to the city’s social and artistic life.<br><br>Milan is also a cultural and artistic center, with a rich history and heritage.<br><br>It hosts many museums, galleries, theaters, festivals and events, covering various fields of interest, such as art, music, literature, cinema, fashion and design.<br><br>Some of the most famous cultural attractions in Milan are the Pinacoteca di Brera, the Museo del Novecento, the Triennale, the Palazzo Reale, the Museo Poldi Pezzoli and the Museo Nazionale della Scienza e della Tecnologia."
facts.Milan.economy="Milan is the economic engine of Italy, and one of the main financial and business hubs in Europe.<br><br>It has a diversified and dynamic economy, based on sectors such as banking, insurance, fashion, design, media, publishing, tourism, trade and services.<br><br>It is also a leading center for innovation and research, hosting several universities, colleges and institutes, such as the Bocconi University, the Politecnico di Milano, the Università Cattolica del Sacro Cuore and the Università degli Studi di Milano.<br><br>Milan offers many opportunities for work and career development, especially for highly skilled and qualified professionals.<br><br>However, it is also a very competitive and demanding city, where the work ethic is strong and the cost of living is high.<br><br>Milan is one of the richest cities in Italy and Europe, but it also faces some social and economic challenges, such as poverty, inequality, unemployment and immigration.<br><br>According to the latest data, about 15% of the population in Milan lives below the poverty line, and about one in ten is unemployed.<br><br>The city also hosts a large number of immigrants, mostly from Eastern Europe, Africa and Asia, who often face difficulties in integrating and accessing basic services.<br><br>The city authorities have implemented various policies and initiatives to address these issues, such as social housing, welfare programs, education and training, cultural integration and security."
facts.Milan.education="Milan is a student city, with a large and diverse student population.<br><br>It has several public and private universities and colleges, offering a wide range of courses and degrees, from humanities and social sciences to engineering and medicine.<br><br>Some of the most prestigious and renowned academic institutions in Milan are the Bocconi University, the Politecnico di Milano, the Università Cattolica del Sacro Cuore and the Università degli Studi di Milano.<br><br>The city also has many international schools, catering to the needs of expat families and children.<br><br>Some of the most popular and reputable international schools in Milan are the American School of Milan, the British School of Milan, the International School of Milan and the St. Louis School."
facts.Milan.safety="Milan is a safe city for tourists and expats, with a relatively low crime rate compared to other major cities in Italy and Europe.<br><br>However, some precautions are recommended, especially in certain areas and situations.<br><br>The most common crimes in Milan are pickpocketing, bag-snatching, scams and vandalism, which usually target crowded and touristy places, such as the city center, the railway station, the metro and the buses.<br><br>To avoid these risks, it is advisable to be vigilant and careful, to keep your valuables close and secure, to avoid suspicious or aggressive people, and to report any incident to the police.<br><br>Milan is also generally safe at night, but it is better to avoid walking alone in dark and isolated streets, and to stick to the well-lit and busy areas."
facts.Milan.climate="Living in Milan means experiencing four seasons, each with its own charm and challenges.<br><br>In the summer, it’s hot and humid, and you can enjoy the sun and the nightlife.<br><br>In the winter, it’s cold and foggy, and you can admire the snow and the decorations.<br><br>The spring and the autumn are mild and pleasant, with some rain and some sun.<br><br>You can see the flowers and the leaves, and enjoy the culture and the art.<br><br>Milan is not very sunny or rainy by Italian standards, but it still has some clear and bright days, and some wet and cloudy days.<br><br>The weather can be changeable and unpredictable, so you need to be prepared for anything."
facts.Milan.pros="Overall, Milan is a vibrant and cosmopolitan city, with a rich culture and history.<br><br>You can explore its many attractions, such as museums, art galleries, theatres, and festivals, and immerse yourself in its culture.<br><br>It is also a fashion capital, with many famous brands and designers based in the city, and a lot of shopping opportunities.<br><br>The city has a good public transportation system, which makes it easy to get around and to other major European cities, such as Paris, Berlin, and Zurich.<br><br>Not only that, but you can also enjoy its green spaces and parks, where you can relax and connect with nature, or its lakes and mountains, where you can have fun and adventure.<br><br>Milan is a multicultural and diverse city, where you can meet people from different backgrounds and sectors, such as banking, industrial and design.<br><br>English is more widely spoken here than in other Italian cities, which makes it easier for you to communicate and find work.<br><br>The city has a dynamic and innovative economy, which offers you many opportunities for career growth and development.<br><br>Milan has a high quality of life, with excellent education, healthcare, and social services, which ensure your well-being and happiness."
facts.Milan.cons="Milan can be expensive and challenging to live in.<br><br>You can face difficulties in finding affordable housing, especially in the city centre, where the prices are very high.<br><br>You can also spend a lot on food, utilities, entertainment, and healthcare, which are higher than the national average.<br><br>The city can be crowded and noisy, especially during peak tourist season, when it is full of visitors and events.<br><br>It can also be polluted, with poor air quality and traffic congestion, which can affect your health and mood.<br><br>Milan is not very friendly to foreigners, and the language barrier can be a challenge, especially if you don’t speak Italian.<br><br>You can also have trouble making friends and integrating into the local community, which can make you feel lonely and isolated.<br><br>Moreover, the city can have a fast-paced and competitive lifestyle, which can be stressful and exhausting, especially if you have to balance work and personal life.<br><br>In addition to that, compared to other parts of Italy, Milan can have a cold and humid climate, with foggy and rainy winters, which can make you feel gloomy and depressed."
facts.Milan.prosandconstable="<center><table class='table center'>   <tr>     <th>Pros</th>     <th>Cons</th>   </tr>   <tr>     <td>Vibrant and cosmopolitan city</td>     <td>Expensive city</td>   </tr>   <tr>     <td>Rich culture and history</td>     <td>Crowded and noisy</td>   </tr>   <tr>     <td>Fashion capital</td>     <td>Polluted</td>   </tr>   <tr>     <td>Well-developed public transportation</td>     <td>Not very friendly to foreigners</td>   </tr>   <tr>     <td>Close to other major European cities</td>     <td>Language barrier</td>   </tr>   <tr>     <td>Many green spaces and parks</td>     <td>Hard to make friends and integrate</td>   </tr>   <tr>     <td>Surrounded by beautiful lakes and mountains</td>     <td>Fast-paced and competitive lifestyle</td>   </tr>   <tr>     <td>Multicultural and diverse</td>     <td>Cold and humid climate</td>   </tr>   <tr>     <td>English is more widespread</td>     <td></td>   </tr>   <tr>     <td>Dynamic and innovative economy</td>     <td></td>   </tr>   <tr>     <td>High quality of life</td>     <td></td>   </tr> </table></center>"
facts.Milan.forExpats="Milan is a vibrant and cosmopolitan city that attracts many expats from different countries and backgrounds.<br><br>It is the economic, financial and fashion capital of Italy, offering a variety of opportunities and experiences for those who live there.<br><br>Living in Milan as an expat can be both exciting and challenging. You can enjoy the benefits of living in a modern and dynamic city that offers a lot of culture, entertainment, shopping and gastronomy, but you also have to deal with the high cost of living, the language barrier, the bureaucracy and the traffic.<br><br>Some of the best areas for expats to live in Milan are Porta Nuova, Isola, Garibaldi, Brera and Navigli."
facts.Milan.forWomen="Milan is a great city for women who want to pursue their personal and professional goals.<br><br>It is a city that empowers women and offers them a lot of opportunities in various fields, especially in fashion, design, media and business.<br><br>Women in Milan can enjoy a high quality of life, a rich cultural scene, a diverse and inclusive society, and a safe and secure environment.<br><br>However, women in Milan also face some challenges, such as the gender pay gap, the glass ceiling, the work-life balance, and the social pressure to conform to certain standards of beauty and style."
facts.Milan.forStudents="Milan is a popular destination for students who want to study in Italy or abroad.<br><br>It is a city that offers a wide range of academic programs, from arts and humanities to engineering and sciences, from public and private universities to international and prestigious institutions.<br><br>Students in Milan can benefit from a stimulating and innovative learning environment, a lively and diverse student community, a rich and varied cultural offer, and a lot of opportunities for internships and career development.<br><br>However, students in Milan also have to cope with the high cost of living, the competitive and demanding academic standards, the limited availability of accommodation, and the complex bureaucracy and regulations."
facts.Milan.forLGBTQ="Milan is one of the most LGBTQ-friendly cities in Italy and Europe.<br><br>It is a city that celebrates diversity and inclusion, and that supports and protects the rights and freedoms of LGBTQ people.<br><br>LGBTQ people in Milan can enjoy a vibrant and colorful social scene, a large and active LGBTQ community, a lot of events and festivals, and a lot of resources and services.<br><br>However, LGBTQ people in Milan also have to face some challenges, such as discrimination, harassment, violence, and homophobia, especially in some conservative and religious sectors of the society."

facts.Rome.introduction="Rome is one of the oldest and most influential cities in the world, with a history that spans over 2,500 years.<br><br>It is the capital of Italy and the seat of the Roman Catholic Church, as well as a UNESCO World Heritage Site.<br><br>Living in Rome as an expat can be both rewarding and challenging. You can enjoy the beauty and culture of the city, but also face the difficulties of traffic, bureaucracy, and pollution.<br><br>Rome is a city of contrasts, where ancient monuments coexist with modern buildings, and where tradition and innovation blend together."
facts.Rome.overview="Rome is the most populous city in Italy, with about 2.8 million inhabitants.<br><br>It is also the core of the wider Rome metropolitan area, which is estimated to have between 4.2 million and 6.7 million people.<br><br>Rome is the political and administrative capital of Italy and a major cultural and tourist center. It is known for its landmarks, such as the Colosseum, the Pantheon, the Vatican, and the Trevi Fountain.<br><br>It has a GDP of about €200 billion ($246 billion), making it the fourth richest city in Italy and one of the largest economies in Europe."
facts.Rome.costofliving="The cost of living in Rome is high compared to other Italian cities, but lower than Milan. It is the second most expensive city in Italy and one of the most expensive in Europe.<br><br>A family of four estimated monthly costs are €4,000 without rent, and a single person estimated monthly costs are €2,400 without rent.<br><br>Rent in Rome is also high, especially in the city centre. For example, a one-bedroom apartment in the city centre costs about €800 per month, while a three-bedroom apartment costs about €1,600 per month.<br><br>The prices of food, transportation, utilities, and entertainment are also higher than the national average."
facts.Rome.culture="Rome is a historical and artistic city, with a rich and diverse population.<br><br>It is home to people from different countries, religions and backgrounds, who contribute to the city’s social and cultural life.<br><br>Rome is also a cultural and artistic center, with a long and glorious history and heritage.<br><br>It hosts many museums, galleries, theaters, festivals and events, covering various fields of interest, such as art, music, literature, cinema, religion and sports.<br><br>Some of the most famous cultural attractions in Rome are the Vatican Museums, the Sistine Chapel, the Roman Forum, the Capitoline Museums, the Borghese Gallery and the National Museum of Rome."
facts.Rome.economy="Rome is the political and administrative capital of Italy, and a major cultural and tourist center. It is known for its landmarks, such as the Colosseum, the Pantheon, the Vatican, and the Trevi Fountain.<br><br>It has a mixed and diversified economy, based on sectors such as public administration, services, tourism, commerce, media, entertainment, education, and research.<br><br>It is also a hub for innovation and creativity, hosting several universities, academies, and institutes, such as the Sapienza University of Rome, the LUISS University, the Rome University of Fine Arts, and the National Research Council.<br><br>Rome offers many opportunities for work and career development, especially for highly skilled and qualified professionals.<br><br>However, it is also a very expensive and congested city, where the quality of life is often affected by problems such as traffic, pollution, bureaucracy, and corruption.<br><br>Rome is one of the most visited cities in the world, but it also faces some social and economic challenges, such as poverty, inequality, unemployment, and immigration.<br><br>According to the latest data, about 14% of the population in Rome lives below the poverty line, and about 11% is unemployed.<br><br>The city also hosts a large number of immigrants, mostly from Eastern Europe, Africa, and Asia, who often face difficulties in integrating and accessing basic services.<br><br>The city authorities have implemented various policies and initiatives to address these issues, such as urban regeneration, social inclusion, cultural promotion, and security."
facts.Rome.education="Rome is a historical and artistic city, with a rich and diverse educational offer.<br><br>It has several public and private universities and colleges, offering a wide range of courses and degrees, from humanities and social sciences to engineering and medicine.<br><br>Some of the most prestigious and renowned academic institutions in Rome are the Sapienza University of Rome, the LUISS University, the Pontifical Gregorian University, and the John Cabot University.<br><br>The city also has many international schools, catering to the needs of expat families and children.<br><br>Some of the most popular and reputable international schools in Rome are the American Overseas School of Rome, the St. George’s British International School, the Marymount International School, and the Rome International School."
facts.Rome.safety="Rome is a relatively safe city to visit, with a moderate crime rate compared to other major cities in Italy and Europe.<br><br>However, some precautions are recommended, especially in certain areas and situations.<br><br>The most common crimes in Rome are pickpocketing, bag-snatching, scams, and vandalism, which usually target crowded and touristy places, such as the city center, the railway stations, the metro, and the buses.<br><br>To avoid these risks, it is advisable to be vigilant and careful, to keep your valuables close and secure, to avoid suspicious or aggressive people, and to report any incident to the police.<br><br>Rome is also generally safe at night, but it is better to avoid walking alone in dark and isolated streets, and to stick to the well-lit and busy areas.<br><br>Some of the areas to avoid in Rome are Tor Bella Monaca, Romanina, San Basilio, and Corviale, which are affected by drug trafficking, thefts, strong presence of immigrants, and delinquency."
facts.Rome.climate="Rome has a Mediterranean climate, with mild winters and warm to hot summers. It is located in central Italy, on a plain, and about 25 km (15 mi) from the Tyrrhenian Sea.<br><br>The average temperature of the coldest month (January) is of 7.7 °C (46 °F), that of the warmest months (July, August) is of 25.6 °C (78 °F).<br><br>Precipitation amounts to about 800 millimeters (31.5 inches) per year; the wettest season is autumn, followed by winter3 Here is the average precipitation4<br><br>In the summer, it’s hot and sunny, and you can enjoy the sun and the nightlife. However, there can be some afternoon thunderstorms, and the humidity can be high.<br><br>In the winter, it’s mild and quite rainy, but it can get cold at night. Sometimes, there can be some snowfalls, but they are usually light and rare.<br><br>The spring and the autumn are pleasant and variable, with some rain and some sun. You can see the flowers and the leaves, and enjoy the culture and the art.<br><br>Rome is not very sunny or rainy by Italian standards, but it still has some clear and bright days, and some wet and cloudy days.<br><br>The weather can be changeable and unpredictable, so you need to be prepared for anything."
facts.Rome.pros="Overall, Rome is a historical and artistic city, with a rich and diverse culture.<br><br>You can explore its many attractions, such as ancient monuments, museums, art galleries, churches, and fountains, and immerse yourself in its history.<br><br>It is also a religious capital, with the Vatican City and the Pope based in the city, and a lot of spiritual and cultural events.<br><br>The city has a good public transportation system, which makes it easy to get around and to other major Italian cities, such as Florence, Naples, and Venice.<br><br>Not only that, but you can also enjoy its food and wine, which are famous for their quality and variety, and reflect the regional and seasonal diversity of Italy.<br><br>Rome is a historical and artistic city, with a rich and diverse population.<br><br>You can meet people from different countries, religions, and backgrounds, who contribute to the city’s social and cultural life.<br><br>English is widely spoken here, especially among the younger generation, which makes it easier for you to communicate and find work.<br><br>The city has a stable and diversified economy, which offers you many opportunities for career growth and development.<br><br>Rome has a high quality of life, with excellent education, healthcare, and social services, which ensure your well-being and happiness."
facts.Rome.cons="Rome can be expensive and challenging to live in.<br><br>You can face difficulties in finding affordable housing, especially in the city centre, where the prices are very high.<br><br>You can also spend a lot on food, utilities, entertainment, and healthcare, which are higher than the national average.<br><br>The city can be crowded and noisy, especially during peak tourist season, when it is full of visitors and events.<br><br>It can also be polluted, with poor air quality and traffic congestion, which can affect your health and mood.<br><br>Rome is not very friendly to foreigners, and the language barrier can be a challenge, especially if you don’t speak Italian.<br><br>You can also have trouble making friends and integrating into the local community, which can make you feel lonely and isolated.<br><br>Moreover, the city can have a slow-paced and bureaucratic lifestyle, which can be frustrating and demotivating, especially if you have to deal with red tape and corruption.<br><br>In addition to that, compared to other parts of Italy, Rome can have a hot and dry climate, with scorching and humid summers, which can make you feel uncomfortable and exhausted."
facts.Rome.prosandconstable="<center><table class=‘table center’> <tr> <th>Pros</th> <th>Cons</th> </tr> <tr> <td>Historical and artistic city</td> <td>Expensive city</td> </tr> <tr> <td>Rich and diverse culture</td> <td>Crowded and noisy</td> </tr> <tr> <td>Religious capital</td> <td>Polluted</td> </tr> <tr> <td>Well-developed public transportation</td> <td>Not very friendly to foreigners</td> </tr> <tr> <td>Close to other major Italian cities</td> <td>Language barrier</td> </tr> <tr> <td>Food and wine</td> <td>Hard to make friends and integrate</td> </tr> <tr> <td>Historical and artistic population</td> <td>Slow-paced and bureaucratic lifestyle</td> </tr> <tr> <td>English is widely spoken</td> <td>Hot and dry climate</td> </tr> <tr> <td>Stable and diversified economy</td> <td></td> </tr> <tr> <td>High quality of life</td> <td></td> </tr> </table></center>"
facts.Rome.forExpats="Rome is a historic and cultural city that attracts many expats from different countries and backgrounds.<br><br>It is the capital and the largest city of Italy, offering a variety of opportunities and experiences for those who live there.<br><br>Living in Rome as an expat can be both rewarding and challenging. You can enjoy the benefits of living in a beautiful and ancient city that offers a lot of culture, history, art, and cuisine, but you also have to deal with the high cost of living, the language barrier, the bureaucracy and the pollution.<br><br>Some of the best areas for expats to live in Rome are Trastevere, Monti, Testaccio, and Prati."
facts.Rome.forWomen="Rome is a great city for women who want to pursue their personal and professional goals.<br><br>It is a city that values women and offers them a lot of opportunities in various fields, especially in education, culture, tourism and politics.<br><br>Women in Rome can enjoy a high quality of life, a rich cultural scene, a diverse and inclusive society, and a safe and secure environment.<br><br>However, women in Rome also face some challenges, such as the gender pay gap, the glass ceiling, the work-life balance, and the social pressure to conform to certain standards of beauty and style."
facts.Rome.forStudents="Rome is a popular destination for students who want to study in Italy or abroad.<br><br>It is a city that offers a wide range of academic programs, from arts and humanities to engineering and sciences, from public and private universities to international and prestigious institutions.<br><br>Students in Rome can benefit from a stimulating and innovative learning environment, a lively and diverse student community, a rich and varied cultural offer, and a lot of opportunities for internships and career development.<br><br>However, students in Rome also have to cope with the high cost of living, the competitive and demanding academic standards, the limited availability of accommodation, and the complex bureaucracy and regulations."
facts.Rome.forLGBTQ="As the capital and largest city in the country, Rome is one of the most LGBTQ-friendly cities in Italy.<br><br>It is a city that celebrates diversity and inclusion, and that supports and protects the rights and freedoms of LGBTQ people.<br><br>LGBTQ people in Rome can enjoy a vibrant and colorful social scene, a large and active LGBTQ community, a lot of events and festivals, and a lot of resources and services.<br><br>However, LGBTQ people in Rome also have to face some challenges, such as discrimination, harassment, violence, and homophobia, especially in some conservative and religious sectors of the society."


facts.Naples.introduction="Naples is one of the most ancient and fascinating cities in Italy, with a history that spans more than 2,800 years.<br><br>It is the cultural, artistic and culinary capital of the south, famous for its pizza, coffee, music and art.<br><br>Living in Naples as an expat can be both rewarding and challenging. You can enjoy the beauty and diversity of the city, its rich heritage and lively atmosphere, but you also have to deal with its problems, such as traffic, pollution, crime and bureaucracy.";
facts.Naples.overview="Naples is the third most populous city in Italy, after Rome and Milan, with about 909,000 inhabitants.<br><br>It is also the core of the wider Naples metropolitan area, which is estimated to have between 3.1 million and 12.5 million people.<br><br>Naples is the regional capital of Campania and a major port city. It is known for its historic and cultural attractions, especially in the fields of archaeology, architecture, music and literature.<br><br>It has a GDP of about €80 billion ($99 billion), making it the fourth richest city in Italy and one of the most important in the Mediterranean."
facts.Naples.costofliving="The cost of living in Naples is lower than in other Italian cities, especially in the north. It is one of the cheapest cities in Italy and in Europe.<br><br>A family of four estimated monthly costs are €2,500 without rent, and a single person estimated monthly costs are €1,400 without rent.<br><br>Rent in Naples is also low, especially outside the city centre. For example, a one-bedroom apartment in the city centre costs about €500 per month, while a three-bedroom apartment costs about €900 per month.<br><br>The prices of food, transportation, utilities, and entertainment are also lower than the national average."
facts.Naples.culture="Naples is a vibrant and diverse city, with a strong and distinctive identity. It is home to people from different origins, religions and backgrounds, who coexist and enrich the city’s social and cultural life.<br><br>Naples is also a UNESCO World Heritage Site, with a wealth of monuments, churches, palaces, museums, and archaeological sites. It is the birthplace of many famous artists, writers, musicians and actors, such as Caravaggio, Giambattista Vico, Eduardo De Filippo, Sophia Loren and Enrico Caruso.<br><br>Some of the most famous cultural attractions in Naples are the National Archaeological Museum, the Royal Palace, the Castel dell’Ovo, the San Carlo Theatre, the Capodimonte Museum and the Catacombs of San Gennaro."
facts.Naples.economy="Naples is the largest city in southern Italy, and one of the oldest and most historic cities in Europe.<br><br>It has a mixed and complex economy, based on sectors such as tourism, commerce, industry, agriculture, fishing and services.<br><br>It is also a cultural and artistic hub, hosting many museums, monuments, churches, theaters, and festivals, such as the famous San Gennaro feast.<br><br>Naples offers a vibrant and lively atmosphere, with a rich and diverse cuisine, music, and traditions.<br><br>However, it is also a city of contrasts and challenges, where poverty, unemployment, corruption, crime and pollution are widespread.<br><br>According to the latest data, about 25% of the population in Naples lives below the poverty line, and about 20% is unemployed.<br><br>The city also suffers from a lack of infrastructure, public services, and urban planning, which affect its quality of life and development.<br><br>The city authorities have launched several projects and initiatives to improve the situation, such as urban regeneration, social inclusion, environmental protection and economic growth."
facts.Naples.education="Naples is an academic city, with a long and prestigious tradition of learning and research.<br><br>It has several public and private universities and colleges, offering a variety of courses and degrees, from law and economics to engineering and medicine.<br><br>Some of the most famous and respected academic institutions in Naples are the University of Naples Federico II, the oldest public university in the world, the University of Naples Parthenope, the University of Naples L’Orientale, and the University of Naples Suor Orsola Benincasa.<br><br>The city also has some international schools, serving the needs of foreign families and children.<br><br>Some of the most well-known and reputable international schools in Naples are the International School of Naples, the American International School of Naples, and the British School of Naples."
facts.Naples.safety="Naples is a relatively safe city for tourists and expats, with a lower crime rate than other large cities in Italy and Europe.<br><br>However, some caution is advised, especially in some areas and situations.<br><br>The most common crimes in Naples are petty theft, fraud, and extortion, which usually target busy and touristy places, such as the historic center, the port, the airport, and the train station.<br><br>To avoid these risks, it is recommended to be alert and careful, to keep your valuables hidden and secure, to avoid shady or aggressive people, and to report any incident to the police.<br><br>Naples is also generally safe at night, but it is better to avoid wandering alone in dark and deserted streets, and to stick to the main and crowded areas."
facts.Naples.climate="Living in Naples means enjoying a Mediterranean climate, with mild winters and hot summers.<br><br>In the winter, it’s cool and rainy, and you can see the snow-capped Mount Vesuvius.<br><br>In the summer, it’s warm and sunny, and you can swim in the sea and visit the nearby islands.<br><br>The spring and the autumn are temperate and pleasant, with some showers and some breeze.<br><br>You can admire the flowers and the fruits, and explore the culture and the history.<br><br>Naples is quite sunny and rainy by Italian standards, but it also has some cloudy and windy days.<br><br>The weather can be variable and unpredictable, so you need to be ready for anything."
facts.Naples.pros="Naples is a charming and historic city, with a rich culture and heritage.<br><br>You can discover its many attractions, such as castles, churches, museums, and monuments, and learn about its ancient and modern history.<br><br>It is also a culinary paradise, with some of the best pizza, pasta, seafood, and desserts in the world, and a lot of local specialties.<br><br>The city has a lively and friendly atmosphere, with a lot of music, art, and festivals, and a strong sense of community.<br><br>Moreover, Naples has a strategic location near some of the most popular tourist destinations in Italy, such as Pompeii, the Amalfi Coast, Capri, and Mount Vesuvius.<br><br>Naples is a diverse and multicultural city, where you can encounter people from different backgrounds and origins, such as African, Asian, and Middle Eastern.<br><br>Italian is the main language spoken here, but you can also find some people who speak English, French, or Spanish, especially in the tourist areas.<br><br>The city has a low cost of living, which makes it affordable and accessible for many people, especially compared to other Italian cities.<br><br>Naples has a warm and sunny climate, with mild winters and hot summers, which can make you feel happy and energetic."
facts.Naples.cons="Naples can be chaotic and challenging to live in.<br><br>You can face difficulties in finding decent housing, especially in the city centre, where the conditions are often poor and unsafe.<br><br>You can also encounter problems with sanitation, waste management, and public services, which are often inefficient and unreliable.<br><br>The city can be dangerous and violent, especially in some areas, where crime, corruption, and mafia are prevalent.<br><br>It can also be noisy and stressful, especially during peak traffic hours, when the streets are full of cars, scooters, and buses.<br><br>Naples is not very welcoming to foreigners, and the cultural differences can be a barrier, especially if you don’t speak Italian.<br><br>You can also struggle to find work and opportunities, as the city has a high unemployment rate and a stagnant economy.<br><br>Naples has a low quality of life, with poor education, healthcare, and social services, which can affect your well-being and satisfaction.<br><br>In addition to that, compared to other parts of Italy, Naples can have a polluted and smoggy environment, which can harm your health and mood."
facts.Naples.prosandconstable="<center><table class=‘table center’> <tr> <th>Pros</th> <th>Cons</th> </tr> <tr> <td>Charming and historic city</td> <td>Chaotic city</td> </tr> <tr> <td>Rich culture and heritage</td> <td>Difficult to find decent housing</td> </tr> <tr> <td>Culinary paradise</td> <td>Problems with sanitation, waste management, and public services</td> </tr> <tr> <td>Lively and friendly atmosphere</td> <td>Dangerous and violent</td> </tr> <tr> <td>Strategic location near popular tourist destinations</td> <td>Noisy and stressful</td> </tr> <tr> <td>Diverse and multicultural</td> <td>Not very welcoming to foreigners</td> </tr> <tr> <td>Some people speak English, French, or Spanish</td> <td>Hard to find work and opportunities</td> </tr> <tr> <td>Low cost of living</td> <td>Low quality of life</td> </tr> <tr> <td>Warm and sunny climate</td> <td>Polluted and smoggy environment</td> </tr> <tr> <td></td> <td></td> </tr> <tr> <td></td> <td></td> </tr> </table></center>"
facts.Naples.forExpats="Naples is a historic and lively city that attracts many expats who are looking for a different and authentic experience of Italy.<br><br>It is the cultural, artistic and culinary capital of southern Italy, offering a variety of attractions and activities for those who live there.<br><br>Living in Naples as an expat can be both rewarding and challenging. You can enjoy the benefits of living in a warm and friendly city that offers a lot of history, beauty, music and pizza, but you also have to deal with the low quality of services, the pollution, the crime and the chaos.<br><br>Some of the best areas for expats to live in Naples are Chiaia, Vomero, Posillipo and the historic center."
facts.Naples.forWomen="Naples is a fascinating city for women who want to explore their personal and professional potential.<br><br>It is a city that inspires women and offers them a lot of opportunities in various fields, especially in education, health, tourism and social work.<br><br>Women in Naples can enjoy a high quality of life, a vibrant cultural scene, a supportive and diverse society, and a relaxed and fun environment.<br><br>However, women in Naples also face some challenges, such as the patriarchal culture, the domestic violence, the lack of childcare facilities, and the stereotypes and prejudices."
facts.Naples.forStudents="Naples is an attractive destination for students who want to study in Italy or abroad.<br><br>It is a city that offers a wide range of academic programs, from humanities and social sciences to natural and applied sciences, from public and private universities to ancient and prestigious institutions.<br><br>Students in Naples can benefit from a rich and stimulating learning environment, a dynamic and diverse student community, a splendid and varied cultural offer, and a lot of opportunities for volunteering and networking.<br><br>However, students in Naples also have to cope with the low quality of infrastructure, the overcrowded and underfunded facilities, the limited availability of scholarships, and the bureaucratic and corrupt system."
facts.Naples.forLGBTQ="Naples is one of the most LGBTQ-friendly cities in southern Italy and the Mediterranean.<br><br>It is a city that embraces diversity and inclusion, and that respects and promotes the rights and freedoms of LGBTQ people.<br><br>LGBTQ people in Naples can enjoy a lively and colorful social scene, a large and active LGBTQ community, a lot of events and festivals, and a lot of resources and services.<br><br>However, LGBTQ people in Naples also have to face some challenges, such as the social stigma, the legal discrimination, the hate crimes, and the religious intolerance, especially in some rural and traditional areas of the region."

facts.Bari.introduction="Bari is a charming coastal city situated in the heel of Italy’s boot. It is the capital of the Puglia region and a hub for trips around the Mediterranean Sea.<br><br>It is a hidden gem that offers a plethora of cultural and historical treasures. With its breathtaking views of the Adriatic Sea, rich architectural heritage, and delectable cuisine, Bari has become an increasingly popular destination for travelers seeking an authentic Italian experience.<br><br>Living in Bari as an expat can be both enjoyable and stimulating. You can appreciate the beauty and diversity of the city, its friendly and hospitable people, and its lively and fun atmosphere, but you also have to adapt to its pace and customs, such as its siesta and its dialect.";
facts.Bari.overview="Bari is the largest urban and metro area on the Adriatic. It is located in Southern Italy, at a more northerly latitude than Naples, further south than Rome.<br><br>It has a population of about 316,000 inhabitants, over 117 square kilometers (45 sq mi), while the urban area has 750,000 inhabitants. The metropolitan area has 1.3 million inhabitants.<br><br>Bari is the regional capital of Puglia and a major port city. It is known for its historic and cultural attractions, especially in the fields of archaeology, architecture, music and literature.<br><br>It has a GDP of about €80 billion ($99 billion), making it the fourth richest city in Italy and one of the most important in the Mediterranean.";
facts.Bari.costofliving="The cost of living in Bari is lower than in other Italian cities, especially in the north. It is one of the cheapest cities in Italy and in Europe.<br><br>A family of four estimated monthly costs are €2,200 without rent, and a single person estimated monthly costs are €1,200 without rent.<br><br>Rent in Bari is also low, especially outside the city centre. For example, a one-bedroom apartment in the city centre costs about €450 per month, while a three-bedroom apartment costs about €800 per month.<br><br>The prices of food, transportation, utilities, and entertainment are also lower than the national average."
facts.Bari.culture="Bari is a lively and diverse city, with a strong and distinctive identity. It is home to people from different origins, religions and backgrounds, who coexist and enrich the city’s social and cultural life.<br><br>Bari is also a UNESCO World Heritage Site, with a wealth of monuments, churches, palaces, museums, and archaeological sites. It is the birthplace of many famous artists, writers, musicians and actors, such as Nicolaus of Bari, Giovan Battista Pergolesi, Domenico Modugno and Antonio Cassano.<br><br>Some of the most famous cultural attractions in Bari are the Basilica of San Nicola, the Castello Normanno-Svevo, the Petruzzelli Theatre, the Pinacoteca Provinciale and the Trulli of Alberobello."
facts.Bari.economy="Bari is the capital city of the Apulia region, and one of the main economic centers of southern Italy.<br><br>It has a diversified and dynamic economy, based on sectors such as industry, services, trade, tourism, and agriculture.<br><br>It is also a major port and transport hub, connecting Italy with the Balkans, the Middle East, and the Mediterranean.<br><br>Bari is a cultural and educational center, hosting several universities, research institutes, museums, and festivals.<br><br>Bari has a high quality of life, with a low cost of living, a rich gastronomy, and a mild climate.<br><br>However, it also faces some challenges, such as unemployment, social inequality, environmental issues, and urban sprawl.<br><br>According to the latest data, about 15% of the population in Bari lives below the poverty line, and about 12% is unemployed.<br><br>The city authorities have implemented various policies and projects to improve the situation, such as innovation, sustainability, social inclusion, and territorial development."
facts.Bari.education="Bari is a university city, with a strong and diverse academic offer and a large student population.<br><br>It has several public and private universities and colleges, covering a wide range of disciplines and levels, from humanities and social sciences to engineering and health sciences.<br><br>Some of the most renowned and respected academic institutions in Bari are the University of Bari Aldo Moro, the Polytechnic University of Bari, the University of Bari LUM Jean Monnet, and the University of Bari LUMSA.<br><br>The city also has some international schools, catering to the needs of foreign families and children.<br><br>Some of the most reputable and well-known international schools in Bari are the International School of Bari, the British School of Bari, and the French School of Bari."
facts.Bari.safety="Bari is a fairly safe city for tourists and expats, with a moderate crime rate compared to other large cities in Italy and Europe.<br><br>However, some caution is advised, especially in some areas and situations.<br><br>The most common crimes in Bari are theft, robbery, and vandalism, which usually target crowded and touristy places, such as the old town, the seafront, the airport, and the train station.<br><br>To avoid these risks, it is recommended to be vigilant and careful, to keep your valuables hidden and secure, to avoid suspicious or aggressive people, and to report any incident to the police.<br><br>Bari is also generally safe at night, but it is better to avoid walking alone in dark and isolated streets, and to stick to the main and busy areas.<br><br>Bari is not a very rough city, but it has some social problems, such as poverty, unemployment, and immigration, which can create some tension and conflict."
facts.Bari.climate="Living in Bari means enjoying a Mediterranean climate, with warm winters and hot summers.<br><br>In the winter, it’s mild and dry, and you can see the olive trees and the almond blossoms.<br><br>In the summer, it’s hot and humid, and you can relax on the beach and visit the nearby villages.<br><br>The spring and the autumn are warm and pleasant, with some rain and some wind.<br><br>You can taste the fresh and seasonal products, and discover the heritage and the traditions.<br><br>Bari is quite sunny and dry by Italian standards, but it also has some cloudy and stormy days.<br><br>The weather can be changeable and unpredictable, so you need to be prepared for anything."
facts.Bari.pros="Bari is a modern and dynamic city, with a diversified and growing economy.<br><br>You can benefit from its many opportunities, such as industry, trade, tourism, and innovation, and find a variety of jobs and careers.<br><br>It is also a cultural and educational center, hosting several universities, research institutes, museums, and festivals.<br><br>The city has a friendly and relaxed atmosphere, with a lot of music, art, and traditions, and a strong sense of identity.<br><br>Moreover, Bari has a strategic location on the Adriatic Sea, near some of the most beautiful and charming places in Italy, such as Alberobello, Polignano a Mare, and Matera.<br><br>Bari is a diverse and multicultural city, where you can meet people from different backgrounds and origins, such as Balkan, Middle Eastern, and African.<br><br>Italian is the main language spoken here, but you can also find some people who speak English, French, or German, especially in the business and academic sectors.<br><br>The city has a moderate cost of living, which makes it affordable and attractive for many people, especially compared to other Italian cities.<br><br>Bari has a mild and sunny climate, with warm winters and hot summers, which can make you feel comfortable and cheerful." 
facts.Bari.cons="Bari can be challenging and frustrating to live in.<br><br>You can face difficulties in finding quality housing, especially in the old town, where the conditions are often poor and overcrowded.<br><br>You can also encounter problems with traffic, parking, and public transport, which are often congested and unreliable.<br><br>The city can be unsafe and violent, especially in some areas, where theft, robbery, and vandalism are common.<br><br>It can also be noisy and polluted, especially near the port and the industrial zones, where the air quality and the noise levels are high.<br><br>Bari is not very open to foreigners, and the cultural differences can be a challenge, especially if you don’t speak Italian.<br><br>You can also struggle to adapt to the local customs and habits, such as the siesta, the bureaucracy, and the informal economy.<br><br>Bari has a low quality of life, with poor education, healthcare, and social services, which can affect your well-being and satisfaction.<br><br>In addition to that, compared to other parts of Italy, Bari can have a less rich and varied cuisine, culture, and history." 
facts.Bari.prosandconstable="<center><table class=‘table center’> <tr> <th>Pros</th> <th>Cons</th> </tr> <tr> <td>Modern and dynamic city</td> <td>Challenging city</td> </tr> <tr> <td>Diversified and growing economy</td> <td>Difficult to find quality housing</td> </tr> <tr> <td>Cultural and educational center</td> <td>Problems with traffic, parking, and public transport</td> </tr> <tr> <td>Friendly and relaxed atmosphere</td> <td>Unsafe and violent</td> </tr> <tr> <td>Strategic location on the Adriatic Sea</td> <td>Noisy and polluted</td> </tr> <tr> <td>Diverse and multicultural</td> <td>Not very open to foreigners</td> </tr> <tr> <td>Some people speak English, French, or German</td> <td>Hard to adapt to the local customs and habits</td> </tr> <tr> <td>Moderate cost of living</td> <td>Low quality of life</td> </tr> <tr> <td>Mild and sunny climate</td> <td>Less rich and varied cuisine, culture, and history</td> </tr> <tr> <td></td> <td></td> </tr> <tr> <td></td> <td></td> </tr> </table></center>"
facts.Bari.forExpats="Bari is a charming coastal city situated in the heel of Italy’s boot. It is the capital of the Puglia region and a hub for trips around the Mediterranean Sea.<br><br>It is a hidden gem that offers a plethora of cultural and historical treasures. With its breathtaking views of the Adriatic Sea, rich architectural heritage, and delectable cuisine, Bari has become an increasingly popular destination for travelers seeking an authentic Italian experience.<br><br>Living in Bari as an expat can be both enjoyable and stimulating. You can appreciate the beauty and diversity of the city, its friendly and hospitable people, and its lively and fun atmosphere, but you also have to adapt to its pace and customs, such as its siesta and its dialect.<br><br>Some of the best areas for expats to live in Bari are the city center, the seaside districts of Torre a Mare and Santo Spirito, and the modern neighborhoods of Poggiofranco and Carrassi."
facts.Bari.forStudents="Bari is an appealing destination for students who want to study in Italy or abroad.<br><br>It is a city that offers a wide range of academic programs, from humanities and social sciences to natural and applied sciences, from public and private universities to ancient and prestigious institutions.<br><br>Students in Bari can benefit from a rich and stimulating learning environment, a dynamic and diverse student community, a splendid and varied cultural offer, and a lot of opportunities for volunteering and networking.<br><br>However, students in Bari also have to cope with the low quality of infrastructure, the overcrowded and underfunded facilities, the limited availability of scholarships, and the bureaucratic and corrupt system."
facts.Bari.forWomen="Bari is a city that offers some opportunities and advantages for women, but also some difficulties and disadvantages.<br><br>It is a city that has some sectors and fields where women can excel and advance, such as education, health, tourism and social work, but also some areas where women are underrepresented and discriminated, such as politics, business and science.<br><br>Women in Bari can enjoy some aspects of a high quality of life, such as a vibrant cultural scene, a supportive and diverse society, and a relaxed and fun environment, but also suffer from some problems, such as the gender gap, the domestic violence, the lack of childcare facilities, and the stereotypes and prejudices."
facts.Bari.forLGBTQ="Bari is a city that has some progress and achievements for LGBTQ people, but also some setbacks and obstacles.<br><br>It is a city that has a large and active LGBTQ community, some events and festivals, and some resources and services, but also a lack of specific laws and policies to protect and support LGBTQ people, such as same-sex marriage, adoption, and anti-discrimination.<br><br>LGBTQ people in Bari can experience some acceptance and tolerance, especially in some urban and cosmopolitan areas, but also face some hostility and violence, especially in some rural and traditional areas. They also have to deal with some social stigma, legal discrimination, hate crimes, and religious intolerance."
}
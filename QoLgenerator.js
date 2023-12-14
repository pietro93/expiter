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
var selection = ["Agrigento","Milan"]

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

        $(".title").text(en(province.Name)+' for Expats and Nomads');
        $("#overview").append(facts[city].introduction)
        $("#overview").append(facts[city].overview)
        $("#overview").append(map)
        $("#overview").append(separator)
        $("#generalinfo").append(facts[city].culture)
        $("#generalinfo").append("<h3>Climate<h3>")
        $("#generalinfo").append(facts[city].climate)
        $("#generalinfo").append("<h3>Economy<h3>")
        $("#generalinfo").append(facts[city].economy)
        $("#generalinfo").append("<h3>Education<h3>")
        $("#generalinfo").append(facts[city].education)
        $("#generalinfo").append(separator)
        $("#costofliving").append(facts[city].costofliving)
        $("#costofliving").append(separator)
        //$("#overview").append(info.disclaimer)
        //$("#overview").append(info.map)
        $("#povertyandsafety").append(facts[city].safety)
        $("#prosandcons").append(facts[city].prosandconstable)
        $("#prosandcons").append("<h3>Advantages of Living in "+city+" <h3>")
        $("#prosandcons").append(facts[city].pros)
        $("#prosandcons").append("<h3>Disadvantages of Living in "+city+" <h3>")
        $("#prosandcons").append(facts[city].cons)
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
        
        info.map='</br><center class="map"><iframe id="ggmap" src="https://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q='+en(province.Name)+'+&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>'+
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
            '<li><a href="https://expiter.com/blog/articoli.html">Blog</a></li>'+
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
      default: return word;
    }
  }

  function populateFacts(){
  console.log("let's see...");

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
}

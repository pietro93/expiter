import * as pb from './js/pageBuilder.js'
import fetch from 'node-fetch';
import fs from 'fs';
import { nunjucks } from './js/nunjucksEnv.js'

var dataset;
var provinces = {};
var facts={};
var north=["Lombardia","Valle d'Aosta","Piemonte","Liguria","Trentino-Alto Adige", "Friuli-Venezia Giulia","Veneto","Emilia-Romagna"];
var center=["Lazio","Toscana","Marche","Umbria"];
var south=["Abruzzo","Molise","Campania","Puglia","Basilicata","Calabria","Sicilia","Sardegna"]
var avg;
var regions ={};

fetch('https://expiter.com/dataset.json', {method:"Get"})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        dataset=data;
        populateData(data);

        let comuniSiteMap='<?xml version="1.0" encoding="UTF-8"?> '+'\n'+
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> '+'\n';

        for (let i = 0; i < 107; i++){
            let province = dataset[i];
            let sidebar = pb.setSideBar(province);

            if (fs.existsSync('temp/'+province.Name+'-comuni.json')){
                let parsedData = fs.readFileSync('temp/'+province.Name+'-comuni.json','utf8');
                let dic=JSON.parse(parsedData);
                dataset[i]["Comuni"]=dic
            }
            else console.log("Missing comuni: "+province.Name)

            let comuni=dataset[i]["Comuni"];

            let comdataset = fs.readFileSync('comuni.json','utf8');
            let comdata=JSON.parse(comdataset);
            let comindex = []
            for (let k=0; k<comdata.length; k++) comindex.push(comdata[k].Name)

            if (dataset[i].Comuni==undefined) continue;

            for (let c in comuni){
                let comune=comuni[c];
                comune.Name = comune.Name[0] + comune.Name.toLowerCase().slice(1);

                var dirName = 'comuni/'+province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()+'/';
                var fileName = comune.Name.replace('(*)','').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
                let ci=11;

                if (comindex.includes(comune.Name)) {
                    ci = comindex.indexOf(comune.Name)
                    console.log("found some extra info about "+comune.Name+" at position "+ ci)
                }
                if (ci>-1){
                    console.log("Writing comune \""+comune.Name+"\" ("+province.Name+") into file")

                    let urlPath = "https://expiter.com/"+dirName+fileName+"/"
                    comuniSiteMap+='<url><loc>'+urlPath+'</loc></url>'+'\n'

                    let html = renderTown(comune, province, dirName, fileName, sidebar, ci, comdata);

                    if (!fs.existsSync(dirName)) {
                        fs.mkdirSync(dirName, {recursive:true});
                    }

                    try { fs.writeFileSync(dirName+fileName+".html", html); }
                    catch (e) { console.log("write error: "+dirName+fileName+".html — "+e.message); }
                }
            }
            console.log(dataset[i].Name+" Comuni Saved!");
            comuniSiteMap+='</urlset>'
        }
    })
    .catch(function (err) {
        console.log('error: ' + err);
    });


function renderTown(comune, province, dirName, fileName, sidebar, ci, comdata){
    let intro = "<b>"+en(comune.Name)+" is a municipality of "+comune.Population+" inhabitants located in the "+
        "<a href='https://expiter.com/comuni/province-of-"+handle(province)+"'>"+en(province.Name)+" province</a></b> in the Italian region of "+en(province.Region)+
        " in <b>"+(center.includes(province.Region)?"Central Italy":(south.includes(province.Region)?"Southern Italy":"Northern Italy"))+"</b>."

    intro+='<br><br>'+'It has a <b>population density of '+comune.Density+' people per km²</b> and an <b>altitude of '+comune.Altitude+' metres</b> above the sea level.'+'\n'

    intro+='</br></br><b>'+en(comune.Name)+"</b> accounts for about "+((comune.Population.split('.').join("")*100)/province.Population).toFixed(2)+"% of the total population in the province of "+en(province.Name)+
        " and about "+((comune.Population.split('.').join("")*100)/60260456).toFixed(5)+"% of the overall population of Italy as of 2022."

    if (ci>0 && comdata[ci]){
        intro+='<h3>About '+en(comune.Name)+'</h3>'+(comdata[ci].Landmarks||'')+'<br><br>'+(comdata[ci].History||'')
    }

    let zoneAtext="one of the two hottest municipalities in Italy, the other one being "+(comune.Name=="Porto Empedocle"?
        "the Pelagie islands of <a href='https://expiter.com/comuni/agrigento/lampedusa-e-linosa/>Lampedusa and Linosa</a>, geographically located in Africa":
        '<a href="https://expiter.com/comuni/agrigento/porto-empedocle/">Porto Empedocle</a>'+
        " in the main island of Sicily, also located in the province of Agrigento")

    let climate='<p style="font-size:21px; line-height:42px"><b>'+en(comune.Name)+'</b> is classified as a <b>Climate Zone '+comune.ClimateZone+'</b>, which means it is '+
        (comune.ClimateZone==="A"?zoneAtext
        :(comune.ClimateZone==="B"?"one of the warmest and sunniest locations in Italy"
        :(comune.ClimateZone==="C"?"a fairly warm location"
        :(comune.ClimateZone==="D"?"a temperate town by Italian standards"
        :(comune.ClimateZone==="E"?"a fairly chill town"
        :(comune.ClimateZone==="F"?"one of the coldest locations in Italy"
        :""))))))+"."+'\n'
    climate+=
        'The local climate is characterized by '+
        (["Sicilia","Calabria","Sardegna"].includes(province.Region)?"<b>short, mild winters</b> and long, <b>hot and dry summers. Rainfall is mostly concentrated to the winter period.</b>"
        :(["Liguria","Toscana","Lazio","Campania"].includes(province.Region)?"<b>short, mild winters</b> with <b>hot and somewhat windy summers</b> and overall little precipitation."
        :(["Emilia-Romagna","Veneto","Lombardia","Piemonte"].includes(province.Region)?"<b>winters which are long and cold</b> and <b>summers which are dry and very hot</b>. There are frequent precipitations in autumn and spring, and <b>fog is not uncommon</b>."
        :(["Friuli-Venezia Giulia","Marche","Abruzzo","Puglia"].includes(province.Region)?"<b>cold winters</b> and <b>hot but windy summers</b>, with somewhat frequent rainfall spread throughout the year."
        :(["Umbria","Molise","Basilicata"].includes(province.Region)?"<b>long and cold winters with frequent snowfall in mountaineous areas</b>, and <b>somewhat warm and dry summers</b>."
        :((["Trentino-Alto Adige","Val d'Aosta","Valle d'Aosta"].includes(province.Region)||
        ["Belluno","Verbano-Cusio-Ossola","Udine","Como","Bergamo","Varese","Biella"].includes(province.Name))?
        "<b>long and very cold winters with plenty of snow</b>, <b>short and mild summers</b>."
        :""
        ))))))+'\n </br></br>'+"The province of "+en(province.Name)+" experiences on average "+((province.HotDays/3.5)*12).toFixed(2)+" days of hot temperatures (over 30°C) and "+
        ((province.ColdDays/3.5)*12).toFixed(2)+" cold temperature days (<5°C) per year. <br><br> Precipitation in the form of rain or snow occurs around "+(province.RainyDays*12).toFixed(2)+" days per year. "+
        (province.FoggyDays<1?"Fog is rarely an issue, with little to no foggy days throughout the year. ":"There are "+((province.FoggyDays/3.5)*12).toFixed(2)+" foggy days throughout the year. ")+
        "<br><br>The municipality of " + en(comune.Name) + " enjoys approximately " + province.SunshineHours/30 + " hours of sunshine per day. This means that the town experiences an average of " +(((province.SunshineHours/30)/9)*365).toFixed(2)+ " sunny days in a year.</p>";

    let info = getInfo(comune, province);

    let disclaimer='<center><div style="display:inline;" id="disclaimer">This page contains affiliate links. As part of the Amazon Associates and Viator Partner programmes, we may earn a commission on qualified purchases.</div></center>'

    let getyourguide='<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>'

    let expedia='<div id="searchWidget" style="width:98%;height:550px;"><iframe id="widgetIframe" src="https://www.expedia.com/marketing/widgets/searchform/widget?wtt=5&tp1=1101l3BUi9&tp2=expiter&lob=H,FH,CA,CR,A&des='
        +comune.Name+'&wbi=13&olc=000000&whf=4&hfc=C7C7C7&wif=4&ifc=000000&wbc=FFCC00&wbf=4&bfc=3D3100&wws=2&sfs=H550FW98R&langid=1033" width="100%" height="100%" scrolling="no" frameborder="0"></iframe></div>'

    expedia += '<div style="text-align:center; margin-top:20px;">Search for: ' + ['Hotels', 'Apartments', 'Bed & Breakfasts', 'Villas'].map((lodging, index) => `<a href="https://www.expedia.com/Hotel-Search?lodging=${['HOTEL', 'APARTMENT', 'BED_AND_BREAKFAST', 'VILLA'][index]}&destination=${comune.Name}&camref=1101l3BUi9&creativeref=1100l68075" target="_blank" rel="nofollow sponsored" style="font-size:18px; margin: 0 10px;">${lodging}</a>` + (index < 3 ? ' | ' : '')).join('') + '</div>';

    const provinceSlug = province.Name.replace(/'/g,"-").replace(/\s+/g,"-").toLowerCase();
    const provinceUrl = 'https://expiter.com/province/'+provinceSlug+'/';

    const tabRows = buildTabRows(province);

    const toc =
      '<ul>'+
        '<li><a href="#Info-Sheet">Info Sheet</a></li>'+
        '<li><a href="#Overview">About '+en(comune.Name)+'</a></li>'+
        '<li><a href="#Climate">Climate</a></li>'+
        '<li><a href="#Map">Map</a></li>'+
        '<li><a href="#Tours">Experiences &amp; Tours</a></li>'+
        '<li><a href="#Hotels">Hotels</a></li>'+
        '<li><a href="#Nearby">Nearby Towns</a></li>'+
        '<li><a href="#Related">Provinces Nearby</a></li>'+
      '</ul>';

    const seoTitle = en(comune.Name)+" - Quality of Life and Info Sheet for Expats";
    const seoDescription = 'Information about living in '+en(comune.Name)+', Italy for expats and digital nomads. '+en(comune.Name)+' quality of life, cost of living, safety and more.';
    const seoKeywords = en(comune.Name)+' italy, '+en(comune.Name)+' expat,'+en(comune.Name)+' life,'+en(comune.Name)+' digital nomad';

    return nunjucks.render('pages/town.njk', {
        lang: 'en',
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl: 'https://expiter.com/'+dirName+fileName+'/',
        hreflangIt: 'https://expiter.com/it/'+dirName+fileName+'/',
        heroImage: 'https://expiter.com/img/'+province.Abbreviation+'.webp',
        heroAlt: en(comune.Name)+', '+province.Name+', Italy',
        eyebrow: en(province.Region) + ' · ' + en(province.Name) + ' · Town',
        pageTitle: en(comune.Name)+', '+en(province.Region)+', Italy',
        sidebar,
        tabRows,
        toc,
        // page-specific
        townName: en(comune.Name),
        provinceName: en(province.Name),
        provinceUrl,
        regionName: en(province.Region),
        population: comune.Population,
        density: comune.Density,
        altitude: comune.Altitude,
        climateZone: comune.ClimateZone ? comune.ClimateZone : "?",
        intro: pb.addBreaks(intro),
        climate: climate,
        map: info.map,
        getyourguide,
        expedia,
        nearby: info.nearby,
        related: info.related,
        disclaimer,
    });
}


function populateData(data){
    for (let i = 108; i < data.length; i++) {
        let region = data[i];
        regions[region["Name"]]=region;
        regions[region["Name"]].index=i;
        facts[region["Name"]]={};
        facts[region["Name"]].provinces=[];
    }
    for (let i = 0; i < 107; i++) {
        let province = data[i];
        provinces[province["Name"]]=province;
        provinces[province["Name"]].index=i;
        facts[province["Region"]].provinces.push(province.Name)

        facts[province["Name"]]={};
        const slug = province.Name.replace(/\s+/g,"-").replace("'","-").toLowerCase();
        facts[province["Name"]].snippet=
            '<li><a href="https://expiter.com/province/'+slug+'/" title="'+en(province.Name)+', '+en(province.Region)+'">'+
            '<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-56,h-56,fo-auto,q-60" '+
            'alt="'+en(province.Name)+'" width="28" height="28">'+
            '<span>'+en(province.Name)+', '+en(province.Region)+'</span></a></li>';
    }
    avg=data[107];
}


function getInfo(comune,province){
    let name=comune.Name;
    let region=regions[province.Region];

    let info = {}

    info.map='<center class="map"><iframe id="ggmap" src="https://maps.google.com/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>'+
        'Search for: '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'+Attractions&output=embed")\' target="_blank"><b><ej>🎭</ej>Attractions</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'+Museums&output=embed")\' target="_blank"><b><ej>🏺</ej>Museums</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'+Restaurants&output=embed")\' target="_blank"><b><ej>🍕</ej>Restaurants</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'+Bars&output=embed")\' target="_blank"><b><ej>🍺</ej>Bars</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'+Beaches&output=embed")\' target="_blank"><b><ej>🏖️</ej>Beaches</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=en&geocode=&q='+comune.Name+'+Province+Of+'+province.Name+'+Hikinge&output=embed")\' target="_blank"><b><ej>⛰️</ej>Hikes</b></a> '+
        '<a href="https://www.amazon.it/ulp/view?&linkCode=ll2&tag=expiter-21&linkId=5824e12643c8300394b6ebdd10b7ba3c&language=it_IT&ref_=as_li_ss_tl" target="_blank"><b><ej>📦</ej>Amazon Pickup Locations</b></a> '+
        '</center>'

    let target, related1, related2, related3, related4;

    (region.Name==="Valle d'Aosta"?target=facts[region.Name]["provinces"].concat(facts["Piemonte"]["provinces"]):
    (region.Name==="Trentino-Alto Adige"?target=facts[region.Name]["provinces"].concat(facts["Veneto"]["provinces"]).concat(["Brescia","Sondrio"]):
    (region.Name==="Molise"?target=facts[region.Name]["provinces"].concat(facts["Abruzzo"]["provinces"]):
    (region.Name==="Abruzzo"?target=facts[region.Name]["provinces"].concat(facts["Molise"]["provinces"]):
    (region.Name==="Emilia-Romagna"?target=facts[region.Name]["provinces"].concat(["Prato","Mantova","Cremona","Rovigo","Massa-Carrara","Lucca","Pistoia","Pesaro e Urbino","Arezzo"]):
    (region.Name==="Liguria"?target=facts[region.Name]["provinces"].concat(facts["Piemonte"]["provinces"]):
    (region.Name==="Piemonte"?target=facts[region.Name]["provinces"].concat(facts["Lombardia"]["provinces"]):
    (region.Name==="Lombardia"?target=facts[region.Name]["provinces"].concat(facts["Piemonte"]["provinces"]):
    (region.Name==="Friuli-Venezia Giulia"?target=facts[region.Name]["provinces"].concat(facts["Veneto"]["provinces"]):
    (region.Name==="Basilicata"?target=facts[region.Name]["provinces"].concat(facts["Campania"]["provinces"]).concat(facts["Puglia"]["provinces"]).concat(["Cosenza"]):
    (region.Name==="Puglia"?target=facts[region.Name]["provinces"].concat(facts["Basilicata"]["provinces"]).concat(["Campobasso","Benevento","Avellino"]):
    (region.Name==="Umbria"?target=facts[region.Name]["provinces"].concat(facts["Marche"]["provinces"]).concat(["Arezzo","Siena","Viterbo","Rieti"]):
    target=facts[region.Name]["provinces"]))))))))))));
    (province.Name==="Reggio Calabria"?target=target.concat(["Messina"]):
    (province.Name==="Messina"?target=target.concat(["Reggio Calabria"]):
    (province.Name==="Torino"?target=target.concat(["Aosta"]):
    (province.Name==="Cosenza"?target=target.concat(facts["Basilicata"]["provinces"]):
    (province.Name==="Salerno"?target=target.concat(facts["Basilicata"]["provinces"]):
    ""
    )))));

    target=target.filter(item => item !== name && item !== province.Name)
    related1=target[Math.floor(Math.random()*target.length)]
    target=target.filter(item => item !== related1)
    related2=target[Math.floor(Math.random()*target.length)]
    target=target.filter(item => item !== related2)
    related3=target[Math.floor(Math.random()*target.length)]
    target=target.filter(item => item !== related3)
    related4=target[Math.floor(Math.random()*target.length)]

    info.related='<ul class="nearby-pills">'+
        (facts[related1]?facts[related1].snippet:'')+
        (facts[related2]?facts[related2].snippet:'')+
        (facts[related3]?facts[related3].snippet:'')+
        (facts[related4]?facts[related4].snippet:'')+'</ul>'

    info.nearby=''
    for (let p in province.Comuni){
        if (province.Comuni[p].Name!=comune.Name)
            info.nearby+='<b><a href="https://expiter.com/comuni/'+handle(province)+'/'+
                handle(province.Comuni[p])+'/">'+province.Comuni[p].Name+'</a></b>'+' '
    }

    return info;
}


function handle(comune){
    return comune.Name.replace('(*)','').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()
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

// Returns { tier, text, isAmount }
function qualityScoreData(quality, score){
    let expenses=["Cost of Living (Individual)","Cost of Living (Family)","Cost of Living (Nomad)",
        "StudioRental","BilocaleRent","TrilocaleRent","MonthlyIncome",
        "StudioSale","BilocaleSale","TrilocaleSale"];

    if (quality=="CostOfLiving"||quality=="HousingCost"){
        if (score<avg[quality]*.8)             return {tier:'excellent', text:'cheap'};
        if (score<avg[quality]*.95)            return {tier:'great',     text:'affordable'};
        if (score<avg[quality]*1.05)           return {tier:'good',      text:'average'};
        if (score<avg[quality]*1.2)            return {tier:'average',   text:'high'};
        return {tier:'poor', text:'expensive'};
    }
    if (expenses.includes(quality)){
        let tier;
        if (score<avg[quality]*.95)            tier='great';
        else if (score<avg[quality]*1.05)      tier='average';
        else                                   tier='poor';
        return {tier, text: score+'€/m', isAmount:true};
    }
    if (quality=="HotDays"||quality=="ColdDays"){
        const w = (quality=="HotDays"?"hot":"cold");
        if (score<avg[quality]*.8)             return {tier:'excellent', text:'not '+w};
        if (score<avg[quality]*.95)            return {tier:'great',     text:'not very '+w};
        if (score<avg[quality]*1.05)           return {tier:'good',      text:'a bit '+w};
        if (score<avg[quality]*1.2)            return {tier:'average',   text:w};
        return {tier:'poor', text:'very '+w};
    }
    if (quality=="RainyDays"){
        if (score<avg[quality]*.8)             return {tier:'excellent', text:'very little'};
        if (score<avg[quality]*.95)            return {tier:'great',     text:'little'};
        if (score<avg[quality]*1.05)           return {tier:'good',      text:'average'};
        if (score<avg[quality]*1.2)            return {tier:'average',   text:'rainy'};
        return {tier:'poor', text:'a lot'};
    }
    if (quality=="FoggyDays"){
        if (score<avg[quality]*.265)           return {tier:'excellent', text:'no fog'};
        if (score<avg[quality]*.6)             return {tier:'great',     text:'little'};
        if (score<avg[quality]*1.00)           return {tier:'good',      text:'average'};
        if (score<avg[quality]*3)              return {tier:'average',   text:'foggy'};
        return {tier:'poor', text:'a lot'};
    }
    if (quality=="Crime"||quality=="Traffic"){
        if (score<avg[quality]*.8)             return {tier:'excellent', text:'very low'};
        if (score<avg[quality]*.95)            return {tier:'great',     text:'low'};
        if (score<avg[quality]*1.05)           return {tier:'good',      text:'average'};
        if (score<avg[quality]*1.2)            return {tier:'average',   text:'high'};
        return {tier:'poor', text:'too much'};
    }
    if (score<avg[quality]*.8)               return {tier:'poor',      text:'poor'};
    if (score<avg[quality]*.95)              return {tier:'average',   text:'okay'};
    if (score<avg[quality]*1.05)             return {tier:'good',      text:'good'};
    if (score<avg[quality]*1.2)              return {tier:'great',     text:'great'};
    return {tier:'excellent', text:'excellent'};
}

function buildTabRows(province){
    const q = (k, prop) => qualityScoreData(k, province[prop !== undefined ? prop : k]);
    return {
        qualityOfLife: [
            {emoji:'👥', label:'Population', raw: province.Population.toLocaleString('en', {useGrouping:true})},
            {emoji:'🚑', label:'Healthcare', ...q('Healthcare')},
            {emoji:'📚', label:'Education', ...q('Education')},
            {emoji:'👮', label:'Safety', ...q('Safety')},
            {emoji:'🚨', label:'Crime', ...q('Crime')},
            {emoji:'🚌', label:'Transport', ...q('PublicTransport')},
            {emoji:'🚥', label:'Traffic', ...q('Traffic')},
            {emoji:'🚴', label:'Cyclable', ...q('CyclingLanes')},
            {emoji:'🏛️', label:'Culture', ...q('Culture')},
            {emoji:'🍸', label:'Nightlife', ...q('Nightlife')},
            {emoji:'⚽', label:'Recreation', ...q('Sports & Leisure')},
            {emoji:'🌦️', label:'Climate', ...q('Climate')},
            {emoji:'☀️', label:'Sunshine', ...q('SunshineHours')},
            {emoji:'🥵', label:'Summers', ...q('HotDays')},
            {emoji:'🥶', label:'Winters', ...q('ColdDays')},
            {emoji:'🌧️', label:'Rain', ...q('RainyDays')},
            {emoji:'🌫️', label:'Fog', ...q('FoggyDays')},
            {emoji:'🍃', label:'Air quality', ...q('AirQuality')},
            {emoji:'👪', label:'For family', ...q('Family-friendly')},
            {emoji:'👩', label:'For women', ...q('Female-friendly')},
            {emoji:'🏳️‍🌈', label:'LGBTQ+', ...q('LGBT-friendly')},
            {emoji:'🥗', label:'For vegans', ...q('Veg-friendly')},
        ],
        costOfLiving: [
            {emoji:'📈', label:'Cost of Living', ...q('CostOfLiving')},
            {emoji:'🏙️', label:'Housing Cost', ...q('HousingCost')},
            {emoji:'💵', label:'Local Income', ...q('MonthlyIncome')},
            {emoji:'🧑', label:'Expenses (single)', ...q('Cost of Living (Individual)')},
            {emoji:'👪', label:'Expenses (family)', ...q('Cost of Living (Family)')},
            {emoji:'🎒', label:'Expenses (tourist)', ...q('Cost of Living (Nomad)')},
            {emoji:'🏠', label:'Rental (studio)', ...q('StudioRental')},
            {emoji:'🏘️', label:'Rental (2-room)', ...q('BilocaleRent')},
            {emoji:'🏰', label:'Rental (3-room)', ...q('TrilocaleRent')},
            {emoji:'🏠', label:'Sale (studio)', ...q('StudioSale')},
            {emoji:'🏘️', label:'Sale (2-room)', ...q('BilocaleSale')},
            {emoji:'🏰', label:'Sale (3-room)', ...q('TrilocaleSale')},
        ],
        digitalNomads: [
            {emoji:'👩‍💻', label:'Nomad-friendly', ...q('DN-friendly')},
            {emoji:'💸', label:'Nomad cost', ...q('Cost of Living (Nomad)')},
            {emoji:'📡', label:'High-speed Internet', ...q('HighSpeedInternetCoverage')},
            {emoji:'💃', label:'Fun', ...q('Fun')},
            {emoji:'🤗', label:'Friendliness', ...q('Friendliness')},
            {emoji:'🤐', label:'English-speakers', ...q('English-speakers')},
            {emoji:'😊', label:'Happiness', ...q('Antidepressants')},
            {emoji:'📈', label:'Innovation', ...q('Innovation')},
            {emoji:'🏖️', label:'Beach', ...q('Beach')},
            {emoji:'⛰️', label:'Hiking', ...q('Hiking')},
        ],
    };
}

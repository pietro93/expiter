import * as pb from './js/pageBuilder.js'
import fetch from 'node-fetch';
import fs from 'fs';
import { nunjucks } from './js/nunjucksEnv.js'
import { de } from './js/pageBuilder.js'

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
            let sidebar = pb.setSideBarDE(province);

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

                var dirName = 'de/gemeinden/'+handle(de(province.Name))+'/';
                var fileName = handle(comune.Name.replace('(*)',''));
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
    const deProvince = de(province.Name);
    const deRegion = de(province.Region);

    let intro = "<b>"+comune.Name+" ist eine Gemeinde mit "+comune.Population+" Einwohnern in der "+
        "<a href='https://expiter.com/de/provinz/"+handle(deProvince)+"'>Provinz "+deProvince+"</a></b> in der italienischen Region "+deRegion+
        " in <b>"+(center.includes(province.Region)?"Mittelitalien":(south.includes(province.Region)?"Süditalien":"Norditalien"))+"</b>."

    intro+='<br><br>'+'Sie hat eine <b>Bevölkerungsdichte von '+comune.Density+' Einwohnern pro km²</b> und liegt auf einer <b>Höhe von '+comune.Altitude+' Metern</b> über dem Meeresspiegel.'+'\n'

    intro+='</br></br><b>'+comune.Name+"</b> macht etwa "+((comune.Population.split('.').join("")*100)/province.Population).toFixed(2)+"% der Gesamtbevölkerung in der Provinz "+deProvince+
        " und etwa "+((comune.Population.split('.').join("")*100)/60260456).toFixed(5)+"% der Gesamtbevölkerung Italiens im Jahr 2022 aus."

    if (ci>0 && comdata[ci]){
        intro+='<h3>Über '+comune.Name+'</h3>'+(comdata[ci].Landmarks||'')+'<br><br>'+(comdata[ci].History||'')
    }

    let zoneAtext="einer der zwei wärmsten Orte Italiens, der andere ist "+(comune.Name=="Porto Empedocle"?
        "die Pelagischen Inseln von <a href='https://expiter.com/de/gemeinden/agrigent/lampedusa-e-linosa/'>Lampedusa und Linosa</a>, die geographisch in Afrika liegen":
        '<a href="https://expiter.com/de/gemeinden/agrigent/porto-empedocle/">Porto Empedocle</a>'+
        " auf der Hauptinsel Sizilien, ebenfalls in der Provinz Agrigent")

    let climate='<p style="font-size:21px; line-height:42px"><b>'+comune.Name+'</b> ist als <b>Klimazone '+comune.ClimateZone+'</b> eingestuft, was bedeutet, dass es '+
        (comune.ClimateZone==="A"?zoneAtext
        :(comune.ClimateZone==="B"?"einer der wärmsten und sonnigsten Orte in Italien ist"
        :(comune.ClimateZone==="C"?"ein recht warmer Ort ist"
        :(comune.ClimateZone==="D"?"nach italienischen Maßstäben eine gemäßigte Gemeinde ist"
        :(comune.ClimateZone==="E"?"eine recht kühle Gemeinde ist"
        :(comune.ClimateZone==="F"?"einer der kältesten Orte in Italien ist"
        :""))))))+"."+'\n'
    climate+=
        'Das lokale Klima ist charakterisiert durch '+
        (["Sicilia","Calabria","Sardegna"].includes(province.Region)?"<b>kurze, milde Winter</b> und lange, <b>heiße und trockene Sommer. Der Niederschlag konzentriert sich hauptsächlich auf die Wintermonate.</b>"
        :(["Liguria","Toscana","Lazio","Campania"].includes(province.Region)?"<b>kurze, milde Winter</b> mit <b>heißen und etwas windigen Sommern</b> und insgesamt wenig Niederschlag."
        :(["Emilia-Romagna","Veneto","Lombardia","Piemonte"].includes(province.Region)?"<b>lange, kalte Winter</b> und <b>trockene, sehr heiße Sommer</b>. Häufige Niederschläge im Herbst und Frühling, und <b>Nebel ist nicht ungewöhnlich</b>."
        :(["Friuli-Venezia Giulia","Marche","Abruzzo","Puglia"].includes(province.Region)?"<b>kalte Winter</b> und <b>heiße, aber windige Sommer</b>, mit recht häufigen Niederschlägen über das ganze Jahr verteilt."
        :(["Umbria","Molise","Basilicata"].includes(province.Region)?"<b>lange, kalte Winter mit häufigen Schneefällen in bergigen Gebieten</b>, und <b>recht warme und trockene Sommer</b>."
        :((["Trentino-Alto Adige","Val d'Aosta","Valle d'Aosta"].includes(province.Region)||
        ["Belluno","Verbano-Cusio-Ossola","Udine","Como","Bergamo","Varese","Biella"].includes(province.Name))?
        "<b>lange und sehr kalte Winter mit viel Schnee</b>, <b>kurze und milde Sommer</b>."
        :""
        ))))))+'\n </br></br>'+"Die Provinz "+deProvince+" erlebt im Durchschnitt "+((province.HotDays/3.5)*12).toFixed(2)+" Tage mit heißen Temperaturen (über 30°C) und "+
        ((province.ColdDays/3.5)*12).toFixed(2)+" Tage mit kalten Temperaturen (<5°C) pro Jahr. <br><br> Niederschläge in Form von Regen oder Schnee fallen etwa "+(province.RainyDays*12).toFixed(2)+" Tage pro Jahr. "+
        (province.FoggyDays<1?"Nebel ist selten ein Problem, mit wenigen oder keinen Nebeltagen im Jahr. ":"Es gibt "+((province.FoggyDays/3.5)*12).toFixed(2)+" Nebeltage im Jahr. ")+
        "<br><br>Die Gemeinde " + comune.Name + " genießt etwa " + province.SunshineHours/30 + " Sonnenstunden pro Tag. Das bedeutet, dass die Gemeinde im Durchschnitt " +(((province.SunshineHours/30)/9)*365).toFixed(2)+ " sonnige Tage im Jahr erlebt.</p>";

    let info = getInfo(comune, province);

    let disclaimer='<center><div style="display:inline;" id="disclaimer">Diese Seite enthält Affiliate-Links. Als Teil der Amazon Associates und Viator Partner Programme können wir eine Provision für qualifizierte Käufe erhalten.</div></center>'

    let getyourguide='<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>'

    let expedia='<div id="searchWidget" style="width:98%;height:550px;"><iframe id="widgetIframe" src="https://www.expedia.com/marketing/widgets/searchform/widget?wtt=5&tp1=1101l3BUi9&tp2=expiter&lob=H,FH,CA,CR,A&des='
        +comune.Name+'&wbi=13&olc=000000&whf=4&hfc=C7C7C7&wif=4&ifc=000000&wbc=FFCC00&wbf=4&bfc=3D3100&wws=2&sfs=H550FW98R&langid=3079" width="100%" height="100%" scrolling="no" frameborder="0"></iframe></div>'

    expedia += '<div style="text-align:center; margin-top:20px;">Suchen nach: ' + ['Hotels', 'Wohnungen', 'Bed & Breakfasts', 'Villen'].map((lodging, index) => `<a href="https://www.expedia.com/Hotel-Search?lodging=${['HOTEL', 'APARTMENT', 'BED_AND_BREAKFAST', 'VILLA'][index]}&destination=${comune.Name}&camref=1101l3BUi9&creativeref=1100l68075" target="_blank" rel="nofollow sponsored" style="font-size:18px; margin: 0 10px;">${lodging}</a>` + (index < 3 ? ' | ' : '')).join('') + '</div>';

    const enProvinceSlug = province.Name.replace(/'/g,"-").replace(/\s+/g,"-").toLowerCase();
    const provinceUrl = 'https://expiter.com/de/provinz/'+handle(deProvince)+'/';

    const tabRows = buildTabRows(province);

    const toc =
      '<ul>'+
        '<li><a href="#Info-Sheet">Steckbrief</a></li>'+
        '<li><a href="#Overview">Über '+comune.Name+'</a></li>'+
        '<li><a href="#Climate">Klima</a></li>'+
        '<li><a href="#Map">Karte</a></li>'+
        '<li><a href="#Tours">Erlebnisse &amp; Touren</a></li>'+
        '<li><a href="#Hotels">Hotels</a></li>'+
        '<li><a href="#Nearby">Nahe Gemeinden</a></li>'+
        '<li><a href="#Related">Benachbarte Provinzen</a></li>'+
      '</ul>';

    const seoTitle = comune.Name+" - Leben in "+comune.Name+", "+deProvince+" - Expiter";
    const seoDescription = 'Informationen über das Leben in '+comune.Name+', Provinz '+deProvince+'. Lebensqualität, Lebenshaltungskosten, Sicherheit und mehr für Expatriates.';
    const seoKeywords = comune.Name+' italien, '+comune.Name+' expats,'+comune.Name+' leben,'+comune.Name+' digitaler nomade';

    return nunjucks.render('pages/town-de.njk', {
        lang: 'de',
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl: 'https://expiter.com/'+dirName+fileName+'/',
        hreflangEn: 'https://expiter.com/comuni/'+enProvinceSlug+'/'+fileName+'/',
        heroImage: 'https://expiter.com/img/'+province.Abbreviation+'.webp',
        heroAlt: comune.Name+', '+deProvince+', Italien',
        eyebrow: deRegion + ' · ' + deProvince + ' · Gemeinde',
        pageTitle: comune.Name+', '+deProvince+', Italien',
        sidebar,
        tabRows,
        toc,
        // page-specific
        townName: comune.Name,
        provinceName: deProvince,
        provinceUrl,
        regionName: deRegion,
        population: comune.Population,
        density: comune.Density,
        altitude: comune.Altitude,
        climateZone: comune.ClimateZone ? comune.ClimateZone : "?",
        intro: pb.wrapParagraphs(intro),
        climate: pb.wrapParagraphs(climate),
        map: info.map,
        getyourguide,
        expedia,
        nearby: info.nearby,
        related: info.related,
        disclaimer,
        articleSection: 'Gemeinde',
        buildDate: new Date().toISOString()
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
        const slug = handle(de(province.Name));
        facts[province["Name"]].snippet=
            '<li><a href="https://expiter.com/de/provinz/'+slug+'/" title="'+de(province.Name)+', '+de(province.Region)+'">'+
            '<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-56,h-56,fo-auto,q-60" '+
            'alt="'+de(province.Name)+'" width="28" height="28">'+
            '<span>'+de(province.Name)+', '+de(province.Region)+'</span></a></li>';
    }
    avg=data[107];
}


function getInfo(comune,province){
    let name=comune.Name;
    let region=regions[province.Region];

    let info = {}

    info.map='<center class="map"><iframe id="ggmap" src="https://maps.google.com/maps?f=q&source=s_q&hl=de&geocode=&q='+comune.Name+'+Provinz+'+province.Name+'&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>'+
        'Suchen nach: '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=de&geocode=&q='+comune.Name+'+Provinz+'+province.Name+'+Attractions&output=embed")\' target="_blank"><b><ej>🎭</ej>Sehenswürdigkeiten</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=de&geocode=&q='+comune.Name+'+Provinz+'+province.Name+'+Museums&output=embed")\' target="_blank"><b><ej>🏺</ej>Museen</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=de&geocode=&q='+comune.Name+'+Provinz+'+province.Name+'+Restaurants&output=embed")\' target="_blank"><b><ej>🍕</ej>Restaurants</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=de&geocode=&q='+comune.Name+'+Provinz+'+province.Name+'+Bars&output=embed")\' target="_blank"><b><ej>🍺</ej>Bars</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=de&geocode=&q='+comune.Name+'+Provinz+'+province.Name+'+Beaches&output=embed")\' target="_blank"><b><ej>🏖️</ej>Strände</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=de&geocode=&q='+comune.Name+'+Provinz+'+province.Name+'+Hiking&output=embed")\' target="_blank"><b><ej>⛰️</ej>Wanderwege</b></a> '+
        '<a href="https://www.amazon.it/ulp/view?&linkCode=ll2&tag=expiter-21&linkId=5824e12643c8300394b6ebdd10b7ba3c&language=it_IT&ref_=as_li_ss_tl" target="_blank"><b><ej>📦</ej>Amazon</b></a> '+
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
            info.nearby+='<b><a href="https://expiter.com/de/gemeinden/'+handle(de(province.Name))+'/'+
                handle(province.Comuni[p].Name)+'/">'+province.Comuni[p].Name+'</a></b>'+' '
    }

    return info;
}


function handle(name){
    return name.replace('(*)','').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()
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

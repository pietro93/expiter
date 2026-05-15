import * as pb from './js/pageBuilder.js'
import fetch from 'node-fetch';
import fs from 'fs';
import { nunjucks } from './js/nunjucksEnv.js'
import { fr } from './js/pageBuilder.js'

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
            let sidebar = pb.setSideBarFR(province);

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

                var dirName = 'fr/municipalites/'+handle(fr(province.Name))+'/';
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
    const frProvince = fr(province.Name);
    const frRegion = fr(province.Region);

    let intro = "<b>"+comune.Name+" est une commune de "+comune.Population+" habitants située dans la "+
        "<a href='https://expiter.com/fr/province/"+handle(frProvince)+"'>province de "+frProvince+"</a></b> dans la région italienne de "+frRegion+
        " en <b>"+(center.includes(province.Region)?"Italie centrale":(south.includes(province.Region)?"Italie du Sud":"Italie du Nord"))+"</b>."

    intro+='<br><br>'+'Elle a une <b>densité de population de '+comune.Density+' personnes par km²</b> et une <b>altitude de '+comune.Altitude+' mètres</b> au-dessus du niveau de la mer.'+'\n'

    intro+='</br></br><b>'+comune.Name+"</b> représente environ "+((comune.Population.split('.').join("")*100)/province.Population).toFixed(2)+"% de la population totale dans la province de "+frProvince+
        " et environ "+((comune.Population.split('.').join("")*100)/60260456).toFixed(5)+"% de la population totale de l'Italie en 2022."

    if (ci>0 && comdata[ci]){
        intro+='<h3>À propos de '+comune.Name+'</h3>'+(comdata[ci].Landmarks||'')+'<br><br>'+(comdata[ci].History||'')
    }

    let zoneAtext="l'une des deux communes les plus chaudes d'Italie, l'autre étant "+(comune.Name=="Porto Empedocle"?
        "les îles Pélagie de <a href='https://expiter.com/fr/municipalites/agrigente/lampedusa-e-linosa/'>Lampedusa et Linosa</a>, géographiquement situées en Afrique":
        '<a href="https://expiter.com/fr/municipalites/agrigente/porto-empedocle/">Porto Empedocle</a>'+
        " dans l'île principale de Sicile, également dans la province d'Agrigente")

    let climate='<p style="font-size:21px; line-height:42px"><b>'+comune.Name+'</b> est classé comme <b>Zone Climatique '+comune.ClimateZone+'</b>, ce qui signifie que c\'est '+
        (comune.ClimateZone==="A"?zoneAtext
        :(comune.ClimateZone==="B"?"l'un des endroits les plus chauds et ensoleillés d'Italie"
        :(comune.ClimateZone==="C"?"un endroit assez chaud"
        :(comune.ClimateZone==="D"?"une commune tempérée selon les normes italiennes"
        :(comune.ClimateZone==="E"?"une commune assez fraîche"
        :(comune.ClimateZone==="F"?"l'un des endroits les plus froids d'Italie"
        :""))))))+"."+'\n'
    climate+=
        'Le climat local est caractérisé par '+
        (["Sicilia","Calabria","Sardegna"].includes(province.Region)?"<b>des hivers courts et doux</b> et de longs étés <b>chauds et secs. Les précipitations sont principalement concentrées en hiver.</b>"
        :(["Liguria","Toscana","Lazio","Campania"].includes(province.Region)?"<b>des hivers courts et doux</b> avec des <b>étés chauds et assez venteux</b> et peu de précipitations en général."
        :(["Emilia-Romagna","Veneto","Lombardia","Piemonte"].includes(province.Region)?"<b>des hivers longs et froids</b> et <b>des étés secs et très chauds</b>. Il y a de fréquentes précipitations en automne et au printemps, et <b>le brouillard n'est pas rare</b>."
        :(["Friuli-Venezia Giulia","Marche","Abruzzo","Puglia"].includes(province.Region)?"<b>des hivers froids</b> et <b>des étés chauds mais venteux</b>, avec des précipitations assez fréquentes réparties tout au long de l'année."
        :(["Umbria","Molise","Basilicata"].includes(province.Region)?"<b>des hivers longs et froids avec des chutes de neige fréquentes dans les zones montagneuses</b>, et <b>des étés assez chauds et secs</b>."
        :((["Trentino-Alto Adige","Val d'Aosta","Valle d'Aosta"].includes(province.Region)||
        ["Belluno","Verbano-Cusio-Ossola","Udine","Como","Bergamo","Varese","Biella"].includes(province.Name))?
        "<b>des hivers longs et très froids avec beaucoup de neige</b>, <b>des étés courts et doux</b>."
        :""
        ))))))+'\n </br></br>'+"La province de "+frProvince+" connaît en moyenne "+((province.HotDays/3.5)*12).toFixed(2)+" jours de températures chaudes (plus de 30°C) et "+
        ((province.ColdDays/3.5)*12).toFixed(2)+" jours de températures froides (<5°C) par an. <br><br> Les précipitations sous forme de pluie ou de neige surviennent environ "+(province.RainyDays*12).toFixed(2)+" jours par an. "+
        (province.FoggyDays<1?"Le brouillard est rarement un problème, avec peu ou pas de jours de brouillard tout au long de l'année. ":"Il y a "+((province.FoggyDays/3.5)*12).toFixed(2)+" jours de brouillard tout au long de l'année. ")+
        "<br><br>La commune de " + comune.Name + " bénéficie d'environ " + province.SunshineHours/30 + " heures de soleil par jour. Cela signifie que la commune connaît en moyenne " +(((province.SunshineHours/30)/9)*365).toFixed(2)+ " jours ensoleillés par an.</p>";

    let info = getInfo(comune, province);

    let disclaimer='<center><div style="display:inline;" id="disclaimer">Cette page contient des liens d\'affiliation. En tant que partenaire Amazon Associates et Viator, nous pouvons gagner une commission sur les achats qualifiés.</div></center>'

    let getyourguide='<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>'

    let expedia='<div id="searchWidget" style="width:98%;height:550px;"><iframe id="widgetIframe" src="https://www.expedia.com/marketing/widgets/searchform/widget?wtt=5&tp1=1101l3BUi9&tp2=expiter&lob=H,FH,CA,CR,A&des='
        +comune.Name+'&wbi=13&olc=000000&whf=4&hfc=C7C7C7&wif=4&ifc=000000&wbc=FFCC00&wbf=4&bfc=3D3100&wws=2&sfs=H550FW98R&langid=1036" width="100%" height="100%" scrolling="no" frameborder="0"></iframe></div>'

    expedia += '<div style="text-align:center; margin-top:20px;">Rechercher : ' + ['Hôtels', 'Appartements', 'Chambres d\'hôtes', 'Villas'].map((lodging, index) => `<a href="https://www.expedia.com/Hotel-Search?lodging=${['HOTEL', 'APARTMENT', 'BED_AND_BREAKFAST', 'VILLA'][index]}&destination=${comune.Name}&camref=1101l3BUi9&creativeref=1100l68075" target="_blank" rel="nofollow sponsored" style="font-size:18px; margin: 0 10px;">${lodging}</a>` + (index < 3 ? ' | ' : '')).join('') + '</div>';

    const enProvinceSlug = province.Name.replace(/'/g,"-").replace(/\s+/g,"-").toLowerCase();
    const provinceUrl = 'https://expiter.com/fr/province/'+handle(frProvince)+'/';

    const tabRows = buildTabRows(province);

    const toc =
      '<ul>'+
        '<li><a href="#Info-Sheet">Fiche d\'information</a></li>'+
        '<li><a href="#Overview">À propos de '+comune.Name+'</a></li>'+
        '<li><a href="#Climate">Climat</a></li>'+
        '<li><a href="#Map">Carte</a></li>'+
        '<li><a href="#Tours">Expériences &amp; Tours</a></li>'+
        '<li><a href="#Hotels">Hôtels</a></li>'+
        '<li><a href="#Nearby">Communes Proches</a></li>'+
        '<li><a href="#Related">Provinces à Proximité</a></li>'+
      '</ul>';

    const seoTitle = comune.Name+" - Vivre à "+comune.Name+", "+frProvince+" - Expiter";
    const seoDescription = 'Informations sur la vie à '+comune.Name+', province de '+frProvince+'. Qualité de vie, coût de la vie, sécurité et plus encore pour les expatriés.';
    const seoKeywords = comune.Name+' italie, '+comune.Name+' expatriés,'+comune.Name+' vie,'+comune.Name+' nomade digital';

    return nunjucks.render('pages/town-fr.njk', {
        lang: 'fr',
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl: 'https://expiter.com/'+dirName+fileName+'/',
        hreflangEn: 'https://expiter.com/comuni/'+enProvinceSlug+'/'+fileName+'/',
        heroImage: 'https://expiter.com/img/'+province.Abbreviation+'.webp',
        heroAlt: comune.Name+', '+frProvince+', Italie',
        eyebrow: frRegion + ' · ' + frProvince + ' · Commune',
        pageTitle: comune.Name+', '+frProvince+', Italie',
        sidebar,
        tabRows,
        toc,
        // page-specific
        townName: comune.Name,
        provinceName: frProvince,
        provinceUrl,
        regionName: frRegion,
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
        articleSection: 'Commune',
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
        const slug = handle(fr(province.Name));
        facts[province["Name"]].snippet=
            '<li><a href="https://expiter.com/fr/province/'+slug+'/" title="'+fr(province.Name)+', '+fr(province.Region)+'">'+
            '<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-56,h-56,fo-auto,q-60" '+
            'alt="'+fr(province.Name)+'" width="28" height="28">'+
            '<span>'+fr(province.Name)+', '+fr(province.Region)+'</span></a></li>';
    }
    avg=data[107];
}


function getInfo(comune,province){
    let name=comune.Name;
    let region=regions[province.Region];

    let info = {}

    info.map='<center class="map"><iframe id="ggmap" src="https://maps.google.com/maps?f=q&source=s_q&hl=fr&geocode=&q='+comune.Name+'+Province+De+'+province.Name+'&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>'+
        'Rechercher : '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=fr&geocode=&q='+comune.Name+'+Province+De+'+province.Name+'+Attractions&output=embed")\' target="_blank"><b><ej>🎭</ej>Attractions</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=fr&geocode=&q='+comune.Name+'+Province+De+'+province.Name+'+Museums&output=embed")\' target="_blank"><b><ej>🏺</ej>Musées</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=fr&geocode=&q='+comune.Name+'+Province+De+'+province.Name+'+Restaurants&output=embed")\' target="_blank"><b><ej>🍕</ej>Restaurants</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=fr&geocode=&q='+comune.Name+'+Province+De+'+province.Name+'+Bars&output=embed")\' target="_blank"><b><ej>🍺</ej>Bars</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=fr&geocode=&q='+comune.Name+'+Province+De+'+province.Name+'+Beaches&output=embed")\' target="_blank"><b><ej>🏖️</ej>Plages</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=fr&geocode=&q='+comune.Name+'+Province+De+'+province.Name+'+Hiking&output=embed")\' target="_blank"><b><ej>⛰️</ej>Randonnées</b></a> '+
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
            info.nearby+='<b><a href="https://expiter.com/fr/municipalites/'+handle(fr(province.Name))+'/'+
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

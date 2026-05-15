import * as pb from './js/pageBuilder.js'
import fetch from 'node-fetch';
import fs from 'fs';
import { nunjucks } from './js/nunjucksEnv.js'
import { es } from './js/pageBuilder.js'

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
            let sidebar = pb.setSideBarES(province);

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

                var dirName = 'es/municipios/'+handle(es(province.Name))+'/';
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
    const esProvince = es(province.Name);
    const esRegion = es(province.Region);

    let intro = "<b>"+comune.Name+" es un municipio de "+comune.Population+" habitantes ubicado en la "+
        "<a href='https://expiter.com/es/provincia/"+handle(esProvince)+"'>provincia de "+esProvince+"</a></b> en la región italiana de "+esRegion+
        " en <b>"+(center.includes(province.Region)?"Italia Central":(south.includes(province.Region)?"Italia del Sur":"Italia del Norte"))+"</b>."

    intro+='<br><br>'+'Tiene una <b>densidad de población de '+comune.Density+' personas por km²</b> y una <b>altitud de '+comune.Altitude+' metros</b> sobre el nivel del mar.'+'\n'

    intro+='</br></br><b>'+comune.Name+"</b> representa aproximadamente "+((comune.Population.split('.').join("")*100)/province.Population).toFixed(2)+"% de la población total en la provincia de "+esProvince+
        " y aproximadamente "+((comune.Population.split('.').join("")*100)/60260456).toFixed(5)+"% de la población total de Italia en 2022."

    if (ci>0 && comdata[ci]){
        intro+='<h3>Sobre '+comune.Name+'</h3>'+(comdata[ci].Landmarks||'')+'<br><br>'+(comdata[ci].History||'')
    }

    let zoneAtext="uno de los dos municipios más cálidos de Italia, el otro siendo "+(comune.Name=="Porto Empedocle"?
        "las islas Pelagie de <a href='https://expiter.com/es/municipios/agrigento/lampedusa-e-linosa/'>Lampedusa y Linosa</a>, geográficamente situadas en África":
        '<a href="https://expiter.com/es/municipios/agrigento/porto-empedocle/">Porto Empedocle</a>'+
        " en la isla principal de Sicilia, también en la provincia de Agrigento")

    let climate='<p style="font-size:21px; line-height:42px"><b>'+comune.Name+'</b> está clasificado como <b>Zona Climática '+comune.ClimateZone+'</b>, lo que significa que es '+
        (comune.ClimateZone==="A"?zoneAtext
        :(comune.ClimateZone==="B"?"uno de los lugares más cálidos y soleados de Italia"
        :(comune.ClimateZone==="C"?"un lugar bastante cálido"
        :(comune.ClimateZone==="D"?"un municipio templado según los estándares italianos"
        :(comune.ClimateZone==="E"?"un municipio bastante fresco"
        :(comune.ClimateZone==="F"?"uno de los lugares más fríos de Italia"
        :""))))))+"."+'\n'
    climate+=
        'El clima local se caracteriza por '+
        (["Sicilia","Calabria","Sardegna"].includes(province.Region)?"<b>inviernos cortos y suaves</b> y largos veranos <b>calurosos y secos. Las precipitaciones se concentran principalmente en el período invernal.</b>"
        :(["Liguria","Toscana","Lazio","Campania"].includes(province.Region)?"<b>inviernos cortos y suaves</b> con <b>veranos calurosos y algo ventosos</b> y pocas precipitaciones en general."
        :(["Emilia-Romagna","Veneto","Lombardia","Piemonte"].includes(province.Region)?"<b>inviernos largos y fríos</b> y <b>veranos secos y muy calurosos</b>. Hay frecuentes precipitaciones en otoño y primavera, y <b>la niebla no es infrecuente</b>."
        :(["Friuli-Venezia Giulia","Marche","Abruzzo","Puglia"].includes(province.Region)?"<b>inviernos fríos</b> y <b>veranos calurosos pero ventosos</b>, con precipitaciones bastante frecuentes distribuidas a lo largo del año."
        :(["Umbria","Molise","Basilicata"].includes(province.Region)?"<b>inviernos largos y fríos con frecuentes nevadas en zonas montañosas</b>, y <b>veranos bastante cálidos y secos</b>."
        :((["Trentino-Alto Adige","Val d'Aosta","Valle d'Aosta"].includes(province.Region)||
        ["Belluno","Verbano-Cusio-Ossola","Udine","Como","Bergamo","Varese","Biella"].includes(province.Name))?
        "<b>inviernos largos y muy fríos con abundantes nevadas</b>, <b>veranos cortos y suaves</b>."
        :""
        ))))))+'\n </br></br>'+"La provincia de "+esProvince+" experimenta en promedio "+((province.HotDays/3.5)*12).toFixed(2)+" días de temperaturas cálidas (más de 30°C) y "+
        ((province.ColdDays/3.5)*12).toFixed(2)+" días de temperaturas frías (<5°C) al año. <br><br> Las precipitaciones en forma de lluvia o nieve ocurren aproximadamente "+(province.RainyDays*12).toFixed(2)+" días al año. "+
        (province.FoggyDays<1?"La niebla raramente es un problema, con pocos o ningún día de niebla durante el año. ":"Hay "+((province.FoggyDays/3.5)*12).toFixed(2)+" días de niebla a lo largo del año. ")+
        "<br><br>El municipio de " + comune.Name + " disfruta de aproximadamente " + province.SunshineHours/30 + " horas de sol al día. Esto significa que el municipio experimenta un promedio de " +(((province.SunshineHours/30)/9)*365).toFixed(2)+ " días soleados al año.</p>";

    let info = getInfo(comune, province);

    let disclaimer='<center><div style="display:inline;" id="disclaimer">Esta página contiene enlaces de afiliados. Como parte de los programas Amazon Associates y Viator Partner, podemos ganar una comisión en compras calificadas.</div></center>'

    let getyourguide='<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>'

    let expedia='<div id="searchWidget" style="width:98%;height:550px;"><iframe id="widgetIframe" src="https://www.expedia.com/marketing/widgets/searchform/widget?wtt=5&tp1=1101l3BUi9&tp2=expiter&lob=H,FH,CA,CR,A&des='
        +comune.Name+'&wbi=13&olc=000000&whf=4&hfc=C7C7C7&wif=4&ifc=000000&wbc=FFCC00&wbf=4&bfc=3D3100&wws=2&sfs=H550FW98R&langid=3082" width="100%" height="100%" scrolling="no" frameborder="0"></iframe></div>'

    expedia += '<div style="text-align:center; margin-top:20px;">Buscar: ' + ['Hoteles', 'Apartamentos', 'Bed & Breakfasts', 'Villas'].map((lodging, index) => `<a href="https://www.expedia.com/Hotel-Search?lodging=${['HOTEL', 'APARTMENT', 'BED_AND_BREAKFAST', 'VILLA'][index]}&destination=${comune.Name}&camref=1101l3BUi9&creativeref=1100l68075" target="_blank" rel="nofollow sponsored" style="font-size:18px; margin: 0 10px;">${lodging}</a>` + (index < 3 ? ' | ' : '')).join('') + '</div>';

    const enProvinceSlug = province.Name.replace(/'/g,"-").replace(/\s+/g,"-").toLowerCase();
    const provinceUrl = 'https://expiter.com/es/provincia/'+handle(esProvince)+'/';

    const tabRows = buildTabRows(province);

    const toc =
      '<ul>'+
        '<li><a href="#Info-Sheet">Ficha Informativa</a></li>'+
        '<li><a href="#Overview">Sobre '+comune.Name+'</a></li>'+
        '<li><a href="#Climate">Clima</a></li>'+
        '<li><a href="#Map">Mapa</a></li>'+
        '<li><a href="#Tours">Experiencias &amp; Tours</a></li>'+
        '<li><a href="#Hotels">Hoteles</a></li>'+
        '<li><a href="#Nearby">Municipios Cercanos</a></li>'+
        '<li><a href="#Related">Provincias Cercanas</a></li>'+
      '</ul>';

    const seoTitle = comune.Name+" - Vivir en "+comune.Name+", "+esProvince+" - Expiter";
    const seoDescription = 'Información sobre vivir en '+comune.Name+', provincia de '+esProvince+'. Calidad de vida, costo de vida, seguridad y más para expatriados.';
    const seoKeywords = comune.Name+' italia, '+comune.Name+' expatriados,'+comune.Name+' vida,'+comune.Name+' nomada digital';

    return nunjucks.render('pages/town-es.njk', {
        lang: 'es',
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl: 'https://expiter.com/'+dirName+fileName+'/',
        hreflangEn: 'https://expiter.com/comuni/'+enProvinceSlug+'/'+fileName+'/',
        heroImage: 'https://expiter.com/img/'+province.Abbreviation+'.webp',
        heroAlt: comune.Name+', '+esProvince+', Italia',
        eyebrow: esRegion + ' · ' + esProvince + ' · Municipio',
        pageTitle: comune.Name+', '+esProvince+', Italia',
        sidebar,
        tabRows,
        toc,
        // page-specific
        townName: comune.Name,
        provinceName: esProvince,
        provinceUrl,
        regionName: esRegion,
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
        articleSection: 'Municipio',
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
        const slug = handle(es(province.Name));
        facts[province["Name"]].snippet=
            '<li><a href="https://expiter.com/es/provincia/'+slug+'/" title="'+es(province.Name)+', '+es(province.Region)+'">'+
            '<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-56,h-56,fo-auto,q-60" '+
            'alt="'+es(province.Name)+'" width="28" height="28">'+
            '<span>'+es(province.Name)+', '+es(province.Region)+'</span></a></li>';
    }
    avg=data[107];
}


function getInfo(comune,province){
    let name=comune.Name;
    let region=regions[province.Region];

    let info = {}

    info.map='<center class="map"><iframe id="ggmap" src="https://maps.google.com/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+de+'+province.Name+'&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>'+
        'Buscar: '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+de+'+province.Name+'+Attractions&output=embed")\' target="_blank"><b><ej>🎭</ej>Atracciones</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+de+'+province.Name+'+Museums&output=embed")\' target="_blank"><b><ej>🏺</ej>Museos</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+de+'+province.Name+'+Restaurants&output=embed")\' target="_blank"><b><ej>🍕</ej>Restaurantes</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+de+'+province.Name+'+Bars&output=embed")\' target="_blank"><b><ej>🍺</ej>Bares</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+de+'+province.Name+'+Beaches&output=embed")\' target="_blank"><b><ej>🏖️</ej>Playas</b></a> '+
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=es&geocode=&q='+comune.Name+'+Provincia+de+'+province.Name+'+Hiking&output=embed")\' target="_blank"><b><ej>⛰️</ej>Senderismo</b></a> '+
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
            info.nearby+='<b><a href="https://expiter.com/es/municipios/'+handle(es(province.Name))+'/'+
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

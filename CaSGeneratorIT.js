import * as pb from './js/pageBuilder.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { nunjucks } from './js/nunjucksEnv.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var dataset;
var provinces = {};
var facts = {};
var avg;
var regions = {};

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
    '<li><a href="https://expiter.com/it/province/'+slug+'/sicurezza-e-criminalita/" title="Crimine e sicurezza a '+province.Name+', '+province.Region+'">'+
    '<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-56,h-56,fo-auto,q-60" '+
    'alt="'+province.Name+'" width="28" height="28">'+
    '<span>'+province.Name+'</span></a></li>';
  }
  avg=data[107];
}

fetch('https://expiter.com/dataset.json', { method: 'Get' })
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    dataset = data;
    populateData(data);
    return fetch('https://expiter.com/dataset_crime_2023.json', { method: 'Get' });
  })
  .then(function (response) {
    return response.json();
  })
  .then(function (crimeDataset2023) {
    const combinedData = dataset.map(entry => {
      const crimeData = crimeDataset2023.find(c => c.Name === entry.Name);
      return crimeData ? { ...entry, ...crimeData } : entry;
    });

    populateData(combinedData);

    for (let i = 0; i < 107; i++) {
      let province = combinedData[i];

      let dirName = 'it/province/'+province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
      let dir = path.join(__dirname, dirName);

      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
      }

      let htaccessContent = `RewriteEngine on\nRewriteRule ^$ /${dirName}.html [L]\nRewriteRule ^([a-zA-Z0-9-]+)/$ $1.html [L]`;
      fs.writeFileSync(path.join(dir, '.htaccess'), htaccessContent);

      var fileName = dirName+'/sicurezza-e-criminalita';
      let html = renderPage(province, fileName);
      fs.writeFile(fileName+".html", html, function (err) {
        if (err) throw err;
        console.log(province.Name+".html Salvato!");
      });
    }
  })
  .catch(function (err) {
    console.log('errore: ' + err);
  });

function renderPage(province, fileName){
    let info = getInfo(province)
    let separator='</br><div class="separator"></div></br>'
    const tabRows = buildTabRows(province)
    const toc =
      '<ul>'+
        '<li><a href="#Panoramica">Panoramica</a></li>'+
        '<li><a href="#Criminalita-e-Sicurezza">Criminalità e Sicurezza</a></li>'+
        '<li><a href="#Furti-e-Rapine">Furti e Rapine</a></li>'+
        '<li><a href="#Reati-Violenti">Reati Violenti</a></li>'+
        '<li><a href="#Crimine-Organizzato">Crimine Organizzato</a></li>'+
        '<li><a href="#Incidenti">Incidenti</a></li>'+
        '<li><a href="#Scoprire">Scoprire</a></li>'+
      '</ul>'

    const seoTitle = province.Name+" - Scheda informativa su criminalità e sicurezza"
    const seoDescription = 'Informazioni su criminalità e sicurezza a '+province.Name+', Italia. '+province.Name+' indice di criminalità, attività mafiosa, sicurezza e altro ancora.'
    const seoKeywords = province.Name+' italia, '+province.Name+' è sicuro, '+province.Name+' criminalità, '+province.Name+' mafia'

    return nunjucks.render('pages/crime-safety-it.njk', {
        lang: 'it',
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl: 'https://expiter.com/'+fileName+'/',
        hreflangIt: 'https://expiter.com/'+fileName+'/',
        heroImage: 'https://expiter.com/img/safety/'+province.Abbreviation+'.webp',
        heroAlt: 'Provincia di '+province.Name,
        pageTitle: 'Criminalità e sicurezza a '+province.Name,
        eyebrow: province.Region+' · Criminalità e Sicurezza',
        sidebar: pb.setSideBarIT(province),
        tabRows,
        toc,
        overview: pb.addBreaks(info.overview||''),
        crimeandsafety: pb.addBreaks(info.crimeandsafety) + separator,
        theftsandrobberies: info.theftsandrobberies + separator,
        violentcrimes: pb.addBreaks(info.violentcrimes) + separator,
        organizedcrime: pb.addBreaks(info.organizedcrime) + separator,
        accidents: pb.addBreaks(info.accidents) + separator,
        promo: (info.viator||'') + separator + (info.getyourguide||'') + separator + (info.related||'')
    })
}

function getInfo(province){
  populateFacts()

  let info = {}
  let name = province.Name;
  let region = regions[province.Region];

  let safetyVerdict;
  if (province.SafetyRank <= 27)       safetyVerdict = "<b class='green'>una delle province italiane più sicure</b>";
  else if (province.SafetyRank <= 53)  safetyVerdict = "<b class='green'>moderatamente sicura</b> rispetto alle altre province italiane";
  else if (province.SafetyRank <= 79)  safetyVerdict = "<b class='orange'>nella media</b> rispetto alle altre province italiane in termini di sicurezza";
  else                                  safetyVerdict = "<b class='red'>una delle province italiane meno sicure</b>";

  info.overview =
    '<div class="province-hero" role="img" aria-label="Provincia di '+province.Name+'" '+
    'style="background-image:url(\'https://expiter.com/img/safety/'+province.Abbreviation+'.webp\')"></div>'+
    '<p class="lede">Questa pagina offre una panoramica basata sui dati su <b>criminalità e sicurezza a '+province.Name+'</b>'+
    (province.Region ? ', nella regione '+province.Region : '')+'. '+
    'Secondo le statistiche ufficiali 2023, '+province.Name+' è '+safetyVerdict+', '+
    'con un posizionamento di <b>'+province.SafetyRank+' su 106</b> e un punteggio di sicurezza di <b>'+province.SafetyScore+'/10</b>.</p>'+
    '<p>Di seguito troverai dettagli su furti, crimini violenti, crimine organizzato, reati legati alla droga e incidenti, '+
    'insieme alle risposte alle domande più comuni sulla sicurezza a '+province.Name+'.</p>'

  info.crimeandsafety="La provincia di "+province.Name+" si classifica <b>"+province.SafetyRank+" su 106 per sicurezza</b> secondo i nostri dati, con un <b>punteggio di sicurezza di "+province.SafetyScore+"</b>. "+
    "Ci sono stati un totale di " + province.IndiceCriminalita + " segnalazioni ufficiali di crimini per 100.000 abitanti nella provincia nel 2023. Questo è " +
    (province.IndiceCriminalita > avg.IndiceCriminalita ? "<b class='red'>superiore alla media</b> del numero di crimini segnalati per 100.000 abitanti in tutte le province italiane. Questo potrebbe essere dovuto a una varietà di fattori, tra cui condizioni socio-economiche e pratiche di law enforcement." :
    (province.IndiceCriminalita < avg.IndiceCriminalita ? "<b class='green'>inferiore alla media</b> del numero di crimini segnalati per 100.000 abitanti in tutte le province italiane. Questo potrebbe indicare pratiche efficaci di law enforcement, o altri fattori che contribuiscono a ridurre i tassi di criminalità." :
    "<b class='yellow'>in linea con la media</b> del numero di crimini segnalati per 100.000 abitanti in tutte le province italiane. Questo suggerisce che il tasso di criminalità in " + province.Name + " è tipico per le province italiane."))

  info.theftsandrobberies = "Nella provincia di "+province.Name+", ci sono stati <b>"+province.FurtiDestrezza+" casi di furti con destrezza</b>, <b>"+province.FurtiStrappo+" casi di furti con strappo</b>, <b>"+province.FurtiAutovettura+" furti di auto</b>, e <b>"+province.FurtiAbitazione+" furti in abitazione</b> per 100.000 abitanti nel 2023.<br><br>"+
  "Di seguito è presentata una panoramica di come questi tipi di furto si confrontano con la media di tutte le province italiane: <br><br>"+
  (province.FurtiDestrezza > avg.FurtiDestrezza ? "<b class='red'>I furti con destrezza sono superiori alla media</b>." :
  (province.FurtiDestrezza < avg.FurtiDestrezza ? "<b class='green'>I furti con destrezza sono inferiori alla media</b>." :
  "<b class='yellow'>I furti con destrezza sono in linea con la media</b>.")) +
  '<br><br>'+
  (province.FurtiStrappo > avg.FurtiStrappo ? "<b class='red'>I furti con strappo sono superiori alla media</b>." :
  (province.FurtiStrappo < avg.FurtiStrappo ? "<b class='green'>I furti con strappo sono inferiori alla media</b>." :
  "<b class='yellow'>I furti con strappo sono in linea con la media</b>.")) +
  '<br><br>'+
  (province.FurtiAutovettura > avg.FurtiAutovettura ? "<b class='red'>I furti di auto sono superiori alla media</b>." :
  (province.FurtiAutovettura < avg.FurtiAutovettura ? "<b class='green'>I furti di auto sono inferiori alla media</b>." :
  "<b class='yellow'>I furti di auto sono in linea con la media</b>.")) +
  '<br><br>'+
  (province.FurtiAbitazione > avg.FurtiAbitazione ? "<b class='red'>I furti in abitazione sono superiori alla media</b>." :
  (province.FurtiAbitazione < avg.FurtiAbitazione ? "<b class='green'>I furti in abitazione sono inferiori alla media</b>." :
  "<b class='yellow'>I furti in abitazione sono in linea con la media</b>."));

  info.violentcrimes = "Nella provincia di "+province.Name+", ci sono stati "+(province.Omicidi + province.ViolenzeSessuali)+" casi di crimini violenti (omicidi e aggressioni sessuali) per 100.000 abitanti nel 2023. Questo è "+
  (province.Omicidi + province.ViolenzeSessuali > avg.Omicidi + avg.ViolenzeSessuali ? "<b class='red'>superiore alla media</b> del numero di crimini violenti per 100.000 abitanti in tutte le province italiane." :
  (province.Omicidi + province.ViolenzeSessuali < avg.Omicidi + avg.ViolenzeSessuali ? "<b class='green'>inferiore alla media</b> del numero di crimini violenti per 100.000 abitanti in tutte le province italiane." :
  "<b class='yellow'>in linea con la media</b> del numero di crimini violenti per 100.000 abitanti in tutte le province italiane."));

  info.organizedcrime = "Nella provincia di "+province.Name+", ci sono stati "+province.Estorsioni+" casi di estorsioni, "+province.RiciclaggioDenaro+" casi di riciclaggio di denaro, e "+province.ReatiStupefacenti+" crimini legati alla droga per 100.000 abitanti nel 2023. "+
  '<br><br>'+(province.Estorsioni > avg.Estorsioni ? "<b class='red'>Le estorsioni sono superiori alla media per tutte le province in Italia</b>." :
  (province.Estorsioni < avg.Estorsioni ? "<b class='green'>Le estorsioni sono inferiori alla media tra tutte le province italiane</b>." :
  "<b class='yellow'>Le estorsioni sono in linea con la media per le province in Italia</b>.")) +
  '<br><br>'+(province.RiciclaggioDenaro > avg.RiciclaggioDenaro ? "<b class='red'>I casi di riciclaggio di denaro sono superiori alla media in tutte le province del paese</b>." :
  (province.RiciclaggioDenaro < avg.RiciclaggioDenaro ? "<b class='green'>I casi di riciclaggio di denaro sono inferiori alla media per tutte le province del paese</b>." :
  "<b class='yellow'>I casi di riciclaggio di denaro sono in linea con la media nazionale</b>.")) +
  '<br><br>'+(province.ReatiStupefacenti > avg.ReatiStupefacenti ? "<b class='red'>I crimini legati alla droga sono superiori alla media per tutte le province italiane</b>." :
  (province.ReatiStupefacenti < avg.ReatiStupefacenti ? "<b class='green'>I crimini legati alla droga sono inferiori alla media per tutte le province italiane</b>." :
  "<b class='yellow'>I crimini legati alla droga sono in linea con la media tra le province italiane</b>."))
  +(facts[province.Name].mafia?'<br><br><h3>Attività mafiosa</h3>'+facts[province.Name].mafia:"");

  info.accidents = "Nella provincia di "+province.Name+", ci sono stati "+province.InfortuniLavoro+" casi di incidenti mortali e di invalidità permanente per 10.000 dipendenti, e "+province.MortalitàIncidenti+" morti per incidenti stradali per 10.000 residenti nel 2023. "+
  (province.InfortuniLavoro > avg.InfortuniLavoro ? "<b class='red'>Gli incidenti sul lavoro sono superiori alla media per tutte le province italiane</b>." :
  (province.InfortuniLavoro < avg.InfortuniLavoro ? "<b class='green'>Gli incidenti sul lavoro sono inferiori rispetto alla media di tutte le province in Italia</b>." :
  "<b class='yellow'>Gli incidenti sul lavoro sono in linea con la media nazionale</b>.")) +
  '<br><br>'+(province.MortalitàIncidenti > avg.MortalitàIncidenti ? "<b class='red'>Le morti per incidenti stradali sono superiori alla media nazionale</b>." :
  (province.MortalitàIncidenti < avg.MortalitàIncidenti ? "<b class='green'>Le morti per incidenti stradali sono inferiori alla media nazionale</b>." :
  "<b class='yellow'>Le morti per incidenti stradali sono in linea con la media nazionale</b>."));

  info.viator='<center><h3>Tour consigliati a '+(province.Viator?name:region.Name)+'</h3></center>'+
  '<div data-vi-partner-id=P00045447 data-vi-language=it data-vi-currency=EUR data-vi-partner-type="AFFILIATE" data-vi-url="'+
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

  info.related='<h2>Altre Province</h2>'+
  '<ul class="nearby-pills">'+
  facts[related1].snippet+
  facts[related2].snippet+
  facts[related3].snippet+
  facts[related4].snippet+'</ul>'

  return info;
}


// Returns { tier, text } — same thresholds as EN, Italian labels
function qualityScoreData(quality, score){
    let expenses=["Cost of Living (Individual)","Cost of Living (Family)","Cost of Living (Nomad)",
      "StudioRental","BilocaleRent","TrilocaleRent","MonthlyIncome",
      "StudioSale","BilocaleSale","TrilocaleSale"];

    if (quality=="CostOfLiving"||quality=="HousingCost"){
      if (score<avg[quality]*.8)             return {tier:'excellent', text:'molto basso'};
      if (score<avg[quality]*.95)            return {tier:'great',     text:'basso'};
      if (score<avg[quality]*1.05)           return {tier:'good',      text:'nella media'};
      if (score<avg[quality]*1.2)            return {tier:'average',   text:'alto'};
      return {tier:'poor', text:'molto alto'};
    }
    if (expenses.includes(quality)){
      let tier;
      if (score<avg[quality]*.95)            tier='great';
      else if (score<avg[quality]*1.05)      tier='average';
      else                                   tier='poor';
      return {tier, text: score+'€/m', isAmount:true};
    }
    if (quality=="HotDays"||quality=="ColdDays"){
      const w = (quality=="HotDays"?"caldo":"freddo");
      if (score<avg[quality]*.8)             return {tier:'excellent', text:'non '+w};
      if (score<avg[quality]*.95)            return {tier:'great',     text:'non molto '+w};
      if (score<avg[quality]*1.05)           return {tier:'good',      text:"un po' "+w};
      if (score<avg[quality]*1.2)            return {tier:'average',   text:w};
      return {tier:'poor', text:'molto '+w};
    }
    if (quality=="RainyDays"){
      if (score<avg[quality]*.8)             return {tier:'excellent', text:'molto poca'};
      if (score<avg[quality]*.95)            return {tier:'great',     text:'poca'};
      if (score<avg[quality]*1.05)           return {tier:'good',      text:'nella media'};
      if (score<avg[quality]*1.2)            return {tier:'average',   text:'piovoso'};
      return {tier:'poor', text:'molto piovoso'};
    }
    if (quality=="FoggyDays"){
      if (score<avg[quality]*.265)           return {tier:'excellent', text:'niente nebbia'};
      if (score<avg[quality]*.6)             return {tier:'great',     text:'poca'};
      if (score<avg[quality]*1.00)           return {tier:'good',      text:'nella media'};
      if (score<avg[quality]*3)              return {tier:'average',   text:'nebbioso'};
      return {tier:'poor', text:'molto nebbioso'};
    }
    if (quality=="Crime"||quality=="Traffic"){
      if (score<avg[quality]*.8)             return {tier:'excellent', text:'molto basso'};
      if (score<avg[quality]*.95)            return {tier:'great',     text:'basso'};
      if (score<avg[quality]*1.05)           return {tier:'good',      text:'nella media'};
      if (score<avg[quality]*1.2)            return {tier:'average',   text:'alto'};
      return {tier:'poor', text:'molto alto'};
    }
    if (score<avg[quality]*.8)               return {tier:'poor',      text:'scarso'};
    if (score<avg[quality]*.95)              return {tier:'average',   text:'okay'};
    if (score<avg[quality]*1.05)             return {tier:'good',      text:'buono'};
    if (score<avg[quality]*1.2)              return {tier:'great',     text:'molto buono'};
    return {tier:'excellent', text:'ottimo'};
}

function buildTabRows(province){
    const q = (k, prop) => qualityScoreData(k, province[prop !== undefined ? prop : k]);
    return {
      qualityOfLife: [
        {emoji:'👥', label:'Popolazione', raw: province.Population.toLocaleString('it', {useGrouping:true})},
        {emoji:'🚑', label:'Sanità', ...q('Healthcare')},
        {emoji:'📚', label:'Istruzione', ...q('Education', 'Education')},
        {emoji:'👮', label:'Sicurezza', ...q('Safety')},
        {emoji:'🚨', label:'Criminalità', ...q('Crime')},
        {emoji:'🚌', label:'Trasporti', ...q('PublicTransport')},
        {emoji:'🚥', label:'Traffico', ...q('Traffic')},
        {emoji:'🚴', label:'Bici', ...q('CyclingLanes')},
        {emoji:'🏛️', label:'Cultura', ...q('Culture')},
        {emoji:'🍸', label:'Movida', ...q('Nightlife')},
        {emoji:'⚽', label:'Svaghi', ...q('Sports & Leisure')},
        {emoji:'🌦️', label:'Clima', ...q('Climate')},
        {emoji:'☀️', label:'Sole', ...q('SunshineHours')},
        {emoji:'🥵', label:'Estati', ...q('HotDays')},
        {emoji:'🥶', label:'Inverni', ...q('ColdDays')},
        {emoji:'🌧️', label:'Pioggia', ...q('RainyDays')},
        {emoji:'🌫️', label:'Nebbia', ...q('FoggyDays')},
        {emoji:"🍃", label:"Qualità dell'Aria", ...q('AirQuality')},
        {emoji:'👪', label:'Per famiglie', ...q('Family-friendly')},
        {emoji:'👩', label:'Per donne', ...q('Female-friendly')},
        {emoji:'🏳️‍🌈', label:'LGBTQ+', ...q('LGBT-friendly')},
        {emoji:'🥗', label:'Vegan', ...q('Veg-friendly')},
      ],
      costOfLiving: [
        {emoji:'📈', label:'Costo della Vita', ...q('CostOfLiving')},
        {emoji:'🏙️', label:'Costi abitativi', ...q('HousingCost')},
        {emoji:'💵', label:'Stipendi', ...q('MonthlyIncome')},
        {emoji:'🧑', label:'Costi (individuo)', ...q('Cost of Living (Individual)')},
        {emoji:'👪', label:'Costi (famiglia)', ...q('Cost of Living (Family)')},
        {emoji:'🎒', label:'Costi (turista)', ...q('Cost of Living (Nomad)')},
        {emoji:'🏠', label:'Affitti (monolocale)', ...q('StudioRental')},
        {emoji:'🏘️', label:'Affitti (bilocale)', ...q('BilocaleRent')},
        {emoji:'🏰', label:'Affitti (trilocale)', ...q('TrilocaleRent')},
        {emoji:'🏠', label:'Acquisto (monolocale)', ...q('StudioSale')},
        {emoji:'🏘️', label:'Acquisto (bilocale)', ...q('BilocaleSale')},
        {emoji:'🏰', label:'Acquisto (trilocale)', ...q('TrilocaleSale')},
      ],
      digitalNomads: [
        {emoji:'👩‍💻', label:'Nomad-friendly', ...q('DN-friendly')},
        {emoji:'💸', label:'Spese per Nomadi', ...q('Cost of Living (Nomad)')},
        {emoji:'📡', label:'Connessione Ultra-veloce', ...q('HighSpeedInternetCoverage')},
        {emoji:'💃', label:'Divertimento', ...q('Fun')},
        {emoji:'🤗', label:'Simpatia', ...q('Friendliness')},
        {emoji:'🤐', label:'Internazionalità', ...q('English-speakers')},
        {emoji:'😊', label:'Felicità', ...q('Antidepressants')},
        {emoji:'📈', label:'Innovazione', ...q('Innovation')},
        {emoji:'🏖️', label:'Spiagge', ...q('Beach')},
        {emoji:'⛰️', label:'Escursionismo', ...q('Hiking')},
      ],
    };
}

function populateFacts(){
    facts.Roma.mafia="Roma è un importante centro di attività mafiosa con la presenza di diversi gruppi di criminalità organizzata come la 'Ndrangheta, la Camorra e famiglie criminali romane autoctone. Queste organizzazioni collaborano in attività criminali e corruzione, con la famiglia criminale dei Casamonica che controlla i sobborghi sud-orientali di Roma e le colline albane circostanti. Nel 2015 il clan Casamonica ha tenuto un funerale sfarzoso per il loro boss Vittorio Casamonica mostrando il loro potere e nel 2018 cinque membri del clan sono stati condannati fino a 30 anni di carcere. La rete 'Mafia Capitale' scoperta nel 2014 coinvolge politici, uomini d'affari e funzionari corrotti che collaborano con gruppi criminali per manipolare gli appalti pubblici."
    facts.Milano.mafia="Milano ha una significativa presenza mafiosa con l'infiltrazione di vari gruppi di criminalità organizzata come la 'Ndrangheta dalla Calabria, la Camorra da Napoli e famiglie criminali milanesi autoctone. Questi gruppi hanno diversificato le loro attività dal racket tradizionale all'infiltrazione nell'economia legale attraverso il riciclaggio di denaro e la corruzione. Un rapporto del 2018 ha rilevato che circa 45 diverse bande di tipo mafioso operano a Milano. La 'Ndrangheta in particolare è diventata una forza dominante con il potente clan Valle con base a Milano che controlla gran parte del traffico di droga e delle operazioni di riciclaggio di denaro della città."
    facts.Napoli.mafia="Napoli ha una lunga storia di attività mafiosa principalmente associata alla Camorra, una delle organizzazioni criminali più antiche e potenti d'Italia. La Camorra ha profonde radici a Napoli e nella regione della Campania circostante, controllando varie attività illegali come il traffico di droga, l'estorsione e il racket. L'influenza dell'organizzazione si estende anche alle attività legittime, permettendole di riciclare denaro e espandere i suoi affari criminali. Gli sforzi per combattere la Camorra sono in corso, con le agenzie di applicazione della legge che prendono di mira figure chiave e operazioni per indebolire la presa dell'organizzazione sulla città."
    facts.Bari.mafia="Bari e la regione circostante della Puglia sono influenzate da vari gruppi criminali organizzati, incluso la Sacra Corona Unita, un'organizzazione di tipo mafioso emersa negli anni '80. Questo gruppo è coinvolto in una serie di attività criminali come il traffico di droga, l'estorsione e il riciclaggio di denaro e ha infiltrato imprese legittime e circoli politici. Nonostante gli sforzi delle forze dell'ordine che hanno portato a numerosi arresti e condanne di membri della Sacra Corona Unita, l'organizzazione continua a mantenere una presenza a Bari e nelle aree circostanti."
    facts.Catania.mafia="Catania è stata un punto caldo per l'attività della mafia, particolarmente legata ai clan della Cosa Nostra operanti nella zona; recenti operazioni della polizia a Catania hanno portato a significativi arresti, con 40 persone detenute in un'operazione mirata ai clan della Cosa Nostra nella città."
    facts.Palermo.mafia="Palermo, la capitale della Sicilia, è da lungo tempo considerata il luogo di nascita e il baluardo della Mafia siciliana, nota anche come Cosa Nostra. La città ha una storia radicata di influenza mafiosa, che risale alla metà del XIX secolo quando eserciti privati, o 'mafie', venivano assunti da proprietari assenti per proteggere le loro tenute dai banditi."
    facts.Torino.mafia="Ci sono prove della presenza e dell'attività della mafia a Torino e nella regione del Piemonte. Le indagini hanno rivelato l'infiltrazione della mafia nell'economia legale, particolarmente legata a progetti edili e appalti pubblici. Gruppi criminali come la 'Ndrangheta calabrese e le organizzazioni mafiose nigeriane hanno stabilito una base a Torino, impegnandosi in attività come il traffico di droga, l'estorsione e il riciclaggio di denaro."
    facts.Genova.mafia="La 'Ndrangheta, un potente gruppo criminale organizzato calabrese, ha una presenza significativa e influenza a Genova e nella regione circostante della Liguria. Le indagini hanno rivelato l'infiltrazione della mafia in aziende e progetti edili, inclusa la tragedia del crollo del ponte di Genova del 2018."
    facts.Venezia.mafia="La mafia ha una presenza significativa a Venezia, particolarmente sotto forma della 'Ndrangheta calabrese. Il gruppo ha infiltrato vari settori dell'economia della città, inclusi costruzioni, turismo e finanza."
    facts.Messina.mafia="La mafia ha una presenza significativa a Messina, particolarmente con l'influenza del clan Romeo-Santapaola. Questo clan detiene il potere nella città, con stretti legami con la Cosa Nostra a Palermo e il controllo su affari illeciti."
    facts.Firenze.mafia="Ci sono prove della presenza e dell'influenza della mafia a Firenze. La città è stata colpita dalle attività mafiose, inclusa l'esplosione del 1993 a Via dei Georgofili perpetrata dalla Mafia siciliana, che ha causato cinque morti e 48 feriti."
    facts.Caltanissetta.mafia="A Caltanissetta e a Gela, la mafia, in particolare Cosa Nostra, ha una forte presenza. Gruppi criminali come i Rinzivillo e gli Emmanuello sono attivi nonostante le azioni delle forze dell'ordine."
    facts.Bologna.mafia="Bologna e la regione dell'Emilia-Romagna sono storicamente libere da significativa presenza della mafia. Tuttavia, rapporti e indagini recenti rivelano segni di infiltrazione della mafia nella zona."
    facts.Cosenza.mafia="Cosenza ha una storia di attività mafiosa legata alla 'Ndrangheta, una delle organizzazioni criminali più potenti in Italia. La 'Ndrangheta ha una forte presenza nella regione Calabria, dove Cosenza è situata, e controlla diverse attività illegali come il traffico di droga, l'estorsione e il racket."
    facts.Siracusa.mafia="Siracusa ha una storia di attività mafiosa legata alla mafia siciliana, nota come Cosa Nostra. La mafia siciliana ha una forte presenza nella regione Sicilia, dove Siracusa è situata, e controlla diverse attività illegali come il traffico di droga, l'estorsione e il racket."
    facts["Reggio Calabria"].mafia="Reggio Calabria e la regione della Calabria sono riconosciute come roccaforti della 'Ndrangheta, una delle organizzazioni mafiose più potenti d'Italia."
    facts["L'Aquila"].mafia="L'Aquila, la città capoluogo della regione Abruzzo, è stata presa di mira da varie organizzazioni mafiose. La mafia nigeriana è stata attiva nella città, portando a operazioni della polizia e arresti."
    facts.Potenza.mafia="Potenza, in Basilicata, è interessata da una significativa presenza di organizzazioni criminali, tra cui la 'Ndrangheta e la Camorra."
    facts.Foggia.mafia="La città di Foggia e la sua provincia sono caratterizzate dalla presenza di una potente organizzazione criminale di stampo mafioso, comunemente conosciuta come 'Società foggiana' o 'mafia foggiana'. Questa mafia è considerata la 'Quarta Mafia' d'Italia, dopo Cosa Nostra in Sicilia, 'Ndrangheta in Calabria e Camorra in Campania."
    facts.Pescara.mafia="La città di Pescara e la sua provincia sono state infiltrate dalla potente 'Società foggiana', considerata la 'Quarta Mafia' d'Italia."
    facts["Catanzaro"].mafia="Catanzaro è un importante centro di attività mafiosa con la presenza di diversi gruppi di criminalità organizzata come la 'Ndrangheta, la Camorra e famiglie criminali calabresi autoctone."
    facts["Messina"].mafia="Messina è un importante centro di attività mafiosa. Diverse organizzazioni criminali come la 'Ndrangheta, la Camorra e Cosa nostra hanno una forte presenza nella città."
    facts["Lecce"].mafia="La mafia a Lecce è una presenza significativa, con la 'Ndrangheta che ha infiltrato il tessuto imprenditoriale locale."
    facts.Livorno.mafia="A Livorno, la mafia è rappresentata principalmente dalla 'ndrangheta, che ha stretto rapporti con gruppi criminali locali e si è insediata nel porto, dove gestisce traffici di droga e rifiuti."
    facts.Trieste.mafia="La criminalità organizzata è presente a Trieste e nel Friuli Venezia Giulia, anche se non in forma stabile e radicata."
    facts.Vicenza.mafia="A Vicenza, la mafia nigeriana è stata accertata dalle indagini giudiziarie."
    facts.Verona.mafia="A Verona, la 'Ndrangheta è stata coinvolta in traffici di droga e rifiuti tossici."
}

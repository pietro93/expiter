import * as pb from './js/pageBuilder.js';
import fetch from 'node-fetch';
import fs from 'fs';
import { nunjucks } from './js/nunjucksEnv.js';

var dataset;
var provinces = {};
var facts={};
var avg;
var regions ={};


fetch('https://expiter.com/dataset.json', {method:"Get"})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        dataset=data;
        populateData(data);
        for (let i = 0; i < 107; i++){
            let province = dataset[i];

            var fileName = 'it/province/'+province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();

            let parsedData = '';
            try { parsedData = fs.readFileSync('temp/it-parsedDataAbout'+province.Name+'.txt','utf8'); } catch(e) { parsedData = ''; }
            let provinceData = parsedData.split("%%%")[0]; if (provinceData=="undefined") provinceData="";
            let transportData = parsedData.split("%%%")[1]; if (transportData===undefined||transportData=="undefined") transportData="";
            facts[province.Name]["provinceData"]=provinceData;
            facts[province.Name]["transportData"]=transportData;

            let html = renderPage(province, fileName);
            fs.writeFile(fileName+".html", html, function (err) {
                if (err) throw err;
                console.log(dataset[i].Name+".html"+' Salvato!');
            });
        }
    })
    .catch(function (err) {
        console.log('errore: ' + err);
    });

    function renderPage(province, fileName){
        let info = getInfo(province)
        let separator='</br><div class="separator"></div></br>'

        let map =
        '<figure class="province-map">'+
        '<img alt="Mappa della provincia di '+province.Name+' in '+province.Region+'" '+
        'loading="lazy" '+
        'src="https://ik.imagekit.io/cfkgj4ulo/map/'+province["Region"].replace(/\s+/g,"-").replace("'","-")+'-provinces.webp?tr=w-340">'+
        '<figcaption>Mappa delle province della regione '+province.Region+' inclusa '+province.Name+'</figcaption>'+
        '</figure>'

        const tabRows = buildTabRows(province)
        const toc =
          '<ul>'+
            '<li><a href="#Informazioni-Generali">Informazioni Generali</a></li>'+
            '<li><a href="#Clima">Clima</a></li>'+
            '<li><a href="#Costo-della-Vita">Costo della Vita</a></li>'+
            '<li><a href="#Qualita-della-Vita">Qualità della Vita</a>'+
              '<ul>'+
                '<li><a href="#Sanita">Sanità</a></li>'+
                '<li><a href="#Istruzione">Istruzione</a></li>'+
                '<li><a href="#Svago">Svago</a></li>'+
                '<li><a href="#Criminalita-e-Sicurezza">Criminalità e Sicurezza</a></li>'+
                '<li><a href="#Trasporti">Trasporti</a></li>'+
              '</ul>'+
            '</li>'+
            '<li><a href="#Turismo">Turismo</a></li>'+
          '</ul>'

        const seoTitle = province.Name+" - Qualità e Costo della Vita"
        const seoDescription = 'Informazioni su come si vive a '+province.Name+' ('+province.Region+') per espatriati, fuori sede e nomadi digitali. '+province.Name+' qualità della vita, costo della vita, sicurezza e altre info utili.'
        const seoKeywords = 'vivere a '+province.Name+', '+province.Name+' nomadi digitali, '+province.Name+' qualità della vita, '+province.Name+' movida'

        return nunjucks.render('pages/province-it.njk', {
            lang: 'it',
            seoTitle,
            seoDescription,
            seoKeywords,
            canonicalUrl: 'https://expiter.com/'+fileName+'/',
            hreflangIt: 'https://expiter.com/'+fileName+'/',
            heroImage: 'https://expiter.com/img/'+province.Abbreviation+'.webp',
            heroAlt: 'Provincia di '+province.Name,
            eyebrow: province.Region + ' · Provincia',
            pageTitle: 'Come si vive a '+province.Name+' - Qualità della vita, costi e cose da sapere',
            sidebar: pb.setSideBarIT(province),
            crimeUrl: 'https://expiter.com/'+fileName+'/sicurezza-e-criminalita/',
            tabRows,
            toc,
            overview: '<div class="province-hero" role="img" aria-label="Provincia di '+province.Name+'" style="background-image:url(\'https://expiter.com/img/'+province.Abbreviation+'.webp\')"></div>' + map + pb.wrapParagraphs(info.overview) + (info.disclaimer||'') + (info.map||''),
            climate: pb.wrapParagraphs(info.climate) + separator + pb.addBreaks(info.weather||''),
            col: pb.wrapParagraphs(info.CoL),
            healthcare: pb.wrapParagraphs(info.healthcare) + separator,
            education: pb.wrapParagraphs(info.education) + separator,
            leisure: pb.wrapParagraphs(info.leisure) + separator,
            crimeandsafety: pb.wrapParagraphs(info.crimeandsafety) + separator,
            transport: pb.wrapParagraphs(info.transport) + separator,
            promo: (info.viator||'') + separator + (info.getyourguide||'') + separator + (info.related||''),
            articleSection: 'Provincia',
            buildDate: new Date().toISOString()
        })
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
    "<a href='https://expiter.com/it/comuni/provincia-di-"+province.Name.replace(/\s+/g,"-").replace("'","-").toLowerCase()+"/'>"+"L'area metropolitana di "+province.Name+" comprende <b>"+
    +province.Towns+" comuni</b></a> e ricopre un'area di "+province.Size.toLocaleString()+" km<sup>2</sup>. "
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

    info.leisure=province.Name+" ha <b>"+(province.Nightlife>7.5?"un'ottima vita notturna'":"una vita notturna abbastanza movimentata")+"</b> con "+
    province.Bars+" bar e "+province.Restaurants+" ristoranti per ogni diecimila abitanti. "

    info.healthcare="<b>La sanità a "+province.Name+" è "+(province.Healthcare>6.74?"<b class='green'>al di sopra della media":"<b class='red'>sotto la media")+"</b></b>. "+
    "Per ogni diecimila abitanti, ci sono circa "+province.pharmacies+" farmacie, "+province.GeneralPractitioners+" medici generali e "+province.SpecializedDoctors+" medici specializzati. "+
    "<b>L'aspettativa di vita media a "+province.Name+" è "+(province.LifeExpectancy>82.05?" molto alta con ":"di ")+province.LifeExpectancy+" anni di età.</b>"

    info.crimeandsafety="La provincia di "+province.Name+" è generalmente "+(province.Safety>7.33?"<b class='green'>molto sicura":(province.Safety>6?"<b class='green'>moderatamente sicura":"<b class='red'>meno sicura rispetto ad altre province italiane"))+"</b>. "+
    "Nel 2021, vi sono stati <b>"+province.ReportedCrimes+" denunce per crimini ogni centomila abitanti</b>. Si tratta del "+(province.ReportedCrimes>2835.76?"<b class='red'>"+(((province.ReportedCrimes/2835.76)*100)-100).toFixed(2)+"% in più della media nazionale</b>":"<b class='green'>"+((100-(province.ReportedCrimes/2835.76)*100).toFixed(2))+"% in meno rispetto alla media nazionale</b>")+"."+
    "<br><br>"+
    "Vi sono stati all'incirca <b>"+province.RoadFatalities+" fatalità dovute a incidenti stradali</b> e <b>"+province.WorkAccidents+" incidenti gravi sul lavoro</b> per ogni diecimila persone a "+province.Name+". Si tratta rispettivamente del "+
    (province.RoadFatalities>0.54?"<b class='red'>"+(((province.RoadFatalities/0.54)*100-100).toFixed(2))+"% di incidenti stradali in più rispetto alla media":"<b class='green'>"+(((100-(province.RoadFatalities/0.54)*100).toFixed(2))+"% di incidenti stradali in meno rispetto alla media"))+"</b> e del "+
    (province.RoadFatalities>12.90?"<b class='red'>"+(((province.WorkAccidents/12.90)*100-100).toFixed(2))+"% di incidenti sul lavoro in più rispetto alla media":"<b class='green'>"+(((100-(province.WorkAccidents/12.90)*100).toFixed(2))+"% di incidenti sul lavoro in meno rispetto alla media"))+"</b>."+
    "<br><br>"
    info.crimeandsafety+=(province.CarTheft>70.53?"Il furto di automobili è stimato essere il <b class='red'>"+(((province.CarTheft/70.53)*100)-100).toFixed(2)+"% in più rispetto alla media</b> con "+province.CarTheft+" casi per centomila abitanti.":"I furti di automobili sono riportati essere il <b class='green'>"+((100-(province.CarTheft/70.53)*100)).toFixed(2)+"% in meno rispetto alla media</b> with only "+province.CarTheft+" casi riportati per centomila abitanti.")+" "+
    (province.HouseTheft>175.02?"I casi riportati di furti nelle abitazioni è del <b class='red'>"+(((province.HouseTheft/175.02)*100)-100).toFixed(2)+"% più alto della media</b> con "+province.HouseTheft+" denunce per centomila abitanti.":"I casi di furti nelle abitazioni sono riportati al <b class='green'>"+((100-(province.HouseTheft/175.02)*100)).toFixed(2)+"% in meno</b> della media con "+province.HouseTheft+" casi per centomila abitanti.")+" "+
    (province.Robberies>22.14?"Gli eventi di rapina non sono del tutto inusuali, vi sono il <b class='red'>"+(((province.Robberies/22.14)*100)-100).toFixed(2)+"% in più di casi riportati rispetto alla media nazionale</b> con "+province.Robberies+" denunce per centomila abitanti":"Le rapine non sono molto comuni con "+province.HouseTheft+" casi riportati per centomila abitanti, all'incirca il <b class='green'>"+((100-(province.Robberies/22.14)*100)).toFixed(2)+"% in meno della media nazionale</b>")+". "

    info.education=province.Name+" ha "+(province.HighSchoolGraduates>avg.HighSchoolGraduates?"<b class='green'>un numero di diplomati più alto della media":"<b class='red'>un tasso di diplomati più basso della media")+"</b>, circa "+province.HighSchoolGraduates+"%; e "+(province.UniversityGraduates>avg.UniversityGraduates?"<b class='green'>un tasso di laureati più alto della media":"<b class='red'>una percentuale di laureati più bassa della media")+"</b>, circa "+province.UniversityGraduates+"%."
    +(province.Universities>1?" Ci sono <b>"+province.Universities+" università</b> in provincia di":(province.Universities==1?" C'è <b>una sola università</b> in provincia di":" <b>Non ci sono università</b> in provincia di "))+province.Name+"."

    info.transport="<b>L'offerta del trasporto pubblico a "+name+"</b> è "+(province.PublicTransport<avg.PublicTransport*.9?"<b class='red'>carente":(province.PublicTransport>avg.PublicTransport*1.1?"<b class='green'>abbastanza buona":"<b class='green'>più che soddisfacente"))+"</b>, e "+
    (province.Traffic<avg.Traffic*.85?"<b class='green'>il traffico è basso":(province.Traffic<avg.Traffic?"<b class='green'>il traffico è al di sotto della media":(province.Traffic>avg.Traffic*1.1?"<b class='red'>c'è molto traffico di autoveicoli":"<b class='red'>vi sono livelli di traffico abbastanza alto")))+"</b>. "+
    "Ci sono in media "+province.VehiclesPerPerson+" veicoli per persona, rispetto alla media nazionale di "+avg.VehiclesPerPerson+". "+(province.Subway>0?"La città di "+name+" è uno dei pochi centri urbani in Italia dotati di un sistema di trasporto metropolitano, la <b>Metropolitana di "+name+"</b>. ":"")+
    "<br><br>"+
    "Circa "+(province.CyclingLanes/10).toFixed(2)+"km per diecimila abitanti nel comune principale di "+name+" sono coperti da piste ciclabili. Ciò rende "+name+" "+(province.CyclingLanes>avg.CyclingLanes*.8?"<b class='green'>abbastanza ciclabile per gli standard italiani":(province.CyclingLanes>avg.CyclingLanes*1.2?"<b class='green'>molto ciclabile e \"bike-friendly\" per gli standard del paese.":"<b class='red'>non particolarmente ciclabile o \"bike-friendly\""))+"</b>. ";

    (facts[name]["transportData"]!=""?(info.transport+='</br></br>'+facts[name]["transportData"])
    :"")

    info.disclaimer='</br></br><center><div id="disclaimer">Questa pagina contiene link di affiliazione. In quanto partner di Amazon e Viator, potremmo guadagnare commissioni su acquisti idonei.</div></center>'

    info.map='</br><center class="map"><iframe id="ggmap" src="https://maps.google.it/maps?f=q&source=s_q&hl=it&geocode=&q=Provincia+di+'+name+'&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>'+
    'Mostra: '+
    '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=it&geocode=&q=Provincia+di+'+name+'+Cose+da+fare&output=embed")\' target="_blank"><b><ej>🎭</ej>Attrazioni</b></a> '+
    '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=it&geocode=&q=Provincia+di+'+name+'+Musei&output=embed")\' target="_blank"><b><ej>🏺</ej>Musei</b></a> '+
    '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=it&geocode=&q=Provincia+di+'+name+'+Ristoranti&output=embed")\' target="_blank"><b><ej>🍕</ej>Ristoranti</b></a> '+
    '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=it&geocode=&q=Provincia+di+'+name+'+Bar&output=embed")\' target="_blank"><b><ej>🍺</ej>Bar</b></a> '+
    '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=it&geocode=&q=Provincia+di+'+name+'+Stabilimento+balneare&output=embed")\' target="_blank"><b><ej>🏖️</ej>Spiagge</b></a> '+
    '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.it\/maps?f=q&source=s_q&hl=it&geocode=&q=Provincia+di+'+name+'+Area+per+passeggiate&output=embed")\' target="_blank"><b><ej>⛰️</ej>Escursioni</b></a> '+
    '<a href="https://www.amazon.it/ulp/view?&linkCode=ll2&tag=expiter-21&linkId=5824e12643c8300394b6ebdd10b7ba3c&language=it_IT&ref_=as_li_ss_tl" target="_blank"><b><ej>📦</ej>Punti Amazon Pickup</b></a> '+
    '</center>'

    info.weather=(province.WeatherWidget?'<div class="weather-block"><h3>Clima</h3><a class="weatherwidget-io" href="https://forecast7.com/en/'+province.WeatherWidget+'" data-label_1="'+name+'" data-label_2="'+region.Name+'"'+
    'data-font="Roboto" data-icons="Climacons Animated" data-mode="Forecast" data-theme="clear"  data-basecolor="rgba(155, 205, 245, 0.59)" data-textcolor="#000441" >'+name+', '+region.Name+'</a>'+
    '<script>'+
    "!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');"+
    '</script></div>':"")

    info.viator='<center><h3>Esperienze consigliate a '+(province.Viator?name:region.Name)+'</h3></center>'+
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

    info.related='<h2>Nelle vicinanze</h2>'+
    '<ul class="nearby-pills">'+
    facts[related1].snippet+
    facts[related2].snippet+
    facts[related3].snippet+
    facts[related4].snippet+'</ul>'

    return info;
  }


function populateFacts(){
    facts.Roma.overview="La <b>città di Roma</b>, con 2.761.632 abitanti, è la città più popolosa nonché <b>capitale d'Italia</b>."
    facts.Milano.overview="The <b>city of Milan</b>, with 1,371,498 residents, is the second-most popolous city and <b>industrial, commercial and financial capital of Italy</b>."
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
      '<li><a href="https://expiter.com/it/province/'+slug+'/" title="'+province.Name+', '+province.Region+'">'+
      '<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+province.Abbreviation+'.webp?tr=w-56,h-56,fo-auto,q-60" '+
      'alt="'+province.Name+'" width="28" height="28">'+
      '<span>'+province.Name+'</span></a></li>';
    }
    avg=data[107];
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
      // FoggyDays: verbatim non-linear thresholds
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
    // default: higher = better
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
        {emoji:'📚', label:'Istruzione', ...q('Education', 'Istruzione')},
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

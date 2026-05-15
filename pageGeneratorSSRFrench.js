import * as pb from './js/pageBuilder.js';
import { fr } from './js/pageBuilder.js';
import fetch from 'node-fetch';
import fs from 'fs';
import { nunjucks } from './js/nunjucksEnv.js';

function slug(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
}

var dataset;
var provinces = {};
var facts = {};
var avg;
var regions = {};


fetch('https://expiter.com/dataset.json', { method: 'Get' })
    .then(function (response) { return response.json(); })
    .then(function (data) {
        dataset = data;
        populateData(data);
        for (let i = 0; i < 107; i++) {
            let province = dataset[i];

            var fileName = 'fr/province/' + slug(fr(province.Name));

            let parsedData = '';
            try { parsedData = fs.readFileSync('temp/fr-parsedDataAbout' + province.Name + '.txt', 'utf8'); } catch (e) { parsedData = ''; }
            let provinceData = parsedData.split('%%%')[0]; if (provinceData == 'undefined') provinceData = '';
            let transportData = parsedData.split('%%%')[1]; if (transportData === undefined || transportData == 'undefined') transportData = '';
            facts[province.Name]['provinceData'] = provinceData;
            facts[province.Name]['transportData'] = transportData;

            let html = renderPage(province, fileName);
            fs.writeFile(fileName + '.html', html, function (err) {
                if (err) throw err;
                console.log(dataset[i].Name + '.html Enregistré!');
            });
        }
    })
    .catch(function (err) { console.log('Erreur: ' + err); });


function renderPage(province, fileName) {
    let info = getInfo(province);
    let separator = '</br><div class="separator"></div></br>';

    let map =
        '<figure class="province-map">' +
        '<img alt="Carte de la province de ' + fr(province.Name) + ' en ' + fr(province.Region) + '" ' +
        'loading="lazy" ' +
        'src="https://ik.imagekit.io/cfkgj4ulo/map/' + province['Region'].replace(/\s+/g, '-').replace("'", '-') + '-provinces.webp?tr=w-340">' +
        '<figcaption>Carte des provinces de la région ' + fr(province.Region) + ' incluant ' + fr(province.Name) + '</figcaption>' +
        '</figure>';

    const tabRows = buildTabRows(province);
    const toc =
        '<ul>' +
        '<li><a href="#Informations-Generales">Informations Générales</a></li>' +
        '<li><a href="#Climat">Climat</a></li>' +
        '<li><a href="#Cout-de-la-Vie">Coût de la Vie</a></li>' +
        '<li><a href="#Qualite-de-Vie">Qualité de Vie</a>' +
        '<ul>' +
        '<li><a href="#Sante">Santé</a></li>' +
        '<li><a href="#Education">Éducation</a></li>' +
        '<li><a href="#Loisirs">Loisirs</a></li>' +
        '<li><a href="#Criminalite-et-Securite">Criminalité et Sécurité</a></li>' +
        '<li><a href="#Transports">Transports</a></li>' +
        '</ul>' +
        '</li>' +
        '<li><a href="#Tourisme">Tourisme</a></li>' +
        '</ul>';

    const seoTitle = fr(province.Name) + ' - Qualité et Coût de la Vie';
    const seoDescription = 'Informations sur la vie à ' + fr(province.Name) + ' (' + fr(province.Region) + ") pour expatriés, étudiants et nomades numériques. " + fr(province.Name) + ' qualité de vie, coût de la vie, sécurité et autres informations utiles.';
    const seoKeywords = 'vivre à ' + fr(province.Name) + ', ' + fr(province.Name) + ' nomades numériques, ' + fr(province.Name) + ' qualité de vie, ' + fr(province.Name) + ' vie nocturne';

    return nunjucks.render('pages/province-fr.njk', {
        lang: 'fr',
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl: 'https://expiter.com/' + fileName + '/',
        hreflangIt: 'https://expiter.com/it/province/' + slug(province.Name) + '/',
        heroImage: 'https://expiter.com/img/' + province.Abbreviation + '.webp',
        heroAlt: 'Province de ' + fr(province.Name),
        eyebrow: fr(province.Region) + ' · Province',
        pageTitle: 'Comment vivre à ' + fr(province.Name) + ' - Qualité de vie, coûts et choses à savoir',
        sidebar: pb.setSideBarFR(province),
        crimeUrl: 'https://expiter.com/' + fileName + '/criminalite-et-securite/',
        tabRows,
        toc,
        overview: '<div class="province-hero" role="img" aria-label="Province de ' + fr(province.Name) + '" style="background-image:url(\'https://expiter.com/img/' + province.Abbreviation + '.webp\')"></div>' + map + pb.addBreaks(info.overview) + (info.disclaimer || '') + (info.map || ''),
        climate: pb.addBreaks(info.climate) + separator + pb.addBreaks(info.weather || ''),
        col: pb.addBreaks(info.CoL),
        healthcare: pb.addBreaks(info.healthcare) + separator,
        education: pb.addBreaks(info.education) + separator,
        leisure: pb.addBreaks(info.leisure) + separator,
        crimeandsafety: pb.addBreaks(info.crimeandsafety) + separator,
        transport: pb.addBreaks(info.transport) + separator,
        promo: (info.viator || '') + separator + (info.getyourguide || '') + separator + (info.related || '')
    });
}


function getInfo(province) {
    populateFacts();
    let ratio = (province.Men / (Math.min(province.Men, province.Women))).toFixed(2) + ':' + (province.Women / (Math.min(province.Men, province.Women))).toFixed(2);
    let name = province.Name;
    let region = regions[province.Region];

    let info = {};

    info.overview = 'La province de ' + fr(province.Name) + ' est la <b>' + province.SizeByPopulation + 'e plus grande province italienne par population</b> avec <b>' + province.Population.toLocaleString('fr') + ' habitants</b>, dans la région <b>' + fr(province.Region) + '</b>. ' +
        (facts[name].overview ? facts[name].overview : '') +
        '</br></br>' +
        "<a href='https://expiter.com/fr/communes/province-de-" + slug(fr(province.Name)) + "/'>L'aire métropolitaine de " + fr(province.Name) + ' comprend <b>' + province.Towns + ' communes</b></a> et couvre une superficie de ' + province.Size.toLocaleString('fr') + ' km<sup>2</sup>. ' +
        'La <b>densité de population est de ' + province.Density + ' habitants par km<sup>2</sup></b>, ce qui la rend ' +
        (province.Density < 100 ? 'peu peuplée.' : (province.Density > 500 ? 'très peuplée.' : 'assez densément peuplée.')) +
        ' Le rapport entre hommes et femmes est de ' + ratio + '.';

    if (facts[name]['provinceData'] != '') info.overview += '</br></br>' + facts[name]['provinceData'];

    info.CoL = 'Le <b>salaire moyen mensuel à ' + fr(province.Name) + ' est de ' + province.MonthlyIncome + '€</b>, ce qui est ' +
        (province.MonthlyIncome > 1500 && province.MonthlyIncome < 1800 ? 'dans la moyenne du pays' : (province.MonthlyIncome >= 1800 ? "<b class='green'>au-dessus de la moyenne</b> pour l'Italie" : "<b class='red'>en dessous de la moyenne</b> pour l'Italie")) + '.' +
        '</br></br>' +
        'Le coût de la vie est estimé à ' + province['Cost of Living (Individual)'] + '€ par mois pour une personne seule ou ' + province['Cost of Living (Family)'] + '€ par mois pour une famille de quatre personnes. Le coût pour louer un petit appartement (deux ou trois pièces) dans un quartier résidentiel de la ville est d\'environ ' + province['MonthlyRental'] + '€ par mois.' + '</br></br>' +
        'En général, vivre à ' + (province['Cost of Living (Individual)'] > avg['Cost of Living (Individual)'] ? "<b class='red'>" + fr(province.Name) + ' est très coûteux' : (province['Cost of Living (Individual)'] < 1150 ? "<b class='green'>" + fr(province.Name) + " n'est pas du tout coûteux" : "<b class='green'>" + fr(province.Name) + " n'est pas très coûteux")) + '</b> par rapport aux autres provinces italiennes.' +
        ' Vivre à ' + fr(province.Name) + ' est environ ' + (province['Cost of Living (Individual)'] > avg['Cost of Living (Individual)'] ? "<b class='red'>" + (province['Cost of Living (Individual)'] / avg['Cost of Living (Individual)'] * 100 - 100).toFixed(2) + '% plus coûteux que la moyenne</b> de toutes les villes italiennes' : "<b class='green'>" + (100 - province['Cost of Living (Individual)'] / avg['Cost of Living (Individual)'] * 100).toFixed(2) + '% moins cher que la moyenne</b> de toutes les autres provinces italiennes') + '.';

    info.climate = 'La province de ' + fr(province.Name) + ' reçoit en moyenne <b>' + province.SunshineHours + ' heures de soleil</b> par mois, soit ' + (province.SunshineHours / 30).toFixed(1) + ' heures de lumière par jour.' +
        ' Cela représente ' + (province.SunshineHours > 236 ? "<b class='green'>" + (province.SunshineHours / 236 * 100 - 100).toFixed(2) + '% de plus</b> que la moyenne italienne' : "<b class='red'>" + (100 - (province.SunshineHours / 236) * 100).toFixed(2) + '% de moins</b> que la moyenne italienne') + ' et ' +
        (province.SunshineHours > region.SunshineHours ? "<b class='green'>" + (province.SunshineHours / region.SunshineHours * 100 - 100).toFixed(2) + '% de plus</b> que la moyenne de la région ' : "<b class='red'>" + (100 - (province.SunshineHours / region.SunshineHours) * 100).toFixed(2) + '% de moins</b> que la moyenne de la région ') + fr(province.Region) + '.' +
        '</br></br>' +
        "Tout au long de l'année, <b>il pleut en moyenne " + province.RainyDays + ' jours par mois</b>, ce qui est ' +
        (province.RainyDays > 8 ? "<b class='red'>bien au-dessus de la moyenne" : (province.RainyDays < 7 ? "<b class='green'>en dessous de la moyenne</b>" : '<b>une quantité ordinaire de précipitations')) + '</b> pour une province italienne.' +
        '</br></br>' +
        "En automne et en hiver, il y a généralement " + (province.FoggyDays > 5 ? "<b class='red'>" : "<b class='green'>") + province.FoggyDays + ' jours de brouillard par mois</b> et <b>' + province.ColdDays + ' jours très froids</b> avec des températures ressenties inférieures à 3°C.' +
        " En été, il y a en moyenne <b>" + province.HotDays + ' jours chauds par mois</b>, avec des températures ressenties supérieures à 30°C.';

    info.leisure = fr(province.Name) + ' a <b>' + (province.Nightlife > 7.5 ? 'une excellente vie nocturne' : 'une vie nocturne assez animée') + '</b> avec ' +
        province.Bars + ' bars et ' + province.Restaurants + ' restaurants pour dix mille habitants.';

    info.healthcare = '<b>La santé à ' + fr(province.Name) + ' est ' + (province.Healthcare > 6.74 ? "<b class='green'>au-dessus de la moyenne" : "<b class='red'>en dessous de la moyenne") + '</b></b>. ' +
        'Pour dix mille habitants, il y a environ ' + province.Pharmacies + ' pharmacies, ' + province.GeneralPractitioners + ' médecins généralistes et ' + province.SpecializedDoctors + ' médecins spécialisés. ' +
        "<b>L'espérance de vie moyenne à " + fr(province.Name) + ' est ' + (province.LifeExpectancy > 82.05 ? ' très élevée avec ' : 'de ') + province.LifeExpectancy + ' ans.</b>';

    info.crimeandsafety = 'La province de ' + fr(province.Name) + ' est généralement ' + (province.Safety > 7.33 ? "<b class='green'>très sûre" : (province.Safety > 6 ? "<b class='green'>modérément sûre" : "<b class='red'>moins sûre que les autres provinces italiennes")) + '</b>. ' +
        'En 2021, il y a eu <b>' + province.ReportedCrimes + ' plaintes pour crimes pour cent mille habitants</b>. Cela représente ' + (province.ReportedCrimes > 2835.76 ? "<b class='red'>" + (((province.ReportedCrimes / 2835.76) * 100) - 100).toFixed(2) + '% de plus que la moyenne nationale</b>' : "<b class='green'>" + ((100 - (province.ReportedCrimes / 2835.76) * 100).toFixed(2)) + '% de moins que la moyenne nationale</b>') + '.' +
        '<br><br>' +
        'Il y a eu environ <b>' + province.RoadFatalities + ' décès dus à des accidents de la route</b> et <b>' + province.WorkAccidents + ' accidents graves au travail</b> pour dix mille personnes à ' + fr(province.Name) + ". Il s'agit respectivement de " +
        (province.RoadFatalities > 0.54 ? "<b class='red'>" + (((province.RoadFatalities / 0.54) * 100 - 100).toFixed(2)) + "% d'accidents de la route en plus que la moyenne" : "<b class='green'>" + ((100 - (province.RoadFatalities / 0.54) * 100).toFixed(2)) + "% d'accidents de la route en moins que la moyenne") + '</b> et de ' +
        (province.RoadFatalities > 12.90 ? "<b class='red'>" + (((province.WorkAccidents / 12.90) * 100 - 100).toFixed(2)) + "% d'accidents au travail en plus que la moyenne" : "<b class='green'>" + ((100 - (province.WorkAccidents / 12.90) * 100).toFixed(2)) + "% d'accidents au travail en moins que la moyenne") + '</b>.' +
        '<br><br>' +
        (province.CarTheft > 70.53 ? "Le vol de voitures est estimé être <b class='red'>" + (((province.CarTheft / 70.53) * 100) - 100).toFixed(2) + '% plus élevé que la moyenne</b> avec ' + province.CarTheft + ' cas pour cent mille habitants.' : "Les vols de voitures sont <b class='green'>" + ((100 - (province.CarTheft / 70.53) * 100)).toFixed(2) + '% moins nombreux que la moyenne</b> avec seulement ' + province.CarTheft + ' cas signalés pour cent mille habitants.') + ' ' +
        (province.HouseTheft > 175.02 ? "Les cas signalés de vols dans les habitations sont <b class='red'>" + (((province.HouseTheft / 175.02) * 100) - 100).toFixed(2) + '% plus élevés que la moyenne</b> avec ' + province.HouseTheft + ' plaintes pour cent mille habitants.' : "Les vols dans les habitations sont <b class='green'>" + ((100 - (province.HouseTheft / 175.02) * 100)).toFixed(2) + '% moins nombreux</b> que la moyenne avec ' + province.HouseTheft + ' cas pour cent mille habitants.') + ' ' +
        (province.Robberies > 22.14 ? "Les vols à main armée ne sont pas inhabituels, il y a <b class='red'>" + (((province.Robberies / 22.14) * 100) - 100).toFixed(2) + '% plus de cas signalés que la moyenne nationale</b> avec ' + province.Robberies + ' plaintes pour cent mille habitants.' : "Les vols à main armée ne sont pas très fréquents avec " + province.Robberies + " cas signalés pour cent mille habitants, environ <b class='green'>" + ((100 - (province.Robberies / 22.14) * 100)).toFixed(2) + '% moins que la moyenne nationale</b>.');

    info.education = fr(province.Name) + ' a ' + (province.HighSchoolGraduates > avg.HighSchoolGraduates ? "<b class='green'>un nombre de diplômés plus élevé que la moyenne" : "<b class='red'>un taux de diplômés plus bas que la moyenne") + '</b>, environ ' + province.HighSchoolGraduates + '%; et ' + (province.UniversityGraduates > avg.UniversityGraduates ? "<b class='green'>un taux de diplômés plus élevé que la moyenne" : "<b class='red'>un pourcentage de diplômés plus bas que la moyenne") + '</b>, environ ' + province.UniversityGraduates + '%.' +
        (province.Universities > 1 ? ' Il y a <b>' + province.Universities + ' universités</b> dans la province de ' : (province.Universities == 1 ? ' Il y a <b>une seule université</b> dans la province de ' : " <b>Il n'y a pas d'université</b> dans la province de ")) + fr(province.Name) + '.';

    info.transport = "<b>L'offre de transport public à " + fr(name) + '</b> est ' + (province.PublicTransport < avg.PublicTransport * 0.9 ? "<b class='red'>insuffisante" : (province.PublicTransport > avg.PublicTransport * 1.1 ? "<b class='green'>assez bonne" : "<b class='green'>plus que satisfaisante")) + '</b>, et ' +
        (province.Traffic < avg.Traffic * 0.85 ? "<b class='green'>le trafic est faible" : (province.Traffic < avg.Traffic ? "<b class='green'>le trafic est en dessous de la moyenne" : (province.Traffic > avg.Traffic * 1.1 ? "<b class='red'>il y a beaucoup de trafic automobile" : "<b class='red'>il y a des niveaux de trafic assez élevés"))) + '</b>. ' +
        'Il y a en moyenne ' + province.VehiclesPerPerson + ' véhicules par personne, par rapport à la moyenne nationale de ' + avg.VehiclesPerPerson + '. ' + (province.Subway > 0 ? 'La ville de ' + fr(name) + " est l'une des rares villes italiennes dotées d'un système de transport métropolitain, le <b>Métro de " + fr(name) + '</b>. ' : '') +
        '<br><br>' +
        'Environ ' + (province.CyclingLanes / 10).toFixed(2) + 'km pour dix mille habitants dans la ville principale de ' + fr(name) + ' sont couverts par des pistes cyclables. Cela rend ' + fr(name) + ' ' + (province.CyclingLanes > avg.CyclingLanes * 0.8 ? "<b class='green'>assez cyclable selon les normes italiennes" : (province.CyclingLanes > avg.CyclingLanes * 1.2 ? "<b class='green'>très cyclable selon les normes italiennes" : "<b class='red'>pas particulièrement cyclable")) + '</b>.';

    if (facts[name]['transportData'] != '') info.transport += '</br></br>' + facts[name]['transportData'];

    info.disclaimer = '</br></br><center><div id="disclaimer">Cette page contient des liens d\'affiliation. En tant que partenaire d\'Amazon et de Viator, nous pouvons gagner des commissions sur les achats éligibles.</div></center>';

    info.map = '</br><center class="map"><iframe id="ggmap" src="https://maps.google.com/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+' + name + '&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>' +
        'Afficher: ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+' + name + '+Cose+da+fare&output=embed")\' target="_blank"><b><ej>🎭</ej>Attractions</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+' + name + '+Musei&output=embed")\' target="_blank"><b><ej>🏺</ej>Musées</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+' + name + '+Ristoranti&output=embed")\' target="_blank"><b><ej>🍕</ej>Restaurants</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+' + name + '+Bar&output=embed")\' target="_blank"><b><ej>🍺</ej>Bars</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+' + name + '+Stabilimento+balneare&output=embed")\' target="_blank"><b><ej>🏖️</ej>Plages</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=fr&geocode=&q=Provincia+di+' + name + '+Area+per+passeggiate&output=embed")\' target="_blank"><b><ej>⛰️</ej>Randonnées</b></a> ' +
        '<a href="https://www.amazon.fr/ulp/view?&linkCode=ll2&tag=expiter-21&linkId=5824e12643c8300394b6ebdd10b7ba3c&language=fr_FR&ref_=as_li_ss_tl" target="_blank"><b><ej>📦</ej>Points de retrait Amazon</b></a> ' +
        '</center>';

    info.weather = (province.WeatherWidget ? '<div class="weather-block"><h3>Climat</h3><a class="weatherwidget-io" href="https://forecast7.com/fr/' + province.WeatherWidget + '" data-label_1="' + fr(name) + '" data-label_2="' + fr(region.Name) + '" data-font="Roboto" data-icons="Climacons Animated" data-mode="Forecast" data-theme="clear" data-basecolor="rgba(155, 205, 245, 0.59)" data-textcolor="#000441" >' + fr(name) + ', ' + fr(region.Name) + '</a>' +
        '<script>' +
        "!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');" +
        '</script></div>' : '');

    info.viator = '<center><h3>Expériences recommandées à ' + (province.Viator ? fr(name) : fr(region.Name)) + '</h3></center>' +
        '<div data-vi-partner-id=P00045447 data-vi-language=fr data-vi-currency=EUR data-vi-partner-type="AFFILIATE" data-vi-url="' +
        (region.Name == 'Molise' ? '' : 'https://www.viator.com/') + (province.Viator ? province.Viator : region.Viator) + '"' +
        (province.Viator.includes(',') || region.Name == 'Molise' ? '' : ' data-vi-total-products=6 ') +
        ' data-vi-campaign="' + name + '" ></div>' +
        '<script async src="https://www.viator.com/orion/partner/widget.js"></script>';

    info.getyourguide = '<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>';

    let target, related1, related2, related3, related4;

    (region.Name == "Valle d'Aosta" ? target = facts[region.Name]['provinces'].concat(facts['Piemonte']['provinces']) :
        (region.Name == 'Trentino-Alto Adige' ? target = facts[region.Name]['provinces'].concat(facts['Veneto']['provinces']).concat(['Brescia', 'Sondrio']) :
            (region.Name == 'Molise' ? target = facts[region.Name]['provinces'].concat(facts['Abruzzo']['provinces']) :
                (region.Name == 'Abruzzo' ? target = facts[region.Name]['provinces'].concat(facts['Molise']['provinces']) :
                    (region.Name == 'Emilia-Romagna' ? target = facts[region.Name]['provinces'].concat(['Prato', 'Mantova', 'Cremona', 'Rovigo', 'Massa-Carrara', 'Lucca', 'Pistoia', 'Pesaro e Urbino', 'Arezzo']) :
                        (region.Name == 'Liguria' ? target = facts[region.Name]['provinces'].concat(facts['Piemonte']['provinces']) :
                            (region.Name == 'Piemonte' ? target = facts[region.Name]['provinces'].concat(facts['Lombardia']['provinces']) :
                                (region.Name == 'Lombardia' ? target = facts[region.Name]['provinces'].concat(facts['Piemonte']['provinces']) :
                                    (region.Name == 'Friuli-Venezia Giulia' ? target = facts[region.Name]['provinces'].concat(facts['Veneto']['provinces']) :
                                        (region.Name == 'Basilicata' ? target = facts[region.Name]['provinces'].concat(facts['Campania']['provinces']).concat(facts['Puglia']['provinces']).concat(['Cosenza']) :
                                            (region.Name == 'Puglia' ? target = facts[region.Name]['provinces'].concat(facts['Basilicata']['provinces']).concat(['Campobasso', 'Benevento', 'Avellino']) :
                                                (region.Name == 'Umbria' ? target = facts[region.Name]['provinces'].concat(facts['Marche']['provinces']).concat(['Arezzo', 'Siena', 'Viterbo', 'Rieti']) :
                                                    target = facts[region.Name]['provinces']))))))))))));
    (province.Name == 'Reggio Calabria' ? target = target.concat(['Messina']) :
        (province.Name == 'Messina' ? target = target.concat(['Reggio Calabria']) :
            (province.Name == 'Torino' ? target = target.concat(['Aosta']) :
                (province.Name == 'Cosenza' ? target = target.concat(facts['Basilicata']['provinces']) :
                    (province.Name == 'Salerno' ? target = target.concat(facts['Basilicata']['provinces']) :
                        '')))));

    target = target.filter(item => item !== name);
    related1 = target[Math.floor(Math.random() * target.length)];
    target = target.filter(item => item !== related1);
    related2 = target[Math.floor(Math.random() * target.length)];
    target = target.filter(item => item !== related2);
    related3 = target[Math.floor(Math.random() * target.length)];
    target = target.filter(item => item !== related3);
    related4 = target[Math.floor(Math.random() * target.length)];

    info.related = '<h2>À proximité</h2>' +
        '<ul class="nearby-pills">' +
        facts[related1].snippet +
        facts[related2].snippet +
        facts[related3].snippet +
        facts[related4].snippet + '</ul>';

    return info;
}


function populateFacts() {
    facts.Roma.overview = 'La <b>ville de Rome</b>, avec 2.761.632 habitants, est la ville la plus peuplée et la <b>capitale de l\'Italie</b>.';
    facts.Milano.overview = 'La <b>ville de Milan</b>, avec 1.371.498 habitants, est la deuxième ville la plus peuplée et la <b>capitale industrielle, commerciale et financière de l\'Italie</b>.';
}


function populateData(data) {
    for (let i = 108; i < data.length; i++) {
        let region = data[i];
        regions[region['Name']] = region;
        regions[region['Name']].index = i;
        facts[region['Name']] = {};
        facts[region['Name']].provinces = [];
    }
    for (let i = 0; i < 107; i++) {
        let province = data[i];
        provinces[province['Name']] = province;
        provinces[province['Name']].index = i;
        facts[province['Region']].provinces.push(province.Name);

        facts[province['Name']] = {};
        const sl = slug(fr(province.Name));
        facts[province['Name']].snippet =
            '<li><a href="https://expiter.com/fr/province/' + sl + '/" title="' + fr(province.Name) + ', ' + fr(province.Region) + '">' +
            '<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/' + province.Abbreviation + '.webp?tr=w-56,h-56,fo-auto,q-60" ' +
            'alt="' + fr(province.Name) + '" width="28" height="28">' +
            '<span>' + fr(province.Name) + '</span></a></li>';
    }
    avg = data[107];
}


function qualityScoreData(quality, score) {
    let expenses = ['Cost of Living (Individual)', 'Cost of Living (Family)', 'Cost of Living (Nomad)',
        'StudioRental', 'BilocaleRent', 'TrilocaleRent', 'MonthlyIncome',
        'StudioSale', 'BilocaleSale', 'TrilocaleSale'];

    if (quality == 'CostOfLiving' || quality == 'HousingCost') {
        if (score < avg[quality] * .8) return { tier: 'excellent', text: 'très bas' };
        if (score < avg[quality] * .95) return { tier: 'great', text: 'bas' };
        if (score < avg[quality] * 1.05) return { tier: 'good', text: 'dans la moyenne' };
        if (score < avg[quality] * 1.2) return { tier: 'average', text: 'élevé' };
        return { tier: 'poor', text: 'très élevé' };
    }
    if (expenses.includes(quality)) {
        let tier;
        if (score < avg[quality] * .95) tier = 'great';
        else if (score < avg[quality] * 1.05) tier = 'average';
        else tier = 'poor';
        return { tier, text: score + '€/m', isAmount: true };
    }
    if (quality == 'HotDays' || quality == 'ColdDays') {
        const w = (quality == 'HotDays' ? 'chaud' : 'froid');
        if (score < avg[quality] * .8) return { tier: 'excellent', text: 'pas ' + w };
        if (score < avg[quality] * .95) return { tier: 'great', text: 'pas très ' + w };
        if (score < avg[quality] * 1.05) return { tier: 'good', text: 'un peu ' + w };
        if (score < avg[quality] * 1.2) return { tier: 'average', text: w };
        return { tier: 'poor', text: 'très ' + w };
    }
    if (quality == 'RainyDays') {
        if (score < avg[quality] * .8) return { tier: 'excellent', text: 'très peu' };
        if (score < avg[quality] * .95) return { tier: 'great', text: 'peu' };
        if (score < avg[quality] * 1.05) return { tier: 'good', text: 'dans la moyenne' };
        if (score < avg[quality] * 1.2) return { tier: 'average', text: 'pluvieux' };
        return { tier: 'poor', text: 'très pluvieux' };
    }
    if (quality == 'FoggyDays') {
        if (score < avg[quality] * .265) return { tier: 'excellent', text: 'pas de brouillard' };
        if (score < avg[quality] * .6) return { tier: 'great', text: 'peu' };
        if (score < avg[quality] * 1.00) return { tier: 'good', text: 'dans la moyenne' };
        if (score < avg[quality] * 3) return { tier: 'average', text: 'brumeux' };
        return { tier: 'poor', text: 'très brumeux' };
    }
    if (quality == 'Crime' || quality == 'Traffic') {
        if (score < avg[quality] * .8) return { tier: 'excellent', text: 'très bas' };
        if (score < avg[quality] * .95) return { tier: 'great', text: 'bas' };
        if (score < avg[quality] * 1.05) return { tier: 'good', text: 'moyen' };
        if (score < avg[quality] * 1.2) return { tier: 'average', text: 'élevé' };
        return { tier: 'poor', text: 'très élevé' };
    }
    if (score < avg[quality] * .8) return { tier: 'poor', text: 'médiocre' };
    if (score < avg[quality] * .95) return { tier: 'average', text: 'correct' };
    if (score < avg[quality] * 1.05) return { tier: 'good', text: 'bon' };
    if (score < avg[quality] * 1.2) return { tier: 'great', text: 'très bon' };
    return { tier: 'excellent', text: 'excellent' };
}


function buildTabRows(province) {
    const q = (k, prop) => qualityScoreData(k, province[prop !== undefined ? prop : k]);
    return {
        qualityOfLife: [
            { emoji: '👥', label: 'Population', raw: province.Population.toLocaleString('fr', { useGrouping: true }) },
            { emoji: '🚑', label: 'Santé', ...q('Healthcare') },
            { emoji: '📚', label: 'Éducation', ...q('Education', 'Istruzione') },
            { emoji: '👮', label: 'Sécurité', ...q('Safety') },
            { emoji: '🚨', label: 'Criminalité', ...q('Crime') },
            { emoji: '🚌', label: 'Transports', ...q('PublicTransport') },
            { emoji: '🚥', label: 'Trafic', ...q('Traffic') },
            { emoji: '🚴', label: 'Vélo', ...q('CyclingLanes') },
            { emoji: '🏛️', label: 'Culture', ...q('Culture') },
            { emoji: '🍸', label: 'Vie nocturne', ...q('Nightlife') },
            { emoji: '⚽', label: 'Loisirs', ...q('Sports & Leisure') },
            { emoji: '🌦️', label: 'Climat', ...q('Climate') },
            { emoji: '☀️', label: 'Soleil', ...q('SunshineHours') },
            { emoji: '🥵', label: 'Étés', ...q('HotDays') },
            { emoji: '🥶', label: 'Hivers', ...q('ColdDays') },
            { emoji: '🌧️', label: 'Pluie', ...q('RainyDays') },
            { emoji: '🌫️', label: 'Brouillard', ...q('FoggyDays') },
            { emoji: '🍃', label: "Qualité de l'air", ...q('AirQuality') },
            { emoji: '👪', label: 'Pour familles', ...q('Family-friendly') },
            { emoji: '👩', label: 'Pour femmes', ...q('Female-friendly') },
            { emoji: '🏳️‍🌈', label: 'LGBTQ+', ...q('LGBT-friendly') },
            { emoji: '🥗', label: 'Végan', ...q('Veg-friendly') },
        ],
        costOfLiving: [
            { emoji: '📈', label: 'Coût de la vie', ...q('CostOfLiving') },
            { emoji: '🏙️', label: 'Coût du logement', ...q('HousingCost') },
            { emoji: '💵', label: 'Salaires', ...q('MonthlyIncome') },
            { emoji: '🧑', label: 'Coûts (individu)', ...q('Cost of Living (Individual)') },
            { emoji: '👪', label: 'Coûts (famille)', ...q('Cost of Living (Family)') },
            { emoji: '🎒', label: 'Coûts (touriste)', ...q('Cost of Living (Nomad)') },
            { emoji: '🏠', label: 'Location (studio)', ...q('StudioRental') },
            { emoji: '🏘️', label: 'Location (2 pièces)', ...q('BilocaleRent') },
            { emoji: '🏰', label: 'Location (3 pièces)', ...q('TrilocaleRent') },
            { emoji: '🏠', label: 'Achat (studio)', ...q('StudioSale') },
            { emoji: '🏘️', label: 'Achat (2 pièces)', ...q('BilocaleSale') },
            { emoji: '🏰', label: 'Achat (3 pièces)', ...q('TrilocaleSale') },
        ],
        digitalNomads: [
            { emoji: '👩‍💻', label: 'Nomad-friendly', ...q('DN-friendly') },
            { emoji: '💸', label: 'Dépenses nomades', ...q('Cost of Living (Nomad)') },
            { emoji: '📡', label: 'Internet ultra-rapide', ...q('HighSpeedInternetCoverage') },
            { emoji: '💃', label: 'Divertissement', ...q('Fun') },
            { emoji: '🤗', label: 'Convivialité', ...q('Friendliness') },
            { emoji: '🤐', label: 'Anglophones', ...q('English-speakers') },
            { emoji: '😊', label: 'Bonheur', ...q('Antidepressants') },
            { emoji: '📈', label: 'Innovation', ...q('Innovation') },
            { emoji: '🏖️', label: 'Plages', ...q('Beach') },
            { emoji: '⛰️', label: 'Randonnée', ...q('Hiking') },
        ],
    };
}

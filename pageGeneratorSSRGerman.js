import * as pb from './js/pageBuilder.js';
import { de } from './js/pageBuilder.js';
import fetch from 'node-fetch';
import fs from 'fs';
import { nunjucks } from './js/nunjucksEnv.js';

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

            var fileName = 'de/provinz/' + de(province.Name).replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();

            let parsedData = '';
            try { parsedData = fs.readFileSync('temp/de-parsedDataAbout' + province.Name + '.txt', 'utf8'); } catch (e) { parsedData = ''; }
            let provinceData = parsedData.split('%%%')[0]; if (provinceData == 'undefined') provinceData = '';
            let transportData = parsedData.split('%%%')[1]; if (transportData === undefined || transportData == 'undefined') transportData = '';
            facts[province.Name]['provinceData'] = provinceData;
            facts[province.Name]['transportData'] = transportData;

            let html = renderPage(province, fileName);
            fs.writeFile(fileName + '.html', html, function (err) {
                if (err) throw err;
                console.log(dataset[i].Name + '.html Gespeichert!');
            });
        }
    })
    .catch(function (err) { console.log('Fehler: ' + err); });


function renderPage(province, fileName) {
    let info = getInfo(province);
    let separator = '</br><div class="separator"></div></br>';

    let map =
        '<figure class="province-map">' +
        '<img alt="Karte der Provinz ' + de(province.Name) + ' in ' + de(province.Region) + '" ' +
        'loading="lazy" ' +
        'src="https://ik.imagekit.io/cfkgj4ulo/map/' + province['Region'].replace(/\s+/g, '-').replace("'", '-') + '-provinces.webp?tr=w-340">' +
        '<figcaption>Karte der Provinzen der Region ' + de(province.Region) + ' einschließlich ' + de(province.Name) + '</figcaption>' +
        '</figure>';

    const tabRows = buildTabRows(province);
    const toc =
        '<ul>' +
        '<li><a href="#Allgemeine-Informationen">Allgemeine Informationen</a></li>' +
        '<li><a href="#Klima">Klima</a></li>' +
        '<li><a href="#Lebenshaltungskosten">Lebenshaltungskosten</a></li>' +
        '<li><a href="#Lebensqualitaet">Lebensqualität</a>' +
        '<ul>' +
        '<li><a href="#Gesundheit">Gesundheit</a></li>' +
        '<li><a href="#Bildung">Bildung</a></li>' +
        '<li><a href="#Freizeit">Freizeit</a></li>' +
        '<li><a href="#Kriminalitaet-und-Sicherheit">Kriminalität und Sicherheit</a></li>' +
        '<li><a href="#Verkehr">Verkehr</a></li>' +
        '</ul>' +
        '</li>' +
        '<li><a href="#Tourismus">Tourismus</a></li>' +
        '</ul>';

    const seoTitle = de(province.Name) + ' - Lebensqualität und Lebenshaltungskosten';
    const seoDescription = 'Informationen über das Leben in ' + de(province.Name) + ' (' + de(province.Region) + ') für Expatriates, Studenten und digitale Nomaden. ' + de(province.Name) + ' Lebensqualität, Lebenshaltungskosten, Sicherheit und andere nützliche Informationen.';
    const seoKeywords = 'Leben in ' + de(province.Name) + ', ' + de(province.Name) + ' digitale Nomaden, ' + de(province.Name) + ' Lebensqualität, ' + de(province.Name) + ' Nachtleben';

    return nunjucks.render('pages/province-de.njk', {
        lang: 'de',
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl: 'https://expiter.com/' + fileName + '/',
        hreflangIt: 'https://expiter.com/it/province/' + province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase() + '/',
        heroImage: 'https://expiter.com/img/' + province.Abbreviation + '.webp',
        heroAlt: 'Provinz ' + de(province.Name),
        eyebrow: de(province.Region) + ' · Provinz',
        pageTitle: 'Wie man in ' + de(province.Name) + ' lebt - Lebensqualität, Kosten und Wissenswertes',
        sidebar: pb.setSideBarDE(province),
        crimeUrl: 'https://expiter.com/' + fileName + '/kriminalitaet-und-sicherheit/',
        tabRows,
        toc,
        overview: '<div class="province-hero" role="img" aria-label="Provinz ' + de(province.Name) + '" style="background-image:url(\'https://expiter.com/img/' + province.Abbreviation + '.webp\')"></div>' + map + pb.addBreaks(info.overview) + (info.disclaimer || '') + (info.map || ''),
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

    info.overview = 'Die Provinz ' + de(province.Name) + ' ist die <b>' + province.SizeByPopulation + '. größte italienische Provinz nach Bevölkerung</b> mit <b>' + province.Population.toLocaleString('de') + ' Einwohnern</b> in der Region <b>' + de(province.Region) + '</b>. ' +
        (facts[name].overview ? facts[name].overview : '') +
        '</br></br>' +
        "<a href='https://expiter.com/de/gemeinden/provinz-" + de(province.Name).replace(/\s+/g, '-').replace("'", '-').toLowerCase() + "/'>Das Ballungsgebiet von " + de(province.Name) + ' umfasst <b>' + province.Towns + ' Gemeinden</b></a> und erstreckt sich über eine Fläche von ' + province.Size.toLocaleString('de') + ' km<sup>2</sup>. ' +
        'Die <b>Bevölkerungsdichte beträgt ' + province.Density + ' Einwohner pro km<sup>2</sup></b>, was sie ' +
        (province.Density < 100 ? 'wenig bevölkert macht.' : (province.Density > 500 ? 'sehr dicht besiedelt macht.' : 'ziemlich dicht besiedelt macht.')) +
        ' Das Verhältnis zwischen Männern und Frauen beträgt ' + ratio + '.';

    if (facts[name]['provinceData'] != '') info.overview += '</br></br>' + facts[name]['provinceData'];

    info.CoL = 'Das <b>durchschnittliche monatliche Gehalt in ' + de(province.Name) + ' beträgt ' + province.MonthlyIncome + '€</b>, was ' +
        (province.MonthlyIncome > 1500 && province.MonthlyIncome < 1800 ? 'im landesweiten Durchschnitt liegt' : (province.MonthlyIncome >= 1800 ? "<b class='green'>über dem Durchschnitt</b> für Italien" : "<b class='red'>unter dem Durchschnitt</b> für Italien")) + '.' +
        '</br></br>' +
        'Die Lebenshaltungskosten werden auf ' + province['Cost of Living (Individual)'] + '€ pro Monat für eine Einzelperson oder ' + province['Cost of Living (Family)'] + '€ pro Monat für eine vierköpfige Familie geschätzt. Die Kosten für die Miete eines kleinen Apartments (zwei oder drei Zimmer) in einem Wohnviertel der Stadt betragen etwa ' + province['MonthlyRental'] + '€ pro Monat.' + '</br></br>' +
        'Im Allgemeinen ist das Leben in ' + (province['Cost of Living (Individual)'] > avg['Cost of Living (Individual)'] ? "<b class='red'>" + de(province.Name) + ' sehr teuer' : (province['Cost of Living (Individual)'] < 1150 ? "<b class='green'>" + de(province.Name) + ' überhaupt nicht teuer' : "<b class='green'>" + de(province.Name) + ' nicht sehr teuer')) + '</b> im Vergleich zu anderen italienischen Provinzen.' +
        ' Das Leben in ' + de(province.Name) + ' ist ungefähr ' + (province['Cost of Living (Individual)'] > avg['Cost of Living (Individual)'] ? "<b class='red'>" + (province['Cost of Living (Individual)'] / avg['Cost of Living (Individual)'] * 100 - 100).toFixed(2) + '% teurer als der Durchschnitt</b> aller italienischen Städte' : "<b class='green'>" + (100 - province['Cost of Living (Individual)'] / avg['Cost of Living (Individual)'] * 100).toFixed(2) + '% günstiger als der Durchschnitt</b> aller anderen italienischen Provinzen') + '.';

    info.climate = 'Die Provinz ' + de(province.Name) + ' erhält durchschnittlich <b>' + province.SunshineHours + ' Stunden Sonnenschein</b> pro Monat, was ' +
        (province.SunshineHours / 30).toFixed(1) + ' Stunden Helligkeit pro Tag entspricht.' +
        ' Das entspricht ' + (province.SunshineHours > 236 ? "<b class='green'>" + (province.SunshineHours / 236 * 100 - 100).toFixed(2) + '% mehr</b> als der italienische Durchschnitt' : "<b class='red'>" + (100 - (province.SunshineHours / 236) * 100).toFixed(2) + '% weniger</b> als der italienische Durchschnitt') + ' und ' +
        (province.SunshineHours > region.SunshineHours ? "<b class='green'>" + (province.SunshineHours / region.SunshineHours * 100 - 100).toFixed(2) + '% mehr</b> als der Durchschnitt der Region ' : "<b class='red'>" + (100 - (province.SunshineHours / region.SunshineHours) * 100).toFixed(2) + '% weniger</b> als der Durchschnitt der Region ') + de(province.Region) + '.' +
        '</br></br>' +
        'Im Laufe des Jahres <b>regnet es durchschnittlich ' + province.RainyDays + ' Tage pro Monat</b>, was ' +
        (province.RainyDays > 8 ? "<b class='red'>weit über dem Durchschnitt" : (province.RainyDays < 7 ? "<b class='green'>unter dem Durchschnitt</b>" : '<b>eine normale Niederschlagsmenge')) + '</b> für eine italienische Provinz ist.' +
        '</br></br>' +
        'In Herbst und Winter gibt es normalerweise ' + (province.FoggyDays > 5 ? "<b class='red'>" : "<b class='green'>") + province.FoggyDays + ' Nebeltage pro Monat</b> und <b>' + province.ColdDays + ' kalte Tage pro Monat</b> mit gefühlten Temperaturen unter 3°C.' +
        ' Im Sommer gibt es durchschnittlich <b>' + province.HotDays + ' heiße Tage pro Monat</b> mit gefühlten Temperaturen über 30°C.';

    info.leisure = de(province.Name) + ' hat <b>' + (province.Nightlife > 7.5 ? 'ein ausgezeichnetes Nachtleben' : 'ein ziemlich lebhaftes Nachtleben') + '</b> mit ' +
        province.Bars + ' Bars und ' + province.Restaurants + ' Restaurants pro zehntausend Einwohnern.';

    info.healthcare = '<b>Die Gesundheitsversorgung in ' + de(province.Name) + ' ist ' + (province.Healthcare > 6.74 ? "<b class='green'>über dem Durchschnitt" : "<b class='red'>unter dem Durchschnitt") + '</b></b>. ' +
        'Auf zehntausend Einwohner kommen etwa ' + province.Pharmacies + ' Apotheken, ' + province.GeneralPractitioners + ' Allgemeinärzte und ' + province.SpecializedDoctors + ' Fachärzte. ' +
        '<b>Die durchschnittliche Lebenserwartung in ' + de(province.Name) + ' beträgt ' + (province.LifeExpectancy > 82.05 ? 'sehr hohe ' : '') + province.LifeExpectancy + ' Jahre.</b>';

    info.crimeandsafety = 'Die Provinz ' + de(province.Name) + ' ist in der Regel ' + (province.Safety > 7.33 ? "<b class='green'>sehr sicher" : (province.Safety > 6 ? "<b class='green'>mäßig sicher" : "<b class='red'>weniger sicher als andere italienische Provinzen")) + '</b>. ' +
        'Im Jahr 2021 gab es <b>' + province.ReportedCrimes + ' Anzeigen pro hunderttausend Einwohner</b>. Das entspricht ' + (province.ReportedCrimes > 2835.76 ? "<b class='red'>" + (((province.ReportedCrimes / 2835.76) * 100) - 100).toFixed(2) + '% über dem nationalen Durchschnitt</b>' : "<b class='green'>" + ((100 - (province.ReportedCrimes / 2835.76) * 100).toFixed(2)) + '% unter dem nationalen Durchschnitt</b>') + '.' +
        '<br><br>' +
        'Es gab ungefähr <b>' + province.RoadFatalities + ' Todesfälle durch Verkehrsunfälle</b> und <b>' + province.WorkAccidents + ' schwere Arbeitsunfälle</b> pro zehntausend Personen in ' + de(province.Name) + '. Das sind jeweils ' +
        (province.RoadFatalities > 0.54 ? "<b class='red'>" + (((province.RoadFatalities / 0.54) * 100 - 100).toFixed(2)) + '% mehr Verkehrsunfälle als der Durchschnitt' : "<b class='green'>" + ((100 - (province.RoadFatalities / 0.54) * 100).toFixed(2)) + '% weniger Verkehrsunfälle als der Durchschnitt') + '</b> und ' +
        (province.RoadFatalities > 12.90 ? "<b class='red'>" + (((province.WorkAccidents / 12.90) * 100 - 100).toFixed(2)) + '% mehr Arbeitsunfälle als der Durchschnitt' : "<b class='green'>" + ((100 - (province.WorkAccidents / 12.90) * 100).toFixed(2)) + '% weniger Arbeitsunfälle als der Durchschnitt') + '</b>.' +
        '<br><br>' +
        (province.CarTheft > 70.53 ? "Autodiebstahl wird auf <b class='red'>" + (((province.CarTheft / 70.53) * 100) - 100).toFixed(2) + '% über dem Durchschnitt geschätzt</b> mit ' + province.CarTheft + ' Fällen pro hunderttausend Einwohner.' : "Autodiebstähle werden <b class='green'>" + ((100 - (province.CarTheft / 70.53) * 100)).toFixed(2) + '% seltener als der Durchschnitt</b> mit nur ' + province.CarTheft + ' gemeldeten Fällen pro hunderttausend Einwohner.') + ' ' +
        (province.HouseTheft > 175.02 ? "Einbruchdiebstähle sind <b class='red'>" + (((province.HouseTheft / 175.02) * 100) - 100).toFixed(2) + '% höher als der Durchschnitt</b> mit ' + province.HouseTheft + ' Anzeigen pro hunderttausend Einwohner.' : "Einbruchdiebstähle werden <b class='green'>" + ((100 - (province.HouseTheft / 175.02) * 100)).toFixed(2) + '% seltener als der Durchschnitt</b> mit nur ' + province.HouseTheft + ' Fällen pro hunderttausend Einwohner.') + ' ' +
        (province.Robberies > 22.14 ? "Bewaffnete Raubüberfälle sind nicht ganz ungewöhnlich, es gibt <b class='red'>" + (((province.Robberies / 22.14) * 100) - 100).toFixed(2) + '% mehr Fälle als der nationale Durchschnitt</b> mit ' + province.Robberies + ' Anzeigen pro hunderttausend Einwohner.' : 'Bewaffnete Raubüberfälle sind nicht sehr häufig mit ' + province.Robberies + " gemeldeten Fällen pro hunderttausend Einwohner, etwa <b class='green'>" + ((100 - (province.Robberies / 22.14) * 100)).toFixed(2) + '% weniger als der nationale Durchschnitt</b>.');

    info.education = de(province.Name) + ' hat ' + (province.HighSchoolGraduates > avg.HighSchoolGraduates ? "<b class='green'>eine höhere Abiturientenquote als der Durchschnitt" : "<b class='red'>eine niedrigere Abiturientenquote als der Durchschnitt") + '</b>, etwa ' + province.HighSchoolGraduates + '%; und ' + (province.UniversityGraduates > avg.UniversityGraduates ? "<b class='green'>eine höhere Akademikerquote als der Durchschnitt" : "<b class='red'>eine niedrigere Akademikerquote als der Durchschnitt") + '</b>, etwa ' + province.UniversityGraduates + '%.' +
        (province.Universities > 1 ? ' Es gibt <b>' + province.Universities + ' Universitäten</b> in der Provinz ' : (province.Universities == 1 ? ' Es gibt <b>eine Universität</b> in der Provinz ' : ' <b>Es gibt keine Universität</b> in der Provinz ')) + de(province.Name) + '.';

    info.transport = '<b>Das Angebot an öffentlichen Verkehrsmitteln in ' + de(name) + '</b> ist ' + (province.PublicTransport < avg.PublicTransport * 0.9 ? "<b class='red'>unzureichend" : (province.PublicTransport > avg.PublicTransport * 1.1 ? "<b class='green'>zufriedenstellend" : "<b class='green'>mehr als zufriedenstellend")) + '</b>, und ' +
        (province.Traffic < avg.Traffic * 0.85 ? "<b class='green'>der Verkehr ist leicht" : (province.Traffic < avg.Traffic ? "<b class='green'>der Verkehr liegt unter dem Durchschnitt" : (province.Traffic > avg.Traffic * 1.1 ? "<b class='red'>der Verkehr ist hoch" : "<b class='red'>der Verkehr ist ziemlich hoch"))) + '</b>. ' +
        'Es gibt im Durchschnitt ' + province.VehiclesPerPerson + ' Fahrzeuge pro Person, verglichen mit dem nationalen Durchschnitt von ' + avg.VehiclesPerPerson + '. ' + (province.Subway > 0 ? 'Die Stadt ' + de(name) + ' ist eine der wenigen italienischen Städte mit einem Metrosystem, der <b>U-Bahn von ' + de(name) + '</b>. ' : '') +
        '<br><br>' +
        'Etwa ' + (province.CyclingLanes / 10).toFixed(2) + 'km pro zehntausend Einwohner der Hauptstadt von ' + de(name) + ' bestehen aus Fahrradwegen. Das macht ' + de(name) + ' ' + (province.CyclingLanes > avg.CyclingLanes * 0.8 ? "<b class='green'>einigermaßen fahrradfreundlich nach italienischen Standards" : (province.CyclingLanes > avg.CyclingLanes * 1.2 ? "<b class='green'>sehr fahrradfreundlich nach italienischen Standards" : "<b class='red'>nicht sehr fahrradfreundlich")) + '</b>.';

    if (facts[name]['transportData'] != '') info.transport += '</br></br>' + facts[name]['transportData'];

    info.disclaimer = '</br></br><center><div id="disclaimer">Diese Seite enthält Partnerlinks. Als Partner von Amazon und Viator können wir Provisionen für qualifizierte Käufe verdienen.</div></center>';

    info.map = '</br><center class="map"><iframe id="ggmap" src="https://maps.google.com/maps?f=q&source=s_q&hl=de&geocode=&q=Provincia+di+' + name + '&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>' +
        'Anzeigen: ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=de&geocode=&q=Provincia+di+' + name + '+Cose+da+fare&output=embed")\' target="_blank"><b><ej>🎭</ej>Sehenswürdigkeiten</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=de&geocode=&q=Provincia+di+' + name + '+Musei&output=embed")\' target="_blank"><b><ej>🏺</ej>Museen</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=de&geocode=&q=Provincia+di+' + name + '+Ristoranti&output=embed")\' target="_blank"><b><ej>🍕</ej>Restaurants</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=de&geocode=&q=Provincia+di+' + name + '+Bar&output=embed")\' target="_blank"><b><ej>🍺</ej>Bars</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=de&geocode=&q=Provincia+di+' + name + '+Stabilimento+balneare&output=embed")\' target="_blank"><b><ej>🏖️</ej>Strände</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=de&geocode=&q=Provincia+di+' + name + '+Area+per+passeggiate&output=embed")\' target="_blank"><b><ej>⛰️</ej>Wanderungen</b></a> ' +
        '<a href="https://www.amazon.de/ulp/view?&linkCode=ll2&tag=expiter-21&linkId=5824e12643c8300394b6ebdd10b7ba3c&language=de_DE&ref_=as_li_ss_tl" target="_blank"><b><ej>📦</ej>Amazon Abholstellen</b></a> ' +
        '</center>';

    info.weather = (province.WeatherWidget ? '<div class="weather-block"><h3>Wetter</h3><a class="weatherwidget-io" href="https://forecast7.com/de/' + province.WeatherWidget + '" data-label_1="' + de(name) + '" data-label_2="' + de(region.Name) + '" data-font="Roboto" data-icons="Climacons Animated" data-mode="Forecast" data-theme="clear" data-basecolor="rgba(155, 205, 245, 0.59)" data-textcolor="#000441" >' + de(name) + ', ' + de(region.Name) + '</a>' +
        '<script>' +
        "!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');" +
        '</script></div>' : '');

    info.viator = '<center><h3>Empfohlene Erlebnisse in ' + (province.Viator ? de(name) : de(region.Name)) + '</h3></center>' +
        '<div data-vi-partner-id=P00045447 data-vi-language=de data-vi-currency=EUR data-vi-partner-type="AFFILIATE" data-vi-url="' +
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

    info.related = '<h2>In der Nähe</h2>' +
        '<ul class="nearby-pills">' +
        facts[related1].snippet +
        facts[related2].snippet +
        facts[related3].snippet +
        facts[related4].snippet + '</ul>';

    return info;
}


function populateFacts() {
    facts.Roma.overview = 'Die <b>Stadt Rom</b> mit 2.761.632 Einwohnern ist die bevölkerungsreichste Stadt und die <b>Hauptstadt Italiens</b>.';
    facts.Milano.overview = 'Die <b>Stadt Mailand</b> mit 1.371.498 Einwohnern ist die zweitgrößte Stadt und die <b>industrielle, kommerzielle und finanzielle Hauptstadt Italiens</b>.';
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
        const slug = de(province.Name).replace(/\s+/g, '-').replace("'", '-').toLowerCase();
        facts[province['Name']].snippet =
            '<li><a href="https://expiter.com/de/provinz/' + slug + '/" title="' + de(province.Name) + ', ' + de(province.Region) + '">' +
            '<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/' + province.Abbreviation + '.webp?tr=w-56,h-56,fo-auto,q-60" ' +
            'alt="' + de(province.Name) + '" width="28" height="28">' +
            '<span>' + de(province.Name) + '</span></a></li>';
    }
    avg = data[107];
}


// Returns { tier, text } — same thresholds as EN/IT, German labels
function qualityScoreData(quality, score) {
    let expenses = ['Cost of Living (Individual)', 'Cost of Living (Family)', 'Cost of Living (Nomad)',
        'StudioRental', 'BilocaleRent', 'TrilocaleRent', 'MonthlyIncome',
        'StudioSale', 'BilocaleSale', 'TrilocaleSale'];

    if (quality == 'CostOfLiving' || quality == 'HousingCost') {
        if (score < avg[quality] * .8) return { tier: 'excellent', text: 'sehr niedrig' };
        if (score < avg[quality] * .95) return { tier: 'great', text: 'niedrig' };
        if (score < avg[quality] * 1.05) return { tier: 'good', text: 'im Durchschnitt' };
        if (score < avg[quality] * 1.2) return { tier: 'average', text: 'hoch' };
        return { tier: 'poor', text: 'sehr hoch' };
    }
    if (expenses.includes(quality)) {
        let tier;
        if (score < avg[quality] * .95) tier = 'great';
        else if (score < avg[quality] * 1.05) tier = 'average';
        else tier = 'poor';
        return { tier, text: score + '€/m', isAmount: true };
    }
    if (quality == 'HotDays' || quality == 'ColdDays') {
        const w = (quality == 'HotDays' ? 'heiß' : 'kalt');
        if (score < avg[quality] * .8) return { tier: 'excellent', text: 'nicht ' + w };
        if (score < avg[quality] * .95) return { tier: 'great', text: 'nicht sehr ' + w };
        if (score < avg[quality] * 1.05) return { tier: 'good', text: 'etwas ' + w };
        if (score < avg[quality] * 1.2) return { tier: 'average', text: w };
        return { tier: 'poor', text: 'sehr ' + w };
    }
    if (quality == 'RainyDays') {
        if (score < avg[quality] * .8) return { tier: 'excellent', text: 'sehr wenig' };
        if (score < avg[quality] * .95) return { tier: 'great', text: 'wenig' };
        if (score < avg[quality] * 1.05) return { tier: 'good', text: 'im Durchschnitt' };
        if (score < avg[quality] * 1.2) return { tier: 'average', text: 'regnerisch' };
        return { tier: 'poor', text: 'sehr regnerisch' };
    }
    if (quality == 'FoggyDays') {
        if (score < avg[quality] * .265) return { tier: 'excellent', text: 'kein Nebel' };
        if (score < avg[quality] * .6) return { tier: 'great', text: 'wenig' };
        if (score < avg[quality] * 1.00) return { tier: 'good', text: 'im Durchschnitt' };
        if (score < avg[quality] * 3) return { tier: 'average', text: 'neblig' };
        return { tier: 'poor', text: 'sehr neblig' };
    }
    if (quality == 'Crime' || quality == 'Traffic') {
        if (score < avg[quality] * .8) return { tier: 'excellent', text: 'sehr niedrig' };
        if (score < avg[quality] * .95) return { tier: 'great', text: 'niedrig' };
        if (score < avg[quality] * 1.05) return { tier: 'good', text: 'mittel' };
        if (score < avg[quality] * 1.2) return { tier: 'average', text: 'hoch' };
        return { tier: 'poor', text: 'sehr hoch' };
    }
    // default: higher = better
    if (score < avg[quality] * .8) return { tier: 'poor', text: 'schlecht' };
    if (score < avg[quality] * .95) return { tier: 'average', text: 'ausreichend' };
    if (score < avg[quality] * 1.05) return { tier: 'good', text: 'gut' };
    if (score < avg[quality] * 1.2) return { tier: 'great', text: 'sehr gut' };
    return { tier: 'excellent', text: 'ausgezeichnet' };
}


function buildTabRows(province) {
    const q = (k, prop) => qualityScoreData(k, province[prop !== undefined ? prop : k]);
    return {
        qualityOfLife: [
            { emoji: '👥', label: 'Bevölkerung', raw: province.Population.toLocaleString('de', { useGrouping: true }) },
            { emoji: '🚑', label: 'Gesundheit', ...q('Healthcare') },
            { emoji: '📚', label: 'Bildung', ...q('Education', 'Istruzione') },
            { emoji: '👮', label: 'Sicherheit', ...q('Safety') },
            { emoji: '🚨', label: 'Kriminalität', ...q('Crime') },
            { emoji: '🚌', label: 'Verkehr', ...q('PublicTransport') },
            { emoji: '🚥', label: 'Stau', ...q('Traffic') },
            { emoji: '🚴', label: 'Fahrrad', ...q('CyclingLanes') },
            { emoji: '🏛️', label: 'Kultur', ...q('Culture') },
            { emoji: '🍸', label: 'Nachtleben', ...q('Nightlife') },
            { emoji: '⚽', label: 'Freizeit', ...q('Sports & Leisure') },
            { emoji: '🌦️', label: 'Klima', ...q('Climate') },
            { emoji: '☀️', label: 'Sonne', ...q('SunshineHours') },
            { emoji: '🥵', label: 'Sommer', ...q('HotDays') },
            { emoji: '🥶', label: 'Winter', ...q('ColdDays') },
            { emoji: '🌧️', label: 'Regen', ...q('RainyDays') },
            { emoji: '🌫️', label: 'Nebel', ...q('FoggyDays') },
            { emoji: '🍃', label: 'Luftqualität', ...q('AirQuality') },
            { emoji: '👪', label: 'Für Familien', ...q('Family-friendly') },
            { emoji: '👩', label: 'Für Frauen', ...q('Female-friendly') },
            { emoji: '🏳️‍🌈', label: 'LGBTQ+', ...q('LGBT-friendly') },
            { emoji: '🥗', label: 'Vegan', ...q('Veg-friendly') },
        ],
        costOfLiving: [
            { emoji: '📈', label: 'Lebenshaltungskosten', ...q('CostOfLiving') },
            { emoji: '🏙️', label: 'Wohnungskosten', ...q('HousingCost') },
            { emoji: '💵', label: 'Gehalt', ...q('MonthlyIncome') },
            { emoji: '🧑', label: 'Kosten (Einzelperson)', ...q('Cost of Living (Individual)') },
            { emoji: '👪', label: 'Kosten (Familie)', ...q('Cost of Living (Family)') },
            { emoji: '🎒', label: 'Kosten (Tourist)', ...q('Cost of Living (Nomad)') },
            { emoji: '🏠', label: 'Miete (Studio)', ...q('StudioRental') },
            { emoji: '🏘️', label: 'Miete (2-Zimmer)', ...q('BilocaleRent') },
            { emoji: '🏰', label: 'Miete (3-Zimmer)', ...q('TrilocaleRent') },
            { emoji: '🏠', label: 'Kauf (Studio)', ...q('StudioSale') },
            { emoji: '🏘️', label: 'Kauf (2-Zimmer)', ...q('BilocaleSale') },
            { emoji: '🏰', label: 'Kauf (3-Zimmer)', ...q('TrilocaleSale') },
        ],
        digitalNomads: [
            { emoji: '👩‍💻', label: 'Nomadenfreundlich', ...q('DN-friendly') },
            { emoji: '💸', label: 'Nomadenkosten', ...q('Cost of Living (Nomad)') },
            { emoji: '📡', label: 'Schnelles Internet', ...q('HighSpeedInternetCoverage') },
            { emoji: '💃', label: 'Unterhaltung', ...q('Fun') },
            { emoji: '🤗', label: 'Freundlichkeit', ...q('Friendliness') },
            { emoji: '🤐', label: 'Englischsprecher', ...q('English-speakers') },
            { emoji: '😊', label: 'Glück', ...q('Antidepressants') },
            { emoji: '📈', label: 'Innovation', ...q('Innovation') },
            { emoji: '🏖️', label: 'Strände', ...q('Beach') },
            { emoji: '⛰️', label: 'Wandern', ...q('Hiking') },
        ],
    };
}

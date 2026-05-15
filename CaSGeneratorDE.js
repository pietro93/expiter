import * as pb from './js/pageBuilder.js';
import { de } from './js/pageBuilder.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { nunjucks } from './js/nunjucksEnv.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function slug(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
}

var dataset;
var provinces = {};
var facts = {};
var avg;
var regions = {};

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
        const sl = slug(de(province.Name));
        facts[province['Name']].snippet =
            '<li><a href="https://expiter.com/de/provinz/' + sl + '/kriminalitaet-und-sicherheit/" title="Kriminalität und Sicherheit in ' + de(province.Name) + ', ' + de(province.Region) + '">' +
            '<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/' + province.Abbreviation + '.webp?tr=w-56,h-56,fo-auto,q-60" ' +
            'alt="' + de(province.Name) + '" width="28" height="28">' +
            '<span>' + de(province.Name) + '</span></a></li>';
    }
    avg = data[107];
}

fetch('https://expiter.com/dataset.json', { method: 'Get' })
    .then(response => response.json())
    .then(data => {
        dataset = data;
        populateData(data);
        return fetch('https://expiter.com/dataset_crime_2023.json', { method: 'Get' });
    })
    .then(response => response.json())
    .then(crimeDataset2023 => {
        const combinedData = dataset.map(entry => {
            const crimeData = crimeDataset2023.find(c => c.Name === entry.Name);
            return crimeData ? { ...entry, ...crimeData } : entry;
        });
        populateData(combinedData);

        for (let i = 0; i < 107; i++) {
            let province = combinedData[i];
            let dirName = 'de/provinz/' + slug(de(province.Name));
            let dir = path.join(__dirname, dirName);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            let htaccessContent = `RewriteEngine on\nRewriteRule ^$ /${dirName}.html [L]\nRewriteRule ^([a-zA-Z0-9-]+)/$ $1.html [L]`;
            fs.writeFileSync(path.join(dir, '.htaccess'), htaccessContent);

            var fileName = dirName + '/kriminalitaet-und-sicherheit';
            let html = renderPage(province, fileName);
            fs.writeFile(fileName + '.html', html, function (err) {
                if (err) throw err;
                console.log(de(province.Name) + '.html Gespeichert!');
            });
        }
    })
    .catch(err => console.log('Fehler: ' + err));


function renderPage(province, fileName) {
    let info = getInfo(province);
    let separator = '</br><div class="separator"></div></br>';
    const tabRows = buildTabRows(province);
    const toc =
        '<ul>' +
        '<li><a href="#Ueberblick">Überblick</a></li>' +
        '<li><a href="#Kriminalitaet-und-Sicherheit">Kriminalität und Sicherheit</a></li>' +
        '<li><a href="#Diebstaehle-und-Raubueberfaelle">Diebstähle und Raubüberfälle</a></li>' +
        '<li><a href="#Gewaltverbrechen">Gewaltverbrechen</a></li>' +
        '<li><a href="#Organisierte-Kriminalitaet">Organisierte Kriminalität</a></li>' +
        '<li><a href="#Unfaelle">Unfälle</a></li>' +
        '<li><a href="#Entdecken">Entdecken</a></li>' +
        '</ul>';

    const seoTitle = de(province.Name) + ' - Informationen zu Kriminalität und Sicherheit';
    const seoDescription = 'Informationen zu Kriminalität und Sicherheit in ' + de(province.Name) + ', Italien. ' + de(province.Name) + ' Kriminalitätsindex, Mafia-Aktivität, Sicherheit und mehr.';
    const seoKeywords = de(province.Name) + ' italien, ' + de(province.Name) + ' sicher, ' + de(province.Name) + ' kriminalität, ' + de(province.Name) + ' mafia';

    return nunjucks.render('pages/crime-safety-de.njk', {
        lang: 'de',
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl: 'https://expiter.com/' + fileName + '/',
        hreflangIt: 'https://expiter.com/it/province/' + slug(province.Name) + '/sicurezza-e-criminalita/',
        heroImage: 'https://expiter.com/img/safety/' + province.Abbreviation + '.webp',
        heroAlt: 'Provinz ' + de(province.Name),
        pageTitle: 'Kriminalität und Sicherheit in ' + de(province.Name),
        eyebrow: de(province.Region) + ' · Kriminalität und Sicherheit',
        sidebar: pb.setSideBarDE(province),
        tabRows,
        toc,
        overview: pb.addBreaks(info.overview || ''),
        crimeandsafety: pb.addBreaks(info.crimeandsafety) + separator,
        theftsandrobberies: info.theftsandrobberies + separator,
        violentcrimes: pb.addBreaks(info.violentcrimes) + separator,
        organizedcrime: pb.addBreaks(info.organizedcrime) + separator,
        accidents: pb.addBreaks(info.accidents) + separator,
        promo: (info.viator || '') + separator + (info.getyourguide || '') + separator + (info.related || '')
    });
}


function getInfo(province) {
    populateFacts();
    let info = {};
    let name = province.Name;
    let region = regions[province.Region];

    let safetyVerdict;
    if (province.SafetyRank <= 27) safetyVerdict = "<b class='green'>eine der sichersten italienischen Provinzen</b>";
    else if (province.SafetyRank <= 53) safetyVerdict = "<b class='green'>mäßig sicher</b> im Vergleich zu anderen italienischen Provinzen";
    else if (province.SafetyRank <= 79) safetyVerdict = "<b class='orange'>im Durchschnitt</b> im Vergleich zu anderen italienischen Provinzen in Sachen Sicherheit";
    else safetyVerdict = "<b class='red'>eine der unsichersten italienischen Provinzen</b>";

    info.overview =
        '<div class="province-hero" role="img" aria-label="Provinz ' + de(province.Name) + '" ' +
        'style="background-image:url(\'https://expiter.com/img/safety/' + province.Abbreviation + '.webp\')"></div>' +
        '<p class="lede">Diese Seite bietet einen datenbasierten Überblick über <b>Kriminalität und Sicherheit in ' + de(province.Name) + '</b>' +
        (province.Region ? ', in der Region ' + de(province.Region) : '') + '. ' +
        'Laut offiziellen Statistiken 2023 ist ' + de(province.Name) + ' ' + safetyVerdict + ', ' +
        'mit einer Platzierung von <b>' + province.SafetyRank + ' von 106</b> und einem Sicherheits-Score von <b>' + province.SafetyScore + '/10</b>.</p>' +
        '<p>Im Folgenden findest du Details zu Diebstählen, Gewaltverbrechen, organisierter Kriminalität, Drogendelikten und Unfällen, ' +
        'sowie Antworten auf die häufigsten Fragen zur Sicherheit in ' + de(province.Name) + '.</p>';

    info.crimeandsafety = 'Die Provinz ' + de(province.Name) + ' belegt nach unseren Daten <b>Platz ' + province.SafetyRank + ' von 106 bei der Sicherheit</b>, mit einem <b>Sicherheits-Score von ' + province.SafetyScore + '</b>. ' +
        'Im Jahr 2023 gab es insgesamt ' + province.IndiceCriminalita + ' offizielle Anzeigen pro 100.000 Einwohner in der Provinz. Das ist ' +
        (province.IndiceCriminalita > avg.IndiceCriminalita ? "<b class='red'>über dem Durchschnitt</b> der gemeldeten Verbrechen pro 100.000 Einwohner in allen italienischen Provinzen. Dies könnte auf verschiedene Faktoren zurückzuführen sein, darunter sozioökonomische Bedingungen und Praktiken der Strafverfolgung." :
            (province.IndiceCriminalita < avg.IndiceCriminalita ? "<b class='green'>unter dem Durchschnitt</b> der gemeldeten Verbrechen pro 100.000 Einwohner in allen italienischen Provinzen. Dies könnte auf effektive Strafverfolgung oder andere Faktoren hinweisen, die zu niedrigeren Kriminalitätsraten beitragen." :
                "<b class='yellow'>im Einklang mit dem Durchschnitt</b> der gemeldeten Verbrechen pro 100.000 Einwohner in allen italienischen Provinzen. Dies deutet darauf hin, dass die Kriminalitätsrate in " + de(province.Name) + ' typisch für italienische Provinzen ist.'));

    info.theftsandrobberies = 'In der Provinz ' + de(province.Name) + ' gab es <b>' + province.FurtiDestrezza + ' Fälle von Taschendiebstahl</b>, <b>' + province.FurtiStrappo + ' Fälle von Handtaschenraub</b>, <b>' + province.FurtiAutovettura + ' Autodiebstähle</b> und <b>' + province.FurtiAbitazione + ' Wohnungseinbrüche</b> pro 100.000 Einwohner im Jahr 2023.<br><br>' +
        'Hier ein Überblick, wie diese Diebstahlsarten im Vergleich zum Durchschnitt aller italienischen Provinzen abschneiden: <br><br>' +
        (province.FurtiDestrezza > avg.FurtiDestrezza ? "<b class='red'>Taschendiebstähle liegen über dem Durchschnitt</b>." :
            (province.FurtiDestrezza < avg.FurtiDestrezza ? "<b class='green'>Taschendiebstähle liegen unter dem Durchschnitt</b>." :
                "<b class='yellow'>Taschendiebstähle entsprechen dem Durchschnitt</b>.")) +
        '<br><br>' +
        (province.FurtiStrappo > avg.FurtiStrappo ? "<b class='red'>Handtaschenraub liegt über dem Durchschnitt</b>." :
            (province.FurtiStrappo < avg.FurtiStrappo ? "<b class='green'>Handtaschenraub liegt unter dem Durchschnitt</b>." :
                "<b class='yellow'>Handtaschenraub entspricht dem Durchschnitt</b>.")) +
        '<br><br>' +
        (province.FurtiAutovettura > avg.FurtiAutovettura ? "<b class='red'>Autodiebstähle liegen über dem Durchschnitt</b>." :
            (province.FurtiAutovettura < avg.FurtiAutovettura ? "<b class='green'>Autodiebstähle liegen unter dem Durchschnitt</b>." :
                "<b class='yellow'>Autodiebstähle entsprechen dem Durchschnitt</b>.")) +
        '<br><br>' +
        (province.FurtiAbitazione > avg.FurtiAbitazione ? "<b class='red'>Wohnungseinbrüche liegen über dem Durchschnitt</b>." :
            (province.FurtiAbitazione < avg.FurtiAbitazione ? "<b class='green'>Wohnungseinbrüche liegen unter dem Durchschnitt</b>." :
                "<b class='yellow'>Wohnungseinbrüche entsprechen dem Durchschnitt</b>."));

    info.violentcrimes = 'In der Provinz ' + de(province.Name) + ' gab es ' + (province.Omicidi + province.ViolenzeSessuali) + ' Fälle von Gewaltverbrechen (Morde und sexuelle Übergriffe) pro 100.000 Einwohner im Jahr 2023. Das ist ' +
        (province.Omicidi + province.ViolenzeSessuali > avg.Omicidi + avg.ViolenzeSessuali ? "<b class='red'>über dem Durchschnitt</b> der Gewaltverbrechen pro 100.000 Einwohner in allen italienischen Provinzen." :
            (province.Omicidi + province.ViolenzeSessuali < avg.Omicidi + avg.ViolenzeSessuali ? "<b class='green'>unter dem Durchschnitt</b> der Gewaltverbrechen pro 100.000 Einwohner in allen italienischen Provinzen." :
                "<b class='yellow'>im Einklang mit dem Durchschnitt</b> der Gewaltverbrechen pro 100.000 Einwohner in allen italienischen Provinzen."));

    info.organizedcrime = 'In der Provinz ' + de(province.Name) + ' gab es ' + province.Estorsioni + ' Erpressungsfälle, ' + province.RiciclaggioDenaro + ' Geldwäschefälle und ' + province.ReatiStupefacenti + ' Drogendelikte pro 100.000 Einwohner im Jahr 2023. ' +
        '<br><br>' + (province.Estorsioni > avg.Estorsioni ? "<b class='red'>Erpressungen liegen über dem Durchschnitt aller italienischen Provinzen</b>." :
            (province.Estorsioni < avg.Estorsioni ? "<b class='green'>Erpressungen liegen unter dem Durchschnitt aller italienischen Provinzen</b>." :
                "<b class='yellow'>Erpressungen entsprechen dem Durchschnitt der italienischen Provinzen</b>.")) +
        '<br><br>' + (province.RiciclaggioDenaro > avg.RiciclaggioDenaro ? "<b class='red'>Geldwäschefälle liegen über dem Durchschnitt aller italienischen Provinzen</b>." :
            (province.RiciclaggioDenaro < avg.RiciclaggioDenaro ? "<b class='green'>Geldwäschefälle liegen unter dem Durchschnitt aller italienischen Provinzen</b>." :
                "<b class='yellow'>Geldwäschefälle entsprechen dem nationalen Durchschnitt</b>.")) +
        '<br><br>' + (province.ReatiStupefacenti > avg.ReatiStupefacenti ? "<b class='red'>Drogendelikte liegen über dem Durchschnitt aller italienischen Provinzen</b>." :
            (province.ReatiStupefacenti < avg.ReatiStupefacenti ? "<b class='green'>Drogendelikte liegen unter dem Durchschnitt aller italienischen Provinzen</b>." :
                "<b class='yellow'>Drogendelikte entsprechen dem Durchschnitt der italienischen Provinzen</b>."))
        + (facts[province.Name].mafia ? '<br><br><h3>Mafia-Aktivität</h3>' + facts[province.Name].mafia : '');

    info.accidents = 'In der Provinz ' + de(province.Name) + ' gab es ' + province.InfortuniLavoro + ' tödliche oder zu dauerhafter Invalidität führende Arbeitsunfälle pro 10.000 Beschäftigte und ' + province.MortalitàIncidenti + ' Verkehrstote pro 10.000 Einwohner im Jahr 2023. ' +
        (province.InfortuniLavoro > avg.InfortuniLavoro ? "<b class='red'>Arbeitsunfälle liegen über dem Durchschnitt aller italienischen Provinzen</b>." :
            (province.InfortuniLavoro < avg.InfortuniLavoro ? "<b class='green'>Arbeitsunfälle liegen unter dem Durchschnitt aller italienischen Provinzen</b>." :
                "<b class='yellow'>Arbeitsunfälle entsprechen dem nationalen Durchschnitt</b>.")) +
        '<br><br>' + (province.MortalitàIncidenti > avg.MortalitàIncidenti ? "<b class='red'>Verkehrstote liegen über dem nationalen Durchschnitt</b>." :
            (province.MortalitàIncidenti < avg.MortalitàIncidenti ? "<b class='green'>Verkehrstote liegen unter dem nationalen Durchschnitt</b>." :
                "<b class='yellow'>Verkehrstote entsprechen dem nationalen Durchschnitt</b>."));

    info.viator = '<center><h3>Empfohlene Touren in ' + (province.Viator ? de(name) : de(region.Name)) + '</h3></center>' +
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

    info.related = '<h2>Weitere Provinzen</h2>' +
        '<ul class="nearby-pills">' +
        facts[related1].snippet + facts[related2].snippet + facts[related3].snippet + facts[related4].snippet + '</ul>';

    return info;
}


function qualityScoreData(quality, score) {
    let expenses = ['Cost of Living (Individual)', 'Cost of Living (Family)', 'Cost of Living (Nomad)', 'StudioRental', 'BilocaleRent', 'TrilocaleRent', 'MonthlyIncome', 'StudioSale', 'BilocaleSale', 'TrilocaleSale'];
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
            { emoji: '📚', label: 'Bildung', ...q('Education', 'Education') },
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

function populateFacts() {
    facts.Roma.mafia = "Rom ist ein bedeutendes Zentrum mafiöser Aktivität, mit der Präsenz verschiedener Gruppen organisierter Kriminalität wie der 'Ndrangheta, der Camorra und einheimischer römischer Kriminalfamilien. Diese Organisationen arbeiten in kriminellen Aktivitäten und Korruption zusammen, wobei der Casamonica-Clan die südöstlichen Vororte Roms und die umliegenden Albaner Hügel kontrolliert.";
    facts.Milano.mafia = "Mailand hat eine bedeutende mafiöse Präsenz mit der Infiltration verschiedener Gruppen organisierter Kriminalität wie der 'Ndrangheta aus Kalabrien, der Camorra aus Neapel und einheimischer Mailänder Kriminalfamilien. Ein Bericht aus dem Jahr 2018 stellte fest, dass in Mailand etwa 45 verschiedene mafiöse Banden operieren.";
    facts.Napoli.mafia = "Neapel hat eine lange Geschichte mafiöser Aktivität, hauptsächlich in Verbindung mit der Camorra, einer der ältesten und mächtigsten kriminellen Organisationen Italiens. Die Camorra hat tiefe Wurzeln in Neapel und der umliegenden Region Kampanien.";
    facts.Bari.mafia = "Bari und die umliegende Region Apulien sind von verschiedenen organisierten Kriminalitätsgruppen beeinflusst, darunter die Sacra Corona Unita, eine mafiöse Organisation, die in den 1980er Jahren entstand.";
    facts.Catania.mafia = "Catania war ein Brennpunkt mafiöser Aktivität, insbesondere im Zusammenhang mit Cosa-Nostra-Clans, die in der Gegend operieren.";
    facts.Palermo.mafia = "Palermo, die Hauptstadt Siziliens, gilt seit langem als Geburtsort und Bollwerk der sizilianischen Mafia, auch bekannt als Cosa Nostra.";
    facts.Torino.mafia = "Es gibt Beweise für die Präsenz und Aktivität der Mafia in Turin und der Region Piemont. Ermittlungen haben die Infiltration der Mafia in die legale Wirtschaft aufgedeckt.";
    facts.Genova.mafia = "Die 'Ndrangheta, eine mächtige kalabrische organisierte Verbrechergruppe, hat eine bedeutende Präsenz und Einfluss in Genua und der umliegenden Region Ligurien.";
    facts.Venezia.mafia = "Die Mafia hat eine bedeutende Präsenz in Venedig, insbesondere in Form der kalabrischen 'Ndrangheta.";
    facts.Messina.mafia = "Die Mafia hat eine bedeutende Präsenz in Messina, insbesondere mit dem Einfluss des Romeo-Santapaola-Clans.";
    facts.Firenze.mafia = "Es gibt Beweise für die Präsenz und den Einfluss der Mafia in Florenz. Die Stadt wurde von mafiösen Aktivitäten betroffen, einschließlich der Bombenexplosion von 1993 in der Via dei Georgofili.";
    facts.Caltanissetta.mafia = "In Caltanissetta und Gela hat die Mafia, insbesondere Cosa Nostra, eine starke Präsenz.";
    facts.Bologna.mafia = "Bologna und die Region Emilia-Romagna sind historisch frei von bedeutender Mafia-Präsenz. Jüngste Berichte und Ermittlungen zeigen jedoch Anzeichen einer Mafia-Infiltration in der Gegend.";
    facts.Cosenza.mafia = "Cosenza hat eine Geschichte mafiöser Aktivität in Verbindung mit der 'Ndrangheta, einer der mächtigsten kriminellen Organisationen in Italien.";
    facts.Siracusa.mafia = "Syrakus hat eine Geschichte mafiöser Aktivität in Verbindung mit der sizilianischen Mafia, bekannt als Cosa Nostra.";
    facts["Reggio Calabria"].mafia = "Reggio Calabria und die Region Kalabrien sind als Hochburgen der 'Ndrangheta anerkannt, einer der mächtigsten mafiösen Organisationen Italiens.";
    facts["L'Aquila"].mafia = "L'Aquila, die Hauptstadt der Region Abruzzen, wurde von verschiedenen mafiösen Organisationen ins Visier genommen.";
    facts.Potenza.mafia = "Potenza in Basilikata ist von einer bedeutenden Präsenz krimineller Organisationen betroffen, darunter 'Ndrangheta und Camorra.";
    facts.Foggia.mafia = "Die Stadt Foggia und ihre Provinz sind geprägt von der Präsenz einer mächtigen kriminellen Organisation mafiösen Typs, allgemein bekannt als 'Società foggiana' oder 'foggianische Mafia'. Diese Mafia gilt als die 'Vierte Mafia' Italiens.";
    facts.Pescara.mafia = "Die Stadt Pescara und ihre Provinz wurden von der mächtigen 'Società foggiana' infiltriert, die als 'Vierte Mafia' Italiens gilt.";
    facts["Catanzaro"].mafia = "Catanzaro ist ein bedeutendes Zentrum mafiöser Aktivität mit der Präsenz mehrerer organisierter Kriminalitätsgruppen wie 'Ndrangheta, Camorra und einheimischer kalabrischer Kriminalfamilien.";
    facts["Lecce"].mafia = "Die Mafia in Lecce ist eine bedeutende Präsenz, mit der 'Ndrangheta, die das lokale Unternehmensgefüge infiltriert hat.";
    facts.Livorno.mafia = "In Livorno ist die Mafia hauptsächlich durch die 'Ndrangheta vertreten, die enge Beziehungen zu lokalen Kriminalgruppen unterhält und sich im Hafen niedergelassen hat.";
    facts.Trieste.mafia = "Organisierte Kriminalität ist in Triest und Friaul-Julisch Venetien präsent, allerdings nicht in stabiler und verwurzelter Form.";
    facts.Vicenza.mafia = "In Vicenza wurde die nigerianische Mafia durch gerichtliche Untersuchungen festgestellt.";
    facts.Verona.mafia = "In Verona war die 'Ndrangheta in Drogen- und Giftmüllhandel verwickelt.";
}

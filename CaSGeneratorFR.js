import * as pb from './js/pageBuilder.js';
import { fr } from './js/pageBuilder.js';
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
        const sl = slug(fr(province.Name));
        facts[province['Name']].snippet =
            '<li><a href="https://expiter.com/fr/province/' + sl + '/criminalite-et-securite/" title="Criminalité et sécurité à ' + fr(province.Name) + ', ' + fr(province.Region) + '">' +
            '<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/' + province.Abbreviation + '.webp?tr=w-56,h-56,fo-auto,q-60" ' +
            'alt="' + fr(province.Name) + '" width="28" height="28">' +
            '<span>' + fr(province.Name) + '</span></a></li>';
    }
    avg = data[107];
}

fetch('https://expiter.com/dataset.json', { method: 'Get' })
    .then(r => r.json())
    .then(data => { dataset = data; populateData(data); return fetch('https://expiter.com/dataset_crime_2023.json', { method: 'Get' }); })
    .then(r => r.json())
    .then(crimeDataset2023 => {
        const combinedData = dataset.map(entry => {
            const c = crimeDataset2023.find(x => x.Name === entry.Name);
            return c ? { ...entry, ...c } : entry;
        });
        populateData(combinedData);

        for (let i = 0; i < 107; i++) {
            let province = combinedData[i];
            let dirName = 'fr/province/' + slug(fr(province.Name));
            let dir = path.join(__dirname, dirName);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            let htaccessContent = `RewriteEngine on\nRewriteRule ^$ /${dirName}.html [L]\nRewriteRule ^([a-zA-Z0-9-]+)/$ $1.html [L]`;
            fs.writeFileSync(path.join(dir, '.htaccess'), htaccessContent);
            var fileName = dirName + '/criminalite-et-securite';
            let html = renderPage(province, fileName);
            fs.writeFile(fileName + '.html', html, function (err) {
                if (err) throw err;
                console.log(fr(province.Name) + '.html Enregistré!');
            });
        }
    })
    .catch(err => console.log('Erreur: ' + err));


function renderPage(province, fileName) {
    let info = getInfo(province);
    let separator = '</br><div class="separator"></div></br>';
    const tabRows = buildTabRows(province);
    const toc =
        '<ul>' +
        '<li><a href="#Apercu">Aperçu</a></li>' +
        '<li><a href="#Criminalite-et-Securite">Criminalité et Sécurité</a></li>' +
        '<li><a href="#Vols-et-Cambriolages">Vols et Cambriolages</a></li>' +
        '<li><a href="#Crimes-Violents">Crimes Violents</a></li>' +
        '<li><a href="#Crime-Organise">Crime Organisé</a></li>' +
        '<li><a href="#Accidents">Accidents</a></li>' +
        '<li><a href="#Decouvrir">Découvrir</a></li>' +
        '</ul>';

    const seoTitle = fr(province.Name) + ' - Fiche d\'information criminalité et sécurité';
    const seoDescription = 'Informations sur la criminalité et la sécurité à ' + fr(province.Name) + ', Italie. ' + fr(province.Name) + ' indice de criminalité, activité mafieuse, sécurité et plus encore.';
    const seoKeywords = fr(province.Name) + ' italie, ' + fr(province.Name) + ' sûr, ' + fr(province.Name) + ' criminalité, ' + fr(province.Name) + ' mafia';

    return nunjucks.render('pages/crime-safety-fr.njk', {
        lang: 'fr',
        seoTitle, seoDescription, seoKeywords,
        canonicalUrl: 'https://expiter.com/' + fileName + '/',
        hreflangIt: 'https://expiter.com/it/province/' + slug(province.Name) + '/sicurezza-e-criminalita/',
        heroImage: 'https://expiter.com/img/safety/' + province.Abbreviation + '.webp',
        heroAlt: 'Province de ' + fr(province.Name),
        pageTitle: 'Criminalité et sécurité à ' + fr(province.Name),
        eyebrow: fr(province.Region) + ' · Criminalité et Sécurité',
        sidebar: pb.setSideBarFR(province),
        tabRows, toc,
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
    if (province.SafetyRank <= 27) safetyVerdict = "<b class='green'>l'une des provinces italiennes les plus sûres</b>";
    else if (province.SafetyRank <= 53) safetyVerdict = "<b class='green'>modérément sûre</b> par rapport aux autres provinces italiennes";
    else if (province.SafetyRank <= 79) safetyVerdict = "<b class='orange'>dans la moyenne</b> par rapport aux autres provinces italiennes en termes de sécurité";
    else safetyVerdict = "<b class='red'>l'une des provinces italiennes les moins sûres</b>";

    info.overview =
        '<div class="province-hero" role="img" aria-label="Province de ' + fr(province.Name) + '" ' +
        'style="background-image:url(\'https://expiter.com/img/safety/' + province.Abbreviation + '.webp\')"></div>' +
        '<p class="lede">Cette page offre un aperçu basé sur les données de la <b>criminalité et de la sécurité à ' + fr(province.Name) + '</b>' +
        (province.Region ? ', dans la région de ' + fr(province.Region) : '') + '. ' +
        "Selon les statistiques officielles 2023, " + fr(province.Name) + ' est ' + safetyVerdict + ', ' +
        'avec un classement de <b>' + province.SafetyRank + ' sur 106</b> et un score de sécurité de <b>' + province.SafetyScore + '/10</b>.</p>' +
        '<p>Vous trouverez ci-dessous des détails sur les vols, les crimes violents, le crime organisé, le trafic de drogue et les accidents, ' +
        'ainsi que les réponses aux questions les plus fréquentes sur la sécurité à ' + fr(province.Name) + '.</p>';

    info.crimeandsafety = 'La province de ' + fr(province.Name) + ' se classe <b>' + province.SafetyRank + ' sur 106 pour la sécurité</b> selon nos données, avec un <b>score de sécurité de ' + province.SafetyScore + '</b>. ' +
        'Il y a eu un total de ' + province.IndiceCriminalita + " signalements officiels de crimes pour 100 000 habitants dans la province en 2023. C'est " +
        (province.IndiceCriminalita > avg.IndiceCriminalita ? "<b class='red'>supérieur à la moyenne</b> du nombre de crimes signalés pour 100 000 habitants dans toutes les provinces italiennes. Cela pourrait être dû à divers facteurs, notamment les conditions socio-économiques et les pratiques de maintien de l'ordre." :
            (province.IndiceCriminalita < avg.IndiceCriminalita ? "<b class='green'>inférieur à la moyenne</b> du nombre de crimes signalés pour 100 000 habitants dans toutes les provinces italiennes. Cela pourrait indiquer des pratiques efficaces de maintien de l'ordre ou d'autres facteurs contribuant à réduire les taux de criminalité." :
                "<b class='yellow'>conforme à la moyenne</b> du nombre de crimes signalés pour 100 000 habitants dans toutes les provinces italiennes. Cela suggère que le taux de criminalité à " + fr(province.Name) + " est typique pour les provinces italiennes."));

    info.theftsandrobberies = 'Dans la province de ' + fr(province.Name) + ', il y a eu <b>' + province.FurtiDestrezza + ' cas de pickpocketing</b>, <b>' + province.FurtiStrappo + ' cas de vol à l\'arraché</b>, <b>' + province.FurtiAutovettura + ' vols de voitures</b>, et <b>' + province.FurtiAbitazione + ' cambriolages résidentiels</b> pour 100 000 habitants en 2023.<br><br>' +
        'Voici un aperçu de la comparaison de ces types de vols avec la moyenne de toutes les provinces italiennes: <br><br>' +
        (province.FurtiDestrezza > avg.FurtiDestrezza ? "<b class='red'>Le pickpocketing est supérieur à la moyenne</b>." : (province.FurtiDestrezza < avg.FurtiDestrezza ? "<b class='green'>Le pickpocketing est inférieur à la moyenne</b>." : "<b class='yellow'>Le pickpocketing est conforme à la moyenne</b>.")) + '<br><br>' +
        (province.FurtiStrappo > avg.FurtiStrappo ? "<b class='red'>Les vols à l'arraché sont supérieurs à la moyenne</b>." : (province.FurtiStrappo < avg.FurtiStrappo ? "<b class='green'>Les vols à l'arraché sont inférieurs à la moyenne</b>." : "<b class='yellow'>Les vols à l'arraché sont conformes à la moyenne</b>.")) + '<br><br>' +
        (province.FurtiAutovettura > avg.FurtiAutovettura ? "<b class='red'>Les vols de voitures sont supérieurs à la moyenne</b>." : (province.FurtiAutovettura < avg.FurtiAutovettura ? "<b class='green'>Les vols de voitures sont inférieurs à la moyenne</b>." : "<b class='yellow'>Les vols de voitures sont conformes à la moyenne</b>.")) + '<br><br>' +
        (province.FurtiAbitazione > avg.FurtiAbitazione ? "<b class='red'>Les cambriolages résidentiels sont supérieurs à la moyenne</b>." : (province.FurtiAbitazione < avg.FurtiAbitazione ? "<b class='green'>Les cambriolages résidentiels sont inférieurs à la moyenne</b>." : "<b class='yellow'>Les cambriolages résidentiels sont conformes à la moyenne</b>."));

    info.violentcrimes = 'Dans la province de ' + fr(province.Name) + ', il y a eu ' + (province.Omicidi + province.ViolenzeSessuali) + ' cas de crimes violents (homicides et agressions sexuelles) pour 100 000 habitants en 2023. C\'est ' +
        (province.Omicidi + province.ViolenzeSessuali > avg.Omicidi + avg.ViolenzeSessuali ? "<b class='red'>supérieur à la moyenne</b> du nombre de crimes violents pour 100 000 habitants dans toutes les provinces italiennes." :
            (province.Omicidi + province.ViolenzeSessuali < avg.Omicidi + avg.ViolenzeSessuali ? "<b class='green'>inférieur à la moyenne</b> du nombre de crimes violents pour 100 000 habitants dans toutes les provinces italiennes." :
                "<b class='yellow'>conforme à la moyenne</b> du nombre de crimes violents pour 100 000 habitants dans toutes les provinces italiennes."));

    info.organizedcrime = 'Dans la province de ' + fr(province.Name) + ', il y a eu ' + province.Estorsioni + ' cas d\'extorsion, ' + province.RiciclaggioDenaro + ' cas de blanchiment d\'argent et ' + province.ReatiStupefacenti + ' crimes liés à la drogue pour 100 000 habitants en 2023. ' +
        '<br><br>' + (province.Estorsioni > avg.Estorsioni ? "<b class='red'>Les extorsions sont supérieures à la moyenne de toutes les provinces d'Italie</b>." : (province.Estorsioni < avg.Estorsioni ? "<b class='green'>Les extorsions sont inférieures à la moyenne des provinces italiennes</b>." : "<b class='yellow'>Les extorsions sont conformes à la moyenne des provinces d'Italie</b>.")) +
        '<br><br>' + (province.RiciclaggioDenaro > avg.RiciclaggioDenaro ? "<b class='red'>Les cas de blanchiment d'argent sont supérieurs à la moyenne dans toutes les provinces du pays</b>." : (province.RiciclaggioDenaro < avg.RiciclaggioDenaro ? "<b class='green'>Les cas de blanchiment d'argent sont inférieurs à la moyenne pour toutes les provinces du pays</b>." : "<b class='yellow'>Les cas de blanchiment d'argent sont conformes à la moyenne nationale</b>.")) +
        '<br><br>' + (province.ReatiStupefacenti > avg.ReatiStupefacenti ? "<b class='red'>Les crimes liés à la drogue sont supérieurs à la moyenne pour toutes les provinces italiennes</b>." : (province.ReatiStupefacenti < avg.ReatiStupefacenti ? "<b class='green'>Les crimes liés à la drogue sont inférieurs à la moyenne pour toutes les provinces italiennes</b>." : "<b class='yellow'>Les crimes liés à la drogue sont conformes à la moyenne parmi les provinces italiennes</b>."))
        + (facts[province.Name].mafia ? '<br><br><h3>Activité mafieuse</h3>' + facts[province.Name].mafia : '');

    info.accidents = 'Dans la province de ' + fr(province.Name) + ', il y a eu ' + province.InfortuniLavoro + ' cas d\'accidents mortels ou entraînant une invalidité permanente pour 10 000 employés, et ' + province.MortalitàIncidenti + ' morts par accidents de la route pour 10 000 habitants en 2023. ' +
        (province.InfortuniLavoro > avg.InfortuniLavoro ? "<b class='red'>Les accidents du travail sont supérieurs à la moyenne pour toutes les provinces italiennes</b>." : (province.InfortuniLavoro < avg.InfortuniLavoro ? "<b class='green'>Les accidents du travail sont inférieurs à la moyenne de toutes les provinces d'Italie</b>." : "<b class='yellow'>Les accidents du travail sont conformes à la moyenne nationale</b>.")) +
        '<br><br>' + (province.MortalitàIncidenti > avg.MortalitàIncidenti ? "<b class='red'>Les morts par accidents de la route sont supérieures à la moyenne nationale</b>." : (province.MortalitàIncidenti < avg.MortalitàIncidenti ? "<b class='green'>Les morts par accidents de la route sont inférieures à la moyenne nationale</b>." : "<b class='yellow'>Les morts par accidents de la route sont conformes à la moyenne nationale</b>."));

    info.viator = '<center><h3>Visites recommandées à ' + (province.Viator ? fr(name) : fr(region.Name)) + '</h3></center>' +
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

    info.related = '<h2>Autres provinces</h2><ul class="nearby-pills">' +
        facts[related1].snippet + facts[related2].snippet + facts[related3].snippet + facts[related4].snippet + '</ul>';

    return info;
}


function qualityScoreData(quality, score) {
    let expenses = ['Cost of Living (Individual)', 'Cost of Living (Family)', 'Cost of Living (Nomad)', 'StudioRental', 'BilocaleRent', 'TrilocaleRent', 'MonthlyIncome', 'StudioSale', 'BilocaleSale', 'TrilocaleSale'];
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
            { emoji: '📚', label: 'Éducation', ...q('Education', 'Education') },
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

function populateFacts() {
    facts.Roma.mafia = "Rome est un centre important d'activité mafieuse avec la présence de plusieurs groupes du crime organisé tels que la 'Ndrangheta, la Camorra et des familles criminelles romaines autochtones.";
    facts.Milano.mafia = "Milan a une présence mafieuse significative avec l'infiltration de divers groupes du crime organisé comme la 'Ndrangheta de Calabre, la Camorra de Naples et des familles criminelles milanaises autochtones.";
    facts.Napoli.mafia = "Naples a une longue histoire d'activité mafieuse principalement associée à la Camorra, l'une des organisations criminelles les plus anciennes et les plus puissantes d'Italie.";
    facts.Bari.mafia = "Bari et la région environnante des Pouilles sont influencées par divers groupes criminels organisés, notamment la Sacra Corona Unita, une organisation de type mafieux qui a émergé dans les années 1980.";
    facts.Catania.mafia = "Catane a été un point chaud pour l'activité de la mafia, particulièrement liée aux clans de Cosa Nostra opérant dans la zone.";
    facts.Palermo.mafia = "Palerme, la capitale de la Sicile, est depuis longtemps considérée comme le berceau et le bastion de la mafia sicilienne, également connue sous le nom de Cosa Nostra.";
    facts.Torino.mafia = "Il existe des preuves de la présence et de l'activité de la mafia à Turin et dans la région du Piémont.";
    facts.Genova.mafia = "La 'Ndrangheta, un puissant groupe criminel organisé calabrais, a une présence et une influence significatives à Gênes et dans la région environnante de la Ligurie.";
    facts.Venezia.mafia = "La mafia a une présence significative à Venise, particulièrement sous la forme de la 'Ndrangheta calabraise.";
    facts.Messina.mafia = "La mafia a une présence significative à Messine, particulièrement avec l'influence du clan Romeo-Santapaola.";
    facts.Firenze.mafia = "Il existe des preuves de la présence et de l'influence de la mafia à Florence. La ville a été touchée par les activités mafieuses, dont l'explosion de 1993 à Via dei Georgofili.";
    facts.Caltanissetta.mafia = "À Caltanissetta et à Gela, la mafia, en particulier Cosa Nostra, a une forte présence.";
    facts.Bologna.mafia = "Bologne et la région d'Émilie-Romagne sont historiquement exemptes d'une présence mafieuse importante. Cependant, des rapports et des enquêtes récents révèlent des signes d'infiltration de la mafia dans la zone.";
    facts.Cosenza.mafia = "Cosenza a une histoire d'activité mafieuse liée à la 'Ndrangheta, l'une des organisations criminelles les plus puissantes d'Italie.";
    facts.Siracusa.mafia = "Syracuse a une histoire d'activité mafieuse liée à la mafia sicilienne, connue sous le nom de Cosa Nostra.";
    facts["Reggio Calabria"].mafia = "Reggio de Calabre et la région de Calabre sont reconnues comme des bastions de la 'Ndrangheta, l'une des organisations mafieuses les plus puissantes d'Italie.";
    facts["L'Aquila"].mafia = "L'Aquila, la capitale de la région des Abruzzes, a été ciblée par diverses organisations mafieuses.";
    facts.Potenza.mafia = "Potenza, en Basilicate, est touchée par une présence significative d'organisations criminelles, notamment la 'Ndrangheta et la Camorra.";
    facts.Foggia.mafia = "La ville de Foggia et sa province sont caractérisées par la présence d'une puissante organisation criminelle de type mafieux, communément connue sous le nom de 'Società foggiana' ou 'mafia foggienne', considérée comme la 'Quatrième Mafia' d'Italie.";
    facts.Pescara.mafia = "La ville de Pescara et sa province ont été infiltrées par la puissante 'Società foggiana', considérée comme la 'Quatrième Mafia' d'Italie.";
    facts["Catanzaro"].mafia = "Catanzaro est un centre important d'activité mafieuse avec la présence de plusieurs groupes du crime organisé tels que la 'Ndrangheta, la Camorra et des familles criminelles calabraises autochtones.";
    facts["Lecce"].mafia = "La mafia à Lecce est une présence significative, avec la 'Ndrangheta qui a infiltré le tissu entrepreneurial local.";
    facts.Livorno.mafia = "À Livourne, la mafia est principalement représentée par la 'Ndrangheta, qui entretient des relations étroites avec les groupes criminels locaux et s'est installée dans le port.";
    facts.Trieste.mafia = "Le crime organisé est présent à Trieste et en Frioul-Vénétie Julienne, mais pas sous une forme stable et enracinée.";
    facts.Vicenza.mafia = "À Vicence, la mafia nigériane a été établie par des enquêtes judiciaires.";
    facts.Verona.mafia = "À Vérone, la 'Ndrangheta a été impliquée dans le trafic de drogue et de déchets toxiques.";
}

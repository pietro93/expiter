import * as pb from './js/pageBuilder.js';
import { es } from './js/pageBuilder.js';
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
        const sl = slug(es(province.Name));
        facts[province['Name']].snippet =
            '<li><a href="https://expiter.com/es/provincia/' + sl + '/criminalidad-y-seguridad/" title="Criminalidad y seguridad en ' + es(province.Name) + ', ' + es(province.Region) + '">' +
            '<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/' + province.Abbreviation + '.webp?tr=w-56,h-56,fo-auto,q-60" ' +
            'alt="' + es(province.Name) + '" width="28" height="28">' +
            '<span>' + es(province.Name) + '</span></a></li>';
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
            let dirName = 'es/provincia/' + slug(es(province.Name));
            let dir = path.join(__dirname, dirName);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            let htaccessContent = `RewriteEngine on\nRewriteRule ^$ /${dirName}.html [L]\nRewriteRule ^([a-zA-Z0-9-]+)/$ $1.html [L]`;
            fs.writeFileSync(path.join(dir, '.htaccess'), htaccessContent);
            var fileName = dirName + '/criminalidad-y-seguridad';
            let html = renderPage(province, fileName);
            fs.writeFile(fileName + '.html', html, function (err) {
                if (err) throw err;
                console.log(es(province.Name) + '.html Guardado!');
            });
        }
    })
    .catch(err => console.log('Error: ' + err));


function renderPage(province, fileName) {
    let info = getInfo(province);
    let separator = '</br><div class="separator"></div></br>';
    const tabRows = buildTabRows(province);
    const toc =
        '<ul>' +
        '<li><a href="#Resumen">Resumen</a></li>' +
        '<li><a href="#Criminalidad-y-Seguridad">Criminalidad y Seguridad</a></li>' +
        '<li><a href="#Robos-y-Hurtos">Robos y Hurtos</a></li>' +
        '<li><a href="#Delitos-Violentos">Delitos Violentos</a></li>' +
        '<li><a href="#Crimen-Organizado">Crimen Organizado</a></li>' +
        '<li><a href="#Accidentes">Accidentes</a></li>' +
        '<li><a href="#Descubrir">Descubrir</a></li>' +
        '</ul>';

    const seoTitle = es(province.Name) + ' - Ficha informativa sobre criminalidad y seguridad';
    const seoDescription = 'Información sobre criminalidad y seguridad en ' + es(province.Name) + ', Italia. ' + es(province.Name) + ' índice de criminalidad, actividad mafiosa, seguridad y más.';
    const seoKeywords = es(province.Name) + ' italia, ' + es(province.Name) + ' seguro, ' + es(province.Name) + ' criminalidad, ' + es(province.Name) + ' mafia';

    return nunjucks.render('pages/crime-safety-es.njk', {
        lang: 'es',
        seoTitle, seoDescription, seoKeywords,
        canonicalUrl: 'https://expiter.com/' + fileName + '/',
        hreflangIt: 'https://expiter.com/it/province/' + slug(province.Name) + '/sicurezza-e-criminalita/',
        heroImage: 'https://expiter.com/img/safety/' + province.Abbreviation + '.webp',
        heroAlt: 'Provincia de ' + es(province.Name),
        pageTitle: 'Criminalidad y seguridad en ' + es(province.Name),
        eyebrow: es(province.Region) + ' · Criminalidad y Seguridad',
        sidebar: pb.setSideBarES(province),
        tabRows, toc,
        overview: pb.wrapParagraphs(info.overview || ''),
        crimeandsafety: pb.wrapParagraphs(info.crimeandsafety) + separator,
        theftsandrobberies: pb.wrapParagraphs(info.theftsandrobberies) + separator,
        violentcrimes: pb.wrapParagraphs(info.violentcrimes) + separator,
        organizedcrime: pb.wrapParagraphs(info.organizedcrime) + separator,
        accidents: pb.wrapParagraphs(info.accidents) + separator,
        promo: (info.viator || '') + separator + (info.getyourguide || '') + separator + (info.related || ''),
        articleSection: 'Criminalidad y Seguridad',
        buildDate: new Date().toISOString()
    });
}


function getInfo(province) {
    populateFacts();
    let info = {};
    let name = province.Name;
    let region = regions[province.Region];

    let safetyVerdict;
    if (province.SafetyRank <= 27) safetyVerdict = "<b class='green'>una de las provincias italianas más seguras</b>";
    else if (province.SafetyRank <= 53) safetyVerdict = "<b class='green'>moderadamente segura</b> en comparación con otras provincias italianas";
    else if (province.SafetyRank <= 79) safetyVerdict = "<b class='orange'>en la media</b> en comparación con otras provincias italianas en términos de seguridad";
    else safetyVerdict = "<b class='red'>una de las provincias italianas menos seguras</b>";

    info.overview =
        '<div class="province-hero" role="img" aria-label="Provincia de ' + es(province.Name) + '" ' +
        'style="background-image:url(\'https://expiter.com/img/safety/' + province.Abbreviation + '.webp\')"></div>' +
        '<p class="lede">Esta página ofrece una visión basada en datos sobre <b>criminalidad y seguridad en ' + es(province.Name) + '</b>' +
        (province.Region ? ', en la región de ' + es(province.Region) : '') + '. ' +
        'Según las estadísticas oficiales de 2023, ' + es(province.Name) + ' es ' + safetyVerdict + ', ' +
        'con una clasificación de <b>' + province.SafetyRank + ' de 106</b> y una puntuación de seguridad de <b>' + province.SafetyScore + '/10</b>.</p>' +
        '<p>A continuación encontrarás detalles sobre robos, crímenes violentos, crimen organizado, delitos relacionados con drogas y accidentes, ' +
        'junto con respuestas a las preguntas más comunes sobre la seguridad en ' + es(province.Name) + '.</p>';

    info.crimeandsafety = 'La provincia de ' + es(province.Name) + ' se clasifica <b>' + province.SafetyRank + ' de 106 en seguridad</b> según nuestros datos, con una <b>puntuación de seguridad de ' + province.SafetyScore + '</b>. ' +
        'Hubo un total de ' + province.IndiceCriminalita + ' denuncias oficiales por crímenes por cada 100.000 habitantes en la provincia en 2023. Esto es ' +
        (province.IndiceCriminalita > avg.IndiceCriminalita ? "<b class='red'>superior a la media</b> del número de crímenes denunciados por 100.000 habitantes en todas las provincias italianas. Esto podría deberse a varios factores, incluyendo condiciones socioeconómicas y prácticas de aplicación de la ley." :
            (province.IndiceCriminalita < avg.IndiceCriminalita ? "<b class='green'>inferior a la media</b> del número de crímenes denunciados por 100.000 habitantes en todas las provincias italianas. Esto podría indicar prácticas eficaces de aplicación de la ley u otros factores que contribuyen a reducir las tasas de criminalidad." :
                "<b class='yellow'>en línea con la media</b> del número de crímenes denunciados por 100.000 habitantes en todas las provincias italianas. Esto sugiere que la tasa de criminalidad en " + es(province.Name) + ' es típica para las provincias italianas.'));

    info.theftsandrobberies = 'En la provincia de ' + es(province.Name) + ', hubo <b>' + province.FurtiDestrezza + ' casos de carterismo</b>, <b>' + province.FurtiStrappo + ' casos de tirones</b>, <b>' + province.FurtiAutovettura + ' robos de vehículos</b> y <b>' + province.FurtiAbitazione + ' robos en domicilios</b> por cada 100.000 habitantes en 2023.<br><br>' +
        'A continuación se presenta una visión general de cómo se comparan estos tipos de robos con la media de todas las provincias italianas: <br><br>' +
        (province.FurtiDestrezza > avg.FurtiDestrezza ? "<b class='red'>El carterismo está por encima de la media</b>." : (province.FurtiDestrezza < avg.FurtiDestrezza ? "<b class='green'>El carterismo está por debajo de la media</b>." : "<b class='yellow'>El carterismo está en línea con la media</b>.")) + '<br><br>' +
        (province.FurtiStrappo > avg.FurtiStrappo ? "<b class='red'>Los tirones están por encima de la media</b>." : (province.FurtiStrappo < avg.FurtiStrappo ? "<b class='green'>Los tirones están por debajo de la media</b>." : "<b class='yellow'>Los tirones están en línea con la media</b>.")) + '<br><br>' +
        (province.FurtiAutovettura > avg.FurtiAutovettura ? "<b class='red'>Los robos de vehículos están por encima de la media</b>." : (province.FurtiAutovettura < avg.FurtiAutovettura ? "<b class='green'>Los robos de vehículos están por debajo de la media</b>." : "<b class='yellow'>Los robos de vehículos están en línea con la media</b>.")) + '<br><br>' +
        (province.FurtiAbitazione > avg.FurtiAbitazione ? "<b class='red'>Los robos en domicilios están por encima de la media</b>." : (province.FurtiAbitazione < avg.FurtiAbitazione ? "<b class='green'>Los robos en domicilios están por debajo de la media</b>." : "<b class='yellow'>Los robos en domicilios están en línea con la media</b>."));

    info.violentcrimes = 'En la provincia de ' + es(province.Name) + ', hubo ' + (province.Omicidi + province.ViolenzeSessuali) + ' casos de crímenes violentos (homicidios y agresiones sexuales) por cada 100.000 habitantes en 2023. Esto es ' +
        (province.Omicidi + province.ViolenzeSessuali > avg.Omicidi + avg.ViolenzeSessuali ? "<b class='red'>superior a la media</b> del número de crímenes violentos por 100.000 habitantes en todas las provincias italianas." :
            (province.Omicidi + province.ViolenzeSessuali < avg.Omicidi + avg.ViolenzeSessuali ? "<b class='green'>inferior a la media</b> del número de crímenes violentos por 100.000 habitantes en todas las provincias italianas." :
                "<b class='yellow'>en línea con la media</b> del número de crímenes violentos por 100.000 habitantes en todas las provincias italianas."));

    info.organizedcrime = 'En la provincia de ' + es(province.Name) + ', hubo ' + province.Estorsioni + ' casos de extorsión, ' + province.RiciclaggioDenaro + ' casos de blanqueo de capitales y ' + province.ReatiStupefacenti + ' delitos relacionados con drogas por cada 100.000 habitantes en 2023. ' +
        '<br><br>' + (province.Estorsioni > avg.Estorsioni ? "<b class='red'>Las extorsiones están por encima de la media de todas las provincias de Italia</b>." : (province.Estorsioni < avg.Estorsioni ? "<b class='green'>Las extorsiones están por debajo de la media entre todas las provincias italianas</b>." : "<b class='yellow'>Las extorsiones están en línea con la media de las provincias de Italia</b>.")) +
        '<br><br>' + (province.RiciclaggioDenaro > avg.RiciclaggioDenaro ? "<b class='red'>Los casos de blanqueo de capitales están por encima de la media en todas las provincias del país</b>." : (province.RiciclaggioDenaro < avg.RiciclaggioDenaro ? "<b class='green'>Los casos de blanqueo de capitales están por debajo de la media para todas las provincias del país</b>." : "<b class='yellow'>Los casos de blanqueo de capitales están en línea con la media nacional</b>.")) +
        '<br><br>' + (province.ReatiStupefacenti > avg.ReatiStupefacenti ? "<b class='red'>Los delitos relacionados con drogas están por encima de la media para todas las provincias italianas</b>." : (province.ReatiStupefacenti < avg.ReatiStupefacenti ? "<b class='green'>Los delitos relacionados con drogas están por debajo de la media para todas las provincias italianas</b>." : "<b class='yellow'>Los delitos relacionados con drogas están en línea con la media entre las provincias italianas</b>."))
        + (facts[province.Name].mafia ? '<br><br><h3>Actividad mafiosa</h3>' + facts[province.Name].mafia : '');

    info.accidents = 'En la provincia de ' + es(province.Name) + ', hubo ' + province.InfortuniLavoro + ' casos de accidentes mortales y de invalidez permanente por cada 10.000 empleados, y ' + province.MortalitàIncidenti + ' muertes por accidentes de tráfico por cada 10.000 residentes en 2023. ' +
        (province.InfortuniLavoro > avg.InfortuniLavoro ? "<b class='red'>Los accidentes laborales están por encima de la media para todas las provincias italianas</b>." : (province.InfortuniLavoro < avg.InfortuniLavoro ? "<b class='green'>Los accidentes laborales están por debajo de la media de todas las provincias de Italia</b>." : "<b class='yellow'>Los accidentes laborales están en línea con la media nacional</b>.")) +
        '<br><br>' + (province.MortalitàIncidenti > avg.MortalitàIncidenti ? "<b class='red'>Las muertes por accidentes de tráfico están por encima de la media nacional</b>." : (province.MortalitàIncidenti < avg.MortalitàIncidenti ? "<b class='green'>Las muertes por accidentes de tráfico están por debajo de la media nacional</b>." : "<b class='yellow'>Las muertes por accidentes de tráfico están en línea con la media nacional</b>."));

    info.viator = '<center><h3>Tours recomendados en ' + (province.Viator ? es(name) : es(region.Name)) + '</h3></center>' +
        '<div data-vi-partner-id=P00045447 data-vi-language=es data-vi-currency=EUR data-vi-partner-type="AFFILIATE" data-vi-url="' +
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

    info.related = '<h2>Otras provincias</h2><ul class="nearby-pills">' +
        facts[related1].snippet + facts[related2].snippet + facts[related3].snippet + facts[related4].snippet + '</ul>';

    return info;
}


function qualityScoreData(quality, score) {
    let expenses = ['Cost of Living (Individual)', 'Cost of Living (Family)', 'Cost of Living (Nomad)', 'StudioRental', 'BilocaleRent', 'TrilocaleRent', 'MonthlyIncome', 'StudioSale', 'BilocaleSale', 'TrilocaleSale'];
    if (quality == 'CostOfLiving' || quality == 'HousingCost') {
        if (score < avg[quality] * .8) return { tier: 'excellent', text: 'muy bajo' };
        if (score < avg[quality] * .95) return { tier: 'great', text: 'bajo' };
        if (score < avg[quality] * 1.05) return { tier: 'good', text: 'promedio' };
        if (score < avg[quality] * 1.2) return { tier: 'average', text: 'alto' };
        return { tier: 'poor', text: 'muy alto' };
    }
    if (expenses.includes(quality)) {
        let tier;
        if (score < avg[quality] * .95) tier = 'great';
        else if (score < avg[quality] * 1.05) tier = 'average';
        else tier = 'poor';
        return { tier, text: score + '€/m', isAmount: true };
    }
    if (quality == 'HotDays' || quality == 'ColdDays') {
        const w = (quality == 'HotDays' ? 'caluroso' : 'frío');
        if (score < avg[quality] * .8) return { tier: 'excellent', text: 'no ' + w };
        if (score < avg[quality] * .95) return { tier: 'great', text: 'no muy ' + w };
        if (score < avg[quality] * 1.05) return { tier: 'good', text: 'un poco ' + w };
        if (score < avg[quality] * 1.2) return { tier: 'average', text: w };
        return { tier: 'poor', text: 'muy ' + w };
    }
    if (quality == 'RainyDays') {
        if (score < avg[quality] * .8) return { tier: 'excellent', text: 'muy poca' };
        if (score < avg[quality] * .95) return { tier: 'great', text: 'poca' };
        if (score < avg[quality] * 1.05) return { tier: 'good', text: 'promedio' };
        if (score < avg[quality] * 1.2) return { tier: 'average', text: 'lluvioso' };
        return { tier: 'poor', text: 'muy lluvioso' };
    }
    if (quality == 'FoggyDays') {
        if (score < avg[quality] * .265) return { tier: 'excellent', text: 'sin niebla' };
        if (score < avg[quality] * .6) return { tier: 'great', text: 'poca' };
        if (score < avg[quality] * 1.00) return { tier: 'good', text: 'promedio' };
        if (score < avg[quality] * 3) return { tier: 'average', text: 'brumoso' };
        return { tier: 'poor', text: 'muy brumoso' };
    }
    if (quality == 'Crime' || quality == 'Traffic') {
        if (score < avg[quality] * .8) return { tier: 'excellent', text: 'muy bajo' };
        if (score < avg[quality] * .95) return { tier: 'great', text: 'bajo' };
        if (score < avg[quality] * 1.05) return { tier: 'good', text: 'medio' };
        if (score < avg[quality] * 1.2) return { tier: 'average', text: 'alto' };
        return { tier: 'poor', text: 'muy alto' };
    }
    if (score < avg[quality] * .8) return { tier: 'poor', text: 'malo' };
    if (score < avg[quality] * .95) return { tier: 'average', text: 'regular' };
    if (score < avg[quality] * 1.05) return { tier: 'good', text: 'bueno' };
    if (score < avg[quality] * 1.2) return { tier: 'great', text: 'muy bueno' };
    return { tier: 'excellent', text: 'excelente' };
}

function buildTabRows(province) {
    const q = (k, prop) => qualityScoreData(k, province[prop !== undefined ? prop : k]);
    return {
        qualityOfLife: [
            { emoji: '👥', label: 'Población', raw: province.Population.toLocaleString('es', { useGrouping: true }) },
            { emoji: '🚑', label: 'Salud', ...q('Healthcare') },
            { emoji: '📚', label: 'Educación', ...q('Education', 'Education') },
            { emoji: '👮', label: 'Seguridad', ...q('Safety') },
            { emoji: '🚨', label: 'Criminalidad', ...q('Crime') },
            { emoji: '🚌', label: 'Transporte', ...q('PublicTransport') },
            { emoji: '🚥', label: 'Tráfico', ...q('Traffic') },
            { emoji: '🚴', label: 'Bici', ...q('CyclingLanes') },
            { emoji: '🏛️', label: 'Cultura', ...q('Culture') },
            { emoji: '🍸', label: 'Vida nocturna', ...q('Nightlife') },
            { emoji: '⚽', label: 'Ocio', ...q('Sports & Leisure') },
            { emoji: '🌦️', label: 'Clima', ...q('Climate') },
            { emoji: '☀️', label: 'Sol', ...q('SunshineHours') },
            { emoji: '🥵', label: 'Veranos', ...q('HotDays') },
            { emoji: '🥶', label: 'Inviernos', ...q('ColdDays') },
            { emoji: '🌧️', label: 'Lluvia', ...q('RainyDays') },
            { emoji: '🌫️', label: 'Niebla', ...q('FoggyDays') },
            { emoji: '🍃', label: 'Calidad del aire', ...q('AirQuality') },
            { emoji: '👪', label: 'Para familias', ...q('Family-friendly') },
            { emoji: '👩', label: 'Para mujeres', ...q('Female-friendly') },
            { emoji: '🏳️‍🌈', label: 'LGBTQ+', ...q('LGBT-friendly') },
            { emoji: '🥗', label: 'Vegano', ...q('Veg-friendly') },
        ],
        costOfLiving: [
            { emoji: '📈', label: 'Costo de vida', ...q('CostOfLiving') },
            { emoji: '🏙️', label: 'Costo de vivienda', ...q('HousingCost') },
            { emoji: '💵', label: 'Salarios', ...q('MonthlyIncome') },
            { emoji: '🧑', label: 'Gastos (individuo)', ...q('Cost of Living (Individual)') },
            { emoji: '👪', label: 'Gastos (familia)', ...q('Cost of Living (Family)') },
            { emoji: '🎒', label: 'Gastos (turista)', ...q('Cost of Living (Nomad)') },
            { emoji: '🏠', label: 'Alquiler (estudio)', ...q('StudioRental') },
            { emoji: '🏘️', label: 'Alquiler (2 habs)', ...q('BilocaleRent') },
            { emoji: '🏰', label: 'Alquiler (3 habs)', ...q('TrilocaleRent') },
            { emoji: '🏠', label: 'Compra (estudio)', ...q('StudioSale') },
            { emoji: '🏘️', label: 'Compra (2 habs)', ...q('BilocaleSale') },
            { emoji: '🏰', label: 'Compra (3 habs)', ...q('TrilocaleSale') },
        ],
        digitalNomads: [
            { emoji: '👩‍💻', label: 'Nomad-friendly', ...q('DN-friendly') },
            { emoji: '💸', label: 'Gastos nómadas', ...q('Cost of Living (Nomad)') },
            { emoji: '📡', label: 'Internet ultra-rápido', ...q('HighSpeedInternetCoverage') },
            { emoji: '💃', label: 'Diversión', ...q('Fun') },
            { emoji: '🤗', label: 'Amabilidad', ...q('Friendliness') },
            { emoji: '🤐', label: 'Anglohablantes', ...q('English-speakers') },
            { emoji: '😊', label: 'Felicidad', ...q('Antidepressants') },
            { emoji: '📈', label: 'Innovación', ...q('Innovation') },
            { emoji: '🏖️', label: 'Playas', ...q('Beach') },
            { emoji: '⛰️', label: 'Senderismo', ...q('Hiking') },
        ],
    };
}

function populateFacts() {
    facts.Roma.mafia = "Roma es un centro importante de actividad mafiosa con la presencia de varios grupos de crimen organizado como la 'Ndrangheta, la Camorra y familias criminales romanas autóctonas.";
    facts.Milano.mafia = "Milán tiene una presencia mafiosa significativa con la infiltración de varios grupos de crimen organizado como la 'Ndrangheta de Calabria, la Camorra de Nápoles y familias criminales milanesas autóctonas.";
    facts.Napoli.mafia = "Nápoles tiene una larga historia de actividad mafiosa principalmente asociada con la Camorra, una de las organizaciones criminales más antiguas y poderosas de Italia.";
    facts.Bari.mafia = "Bari y la región circundante de Apulia están influenciadas por varios grupos criminales organizados, incluida la Sacra Corona Unita, una organización de tipo mafioso surgida en los años 80.";
    facts.Catania.mafia = "Catania ha sido un punto crítico para la actividad de la mafia, particularmente vinculada a los clanes de Cosa Nostra que operan en la zona.";
    facts.Palermo.mafia = "Palermo, la capital de Sicilia, ha sido considerada durante mucho tiempo como el lugar de nacimiento y el bastión de la mafia siciliana, también conocida como Cosa Nostra.";
    facts.Torino.mafia = "Hay evidencia de la presencia y actividad de la mafia en Turín y la región del Piamonte.";
    facts.Genova.mafia = "La 'Ndrangheta, un poderoso grupo criminal organizado calabrés, tiene una presencia e influencia significativas en Génova y la región circundante de Liguria.";
    facts.Venezia.mafia = "La mafia tiene una presencia significativa en Venecia, particularmente en forma de la 'Ndrangheta calabresa.";
    facts.Messina.mafia = "La mafia tiene una presencia significativa en Mesina, particularmente con la influencia del clan Romeo-Santapaola.";
    facts.Firenze.mafia = "Hay evidencia de la presencia e influencia de la mafia en Florencia. La ciudad ha sido afectada por las actividades mafiosas, incluida la explosión de 1993 en Via dei Georgofili.";
    facts.Caltanissetta.mafia = "En Caltanissetta y Gela, la mafia, en particular Cosa Nostra, tiene una fuerte presencia.";
    facts.Bologna.mafia = "Bolonia y la región de Emilia-Romaña están históricamente libres de una presencia mafiosa significativa. Sin embargo, informes e investigaciones recientes revelan signos de infiltración de la mafia en la zona.";
    facts.Cosenza.mafia = "Cosenza tiene una historia de actividad mafiosa vinculada a la 'Ndrangheta, una de las organizaciones criminales más poderosas de Italia.";
    facts.Siracusa.mafia = "Siracusa tiene una historia de actividad mafiosa vinculada a la mafia siciliana, conocida como Cosa Nostra.";
    facts["Reggio Calabria"].mafia = "Reggio Calabria y la región de Calabria son reconocidas como bastiones de la 'Ndrangheta, una de las organizaciones mafiosas más poderosas de Italia.";
    facts["L'Aquila"].mafia = "L'Aquila, la capital de la región de Abruzos, ha sido objetivo de varias organizaciones mafiosas.";
    facts.Potenza.mafia = "Potenza, en Basilicata, se ve afectada por una presencia significativa de organizaciones criminales, incluidas la 'Ndrangheta y la Camorra.";
    facts.Foggia.mafia = "La ciudad de Foggia y su provincia se caracterizan por la presencia de una poderosa organización criminal de tipo mafioso, comúnmente conocida como 'Società foggiana' o 'mafia foggiana', considerada la 'Cuarta Mafia' de Italia.";
    facts.Pescara.mafia = "La ciudad de Pescara y su provincia han sido infiltradas por la poderosa 'Società foggiana', considerada la 'Cuarta Mafia' de Italia.";
    facts["Catanzaro"].mafia = "Catanzaro es un importante centro de actividad mafiosa con la presencia de varios grupos de crimen organizado como la 'Ndrangheta, la Camorra y familias criminales calabresas autóctonas.";
    facts["Lecce"].mafia = "La mafia en Lecce tiene una presencia significativa, con la 'Ndrangheta que ha infiltrado el tejido empresarial local.";
    facts.Livorno.mafia = "En Livorno, la mafia está representada principalmente por la 'Ndrangheta, que mantiene estrechas relaciones con grupos criminales locales y se ha asentado en el puerto.";
    facts.Trieste.mafia = "El crimen organizado está presente en Trieste y Friul-Venecia Julia, aunque no de forma estable y arraigada.";
    facts.Vicenza.mafia = "En Vicenza, la mafia nigeriana ha sido constatada mediante investigaciones judiciales.";
    facts.Verona.mafia = "En Verona, la 'Ndrangheta ha estado involucrada en el tráfico de drogas y residuos tóxicos.";
}

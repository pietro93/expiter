import * as pb from './js/pageBuilder.js';
import { es } from './js/pageBuilder.js';
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

            var fileName = 'es/provincia/' + es(province.Name).replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();

            let parsedData = '';
            try { parsedData = fs.readFileSync('temp/es-parsedDataAbout' + province.Name + '.txt', 'utf8'); } catch (e) { parsedData = ''; }
            let provinceData = parsedData.split('%%%')[0]; if (provinceData == 'undefined') provinceData = '';
            let transportData = parsedData.split('%%%')[1]; if (transportData === undefined || transportData == 'undefined') transportData = '';
            facts[province.Name]['provinceData'] = provinceData;
            facts[province.Name]['transportData'] = transportData;

            let html = renderPage(province, fileName);
            fs.writeFile(fileName + '.html', html, function (err) {
                if (err) throw err;
                console.log(dataset[i].Name + '.html Guardado!');
            });
        }
    })
    .catch(function (err) { console.log('Error: ' + err); });


function renderPage(province, fileName) {
    let info = getInfo(province);
    let separator = '</br><div class="separator"></div></br>';

    let map =
        '<figure class="province-map">' +
        '<img alt="Mapa de la provincia de ' + es(province.Name) + ' en ' + es(province.Region) + '" ' +
        'loading="lazy" ' +
        'src="https://ik.imagekit.io/cfkgj4ulo/map/' + province['Region'].replace(/\s+/g, '-').replace("'", '-') + '-provinces.webp?tr=w-340">' +
        '<figcaption>Mapa de las provincias de la región ' + es(province.Region) + ' incluyendo ' + es(province.Name) + '</figcaption>' +
        '</figure>';

    const tabRows = buildTabRows(province);
    const toc =
        '<ul>' +
        '<li><a href="#Informacion-General">Información General</a></li>' +
        '<li><a href="#Clima">Clima</a></li>' +
        '<li><a href="#Costo-de-Vida">Costo de Vida</a></li>' +
        '<li><a href="#Calidad-de-Vida">Calidad de Vida</a>' +
        '<ul>' +
        '<li><a href="#Salud">Salud</a></li>' +
        '<li><a href="#Educacion">Educación</a></li>' +
        '<li><a href="#Ocio">Ocio</a></li>' +
        '<li><a href="#Criminalidad-y-Seguridad">Criminalidad y Seguridad</a></li>' +
        '<li><a href="#Transporte">Transporte</a></li>' +
        '</ul>' +
        '</li>' +
        '<li><a href="#Turismo">Turismo</a></li>' +
        '</ul>';

    const seoTitle = es(province.Name) + ' - Calidad y Costo de Vida';
    const seoDescription = 'Información sobre la vida en ' + es(province.Name) + ' (' + es(province.Region) + ') para expatriados, estudiantes y nómadas digitales. ' + es(province.Name) + ' calidad de vida, costo de vida, seguridad y otra información útil.';
    const seoKeywords = 'vivir en ' + es(province.Name) + ', ' + es(province.Name) + ' nómadas digitales, ' + es(province.Name) + ' calidad de vida, ' + es(province.Name) + ' vida nocturna';

    return nunjucks.render('pages/province-es.njk', {
        lang: 'es',
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl: 'https://expiter.com/' + fileName + '/',
        hreflangIt: 'https://expiter.com/it/province/' + province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase() + '/',
        heroImage: 'https://expiter.com/img/' + province.Abbreviation + '.webp',
        heroAlt: 'Provincia de ' + es(province.Name),
        eyebrow: es(province.Region) + ' · Provincia',
        pageTitle: 'Cómo se vive en ' + es(province.Name) + ' - Calidad de vida, costos y cosas que saber',
        sidebar: pb.setSideBarES(province),
        crimeUrl: 'https://expiter.com/' + fileName + '/criminalidad-y-seguridad/',
        tabRows,
        toc,
        overview: '<div class="province-hero" role="img" aria-label="Provincia de ' + es(province.Name) + '" style="background-image:url(\'https://expiter.com/img/' + province.Abbreviation + '.webp\')"></div>' + map + pb.addBreaks(info.overview) + (info.disclaimer || '') + (info.map || ''),
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

    info.overview = 'La provincia de ' + es(province.Name) + ' es la <b>' + province.SizeByPopulation + 'ª más grande de Italia por población</b> con <b>' + province.Population.toLocaleString('es') + ' habitantes</b>, en la región de <b>' + es(province.Region) + '</b>. ' +
        (facts[name].overview ? facts[name].overview : '') +
        '</br></br>' +
        "<a href='https://expiter.com/es/municipios/provincia-de-" + es(province.Name).replace(/\s+/g, '-').replace("'", '-').toLowerCase() + "/'>El área metropolitana de " + es(province.Name) + ' incluye <b>' + province.Towns + ' municipios</b></a> y cubre una superficie de ' + province.Size.toLocaleString('es') + ' km<sup>2</sup>. ' +
        'La <b>densidad de población es de ' + province.Density + ' habitantes por km<sup>2</sup></b>, lo que la hace ' +
        (province.Density < 100 ? 'poco poblada.' : (province.Density > 500 ? 'muy densamente poblada.' : 'moderadamente poblada.')) +
        ' La proporción de hombres a mujeres es de ' + ratio + '.';

    if (facts[name]['provinceData'] != '') info.overview += '</br></br>' + facts[name]['provinceData'];

    info.CoL = 'El <b>salario mensual promedio en ' + es(province.Name) + ' es de ' + province.MonthlyIncome + '€</b>, lo que es ' +
        (province.MonthlyIncome > 1500 && province.MonthlyIncome < 1800 ? 'el promedio nacional' : (province.MonthlyIncome >= 1800 ? "<b class='green'>por encima del promedio</b> en Italia" : "<b class='red'>por debajo del promedio</b> en Italia")) + '.' +
        '</br></br>' +
        'El costo de vida se estima en ' + province['Cost of Living (Individual)'] + '€ al mes para una persona sola o ' + province['Cost of Living (Family)'] + '€ al mes para una familia de cuatro. El costo de alquilar un pequeño apartamento (de dos o tres habitaciones) en un barrio residencial de la ciudad es de aproximadamente ' + province['MonthlyRental'] + '€ al mes.' + '</br></br>' +
        'En general, vivir en ' + (province['Cost of Living (Individual)'] > avg['Cost of Living (Individual)'] ? "<b class='red'>" + es(province.Name) + ' es muy caro' : (province['Cost of Living (Individual)'] < 1150 ? "<b class='green'>" + es(province.Name) + ' no es nada caro' : "<b class='green'>" + es(province.Name) + ' no es muy caro')) + '</b> en comparación con otras provincias italianas.' +
        ' Vivir en ' + es(province.Name) + ' es aproximadamente ' + (province['Cost of Living (Individual)'] > avg['Cost of Living (Individual)'] ? "<b class='red'>" + (province['Cost of Living (Individual)'] / avg['Cost of Living (Individual)'] * 100 - 100).toFixed(2) + '% más caro que el promedio</b> de todas las ciudades italianas' : "<b class='green'>" + (100 - province['Cost of Living (Individual)'] / avg['Cost of Living (Individual)'] * 100).toFixed(2) + '% más barato que el promedio</b> de todas las demás provincias italianas') + '.';

    info.climate = 'La provincia de ' + es(province.Name) + ' recibe un promedio de <b>' + province.SunshineHours + ' horas de sol</b> al mes, que son ' + (province.SunshineHours / 30).toFixed(1) + ' horas de luz por día.' +
        ' Esto representa ' + (province.SunshineHours > 236 ? "<b class='green'>" + (province.SunshineHours / 236 * 100 - 100).toFixed(2) + '% más</b> que el promedio italiano' : "<b class='red'>" + (100 - (province.SunshineHours / 236) * 100).toFixed(2) + '% menos</b> que el promedio italiano') + ' y ' +
        (province.SunshineHours > region.SunshineHours ? "<b class='green'>" + (province.SunshineHours / region.SunshineHours * 100 - 100).toFixed(2) + '% más</b> que el promedio de la región ' : "<b class='red'>" + (100 - (province.SunshineHours / region.SunshineHours) * 100).toFixed(2) + '% menos</b> que el promedio de la región ') + es(province.Region) + '.' +
        '</br></br>' +
        'A lo largo del año, <b>llueve un promedio de ' + province.RainyDays + ' días al mes</b>, lo cual es ' +
        (province.RainyDays > 8 ? "<b class='red'>muy por encima del promedio" : (province.RainyDays < 7 ? "<b class='green'>por debajo del promedio</b>" : '<b>una cantidad ordinaria de precipitación')) + '</b> para una provincia italiana.' +
        '</br></br>' +
        'Durante el otoño y el invierno, generalmente hay ' + (province.FoggyDays > 5 ? "<b class='red'>" : "<b class='green'>") + province.FoggyDays + ' días de niebla al mes</b> y <b>' + province.ColdDays + ' días muy fríos</b> con temperaturas percibidas por debajo de 3°C.' +
        ' En verano, hay un promedio de <b>' + province.HotDays + ' días calurosos al mes</b>, con temperaturas percibidas por encima de 30°C.';

    info.leisure = es(province.Name) + ' tiene <b>' + (province.Nightlife > 7.5 ? 'una excelente vida nocturna' : 'una vida nocturna bastante animada') + '</b> con ' +
        province.Bars + ' bares y ' + province.Restaurants + ' restaurantes por cada diez mil habitantes.';

    info.healthcare = '<b>La salud en ' + es(province.Name) + ' es ' + (province.Healthcare > 6.74 ? "<b class='green'>por encima del promedio" : "<b class='red'>por debajo del promedio") + '</b></b>. ' +
        'Para cada diez mil habitantes, hay aproximadamente ' + province.Pharmacies + ' farmacias, ' + province.GeneralPractitioners + ' médicos de cabecera y ' + province.SpecializedDoctors + ' médicos especializados. ' +
        '<b>La esperanza de vida promedio en ' + es(province.Name) + ' es ' + (province.LifeExpectancy > 82.05 ? 'muy alta con ' : 'de ') + province.LifeExpectancy + ' años.</b>';

    info.crimeandsafety = 'La provincia de ' + es(province.Name) + ' es generalmente ' + (province.Safety > 7.33 ? "<b class='green'>muy segura" : (province.Safety > 6 ? "<b class='green'>moderadamente segura" : "<b class='red'>menos segura que otras provincias italianas")) + '</b>. ' +
        'En 2021, hubo <b>' + province.ReportedCrimes + ' denuncias de crímenes por cada cien mil habitantes</b>. Esto representa ' + (province.ReportedCrimes > 2835.76 ? "<b class='red'>" + (((province.ReportedCrimes / 2835.76) * 100) - 100).toFixed(2) + '% más que el promedio nacional</b>' : "<b class='green'>" + ((100 - (province.ReportedCrimes / 2835.76) * 100).toFixed(2)) + '% menos que el promedio nacional</b>') + '.' +
        '<br><br>' +
        'Hubo aproximadamente <b>' + province.RoadFatalities + ' muertes por accidentes de tránsito</b> y <b>' + province.WorkAccidents + ' accidentes graves en el trabajo</b> por cada diez mil personas en ' + es(province.Name) + '. Esto representa respectivamente ' +
        (province.RoadFatalities > 0.54 ? "<b class='red'>" + (((province.RoadFatalities / 0.54) * 100 - 100).toFixed(2)) + '% más de accidentes de tránsito que el promedio' : "<b class='green'>" + ((100 - (province.RoadFatalities / 0.54) * 100).toFixed(2)) + '% menos de accidentes de tránsito que el promedio') + '</b> y ' +
        (province.RoadFatalities > 12.90 ? "<b class='red'>" + (((province.WorkAccidents / 12.90) * 100 - 100).toFixed(2)) + '% más de accidentes laborales que el promedio' : "<b class='green'>" + ((100 - (province.WorkAccidents / 12.90) * 100).toFixed(2)) + '% menos de accidentes laborales que el promedio') + '</b>.' +
        '<br><br>' +
        (province.CarTheft > 70.53 ? "El robo de autos se estima que es <b class='red'>" + (((province.CarTheft / 70.53) * 100) - 100).toFixed(2) + '% más alto que el promedio</b> con ' + province.CarTheft + ' casos por cada cien mil habitantes.' : "Los robos de autos son <b class='green'>" + ((100 - (province.CarTheft / 70.53) * 100)).toFixed(2) + '% menos que el promedio</b> con solo ' + province.CarTheft + ' casos reportados por cada cien mil habitantes.') + ' ' +
        (province.HouseTheft > 175.02 ? "Los casos reportados de robos en hogares son <b class='red'>" + (((province.HouseTheft / 175.02) * 100) - 100).toFixed(2) + '% más altos que el promedio</b> con ' + province.HouseTheft + ' quejas por cada cien mil habitantes.' : "Los casos de robos en hogares son <b class='green'>" + ((100 - (province.HouseTheft / 175.02) * 100)).toFixed(2) + '% menos que el promedio</b> con ' + province.HouseTheft + ' casos por cada cien mil habitantes.') + ' ' +
        (province.Robberies > 22.14 ? "Los robos a mano armada no son del todo inusuales, hay <b class='red'>" + (((province.Robberies / 22.14) * 100) - 100).toFixed(2) + '% más casos reportados que el promedio nacional</b> con ' + province.Robberies + ' denuncias por cada cien mil habitantes.' : 'Los robos a mano armada no son muy frecuentes con ' + province.Robberies + " casos reportados por cada cien mil habitantes, aproximadamente <b class='green'>" + ((100 - (province.Robberies / 22.14) * 100)).toFixed(2) + '% menos que el promedio nacional</b>.');

    info.education = es(province.Name) + ' tiene ' + (province.HighSchoolGraduates > avg.HighSchoolGraduates ? "<b class='green'>un número de graduados más alto que el promedio" : "<b class='red'>una tasa de graduados más baja que el promedio") + '</b>, aproximadamente ' + province.HighSchoolGraduates + '%; y ' + (province.UniversityGraduates > avg.UniversityGraduates ? "<b class='green'>una tasa de graduados universitarios más alta que el promedio" : "<b class='red'>un porcentaje de graduados universitarios más bajo que el promedio") + '</b>, aproximadamente ' + province.UniversityGraduates + '%.' +
        (province.Universities > 1 ? ' Hay <b>' + province.Universities + ' universidades</b> en la provincia de ' : (province.Universities == 1 ? ' Hay <b>una sola universidad</b> en la provincia de ' : ' <b>No hay universidad</b> en la provincia de ')) + es(province.Name) + '.';

    info.transport = '<b>La oferta de transporte público en ' + es(name) + '</b> es ' +
        (province.PublicTransport < avg.PublicTransport * 0.9 ? "<b class='red'>insuficiente" :
            (province.PublicTransport > avg.PublicTransport * 1.1 ? "<b class='green'>bastante buena" :
                "<b class='green'>más que satisfactoria")) +
        '</b>, y ' +
        (province.Traffic < avg.Traffic * 0.85 ? "<b class='green'>el tráfico es bajo" :
            (province.Traffic < avg.Traffic ? "<b class='green'>el tráfico está por debajo del promedio" :
                (province.Traffic > avg.Traffic * 1.1 ? "<b class='red'>hay mucho tráfico automovilístico" :
                    "<b class='red'>hay niveles de tráfico bastante altos"))) +
        '</b>. ' +
        'En promedio hay ' + province.VehiclesPerPerson + ' vehículos por persona, en comparación con el promedio nacional de ' +
        avg.VehiclesPerPerson + '. ' +
        (province.Subway > 0 ? 'La ciudad de ' + es(name) + ' es una de las pocas ciudades italianas con un sistema de transporte metropolitano, el <b>Metro de ' + es(name) + '</b>. ' : '') +
        '<br><br>' +
        'Aproximadamente ' + (province.CyclingLanes / 10).toFixed(2) + 'km por cada diez mil habitantes en la ciudad principal de ' + es(name) + ' están cubiertos por carriles bici. Esto hace que ' + es(name) + ' sea ' + (province.CyclingLanes > avg.CyclingLanes * 0.8 ? "<b class='green'>bastante ciclable para los estándares italianos" : (province.CyclingLanes > avg.CyclingLanes * 1.2 ? "<b class='green'>muy ciclable para los estándares italianos" : "<b class='red'>no particularmente ciclable")) + '</b>.';

    if (facts[name]['transportData'] != '') info.transport += '</br></br>' + facts[name]['transportData'];

    info.disclaimer = '</br></br><center><div id="disclaimer">Esta página contiene enlaces de afiliados. Como socio de Amazon y Viator, podemos ganar comisiones por compras elegibles.</div></center>';

    info.map = '</br><center class="map"><iframe id="ggmap" src="https://maps.google.com/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>' +
        'Mostrar: ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '+Cosas+que+hacer&output=embed")\' target="_blank"><b><ej>🎭</ej>Atracciones</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '+Museos&output=embed")\' target="_blank"><b><ej>🏺</ej>Museos</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '+Restaurantes&output=embed")\' target="_blank"><b><ej>🍕</ej>Restaurantes</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '+Bares&output=embed")\' target="_blank"><b><ej>🍺</ej>Bares</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '+Playas&output=embed")\' target="_blank"><b><ej>🏖️</ej>Playas</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https:\/\/maps.google.com\/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '+Áreas+de+paseo&output=embed")\' target="_blank"><b><ej>⛰️</ej>Senderismo</b></a> ' +
        '<a href="https://www.amazon.es/ulp/view?&linkCode=ll2&tag=expiter-21&linkId=5824e12643c8300394b6ebdd10b7ba3c&language=es_ES&ref_=as_li_ss_tl" target="_blank"><b><ej>📦</ej>Puntos de recogida de Amazon</b></a> ' +
        '</center>';

    info.weather = (province.WeatherWidget ? '<div class="weather-block"><h3>Clima</h3><a class="weatherwidget-io" href="https://forecast7.com/es/' + province.WeatherWidget + '" data-label_1="' + es(name) + '" data-label_2="' + es(region.Name) + '" data-font="Roboto" data-icons="Climacons Animated" data-mode="Forecast" data-theme="clear" data-basecolor="rgba(155, 205, 245, 0.59)" data-textcolor="#000441" >' + es(name) + ', ' + es(region.Name) + '</a>' +
        '<script>' +
        "!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');" +
        '</script></div>' : '');

    info.viator = '<center><h3>Experiencias recomendadas en ' + (province.Viator ? es(name) : es(region.Name)) + '</h3></center>' +
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

    info.related = '<h2>Cerca</h2>' +
        '<ul class="nearby-pills">' +
        facts[related1].snippet +
        facts[related2].snippet +
        facts[related3].snippet +
        facts[related4].snippet + '</ul>';

    return info;
}


function populateFacts() {
    facts.Roma.overview = 'La <b>ciudad de Roma</b>, con 2.761.632 habitantes, es la ciudad más poblada y la <b>capital de Italia</b>.';
    facts.Milano.overview = 'La <b>ciudad de Milán</b>, con 1.371.498 habitantes, es la segunda ciudad más poblada y la <b>capital industrial, comercial y financiera de Italia</b>.';
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
        const slug = es(province.Name).replace(/\s+/g, '-').replace("'", '-').toLowerCase();
        facts[province['Name']].snippet =
            '<li><a href="https://expiter.com/es/provincia/' + slug + '/" title="' + es(province.Name) + ', ' + es(province.Region) + '">' +
            '<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/' + province.Abbreviation + '.webp?tr=w-56,h-56,fo-auto,q-60" ' +
            'alt="' + es(province.Name) + '" width="28" height="28">' +
            '<span>' + es(province.Name) + '</span></a></li>';
    }
    avg = data[107];
}


function qualityScoreData(quality, score) {
    let expenses = ['Cost of Living (Individual)', 'Cost of Living (Family)', 'Cost of Living (Nomad)',
        'StudioRental', 'BilocaleRent', 'TrilocaleRent', 'MonthlyIncome',
        'StudioSale', 'BilocaleSale', 'TrilocaleSale'];

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
            { emoji: '📚', label: 'Educación', ...q('Education', 'Istruzione') },
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

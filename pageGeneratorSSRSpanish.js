import * as pb from './js/pageBuilder.js'
import {es} from './js/pageBuilder.js'
import { createServer } from 'http';
import fetch from 'node-fetch';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jsdom = require('jsdom')

createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('¡Hola mundo!');
}).listen(8080);

var dataset;
var provinces = {};
var facts = {};
var selection = [];
var region_filters = [];
var additionalFilters = [];
var avg;
var regions = {};

fetch('https://expiter.com/dataset.json', {method:"Get"})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        dataset = data;  
        populateData(data);
        for (let i = 0; i < 107; i++){
            let province = dataset[i];
            let sidebar = pb.setSideBarES(province);
            
            var fileName = 'es/provincia/' + pb.handle(es(province.Name)).replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
            let seoTitle = es(province.Name) + " - Calidad y Costo de Vida";
            let seoDescription = 'Información sobre la vida en ' + es(province.Name) + ' ' + '(' + es(province.Region) + ') para expatriados, estudiantes y nómadas digitales. ' + es(province.Name) + ' calidad de vida, costo de vida, seguridad y otros datos útiles.';
            let heroImage = 'https://expiter.com/img/' + province.Abbreviation + '.webp';

            const dom = new jsdom.JSDOM(
            "<html lang='es'>" +
            '<head><meta charset="utf-8">' +
            '<link rel="canonical" href="https://expiter.com/' + fileName + '/"/>' +
            '<link rel="alternate" hreflang="en" href="https://expiter.com/' + fileName.replace('es/', '') + '/" />' +
            '<link rel="alternate" hreflang="es" href="https://expiter.com/' + fileName + '/" />' +
            '<meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale=1,user-scalable=0">' +
            '<script type="text/javascript" src="https://expiter.com/jquery3.6.0.js" defer></script>' +
            '<script type="text/json" src="https://expiter.com/dataset.json"></script>' +
            '<script type="text/javascript" src="https://expiter.com/script.js" defer></script>' +
            '<script type="text/javascript" src="https://expiter.com/bootstrap-toc.js" defer></script>' +
            '<link rel="stylesheet" href="https://expiter.com/fonts.css" media="print" onload="this.media=\'all\'"></link>' +
            '<link rel="stylesheet" href="https://expiter.com/bulma.min.css">' +
            '<link rel="stylesheet" href="https://expiter.com/style.css?v=1.0">' +

            '<!-- GetYourGuide Analytics -->' +
            '<script async defer src="https://widget.getyourguide.com/dist/pa.umd.production.min.js" data-gyg-partner-id="56T9R2T"></script>' +
            "</head>" +

            '<meta property="og:title" content="' + seoTitle + '" />' +
            '<meta property="og:description" content="' + seoDescription + '" />' +
            '<meta property="og:image" content="' + heroImage + '" />' +
            '<meta name="description" content="' + seoDescription + '" />' +
            "<title>" + seoTitle + "</title>" +
           
	        '<meta name="keywords" content="vivir en ' + es(province.Name) + ', ' + es(province.Name) + ' nómadas digitales,' + es(province.Name) + ' calidad de vida,' + es(province.Name) + ' vida nocturna" />' +

            '<link rel="icon" type="image/x-icon" title="Expiter - Expatriados y Nómadas en Italia" href="https://expiter.com/img/expiter-favicon.ico"></link>' +
            "</head>" +
            '<aside class="menu sb higher">' + sidebar + '</aside>\n' +
            '<body data-spy="scroll" data-target="#toc">' +
            
            '<div class="toc container collapsed">' +
            '<i class="arrow left" onclick="$(\'.toc\').toggleClass(\'collapsed\')"></i>' +
            '<div class="row">' +
              '<div class="col-sm-3">' +
                '<nav id="toc" data-toggle="toc"></nav>' +
                '<div class="col-sm-9"></div>' +
              '</div>' +
            '</div>' +
        '</div>' +
        
        '<nav id="navbar"></nav>' +
            '<div class="hero" style="background-image:url(\'https://expiter.com/img/'+province.Abbreviation+'.webp\')" '+'title="Provincia de '+es(province.Name)+'"'+'></div>' +
            '<h1 data-toc-skip id="title" class="title column is-12">  </h1></row>' +
            '<div class="tabs effect-3">' +
            '<input type="radio" id="tab-1" name="tab-effect-3" checked="checked">' +
            '<span>Calidad de Vida</span>' +
            '<input type="radio" id="tab-2" name="tab-effect-3">' +
            '<span>Costo de la Vida</span>' +
            '<input type="radio" id="tab-3" name="tab-effect-3">' +
            '<span>Nómadas Digitales</span>' +    
            '<input type="radio" id="tab-4" name="tab-effect-3" disabled>' +
            '<span></span>' +
            '<input type="radio" id="tab-5" name="tab-effect-3" disabled>' +
            '<span></span>' +
            '<div class="line ease"></div>' +
            '<!-- tab-content -->' +
            '<div class="tab-content">' +
                '<section id="Quality-of-Life" class="columns is-mobile is-multiline">' +
                    '<div class="column">' +                    
               '<!--script.js adds content here-->' +
                    '</div>' +
                '<div class="column" >' +
              '<!--script.js adds content here-->' +
                '</div>' +
                '</section>' +
                '<section id="Cost-of-Living" class="columns is-mobile is-multiline">' +
                    '<div class="column">' +
                        '<!--script.js adds content here-->' +
                             '</div>' +
                         '<div class="column" >' +
                         '</div>' +
                '</section>' +
                '<section id="Digital-Nomads" class="columns is-mobile is-multiline">' +
                    '<div class="column">' +
                             '</div>' +
                         '<div class="column" >' +
                         '</div>' +
                '</section>' +
            '</div>' +
        '</div></div>' +
'<div id="info" class="columns is-multiline is-mobile">' + 
'<section id="Información General"><h2>Información General</h2><span id="overview"></span></section>' + 
'<section id="Clima"><h2>Clima</h2><span id="climate"></span></section>' + 
'<section id="Costo de la Vida"><h2>Costo de la Vida</h2><span id="CoL"></span></section>' +
'<section id="Calidad de Vida"><h2>Calidad de Vida</h2>' + 
'<section id="Salud"><h3>Salud</h3><span id="healthcare"></span></section>' + 
'<section id="Educación"><h3>Educación</h3><span id="education"></span></section>' +
'<section id="Ocio"><h3>Ocio</h3><span id="leisure"></span></section>' +
'<section id="Criminalidad y Seguridad"><h3>Criminalidad y Seguridad</h3><span id="crimeandsafety"></span></section>' +
'<section id="Transporte"><h3>Transporte</h3><span id="transport"></span></section></section>' + 
'<section id="Turismo"><h2>Turismo</h2><span id="promo"></span></section>' +
'<aside class="menu sb mobileonly">'+sidebar+'</aside>\n'+
'</div>'+ '</body></html>'
)

let parsedData = fs.readFileSync('temp/es-parsedDataAbout'+province.Name+'.txt','utf8');
let provinceData = parsedData.split("%%%")[0]; (provinceData==undefined?provinceData="":"")
let transportData = parsedData.split("%%%")[1]; (transportData==undefined?transportData="":"")

facts[province.Name]["provinceData"]=provinceData;
facts[province.Name]["transportData"]=transportData;
console.log(facts[province.Name])
const $ = require('jquery')(dom.window)
newPage(province, $)

let html = dom.window.document.documentElement.outerHTML;
fs.writeFile(fileName+".html", html, function (err, file) {
   if (err) throw err;
   console.log(dataset[i].Name+".html"+' Saved!');
});

}
})
.catch(function (err) {
console.log('error: ' + err);
});


function newPage(province, $){
    let info = getInfo(province)
    let separator='</br><span class="separator"></span></br>'

    let map =
    '<figure>'+
    '<img alt="Mapa de la provincia de '+es(province.Name)+' en '+es(province.Region)+'"'+
    'src="https://ik.imagekit.io/cfkgj4ulo/map/'+province["Region"].replace(/\s+/g,"-").replace("'","-")+'-provinces.webp?tr=w-250'+
    'loading="lazy"></img>'+
    '<figcaption>Mapa de las provincias de la región '+es(province.Region)+' incluyendo '+es(province.Name)+'</figcaption>'+
    '</figure>'
    
    appendProvinceData(province, $);
    pb.setNavBarES($);
    
    $(".title").text('Cómo vivir en '+es(province.Name)+' - Calidad de vida, costos y cosas que saber');
    $("#overview").append(map)
    $("#overview").append(info.overview)
    $("#overview").append(info.disclaimer)
    $("#overview").append(info.map)
    $("#CoL").append(info.CoL)
    $("#climate").append(info.climate)
    $("#climate").append(separator)
    $("#climate").append(info.weather)
    $("#lgbtq").append(info.lgbtq)
    $("#leisure").append(info.leisure)
    $("#leisure").append(separator)
    $("#healthcare").append(info.healthcare)
    $("#healthcare").append(separator)
    $("#crimeandsafety").append(info.crimeandsafety)
    $("#crimeandsafety").append(separator)
    $("#education").append(info.education)
    $("#education").append(separator)
    $("#transport").append(info.transport)
    $("#transport").append(separator)
    $("#promo").append(info.viator)
    $("#promo").append(separator)
    $("#promo").append(info.getyourguide)
    $("#promo").append(separator)
    $("#promo").append(info.related)

   }

   function getData(province){
    for (let i = 0; i < dataset.length; i++){
        if (dataset[i].Name == province) return dataset[i];
    }
}        

function getInfo(province){

    populateFacts();
    let ratio = (province.Men / (Math.min(province.Men, province.Women))).toFixed(2) + ":" + (province.Women / (Math.min(province.Men, province.Women))).toFixed(2);
    let name = province.Name;
    let region = regions[province.Region];
    
    let info = {}

    info.overview = "La provincia de " + es(province.Name) + " es la <b>" + province.SizeByPopulation + "ª más grande de Italia por población</b> con <b>" + province.Population.toLocaleString() + " habitantes</b>, en la región de <b>" + es(province.Region) + "</b>. " +
        (facts[name].overview ? facts[name].overview : "") +
        "</br></br>" +
        "<a href='https://expiter.com/es/municipios/provincia-de-" + es(province.Name).replace(/\s+/g, "-").replace("'", "-").toLowerCase() + "/'>" + "El área metropolitana de " + es(province.Name) + " incluye <b>" +
        +province.Towns + " municipios</b></a> y cubre una superficie de " + province.Size.toLocaleString() + " km<sup>2</sup>. "
        + "La <b>densidad de población es de " + province.Density + " habitantes por km<sup>2</sup></b>, lo que la hace " +
        (province.Density < 100 ? "poco poblada." : (province.Density > 500 ? "muy densamente poblada." : "moderadamente poblada.")) +
        " La proporción de hombres a mujeres es de " + ratio + ".";
        
    (facts[name]["provinceData"] != "" ? (info.overview += '</br></br>' + facts[name]["provinceData"]) : "")

    info.CoL = "El <b>salario mensual promedio en " + es(province.Name) + " es de " + province.MonthlyIncome + "€</b>, lo que es " +
        (province.MonthlyIncome > 1500 && province.MonthlyIncome < 1800 ? "el promedio nacional" : (province.MonthlyIncome >= 1800 ? "<b class='green'>por encima del promedio</b> en Italia" : "<b class='red'>por debajo del promedio</b> en Italia")) + "." +
        "</br></br>" +
        "El costo de vida se estima en " + province["Cost of Living (Individual)"] + "€ al mes para una persona sola o " + province["Cost of Living (Family)"] + "€ al mes para una familia de cuatro. El costo de alquilar " +
        "un pequeño apartamento (de dos o tres habitaciones) en un barrio residencial de la ciudad es de aproximadamente " + province["MonthlyRental"] + "€ al mes." + "</br></br>" +
        "En general, vivir en " + (province["Cost of Living (Individual)"] > avg["Cost of Living (Individual)"] ? "<b class='red'>" + es(province.Name) + " es muy caro" : (province["Cost of Living (Individual)"] < 1150 ? "<b class='green'>" + es(province.Name) + " no es nada caro" : "<b class='green'>" + es(province.Name) + " no es muy caro")) + "</b> en comparación con otras provincias italianas."
        + " Vivir en " + es(province.Name) + " es aproximadamente " + (province['Cost of Living (Individual)'] > avg["Cost of Living (Individual)"] ? "<b class='red'>" + (province['Cost of Living (Individual)'] / avg["Cost of Living (Individual)"] * 100 - 100).toFixed(2) + "% más caro que el promedio</b> de todas las ciudades italianas" : "<b class='green'>" + (100 - province['Cost of Living (Individual)'] / avg["Cost of Living (Individual)"] * 100).toFixed(2) + "% más barato que el promedio</b> de todas las demás provincias italianas.")
        + ".";

    info.climate = "La provincia de " + es(province.Name) + " recibe un promedio de <b>" + province.SunshineHours + " horas de sol</b> al mes, que son " + province.SunshineHours / 30 + " horas de luz por día." +
        " Esto representa " + (province.SunshineHours > 236 ? "<b class='green'>" + (province.SunshineHours / 236 * 100 - 100).toFixed(2) + "% más</b> que el promedio italiano" : "<b class='red'>" + (100 - (province.SunshineHours / 236) * 100).toFixed(2) + "% menos</b> que el promedio italiano") + " y " +
        (province.SunshineHours > region.SunshineHours ? "<b class='green'>" + (province.SunshineHours / region.SunshineHours * 100 - 100).toFixed(2) + "% más</b> que el promedio de la región " : "<b class='red'>" + (100 - (province.SunshineHours / region.SunshineHours) * 100).toFixed(2) + "% menos</b> que el promedio de la región ") + es(province.Region) + "." +
        "</br></br>"
    info.lgbtq = "<b>" + es(province.Name) + " es " + (province['LGBT-friendly'] > 7.9 ? "una de las provincias más amigables con LGBTQ+ en Italia" : (province['LGBT-friendly'] > 6 ? "bastante amigable con LGBTQ+ según los estándares italianos" : "no especialmente amigable con LGBTQ+ en comparación con otras provincias italianas")) +
        ".</b> " + (province.LGBTQAssociations > 1 ? "Hay " + province.LGBTQAssociations + " asociaciones locales LGBTQ+ (Arcigay) en esta provincia." : (province.LGBTQAssociations == 1 ? "Hay 1 asociación LGBTQ+ (Arcigay) en esta provincia." : ""))

    info.leisure = es(province.Name) + " tiene <b>" + (province.Nightlife > 7.5 ? "una excelente vida nocturna" : "una vida nocturna bastante animada") + "</b> con " +
        province.Bars + " bares y " + province.Restaurants + " restaurantes por cada diez mil habitantes. "

    info.healthcare = "<b>La salud en " + es(province.Name) + " es " + (province.Healthcare > 6.74 ? "<b class='green'>por encima del promedio" : "<b class='red'>por debajo del promedio") + "</b></b>. " +
        "Para cada diez mil habitantes, hay aproximadamente " + province.pharmacies + " farmacias, " + province.GeneralPractitioners + " médicos de cabecera y " + province.SpecializedDoctors + " médicos especializados. " +
        "<b>La esperanza de vida promedio en " + es(province.Name) + " es " + (province.LifeExpectancy > 82.05 ? "muy alta con " : "de ") + province.LifeExpectancy + " años.</b>"

    info.crimeandsafety = "La provincia de " + es(province.Name) + " es generalmente " + (province.Safety > 7.33 ? "<b class='green'>muy segura" : (province.Safety > 6 ? "<b class='green'>moderadamente segura" : "<b class='red'>menos segura que otras provincias italianas")) + "</b>. " +
        "En 2021, hubo <b>" + province.ReportedCrimes + " denuncias de crímenes por cada cien mil habitantes</b>. Esto representa " + (province.ReportedCrimes > 2835.76 ? "<b class='red'>" + (((province.ReportedCrimes / 2835.76) * 100) - 100).toFixed(2) + "% más que el promedio nacional</b>" : "<b class='green'>" + ((100 - (province.ReportedCrimes / 2835.76) * 100).toFixed(2)) + "% menos que el promedio nacional</b>") + "." +
        "<br><br>" +
        "Hubo aproximadamente <b>" + province.RoadFatalities + " muertes por accidentes de tránsito</b> y <b>" + province.WorkAccidents + " accidentes graves en el trabajo</b> por cada diez mil personas en " + es(province.Name) + ". Esto representa respectivamente " +
        (province.RoadFatalities > 0.54 ? "<b class='red'>" + (((province.RoadFatalities / 0.54) * 100 - 100).toFixed(2)) + "% más de accidentes de tránsito que el promedio" : "<b class='green'>" + (((100 - (province.RoadFatalities / 0.54) * 100).toFixed(2)) + "% menos de accidentes de tránsito que el promedio")) + "</b> y " +
        (province.RoadFatalities > 12.90 ? "<b class='red'>" + (((province.WorkAccidents / 12.90) * 100 - 100).toFixed(2)) + "% más de accidentes laborales que el promedio" : "<b class='green'>" + (((100 - (province.WorkAccidents / 12.90) * 100).toFixed(2)) + "% menos de accidentes laborales que el promedio")) + "</b>." +
        "<br><br>" 

        info.crimeandsafety += (province.CarTheft > 70.53 ? "El robo de autos se estima que es <b class='red'>" + (((province.CarTheft / 70.53) * 100) - 100).toFixed(2) + "% más alto que el promedio</b> con " + province.CarTheft + " casos por cada cien mil habitantes." : "Los robos de autos se informa que son <b class='green'>" + ((100 - (province.CarTheft / 70.53) * 100)).toFixed(2) + "% menos que el promedio</b> con solo " + province.CarTheft + " casos reportados por cada cien mil habitantes.") + " " + (province.HouseTheft > 175.02 ? "Los casos reportados de robos en hogares son <b class='red'>" + (((province.HouseTheft / 175.02) * 100) - 100).toFixed(2) + "% más altos que el promedio</b> con " + province.HouseTheft + " quejas por cada cien mil habitantes." : "Los casos de robos en hogares se informa que son <b class='green'>" + ((100 - (province.HouseTheft / 175.02) * 100)).toFixed(2) + "% menos que el promedio</b> con " + province.HouseTheft + " casos por cada cien mil habitantes.") + " " + (province.Robberies > 22.14 ? "Los eventos de robo a mano armada no son del todo inusuales, hay <b class='red'>" + (((province.Robberies / 22.14) * 100) - 100).toFixed(2) + "% más casos reportados que el promedio nacional</b> con " + province.Robberies + " denuncias por cada cien mil habitantes" : "Los robos a mano armada no son muy frecuentes con " + province.HouseTheft + " casos reportados por cada cien mil habitantes, aproximadamente <b class='green'>" + ((100 - (province.Robberies / 22.14) * 100)).toFixed(2) + "% menos que el promedio nacional</b>") + ".";
        
        info.education = es(province.Name) + " tiene " + (province.HighSchoolGraduates > avg.HighSchoolGraduates ? "<b class='green'>un número de graduados más alto que el promedio" : "<b class='red'>una tasa de graduados más baja que el promedio") + "</b>, aproximadamente " + province.HighSchoolGraduates + "%; y " + (province.UniversityGraduates > avg.UniversityGraduates ? "<b class='green'>una tasa de graduados universitarios más alta que el promedio" : "<b class='red'>un porcentaje de graduados universitarios más bajo que el promedio") + "</b>, aproximadamente " + province.UniversityGraduates + "%." +
        " El número promedio de <b>años de estudio</b> completados para personas mayores de 25 años es de " + province.YearsOfIstruzione + ", lo que está " + (province.YearsOfIstruzione > avg.YearsOfIstruzione * 1.05 ? "<b class='green'>por encima del promedio nacional</b>" : (province.YearsOfIstruzione < avg.YearsOfIstruzione * .95 ? "<b class='red'>por debajo del promedio nacional</b>" : "cerca del promedio nacional")) + " de " + avg.YearsOfIstruzione + ". " +
        +"<h3>¿Cuántas universidades hay en "+es(province.Name)+"?</h3>";
        (province.Universities > 1 ? "Hay <b>"+province.Universities+" universidades</b> en la provincia de" : (province.Universities == 1 ? "Hay <b>una sola universidad</b> en la provincia de" : " <b>No hay universidad</b> en la provincia de ")) + es(province.Name) + "."
        
        info.transport = "<b>La oferta de transporte público en " + es(name) + "</b> es " + 
        (province.PublicTransport < avg.PublicTransport * .9 ? "<b class='red'>insuficiente" : 
          (province.PublicTransport > avg.PublicTransport * 1.1 ? "<b class='green'>bastante buena" : 
            "<b class='green'>más que satisfactoractoria")) + 
        "</b>, y " +
        (province.Traffic < avg.Traffic * .85 ? "<b class='green'>el tráfico es bajo" : 
          (province.Traffic < avg.Traffic ? "<b class='green'>el tráfico está por debajo del promedio" : 
            (province.Traffic > avg.Traffic * 1.1 ? "<b class='red'>hay mucho tráfico automovilístico" : 
              "<b class='red'>hay niveles de tráfico bastante altos"))) + 
        "</b>. " +
        "En promedio hay " + province.VehiclesPerPerson + " vehículos por persona, en comparación con el promedio nacional de " + 
        avg.VehiclesPerPerson + ". " + 
        (province.Subway > 0 ? "La ciudad de " + es(name) + " es una de las pocas ciudades italianas con un sistema de transporte metropolitano, el <b>Metro de " + es(name) + "</b>. " : "") +
        "<br><br>" +
        (facts[name]["transportData"] != "" ? (info.transport += '</br></br>' + facts[name]["transportData"]) : "");
      
        
        info.disclaimer = '</br></br><center><span id="disclaimer">Esta página contiene enlaces de afiliados. Como socio de Amazon y Viator, podemos ganar comisiones por compras elegibles.</span></center>'
        
        info.map = '</br><center class="map"><iframe id="ggmap" src="https://maps.google.it/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '&output=embed" width="80%" height="250" style="border:0;border-radius:25px;" allowfullscreen="" loading="lazy"></iframe></br></br>' +
        'Mostrar: ' +
        '<a onclick=\'$("#ggmap").attr("src","https://maps.google.it/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '+Cosas+que+hacer&output=embed")\' target="_blank"><b><ej>🎭</ej>Atracciones</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https://maps.google.it/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '+Museos&output=embed")\' target="_blank"><b><ej>🏺</ej>Museos</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https://maps.google.it/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '+Restaurantes&output=embed")\' target="_blank"><b><ej>🍕</ej>Restaurantes</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https://maps.google.it/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '+Bares&output=embed")\' target="_blank"><b><ej>🍺</ej>Bares</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https://maps.google.it/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '+Playas&output=embed")\' target="_blank"><b><ej>🏖️</ej>Playas</b></a> ' +
        '<a onclick=\'$("#ggmap").attr("src","https://maps.google.it/maps?f=q&source=s_q&hl=es&geocode=&q=Provincia+de+' + es(name) + '+Áreas+de+paseo&output=embed")\' target="_blank"><b><ej>⛰️</ej>Senderismo</b></a> ' +
        '<a href="https://www.amazon.es/ulp/view?&linkCode=ll2&tag=expiter-21&linkId=5824e12643c8300394b6ebdd10b7ba3c&language=es_ES&ref_=as_li_ss_tl" target="_blank"><b><ej>📦</ej>Puntos de recogida de Amazon</b></a> ' +
        '</center>';
        
        info.weather = (province.WeatherWidget ? '<center><h3>Clima</h3><a class="weatherwidget-io" href="https://forecast7.com/es/' + province.WeatherWidget + '" data-label_1="' + es(name) + '" data-label_2="' + region.Name + '"' +
        'data-font="Roboto" data-icons="Climacons Animated" data-mode="Forecast" data-theme="clear" data-basecolor="rgba(155, 205, 245, 0.59)" data-textcolor="#000441" >name Region.Name</a>' +
        '<script>' +
        "!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');" +
        '</script>' : "");
        
        info.viator = '<center><h3>Experiencias recomendadas en ' + (province.Viator ? es(name) : region.Name) + '</h3></center>' +
        '<div data-vi-partner-id=P00045447 data-vi-language=es data-vi-currency=EUR data-vi-partner-type="AFFILIATE" data-vi-url="' +
        (region.Name == 'Molise' ? '' : 'https://www.viator.com/') + (province.Viator ? province.Viator : region.Viator) + '"' +
        (province.Viator.includes(",") || region.Name == 'Molise' ? "" : ' data-vi-total-products=6 ') +
        ' data-vi-campaign="' + es(name) + '" ></div>' +
        '<script async src="https://www.viator.com/orion/partner/widget.js"></script>';
        
        info.getyourguide = '<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>';

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

        info.related = '<h2>Cercano</h2> ' +
  '<row class="columns is-multiline is-mobile"> ' +
  facts[related1].snippet +
  facts[related2].snippet +
  facts[related3].snippet +
  facts[related4].snippet + '</row>';

return info;
}

function populateFacts() {
  facts.Roma.overview = "La <b>ciudad de Roma</b>, con 2.761.632 habitantes, es la ciudad más poblada y la <b>capital de Italia</b>.";
  facts.Milano.overview = "La <b>ciudad de Milán</b>, con 1.371.498 habitantes, es la segunda ciudad más poblada y la <b>capital industrial, comercial y financiera de Italia</b>.";
}

function populateData(data){
    for (let i = 108; i < data.length; i++) {
        let region = data[i];
        regions[region["Name"]] = region;
        regions[region["Name"]].index = i;
        facts[region["Name"]] = {}; // inicializar el diccionario "facts" con cada región
        facts[region["Name"]].provinces = [];
    }
    for (let i = 0; i < 107; i++) {
        let province = data[i];
        provinces[province["Name"]] = province;
        provinces[province["Name"]].index = i;
        facts[province["Region"]].provinces.push(province.Name); // agregar provincia al diccionario de regiones

        facts[province["Name"]] = {}; // inicializar el diccionario "facts" con cada provincia
        facts[province["Name"]].snippet =
            '<figure class="column is-3 related"><a href="https://expiter.com/es/provincia/' + province.Name.replace(/\s+/g, "-").replace("'", "-").toLowerCase() + '/">' +
            '<img title="' + es(province.Name) + '" loading="lazy" src="' +
            'https://ik.imagekit.io/cfkgj4ulo/italy-cities/' + province.Abbreviation + '.webp?tr=w-280,h-140,c-at_least,q-5" ' +
            'alt="Provincia de ' + data[i].Name + ', ' + data[i].Region + '"></img>' +
            '<figcaption>' + es(province.Name) + ", " + es(province.Region) + "</figcaption></a></figure>";
    }
    avg = data[107];
}

function appendProvinceData(province, $) {
    let tab1 = $("#Quality-of-Life > .column");
    let tab2 = $("#Cost-of-Living > .column");
    let tab3 = $("#Digital-Nomads > .column");
    tab1[0].innerHTML += ('<p><ej>👥</ej>Población: <b>' + province.Population.toLocaleString('es', { useGrouping: true }) + '</b>');
    tab1[0].innerHTML += ('<p><ej>🚑</ej>Salud: ' + qualityScore("Healthcare", province.Healthcare));
    tab1[0].innerHTML += ('<p><ej>📚</ej>Educación: ' + qualityScore("Education", province.Istruzione));
    tab1[0].innerHTML += ('<p><ej>👮🏽‍♀️</ej>Seguridad: ' + qualityScore("Safety", province.Safety));
    tab1[0].innerHTML += ('<p><ej>🚨</ej>Criminalidad: ' + qualityScore("Crime", province.Crime));

    tab1[0].innerHTML += ('<p><ej>🚌</ej>Transporte: ' + qualityScore("PublicTransport", province["PublicTransport"]));
    tab1[0].innerHTML += ('<p><ej>🚥</ej>Tráfico: ' + qualityScore("Traffic", province["Traffic"]));
    tab1[0].innerHTML += ('<p><ej>🚴‍♂️</ej>Ciclismo: ' + qualityScore('CyclingLanes', province['CyclingLanes']));
    tab1[0].innerHTML += ('<p><ej>🏛️</ej>Cultura: ' + qualityScore("Culture", province.Culture));
    tab1[0].innerHTML += ('<p><ej>🍸</ej>Vida Nocturna: ' + qualityScore("Nightlife", province.Nightlife));
    tab1[0].innerHTML += ('<p><ej>⚽</ej>Deportes y Ocio: ' + qualityScore("Sports & Leisure", province["Sports & Leisure"]));

    tab1[1].innerHTML += ('<p><ej>🌦️</ej>Clima: ' + qualityScore("Climate", province.Climate));
    tab1[1].innerHTML += ('<p><ej>☀️</ej>Sol: ' + qualityScore("SunshineHours", province.SunshineHours));
    tab1[1].innerHTML += ('<p><ej>🥵</ej>Veranos ' + qualityScore("HotDays", province.HotDays));
    tab1[1].innerHTML += ('<p><ej>🥶</ej>Inviernos: ' + qualityScore("ColdDays", province.ColdDays));
    tab1[1].innerHTML += ('<p><ej>🌧️</ej>Lluvia: ' + qualityScore("RainyDays", province.RainyDays));
    tab1[1].innerHTML += ('<p><ej>🌫️</ej>Niebla: ' + qualityScore("FoggyDays", province.FoggyDays));
    tab1[1].innerHTML += ('<p><ej>🍃</ej>Calidad del Aire: ' + qualityScore("AirQuality", province["AirQuality"]));

    tab1[1].innerHTML += ('<p><ej>👪</ej>Para familias: ' + qualityScore("Family-friendly", province["Family-friendly"]));
    tab1[1].innerHTML += ('<p><ej>👩</ej>Para mujeres: ' + qualityScore("Female-friendly", province["Female-friendly"]));
    tab1[1].innerHTML += ('<p><ej>🏳️‍🌈</ej>LGBTQ+: ' + qualityScore("LGBT-friendly", province["LGBT-friendly"]));
    tab1[1].innerHTML += ('<p><ej>🥗</ej>Vegano: ' + qualityScore("Veg-friendly", province["Veg-friendly"]));

    tab2[0].innerHTML += ('<p><ej>📈</ej>Costo de Vida: ' + qualityScore("CostOfLiving", province["CostOfLiving"]));
    tab2[0].innerHTML += ('<p><ej>🧑🏻</ej>Costos (individual): ' + qualityScore("Cost of Living (Individual)", province["Cost of Living (Individual)"]))
    tab2[0].innerHTML += ('<p><ej>👩🏽‍🏫</ej>Costos (turista): ' + qualityScore("Cost of Living (Nomad)", province["Cost of Living (Nomad)"]))
    tab2[0].innerHTML += ('<p><ej>🏠</ej>Alquileres (estudio): ' + qualityScore("StudioRental", province["StudioRental"]))
    tab2[0].innerHTML += ('<p><ej>🏘️</ej>Alquileres (dos habitaciones): ' + qualityScore("BilocaleRent", province["BilocaleRent"]))
    tab2[0].innerHTML += ('<p><ej>🏰</ej>Alquileres (tres habitaciones): ' + qualityScore("TrilocaleRent", province["TrilocaleRent"]))

    tab2[1].innerHTML += ('<p><ej>🏙️</ej>Costo de la vivienda: ' + qualityScore("HousingCost", province["HousingCost"]));
    tab2[1].innerHTML += ('<p><ej>💵</ej>Salario: ' + qualityScore("MonthlyIncome", province["MonthlyIncome"]));
    tab2[1].innerHTML += ('<p><ej>👪</ej>Costos (familia): ' + qualityScore("Cost of Living (Family)", province["Cost of Living (Family)"]))
    tab2[1].innerHTML += ('<p><ej>🏠</ej>Compra (estudio): ' + qualityScore("StudioSale", province["StudioSale"]))
    tab2[1].innerHTML += ('<p><ej>🏘️</ej>Compra (dos habitaciones): ' + qualityScore("BilocaleSale", province["BilocaleSale"]))
    tab2[1].innerHTML += ('<p><ej>🏰</ej>Compra (tres habitaciones): ' + qualityScore("TrilocaleSale", province["TrilocaleSale"]))

    tab3[0].innerHTML += ('<p><ej>👩‍💻</ej>Adecuado para nómadas: ' + qualityScore("DN-friendly", province["DN-friendly"]))
    tab3[0].innerHTML += ('<p><ej>💃</ej>Diversión: ' + qualityScore("Fun", province["Fun"]));
    tab3[0].innerHTML += ('<p><ej>🤗</ej>Simpatía: ' + qualityScore("Friendliness", province["Friendliness"]));
    tab3[0].innerHTML += ('<p><ej>🤐</ej>Internacionalidad: ' + qualityScore("English-speakers", province["English-speakers"]));
    tab3[0].innerHTML += ('<p><ej>😊</ej>Felicidad: ' + qualityScore("Antidepressants", province["Antidepressants"]));
    
    tab3[1].innerHTML += ('<p><ej>💸</ej>Gastos para nómadas: ' + qualityScore("Cost of Living (Nomad)", province["Cost of Living (Nomad)"]))
    tab3[1].innerHTML += ('<p><ej>📡</ej>Conexión ultra rápida: ' + qualityScore("HighSpeedInternetCoverage", province["HighSpeedInternetCoverage"]));
    tab3[1].innerHTML += ('<p><ej>📈</ej>Innovación: ' + qualityScore("Innovation", province["Innovation"]));
    tab3[1].innerHTML += ('<p><ej>🏖️</ej>Playas: ' + qualityScore("Beach", province["Beach"]));
    tab3[1].innerHTML += ('<p><ej>⛰️</ej>Senderismo: ' + qualityScore("Hiking", province["Hiking"]));
    }
    
function qualityScore(quality, score) {
        let expenses = ["Cost of Living (Individual)", "Cost of Living (Family)", "Cost of Living (Nomad)", "StudioRental", "BilocaleRent", "TrilocaleRent", "MonthlyIncome", "StudioSale", "BilocaleSale", "TrilocaleSale"];
        if (quality == "CostOfLiving" || quality == "HousingCost") {
            if (score < avg[quality] * .8) {
                return "<score class='excellent short'>muy bajo</score>";
            } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
                return "<score class='great medium'>bajo</score>";
            } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
                return "<score class='good medium'>promedio</score>";
            } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
                return "<score class='average long'>alto</score>";
            } else if (score >= avg[quality] * 1.2) {
                return "<score class='poor max'>muy alto</score>";
            }
        } else if (expenses.includes(quality)) {
            if (score < avg[quality] * .8) {
                return "<score class='green'>" + score + "€/m</score>";
            } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
                return "<score class='green'>" + score + "€/m</score>";
            } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
                return "<score class='orange'>" + score + "€/m</score>";
            } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
                return "<score class='red'>" + score + "€/m</score>";
            } else if (score >= avg[quality] * 1.2) {
                return "<score class='red'>" + score + "€/m</score>";
            }
        } else if (quality == "HotDays" || quality == "ColdDays") { // high score = bad; low score = good
            if (score < avg[quality] * .8) {
                return "<score class='excellent short'>pocas " + (quality == "HotDays" ? "calurosos" : "fríos") + "</score>";
            } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
                return "<score class='great medium'>no muy " + (quality == "HotDays" ? "calurosos" : "fríos") + "</score>";
            } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
                return "<score class='good medium'>algo " + (quality == "HotDays" ? "calurosos" : "fríos") + "</score>";
            } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
                return "<score class='average long'>" + (quality == "HotDays" ? "calurosos" : "fríos") + "</score>";
            } else if (score >= avg[quality] * 1.2) {
                return "<score class='poor max'>muy " + (quality == "HotDays" ? "calurosos" : "fríos") + "</score>";
            }
        } else if (quality == "RainyDays") { // high score = bad; low score = good
            if (score < avg[quality] * .8) {
                return "<score class='excellent short'>muy pocas</score>";
            } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
                return "<score class='great medium'>pocas</score>";
            } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
                return "<score class='good medium'>en la media</score>";
            } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
                return "<score class='average long'>lluviosos</score>";
            } else if (score >= avg[quality] * 1.2) {
                return "<score class='poor max'>muy lluviosos</score>";
            }
        } else if (quality == "FoggyDays") { // high score = bad; low score = good
            if (score < avg[quality] * .265) {
                return "<score class='excellent short'>sin niebla</score>";
            } else if (score >= avg[quality] * .265 && score < avg[quality] * .6) {
                return "<score class='great medium'>poco</score>";
            } else if (score >= avg[quality] * .6 && score < avg[quality] * 1.00) {
                return "<score class='good medium'>promedio</score>";
            } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 3) {
                return "<score class='average long'>brumoso</score>";
            } else if (score >= avg[quality] * 3) {
                return "<score class='poor max'>muy brumoso</score>";
            }
        } 
        else if (quality == "Crime" || quality == "Traffic") { // puntaje alto = malo; puntaje bajo = bueno 
            if (score < avg[quality] * .8) {
                return "<score class='excellent short'>muy bajo</score>";
            } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
                return "<score class='great medium'>bajo</score>";
            } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
                return "<score class='good medium'>medio</score>";
            } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
                return "<score class='average long'>alto</score>";
            } else if (score >= avg[quality] * 1.2) {
                return "<score class='poor max'>muy alto</score>";
            }
        } else { // puntaje alto = bueno; puntaje bajo = malo 
            if (score < avg[quality] * .8) {
                return "<score class='poor short'>malo</score>";
            } else if (score >= avg[quality] * .8 && score < avg[quality] * .95) {
                return "<score class='average medium'>correcto</score>";
            } else if (score >= avg[quality] * .95 && score < avg[quality] * 1.05) {
                return "<score class='good medium'>bueno</score>";
            } else if (score >= avg[quality] * 1.05 && score < avg[quality] * 1.2) {
                return "<score class='great long'>muy bueno</score>";
            } else if (score >= avg[quality] * 1.2) {
                return "<score class='excellent max'>excelente</score>";
            }
        }
        }
        
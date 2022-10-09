import { createServer } from 'http';
import fetch from 'node-fetch';

import { createRequire } from 'module';
import { parse } from 'path';
const require = createRequire(import.meta.url);
const jsdom = require('jsdom')

let urls = {
    "Milano": {
        "Name": "Milano","Region":"Lombardia", "Url":
            "https://web.archive.org/web/20211127234828/https://www.tuttitalia.it/lombardia/provincia-di-milano/34-comuni/popolazione/"
    },
    "Roma":{
        "Name":"Roma","Region":"Lazio","Url":
        "https://web.archive.org/web/20221004130406/https://www.tuttitalia.it/lazio/provincia-di-roma/36-comuni/popolazione/"
    },
    "Napoli":{
        "Name":"Napoli","Region":"Campania","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/campania/provincia-di-napoli/73-comuni/popolazione/"
    },
    "Torino":{
        "Name":"Torino","Region":"Piemonte","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/piemonte/provincia-di-torino/94-comuni/popolazione/"
    },
    "Genova":{
        "Name":"Genova","Region":"Liguria","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/liguria/provincia-di-genova/46-comuni/popolazione/"
    },
    "Firenze":{
        "Name":"Firenze","Region":"Toscana","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/toscana/provincia-di-firenze/56-comuni/popolazione/"
    },
    "Catania":{
        "Name":"Catania","Region":"Sicilia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sicilia/provincia-di-catania/90-comuni/popolazione/"
    },
    "Palermo":{
        "Name":"Palermo","Region":"Sicilia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sicilia/provincia-di-palermo/21-comuni/popolazione/"
    },
    "Reggio Calabria":{
        "Name":"Reggio Calabria","Region":"Calabria","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/calabria/provincia-di-reggio-calabria/87-comuni/popolazione/"
    },
    "Bologna":{
        "Name":"Bologna","Region":"Emilia-Romagna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/emilia-romagna/provincia-di-bologna/60-comuni/popolazione/"
    },
    "Rimini":{
        "Name":"Rimini","Region":"Emilia-Romagna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/emilia-romagna/provincia-di-rimini/36-comuni/popolazione/"
    },
    "Reggio Emilia":{
        "Name":"Reggio Emilia","Region":"Emilia-Romagna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/emilia-romagna/provincia-di-reggio-emilia/28-comuni/popolazione/"
    },
    "Cagliari":{
        "Name":"Cagliari","Region":"Sardegna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sardegna/provincia-di-cagliari/42-comuni/"
    },
    "Bari":{
        "Name":"Bari","Region":"Puglia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/puglia/provincia-di-bari/23-comuni/popolazione/"
    },
    "Trieste":{
        "Name":"Trieste","Region":"Friuli-Venezia Giulia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/friuli-venezia-giulia/provincia-di-trieste/27-comuni/popolazione/"
    },
    "Trento":{
        "Name":"Trento","Region":"Trentino-Alto Adige","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/trentino-alto-adige/provincia-autonoma-di-trento/88-comuni/popolazione/"
    },
    "Catanzaro":{
        "Name":"Catanzaro","Region":"Calabria","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/calabria/provincia-di-catanzaro/18-comuni/popolazione/"
    },
    "Aosta":{
        "Name":"Aosta","Region":"Val d'Aosta","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/valle-d-aosta/35-comuni/popolazione/"
    },
    "L'Aquila":{
        "Name":"L'Aquila","Region":"Abruzzo","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/abruzzo/provincia-dell-aquila/70-comuni/popolazione/"
    },
    "Perugia":{
        "Name":"Perugia","Region":"Umbria","Url":
        "https://web.archive.org/web/2/https://web.archive.org/web/20221007010501/https://www.tuttitalia.it/umbria/provincia-di-perugia/72-comuni/popolazione/"
    },
    "Avellino":{
        "Name":"Avellino","Region":"Campania","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/campania/provincia-di-avellino/53-comuni/popolazione/"
    },
    "Varese":{
        "Name":"Varese","Region":"Lombardia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lombardia/provincia-di-varese/14-comuni/popolazione/"
    },
    "Salerno":{
        "Name":"Salerno","Region":"Campania","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/campania/provincia-di-salerno/35-comuni/popolazione/"
    },
    "Bergamo":{
        "Name":"Bergamo","Region":"Lombardia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lombardia/provincia-di-bergamo/76-comuni/popolazione/"
    },
    "Brescia":{
        "Name":"Brescia","Region":"Lombardia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lombardia/provincia-di-brescia/61-comuni/popolazione/"
    },
    "Benevento":{
        "Name":"Benevento","Region":"Campania","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/campania/provincia-di-benevento/50-comuni/popolazione/"
    }
    ,
    "Cosenza":{
        "Name":"Cosenza","Region":"Calabria","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/calabria/provincia-di-cosenza/35-comuni/popolazione/"
    }
      
}

createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
}).listen(8080);


const fs = require("fs");
const https = require("follow-redirects").https;
//const https = require('follow-redirects').https;

var output = {};

function fetchData(output) {
    
    for (var i in urls) {
        
        let province = urls[i].Name;
        let url = urls[i].Url;
        let region= urls[i].Region;
        output[province]={"Name":province,"Region":region};
        let html;

        console.log("fetching data from "+url+"...")
        https.get(url, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (data) {
            
              html = data;
          
              parseData(html,output,province)
              
            })
    
        })

    }
    console.log(output)
    return output

}


function parseData(html,output,province) {
    const dom = new jsdom.JSDOM(html);
    const $ = require('jquery')(dom.window);
    let length = $("table.ut tr td a").length
    let comuni={};
    let name;let pop;let sup;let dens;let alt;
    let oz = 0;
    console.log("scraping comuni in "+province)

    for (let i = 0; i < length; i++) {
        name=$($("table.ut tr td a")[i]).text();
        pop=$($("table.ut tr td.cw")[i]).text();
        sup=$($("table.ut tr td.oz")[oz++]).text();
        dens=$($("table.ut tr td.oz")[oz++]).text();
        alt=$($("table.ut tr td.oz")[oz++]).text();
        comuni[name]=
        {"Name":name,"Population":pop,"Surface":sup,"Density":dens,"Altitude":alt};
    }


    output[province]["Comuni"]=comuni;
    console.log(Object.keys(comuni).length)
    console.log(Object.keys(comuni).length ==0)
    if (Object.keys(comuni).length!==0){
    console.log("Writing to file:")
    fs.writeFile('temp/'+province+'-comuni.json', JSON.stringify(output[province]), function (err, file) {
        if (err) throw err;})   
    }
    return comuni;
}

fetchData(output)


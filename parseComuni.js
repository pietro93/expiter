import { createServer } from 'http';
import fetch from 'node-fetch';

import { createRequire } from 'module';
import { parse } from 'path';
const require = createRequire(import.meta.url);
const jsdom = require('jsdom');
require('events').EventEmitter.prototype._maxListeners = 107;
require('events').defaultMaxListeners = 107;


let urls = {
       "Agrigento":{
        "Name":"Agrigento","Region":"Sicilia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sicilia/provincia-di-agrigento/48-comuni/popolazione/"
    }, 
    "Milano": {
        "Name": "Milano","Region":"Lombardia", "Url":
            "https://web.archive.org/web/2/https://www.tuttitalia.it/lombardia/provincia-di-milano/34-comuni/popolazione/"
    },
    "Roma":{
        "Name":"Roma","Region":"Lazio","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lazio/provincia-di-roma/36-comuni/popolazione/"
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
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sardegna/provincia-di-cagliari/42-comuni/popolazione/"
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
        "https://web.archive.org/web/2/https://www.tuttitalia.it/umbria/provincia-di-perugia/72-comuni/popolazione/"
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
    },
    "Siena":{
        "Name":"Siena","Region":"Toscana","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/toscana/provincia-di-siena/65-comuni/popolazione/"
    },
    "Livorno":{
        "Name":"Livorno","Region":"Toscana","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/toscana/provincia-di-livorno/94-comuni/popolazione/"
    }
    ,
    "Pisa":{
        "Name":"Pisa","Region":"Toscana","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/toscana/provincia-di-pisa/42-comuni/popolazione/"
    }
    ,
    "Prato":{
        "Name":"Prato","Region":"Toscana","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/toscana/provincia-di-prato/72-comuni/popolazione/"
    }
    ,
    "Grosseto":{
        "Name":"Grosseto","Region":"Toscana","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/toscana/provincia-di-grosseto/78-comuni/popolazione/"
    }
    ,
    "Lucca":{
        "Name":"Lucca","Region":"Toscana","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/toscana/provincia-di-lucca/66-comuni/popolazione/"
    }
    ,
    "Ancona":{
        "Name":"Ancona","Region":"Marche","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/marche/provincia-di-ancona/26-comuni/popolazione/"
    }
    ,
    "Barletta-Andria-Trani":{
        "Name":"Barletta-Andria-Trani","Region":"Puglia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/puglia/provincia-di-barletta-andria-trani/58-comuni/popolazione/"
    }
    ,
    "Ascoli Piceno":{
        "Name":"Ascoli Piceno","Region":"Marche","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/marche/provincia-di-ascoli-piceno/25-comuni/popolazione/"
    }
    ,
    "Macerata":{
        "Name":"Macerata","Region":"Marche","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/marche/provincia-di-macerata/20-comuni/popolazione/"
    }
    ,
    "Pesaro e Urbino":{
        "Name":"Pesaro e Urbino","Region":"Marche","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/marche/provincia-di-pesaro-urbino/26-comuni/popolazione/"
    }
    ,
    "Isernia":{
        "Name":"Isernia","Region":"Molise","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/molise/provincia-di-isernia/91-comuni/popolazione/"
    }
    ,
    "Campobasso":{
        "Name":"Campobasso","Region":"Molise","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/molise/provincia-di-campobasso/77-comuni/popolazione/"
    }
    ,
    "Arezzo":{
        "Name":"Arezzo","Region":"Toscana","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/toscana/provincia-di-arezzo/41-comuni/popolazione/"
    },
    "Massa-Carrara":{
        "Name":"Massa-Carrara","Region":"Toscana","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/toscana/provincia-di-massa-carrara/67-comuni/popolazione/"
    },
    "Venezia":{
        "Name":"Venezia","Region":"Veneto","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/veneto/provincia-di-venezia/91-comuni/popolazione/"
    },
    "Padova":{
        "Name":"Padova","Region":"Veneto","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/veneto/provincia-di-padova/28-comuni/popolazione/"
    },
    "Vicenza":{
        "Name":"Vicenza","Region":"Veneto","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/veneto/provincia-di-vicenza/28-comuni/popolazione/"
    },
    "Treviso":{
        "Name":"Treviso","Region":"Veneto","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/veneto/provincia-di-treviso/89-comuni/popolazione/"
    },
    "Verona":{
        "Name":"Verona","Region":"Veneto","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/veneto/provincia-di-verona/70-comuni/popolazione/"
    },
    "Udine":{
        "Name":"Udine","Region":"Friuli-Venezia Giulia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/friuli-venezia-giulia/provincia-di-udine/78-comuni/popolazione/"
    },
    "Rovigo":{
        "Name":"Rovigo","Region":"Veneto","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/veneto/provincia-di-rovigo/50-comuni/popolazione/"
    },
    "Pordenone":{
        "Name":"Pordenone","Region":"Friuli-Venezia Giulia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/friuli-venezia-giulia/provincia-di-pordenone/92-comuni/popolazione/"
    },
    "Verbano-Cusio-Ossola":{
        "Name":"Verbano-Cusio-Ossola","Region":"Piemonte","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/piemonte/provincia-del-verbano-cusio-ossola/30-comuni/popolazione/"
    },
    "Bolzano":{
        "Name":"Bolzano","Region":"Trentino-Alto Adige","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/trentino-alto-adige/provincia-autonoma-di-bolzano/87-comuni/popolazione/"
    },
    "Asti":{
        "Name":"Asti","Region":"Piemonte","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/piemonte/provincia-di-asti/89-comuni/popolazione/"
    },
    "Cuneo":{
        "Name":"Cuneo","Region":"Piemonte","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/piemonte/provincia-di-cuneo/39-comuni/popolazione/"
    },
    "Lecco":{
        "Name":"Lecco","Region":"Lombardia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lombardia/provincia-di-lecco/18-comuni/popolazione/"
    },
    "Mantova":{
        "Name":"Mantova","Region":"Lombardia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lombardia/provincia-di-mantova/50-comuni/popolazione/"
    },
    "Pavia":{
        "Name":"Pavia","Region":"Lombardia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lombardia/provincia-di-pavia/38-comuni/popolazione/"
    },
    "Sondrio":{
        "Name":"Sondrio","Region":"Lombardia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lombardia/provincia-di-sondrio/74-comuni/popolazione/"
    },
    "Alessandria":{
        "Name":"Alessandria","Region":"Piemonte","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/piemonte/provincia-di-alessandria/98-comuni/popolazione/"
    },
    "Fermo":{
        "Name":"Fermo","Region":"Mache","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/marche/provincia-di-fermo/16-comuni/popolazione/"
    },
    "Como":{
        "Name":"Como","Region":"Lombardia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lombardia/provincia-di-como/71-comuni/popolazione/"
    },
    "Monza e Brianza":{
        "Name":"Monza e Brianza","Region":"Lombardia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lombardia/provincia-di-monza-della-brianza/65-comuni/popolazione/"
    },
    "Cremona":{
        "Name":"Cremona","Region":"Lombardia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lombardia/provincia-di-cremona/90-comuni/popolazione/"
    },
    "Novara":{
        "Name":"Novara","Region":"Piemonte","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/piemonte/provincia-di-novara/96-comuni/popolazione/"
    },
    "Vercelli":{
        "Name":"Vercelli","Region":"Piemonte","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/piemonte/provincia-di-vercelli/75-comuni/popolazione/"
    },
    "Imperia":{
        "Name":"Imperia","Region":"Liguria","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/liguria/provincia-di-imperia/62-comuni/popolazione/"
    },
    "La Spezia":{
        "Name":"La Spezia","Region":"Liguria","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/liguria/provincia-della-spezia/86-comuni/popolazione/"
    },
    "Biella":{
        "Name":"Biella","Region":"Piemonte","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/piemonte/provincia-di-biella/29-comuni/popolazione/"
    },
    "Lodi":{
        "Name":"Lodi","Region":"Lombardia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lombardia/provincia-di-lodi/30-comuni/popolazione/"
    },
    "Ravenna":{
        "Name":"Ravenna","Region":"Emilia-Romagna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/emilia-romagna/provincia-di-ravenna/74-comuni/popolazione/"
    },
    "Parma":{
        "Name":"Parma","Region":"Emilia-Romagna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/emilia-romagna/provincia-di-parma/44-comuni/popolazione/"
    },
    "Ferrara":{
        "Name":"Ferrara","Region":"Emilia-Romagna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/emilia-romagna/provincia-di-ferrara/12-comuni/popolazione/"
    },
    "Reggio Emilia":{
        "Name":"Reggio Emilia","Region":"Emilia-Romagna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/emilia-romagna/provincia-di-reggio-emilia/28-comuni/popolazione/"
    },
    "Modena":{
        "Name":"Modena","Region":"Emilia-Romagna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/emilia-romagna/provincia-di-modena/70-comuni/popolazione/"
    },
    "Forlì-Cesena":{
        "Name":"Forlì-Cesena","Region":"Emilia-Romagna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/emilia-romagna/provincia-di-forli-cesena/87-comuni/popolazione/"
    },
    "Piacenza":{
        "Name":"Piacenza","Region":"Emilia-Romagna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/emilia-romagna/provincia-di-piacenza/97-comuni/popolazione/"
    },
    "Savona":{
        "Name":"Savona","Region":"Liguria","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/liguria/provincia-di-savona/27-comuni/popolazione/"
    },
    "Terni":{
        "Name":"Terni","Region":"Umbria","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/umbria/provincia-di-terni/28-comuni/popolazione/"
    },
    "Teramo":{
        "Name":"Teramo","Region":"Abruzzo","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/abruzzo/provincia-di-teramo/75-comuni/popolazione/"
    },
    "Latina":{
        "Name":"Latina","Region":"Lazio","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lazio/provincia-di-latina/31-comuni/popolazione/"
    },
    "Frosinone":{
        "Name":"Frosinone","Region":"Lazio","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lazio/provincia-di-frosinone/70-comuni/popolazione/"
    },
    "Rieti":{
        "Name":"Rieti","Region":"Lazio","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lazio/provincia-di-rieti/83-comuni/popolazione/"
    },
    "Viterbo":{
        "Name":"Viterbo","Region":"Lazio","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/lazio/provincia-di-viterbo/19-comuni/popolazione/"
    },
    "Caserta":{
        "Name":"Caserta","Region":"Campania","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/campania/provincia-di-caserta/88-comuni/popolazione/"
    },
    "Matera":{
        "Name":"Matera","Region":"Basilicata","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/basilicata/provincia-di-matera/64-comuni/popolazione/"
    },
    "Potenza":{
        "Name":"Potenza","Region":"Basilicata","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/basilicata/provincia-di-potenza/91-comuni/popolazione/"
    },
    "Brindisi":{
        "Name":"Brindisi","Region":"Puglia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/puglia/provincia-di-brindisi/78-comuni/popolazione/"
    },
    "Lecce":{
        "Name":"Lecce","Region":"Puglia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/puglia/provincia-di-lecce/54-comuni/popolazione/"
    },
    "Foggia":{
        "Name":"Foggia","Region":"Puglia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/puglia/provincia-di-foggia/87-comuni/popolazione/"
    },
    "Taranto":{
        "Name":"Taranto","Region":"Puglia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/puglia/provincia-di-taranto/80-comuni/popolazione/"
    },
    "Vibo Valentia":{
        "Name":"Vibo Valentia","Region":"Calabria","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/calabria/provincia-di-vibo-valentia/91-comuni/popolazione/"
    },
    "Crotone":{
        "Name":"Crotone","Region":"Calabria","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/calabria/provincia-di-crotone/57-comuni/popolazione/"
    },
    "Messina":{
        "Name":"Messina","Region":"Sicilia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sicilia/provincia-di-messina/33-comuni/popolazione/"
    },
    "Caltanissetta":{
        "Name":"Caltanissetta","Region":"Sicilia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sicilia/provincia-di-caltanissetta/44-comuni/popolazione/"
    },
    "Siracusa":{
        "Name":"Siracusa","Region":"Sicilia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sicilia/provincia-di-siracusa/56-comuni/popolazione/"
    },
    "Trapani":{
        "Name":"Trapani","Region":"Sicilia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sicilia/provincia-di-trapani/54-comuni/popolazione/"
    },
    "Enna":{
        "Name":"Enna","Region":"Sicilia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sicilia/provincia-di-enna/80-comuni/popolazione/"
    },
    "Sassari":{
        "Name":"Sassari","Region":"Sardegna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sardegna/provincia-di-sassari/96-comuni/popolazione/"
    },
    "Sud Sardegna":{
        "Name":"Sud Sardegna","Region":"Sardegna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sardegna/provincia-del-sud-sardegna/39-comuni/popolazione/"
    },
    "Nuoro":{
        "Name":"Nuoro","Region":"Sardegna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sardegna/provincia-di-nuoro/21-comuni/popolazione/"
    },
    "Oristano":{
        "Name":"Oristano","Region":"Sardegna","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sardegna/provincia-di-oristano/80-comuni/popolazione/"
    },
    "Gorizia":{
        "Name":"Gorizia","Region":"Friuli-Venezia Giulia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/friuli-venezia-giulia/provincia-di-gorizia/70-comuni/popolazione/"
    },
    "Pescara":{
        "Name":"Pescara","Region":"Abruzzo","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/abruzzo/provincia-di-pescara/95-comuni/popolazione/"
    },
    "Belluno":{
        "Name":"Belluno","Region":"Veneto","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/veneto/provincia-di-belluno/67-comuni/popolazione/"
    },
    "Chieti":{
        "Name":"Chieti","Region":"Abruzzo","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/abruzzo/provincia-di-chieti/14-comuni/popolazione/"
    },
    "Ragusa":{
        "Name":"Ragusa","Region":"Sicilia","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/sicilia/provincia-di-ragusa/16-comuni/popolazione/"
    },
    "Pistoia":{
        "Name":"Pistoia","Region":"Toscana","Url":
        "https://web.archive.org/web/2/https://www.tuttitalia.it/toscana/provincia-di-pistoia/12-comuni/popolazione/"
    }
     
}

createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
}).listen(8080);



const fs = require("fs");
const https = require("follow-redirects").https;
//const https = require('follow-redirects').https;


https.get({
    host: '',
    path: '/',
    timeout: 100000, // Here is where you set the timeout
    followAllRedirects: true,
  }, function(response) {
    // handle the response
  }).on('error', function(error) {
    console.log('Error: ' + error.message);
  });

var output = {};
//var ClimateZones={"A":[],"B":[],"C":[],"D":[],"E":[],"F":[]}

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
            
              html += data;
              
            }),
            res.on('end',function(){
                console.log("...")
                parseData(html,output,province)
            }),
            process.on('uncaughtException', function (err) {
                console.log(err);
            })
            
    
        })

    }
    //console.log(output)
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
    console.log($("table.ut tr td a").length)
    for (let i = 0; i < length; i++) {
        name=$($("table.ut tr td a")[i]).text();
        pop=$($("table.ut tr td.cw")[i]).text();
        sup=$($("table.ut tr td.oz")[oz++]).text();
        dens=$($("table.ut tr td.oz")[oz++]).text();
        alt=$($("table.ut tr td.oz")[oz++]).text();

        comuni[name]=
        {"Name":name,"Population":pop,"Surface":sup,"Density":dens,"Altitude":alt,"ClimateZone":""};
    }
    

    let newUrl=urls[province].Url;
    newUrl=newUrl.replace(newUrl.substr(-23),"");//remove suffix from old url
    (newUrl.charAt(newUrl.length-1)!='/'?newUrl.replace(newUrl.substr(newUrl.length-1),""):"")
    newUrl+=
    '/classificazione-climatica/'
    console.log("parsing ClimateData from "+newUrl)
    let newHtml="";
    https.get(newUrl, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (data) {
            
              newHtml += data;
              
            }),
            res.on('end',function(){
                console.log("parsing ClimateData")
                const dom2 = new jsdom.JSDOM(newHtml);
                const $ = require('jquery')(dom2.window);
                //console.log(newHtml)
                for (let i=0;i<$(".ct td a").length-1;i++){
                    let target=$(".ct td a").eq(i)
                    let c=$(target).text();
                    let cz=$(target).parent().next().text()
                    //console.log("processing "+c+" "+cz)
                  
                    if (!comuni[c]){
                        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>> "+c+" acting up")
                        if (c.substr(8)=="sulla strada d.v.")c=c.replace("strada d.v.","SdV")
                        for (let cc in comuni){                       
                            if (comuni[cc].Name.substr(0,15)==c.substr(0,15)){
                                console.log("found "+comuni[cc].Name+" similar to "+c)
                                console.log(cc)
                                comuni[cc].Name=c.replace("SdV","Strada del Vino");
                                comuni[cc].ClimateZone=cz;
                                console.log(comuni[cc])
                            }
                        }
                    }
                    else comuni[c]["ClimateZone"]=cz;
                    //console.log(comuni[c])
                }
    
                if (Object.keys(comuni).length!==0){
                    console.log(Object.keys(comuni).length+" comuni found in "+province+". Writing to file.")
                    fs.writeFile('temp/'+province+'-comuni.json', JSON.stringify(comuni), function (err, file) {
                        if (err) throw err;})   
                    }

                }
            )})

    return comuni;
}

fetchData(output)


function handle(province){
    return province.replace('(*)','').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()
  }
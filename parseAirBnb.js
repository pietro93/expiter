import { createServer } from 'http';
import fetch from 'node-fetch';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jsdom = require('jsdom')

const dataset=[
    {
        "Abbreviation": "AG",
        "Name": "Agrigento",
        "Region": "Sicilia",
        "Province": "Agrigento",
        "Population": "55,906.00"
    },
    {
        "Abbreviation": "AL",
        "Name": "Alessandria",
        "Region": "Piemonte",
        "Province": "Alessandria",
        "Population": "91,113.00"
    },
    {
        "Abbreviation": "AN",
        "Name": "Ancona",
        "Region": "Marche",
        "Province": "Ancona",
        "Population": "98,541.00"
    },
    {
        "Abbreviation": "AR",
        "Name": "Arezzo",
        "Region": "Toscana",
        "Province": "Arezzo",
        "Population": "96,492.00"
    },
    {
        "Abbreviation": "AT",
        "Name": "Asti",
        "Region": "Piemonte",
        "Province": "Asti",
        "Population": "73,952.00"
    },
    {
        "Abbreviation": "AV",
        "Name": "Avellino",
        "Region": "Campania",
        "Province": "Avellino",
        "Population": "52,974.00"
    },
    {
        "Abbreviation": "BA",
        "Name": "Bari",
        "Region": "Puglia",
        "Province": "Bari",
        "Population": "315,917.00"
    },
    {
        "Abbreviation": "BN",
        "Name": "Benevento",
        "Region": "Campania",
        "Province": "Benevento",
        "Population": "57,456.00"
    },
    {
        "Abbreviation": "BG",
        "Name": "Bergamo",
        "Region": "Lombardia",
        "Province": "Bergamo",
        "Population": "120,390.00"
    },
    {
        "Abbreviation": "BO",
        "Name": "Bologna",
        "Region": "Emilia-Romagna",
        "Province": "Bologna",
        "Population": "392,809.00"
    },
    {
        "Abbreviation": "BZ",
        "Name": "Bolzano",
        "Region": "Trentino-Alto Adige",
        "Province": "Bolzano",
        "Population": "106,918.00"
    },
    {
        "Abbreviation": "BS",
        "Name": "Brescia",
        "Region": "Lombardia",
        "Province": "Brescia",
        "Population": "196,586.00"
    },
    {
        "Abbreviation": "BR",
        "Name": "Brindisi",
        "Region": "Puglia",
        "Province": "Brindisi",
        "Population": "82,836.00"
    },
    {
        "Abbreviation": "CA",
        "Name": "Cagliari",
        "Region": "Sardegna",
        "Province": "Cagliari",
        "Population": "148,492.00"
    },
    {
        "Abbreviation": "CL",
        "Name": "Caltanissetta",
        "Region": "Sicilia",
        "Province": "Caltanissetta",
        "Population": "59,130.00"
    },
    {
        "Abbreviation": "CE",
        "Name": "Caserta",
        "Region": "Campania",
        "Province": "Caserta",
        "Population": "73,614.00"
    },
    {
        "Abbreviation": "CT",
        "Name": "Catania",
        "Region": "Sicilia",
        "Province": "Catania",
        "Population": "296,919.00"
    },
    {
        "Abbreviation": "CZ",
        "Name": "Catanzaro",
        "Region": "Calabria",
        "Province": "Catanzaro",
        "Population": "85,087.00"
    },
    {
        "Abbreviation": "CO",
        "Name": "Como",
        "Region": "Lombardia",
        "Province": "Como",
        "Population": "83,668.00"
    },
    {
        "Abbreviation": "CS",
        "Name": "Cosenza",
        "Region": "Calabria",
        "Province": "Cosenza",
        "Population": "65,209.00"
    },
    {
        "Abbreviation": "CR",
        "Name": "Cremona",
        "Region": "Lombardia",
        "Province": "Cremona",
        "Population": "71,343.00"
    },
    {
        "Abbreviation": "KR",
        "Name": "Crotone",
        "Region": "Calabria",
        "Province": "Crotone",
        "Population": "59,824.00"
    },
    {
        "Abbreviation": "CN",
        "Name": "Cuneo",
        "Region": "Piemonte",
        "Province": "Cuneo",
        "Population": "55,843.00"
    },
    {
        "Abbreviation": "FE",
        "Name": "Ferrara",
        "Region": "Emilia-Romagna",
        "Province": "Ferrara",
        "Population": "130,833.00"
    },
    {
        "Abbreviation": "FI",
        "Name": "Firenze",
        "Region": "Toscana",
        "Province": "Firenze",
        "Population": "367,101.00"
    },
    {
        "Abbreviation": "FG",
        "Name": "Foggia",
        "Region": "Puglia",
        "Province": "Foggia",
        "Population": "145,508.00"
    },
    {
        "Abbreviation": "GE",
        "Name": "Genova",
        "Region": "Liguria",
        "Province": "Genova",
        "Population": "559,374.00"
    },
    {
        "Abbreviation": "GR",
        "Name": "Grosseto",
        "Region": "Toscana",
        "Province": "Grosseto",
        "Population": "81,306.00"
    },
    {
        "Abbreviation": "AQ",
        "Name": "L'Aquila",
        "Region": "Abruzzo",
        "Province": "L'Aquila",
        "Population": "69,918.00"
    },
    {
        "Abbreviation": "SP",
        "Name": "La Spezia",
        "Region": "Liguria",
        "Province": "La Spezia",
        "Population": "92,147.00"
    },
    {
        "Abbreviation": "LT",
        "Name": "Latina",
        "Region": "Lazio",
        "Province": "Latina",
        "Population": "127,013.00"
    },
    {
        "Abbreviation": "LE",
        "Name": "Lecce",
        "Region": "Puglia",
        "Province": "Lecce",
        "Population": "95,085.00"
    },
    {
        "Abbreviation": "LI",
        "Name": "Livorno",
        "Region": "Toscana",
        "Province": "Livorno",
        "Population": "153,297.00"
    },
    {
        "Abbreviation": "LU",
        "Name": "Lucca",
        "Region": "Toscana",
        "Province": "Lucca",
        "Population": "89,141.00"
    },
    {
        "Abbreviation": "MT",
        "Name": "Matera",
        "Region": "Basilicata",
        "Province": "Matera",
        "Population": "60,286.00"
    },
    {
        "Abbreviation": "ME",
        "Name": "Messina",
        "Region": "Sicilia",
        "Province": "Messina",
        "Population": "218,762.00"
    },
    {
        "Abbreviation": "MI",
        "Name": "Milano",
        "Region": "Lombardia",
        "Province": "Milano",
        "Population": "1,373,517.00"
    },
    {
        "Abbreviation": "MO",
        "Name": "Modena",
        "Region": "Emilia-Romagna",
        "Province": "Modena",
        "Population": "185,202.00"
    },
    {
        "Abbreviation": "NA",
        "Name": "Napoli",
        "Region": "Campania",
        "Province": "Napoli",
        "Population": "910,439.00"
    },
    {
        "Abbreviation": "NO",
        "Name": "Novara",
        "Region": "Piemonte",
        "Province": "Novara",
        "Population": "101,657.00"
    },
    {
        "Abbreviation": "PD",
        "Name": "Padova",
        "Region": "Veneto",
        "Province": "Padova",
        "Population": "208,518.00"
    },
    {
        "Abbreviation": "PA",
        "Name": "Palermo",
        "Region": "Sicilia",
        "Province": "Palermo",
        "Population": "627,379.00"
    },
    {
        "Abbreviation": "PR",
        "Name": "Parma",
        "Region": "Emilia-Romagna",
        "Province": "Parma",
        "Population": "197,232.00"
    },
    {
        "Abbreviation": "PV",
        "Name": "Pavia",
        "Region": "Lombardia",
        "Province": "Pavia",
        "Population": "70,964.00"
    },
    {
        "Abbreviation": "PG",
        "Name": "Perugia",
        "Region": "Umbria",
        "Province": "Perugia",
        "Population": "163,286.00"
    },
    {
        "Abbreviation": "PE",
        "Name": "Pescara",
        "Region": "Abruzzo",
        "Province": "Pescara",
        "Population": "119,170.00"
    },
    {
        "Abbreviation": "PC",
        "Name": "Piacenza",
        "Region": "Emilia-Romagna",
        "Province": "Piacenza",
        "Population": "102,899.00"
    },
    {
        "Abbreviation": "PI",
        "Name": "Pisa",
        "Region": "Toscana",
        "Province": "Pisa",
        "Population": "89,643.00"
    },
    {
        "Abbreviation": "PT",
        "Name": "Pistoia",
        "Region": "Toscana",
        "Province": "Pistoia",
        "Population": "89,440.00"
    },
    {
        "Abbreviation": "PN",
        "Name": "Pordenone",
        "Region": "Friuli-Venezia Giulia",
        "Province": "Pordenone",
        "Population": "51,719.00"
    },
    {
        "Abbreviation": "PZ",
        "Name": "Potenza",
        "Region": "Basilicata",
        "Province": "Potenza",
        "Population": "64,970.00"
    },
    {
        "Abbreviation": "PO",
        "Name": "Prato",
        "Region": "Toscana",
        "Province": "Prato",
        "Population": "200,652.00"
    },
    {
        "Abbreviation": "RG",
        "Name": "Ragusa",
        "Region": "Sicilia",
        "Province": "Ragusa",
        "Population": "71,358.00"
    },
    {
        "Abbreviation": "RA",
        "Name": "Ravenna",
        "Region": "Emilia-Romagna",
        "Province": "Ravenna",
        "Population": "155,888.00"
    },
    {
        "Abbreviation": "RC",
        "Name": "Reggio Calabria",
        "Region": "Calabria",
        "Province": "Reggio Calabria",
        "Population": "171,086.00"
    },
    {
        "Abbreviation": "RE",
        "Name": "Reggio Emilia",
        "Region": "Emilia-Romagna",
        "Province": "Reggio Emilia",
        "Population": "168,814.00"
    },
    {
        "Abbreviation": "RN",
        "Name": "Rimini",
        "Region": "Emilia-Romagna",
        "Province": "Rimini",
        "Population": "150,075.00"
    },
    {
        "Abbreviation": "ROMA",
        "Name": "Roma",
        "Region": "Lazio",
        "Province": "Roma",
        "Population": "2,758,839.00"
    },
    {
        "Abbreviation": "SA",
        "Name": "Salerno",
        "Region": "Campania",
        "Province": "Salerno",
        "Population": "127,546.00"
    },
    {
        "Abbreviation": "SS",
        "Name": "Sassari",
        "Region": "Sardegna",
        "Province": "Sassari",
        "Population": "121,017.00"
    },
    {
        "Abbreviation": "SV",
        "Name": "Savona",
        "Region": "Liguria",
        "Province": "Savona",
        "Population": "58,261.00"
    },
    {
        "Abbreviation": "SI",
        "Name": "Siena",
        "Region": "Toscana",
        "Province": "Siena",
        "Population": "54,132.00"
    },
    {
        "Abbreviation": "SR",
        "Name": "Siracusa",
        "Region": "Sicilia",
        "Province": "Siracusa",
        "Population": "115,984.00"
    },
    {
        "Abbreviation": "TA",
        "Name": "Taranto",
        "Region": "Puglia",
        "Province": "Taranto",
        "Population": "188,355.00"
    },
    {
        "Abbreviation": "TE",
        "Name": "Teramo",
        "Region": "Abruzzo",
        "Province": "Teramo",
        "Population": "53,199.00"
    },
    {
        "Abbreviation": "TR",
        "Name": "Terni",
        "Region": "Umbria",
        "Province": "Terni",
        "Population": "106,794.00"
    },
    {
        "Abbreviation": "TO",
        "Name": "Torino",
        "Region": "Piemonte",
        "Province": "Torino",
        "Population": "845,606.00"
    },
    {
        "Abbreviation": "TP",
        "Name": "Trapani",
        "Region": "Sicilia",
        "Province": "Trapani",
        "Population": "64,805.00"
    },
    {
        "Abbreviation": "TN",
        "Name": "Trento",
        "Region": "Trentino-Alto Adige",
        "Province": "Trento",
        "Population": "118,357.00"
    },
    {
        "Abbreviation": "TV",
        "Name": "Treviso",
        "Region": "Veneto",
        "Province": "Treviso",
        "Population": "84,892.00"
    },
    {
        "Abbreviation": "TS",
        "Name": "Trieste",
        "Region": "Friuli-Venezia Giulia",
        "Province": "Trieste",
        "Population": "200,087.00"
    },
    {
        "Abbreviation": "UD",
        "Name": "Udine",
        "Region": "Friuli-Venezia Giulia",
        "Province": "Udine",
        "Population": "97,754.00"
    },
    {
        "Abbreviation": "VA",
        "Name": "Varese",
        "Region": "Lombardia",
        "Province": "Varese",
        "Population": "78,634.00"
    },
    {
        "Abbreviation": "VE",
        "Name": "Venezia",
        "Region": "Veneto",
        "Province": "Venezia",
        "Population": "253,777.00"
    },
    {
        "Abbreviation": "VR",
        "Name": "Verona",
        "Region": "Veneto",
        "Province": "Verona",
        "Population": "257,235.00"
    },
    {
        "Abbreviation": "VI",
        "Name": "Vicenza",
        "Region": "Veneto",
        "Province": "Vicenza",
        "Population": "110,589.00"
    },
    {
        "Abbreviation": "VT",
        "Name": "Viterbo",
        "Region": "Lazio",
        "Province": "Viterbo",
        "Population": "65,034.00"
    },
    {
        "Abbreviation": "NA",
        "Name": "Giugliano in Campania",
        "Region": "Campania",
        "Province": "Napoli",
        "Population": "123,132.00"
    },
    {
        "Abbreviation": "MB",
        "Name": "Monza",
        "Region": "Lombardia",
        "Province": "Monza e Brianza",
        "Population": "121,681.00"
    },
    {
        "Abbreviation": "FC",
        "Name": "Forlì",
        "Region": "Emilia-Romagna",
        "Province": "Forlì-Cesena",
        "Population": "116,714.00"
    },
    {
        "Abbreviation": "BT",
        "Name": "Andria",
        "Region": "Puglia",
        "Province": "Barletta-Andria-Trani",
        "Population": "96,838.00"
    },
    {
        "Abbreviation": "FC",
        "Name": "Cesena",
        "Region": "Emilia-Romagna",
        "Province": "Forlì-Cesena",
        "Population": "96,022.00"
    },
    {
        "Abbreviation": "PU",
        "Name": "Pesaro",
        "Region": "Marche",
        "Province": "Pesaro e Urbino",
        "Population": "95,582.00"
    },
    {
        "Abbreviation": "BT",
        "Name": "Barletta",
        "Region": "Puglia",
        "Province": "Barletta-Andria-Trani",
        "Population": "92,226.00"
    },
    {
        "Abbreviation": "ROMA",
        "Name": "Guidonia Montecelio",
        "Region": "Lazio",
        "Province": "Roma",
        "Population": "88,597.00"
    },
    {
        "Abbreviation": "VA",
        "Name": "Busto Arsizio",
        "Region": "Lombardia",
        "Province": "Varese",
        "Population": "83,056.00"
    },
    {
        "Abbreviation": "ROMA",
        "Name": "Fiumicino",
        "Region": "Lazio",
        "Province": "Roma",
        "Population": "81,016.00"
    },
    {
        "Abbreviation": "NA",
        "Name": "Torre del Greco",
        "Region": "Campania",
        "Province": "Napoli",
        "Population": "80,360.00"
    },
    {
        "Abbreviation": "TP",
        "Name": "Marsala",
        "Region": "Sicilia",
        "Province": "Trapani",
        "Population": "79,709.00"
    },
    {
        "Abbreviation": "MI",
        "Name": "Sesto San Giovanni",
        "Region": "Lombardia",
        "Province": "Milano",
        "Population": "79,488.00"
    },
    {
        "Abbreviation": "NA",
        "Name": "Pozzuoli",
        "Region": "Campania",
        "Province": "Napoli",
        "Population": "75,941.00"
    },
    {
        "Abbreviation": "CS",
        "Name": "Corigliano-Rossano",
        "Region": "Calabria",
        "Province": "Cosenza",
        "Population": "74,765.00"
    },
    {
        "Abbreviation": "NA",
        "Name": "Casoria",
        "Region": "Campania",
        "Province": "Napoli",
        "Population": "73,943.00"
    },
    {
        "Abbreviation": "MI",
        "Name": "Cinisello Balsamo",
        "Region": "Lombardia",
        "Province": "Milano",
        "Population": "73,488.00"
    },
    {
        "Abbreviation": "LT",
        "Name": "Aprilia",
        "Region": "Lazio",
        "Province": "Latina",
        "Population": "73,474.00"
    },
    {
        "Abbreviation": "MO",
        "Name": "Carpi",
        "Region": "Emilia-Romagna",
        "Province": "Modena",
        "Population": "72,511.00"
    },
    {
        "Abbreviation": "CL",
        "Name": "Gela",
        "Region": "Sicilia",
        "Province": "Caltanissetta",
        "Population": "71,343.00"
    },
    {
        "Abbreviation": "BO",
        "Name": "Imola",
        "Region": "Emilia-Romagna",
        "Province": "Bologna",
        "Population": "70,203.00"
    },
    {
        "Abbreviation": "BA",
        "Name": "Altamura",
        "Region": "Puglia",
        "Province": "Bari",
        "Population": "69,637.00"
    },
    {
        "Abbreviation": "CA",
        "Name": "Quartu Sant'Elena",
        "Region": "Sardegna",
        "Province": "Cagliari",
        "Population": "67,694.00"
    },
    {
        "Abbreviation": "CZ",
        "Name": "Lamezia Terme",
        "Region": "Calabria",
        "Province": "Catanzaro",
        "Population": "67,547.00"
    },
    {
        "Abbreviation": "MS",
        "Name": "Massa",
        "Region": "Toscana",
        "Province": "Massa-Carrara",
        "Population": "66,579.00"
    },
    {
        "Abbreviation": "NA",
        "Name": "Castellammare di Stabia",
        "Region": "Campania",
        "Province": "Napoli",
        "Population": "63,656.00"
    },
    {
        "Abbreviation": "RG",
        "Name": "Vittoria",
        "Region": "Sicilia",
        "Province": "Ragusa",
        "Population": "62,574.00"
    },
    {
        "Abbreviation": "NA",
        "Name": "Afragola",
        "Region": "Campania",
        "Province": "Napoli",
        "Population": "62,374.00"
    },
    {
        "Abbreviation": "PV",
        "Name": "Vigevano",
        "Region": "Lombardia",
        "Province": "Pavia",
        "Population": "61,984.00"
    },
    {
        "Abbreviation": "ROMA",
        "Name": "Pomezia",
        "Region": "Lazio",
        "Province": "Roma",
        "Population": "61,391.00"
    },
    {
        "Abbreviation": "SS",
        "Name": "Olbia",
        "Region": "Sardegna",
        "Province": "Sassari",
        "Population": "60,577.00"
    },
    {
        "Abbreviation": "MS",
        "Name": "Carrara",
        "Region": "Toscana",
        "Province": "Massa-Carrara",
        "Population": "60,407.00"
    },
    {
        "Abbreviation": "LU",
        "Name": "Viareggio",
        "Region": "Toscana",
        "Province": "Lucca",
        "Population": "60,058.00"
    },
    {
        "Abbreviation": "PU",
        "Name": "Fano",
        "Region": "Marche",
        "Province": "Pesaro e Urbino",
        "Population": "59,895.00"
    },
    {
        "Abbreviation": "NA",
        "Name": "Acerra",
        "Region": "Campania",
        "Province": "Napoli",
        "Population": "59,007.00"
    },
    {
        "Abbreviation": "MI",
        "Name": "Legnano",
        "Region": "Lombardia",
        "Province": "Milano",
        "Population": "58,797.00"
    },
    {
        "Abbreviation": "RA",
        "Name": "Faenza",
        "Region": "Emilia-Romagna",
        "Province": "Ravenna",
        "Population": "58,299.00"
    },
    {
        "Abbreviation": "NA",
        "Name": "Marano di Napoli",
        "Region": "Campania",
        "Province": "Napoli",
        "Population": "57,894.00"
    },
    {
        "Abbreviation": "BA",
        "Name": "Molfetta",
        "Region": "Puglia",
        "Province": "Bari",
        "Population": "57,486.00"
    },
    {
        "Abbreviation": "TO",
        "Name": "Moncalieri",
        "Region": "Piemonte",
        "Province": "Torino",
        "Population": "56,389.00"
    },
    {
        "Abbreviation": "BT",
        "Name": "Trani",
        "Region": "Puglia",
        "Province": "Barletta-Andria-Trani",
        "Population": "55,171.00"
    },
    {
        "Abbreviation": "PG",
        "Name": "Foligno",
        "Region": "Umbria",
        "Province": "Perugia",
        "Population": "55,066.00"
    },
    {
        "Abbreviation": "FG",
        "Name": "Cerignola",
        "Region": "Puglia",
        "Province": "Foggia",
        "Population": "54,934.00"
    },
    {
        "Abbreviation": "FG",
        "Name": "Manfredonia",
        "Region": "Puglia",
        "Province": "Foggia",
        "Population": "54,863.00"
    },
    {
        "Abbreviation": "BT",
        "Name": "Bisceglie",
        "Region": "Puglia",
        "Province": "Barletta-Andria-Trani",
        "Population": "54,214.00"
    },
    {
        "Abbreviation": "VA",
        "Name": "Gallarate",
        "Region": "Lombardia",
        "Province": "Varese",
        "Population": "53,998.00"
    },
    {
        "Abbreviation": "ROMA",
        "Name": "Tivoli",
        "Region": "Lazio",
        "Province": "Roma",
        "Population": "53,988.00"
    },
    {
        "Abbreviation": "RG",
        "Name": "Modica",
        "Region": "Sicilia",
        "Province": "Ragusa",
        "Population": "53,633.00"
    },
    {
        "Abbreviation": "PE",
        "Name": "Montesilvano",
        "Region": "Abruzzo",
        "Province": "Pescara",
        "Population": "53,166.00"
    },
    {
        "Abbreviation": "NA",
        "Name": "Portici",
        "Region": "Campania",
        "Province": "Napoli",
        "Population": "53,074.00"
    },
    {
        "Abbreviation": "PA",
        "Name": "Bagheria",
        "Region": "Sicilia",
        "Province": "Palermo",
        "Population": "53,002.00"
    },
    {
        "Abbreviation": "ROMA",
        "Name": "Velletri",
        "Region": "Lazio",
        "Province": "Roma",
        "Population": "52,911.00"
    },
    {
        "Abbreviation": "ROMA",
        "Name": "Anzio",
        "Region": "Lazio",
        "Province": "Roma",
        "Population": "52,409.00"
    },
    {
        "Abbreviation": "IM",
        "Name": "Sanremo",
        "Region": "Liguria",
        "Province": "Imperia",
        "Population": "52,221.00"
    },
    {
        "Abbreviation": "BA",
        "Name": "Bitonto",
        "Region": "Puglia",
        "Province": "Bari",
        "Population": "52,093.00"
    },
    {
        "Abbreviation": "ROMA",
        "Name": "Civitavecchia",
        "Region": "Lazio",
        "Province": "Roma",
        "Population": "51,466.00"
    },
    {
        "Abbreviation": "NA",
        "Name": "Ercolano",
        "Region": "Campania",
        "Province": "Napoli",
        "Population": "51,200.00"
    },
    {
        "Abbreviation": "CE",
        "Name": "Aversa",
        "Region": "Campania",
        "Province": "Caserta",
        "Population": "51,115.00"
    },
    {
        "Abbreviation": "CT",
        "Name": "Acireale",
        "Region": "Sicilia",
        "Province": "Catania",
        "Population": "50,761.00"
    },
    {
        "Abbreviation": "SA",
        "Name": "Cava de' Tirreni",
        "Region": "Campania",
        "Province": "Salerno",
        "Population": "50,544.00"
    },
    {
        "Abbreviation": "FI",
        "Name": "Scandicci",
        "Region": "Toscana",
        "Province": "Firenze",
        "Population": "50,402.00"
    },
    {
        "Abbreviation": "SA",
        "Name": "Battipaglia",
        "Region": "Campania",
        "Province": "Salerno",
        "Population": "50,234.00"
    },
    {
        "Abbreviation": "TP",
        "Name": "Mazara del Vallo",
        "Region": "Sicilia",
        "Province": "Trapani",
        "Population": "50,006.00"
    },
    {
        "Abbreviation": "LE",
        "Name": "Gallipoli",
        "Region": "Puglia",
        "Province": "Lecce",
        "Population": "20,678.00"
    },
    {
        "Abbreviation": "VV",
        "Name": "Tropea",
        "Region": "Calabria",
        "Province": "Vibo Valentia",
        "Population": "6,362.00"
    },
    {
        "Abbreviation": "RN",
        "Name": "Riccione",
        "Region": "Emilia-Romagna",
        "Province": "Rimini",
        "Population": "34,965.00"
    },
    {
        "Abbreviation": "SS",
        "Name": "Alghero",
        "Region": "Sardegna",
        "Province": "Sassari",
        "Population": "40,965.00"
    },
    {
        "Abbreviation": "SR",
        "Name": "Avola",
        "Region": "Sicilia",
        "Province": "Siracusa",
        "Population": "31,576.00"
    }
]

createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
  }).listen(8080);


const fs = require("fs");
const https = require("https");
  
fetchData()


function fetchData(){
  for (var i=0; i<1; i++){
      let listingUrl=
      'https://www.agoda.com/en-gb/search?guid=98ff4e2e-c4e4-4642-89ce-d4cc30c69e64&asq=YnnBJqKXujBrtlIHQGL5Z5ufa9Vwpz6XltTHq4n%2B9gOlyfK1ox2axJ%2FxHovoN6BETaf5QLlajbCPAVpdb2UBrHGSweWZrQk6OviJrjdCYMZGU3L%2B%2Bx9OLK4x7uvjNzvIhjtxPlKr6IBg244BbYOe1G0t3c82nJ%2Fp%2B0GXkwK5hQ9k6cH9oeNd%2BaOINw0LroiUvgawC72E%2Fg6AmMquXoXaKeL2AUnfOhFRTEDVteJxPyI%3D&city=1862&tick=638008656480&locale=en-gb&ckuid=dd27a639-1927-49e4-817c-2ed8ee61d27e&prid=0&currency=EUR&correlationId=60d780a8-ec5b-4273-8fbc-80359570d390&pageTypeId=1&realLanguageId=16&languageId=1&origin=IT&cid=1720055&userId=dd27a639-1927-49e4-817c-2ed8ee61d27e&whitelabelid=1&loginLvl=0&storefrontId=3&currencyId=1&currencyCode=EUR&htmlLanguage=en-gb&cultureInfoName=en-gb&machineName=user-55474dd4c5-c9m5n&trafficGroupId=1&sessionId=nwagycqdbjafbifs5gcgg2h0&trafficSubGroupId=212&aid=130589&useFullPageLogin=true&cttp=4&isRealUser=true&mode=production&checkIn=2023-04-01&checkOut=2023-04-30&rooms=1&adults=1&children=0&priceCur=EUR&los=29&'+
      'textToSearch='+dataset[i].Name+'&travellerType=0&familyMode=off'
      console.log(listingUrl)
      https.get(listingUrl, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(data) {
            //console.log(data)
            })
    })
  }
}



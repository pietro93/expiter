export function setSideBar(province){
  let sb="";
  
  province?sb=
  '<p class="menu-label">Province Overview</p>'+
  '<ul class="menu-list">'+
  '<li><a href="https://expiter.com/province/'+handle(province.Name)+'/">'+en(province.Name)+' Province Overview</a></li>'+
  '<li><a href="http://expiter.com/comuni/province-of-'+handle(province.Name)+'/">Municipalities in '+en(province.Name)+'</a></li>'+
  '<li><a href="https://expiter.com/app/?sort=Name&region='+handle(province.Region,1)+'">Provinces in '+en(province.Region)+'</a></li>'+
  '</ul>'+
  '<p class="menu-label">Get Inspired</p>'+
  '<ul class="menu-list">'+
  '<li><a href="https://expiter.com/"><b>Province Comparison Tool</b></a></li>'+
  '<li><a href="https://expiter.com/app/?sort=Expat-friendly&region='+handle(province.Region,1)+'">Best Places to Live in '+en(province.Region)+'</a></li>'+
  '<li><a href="https://expiter.com/app/?sort=Cheapest&region='+handle(province.Region,1)+'">Cheapest Provinces in '+en(province.Region)+'</a></li>'+
  '<li><a href="https://expiter.com/app/?sort=Climate&region='+handle(province.Region,1)+'">Provinces in '+en(province.Region)+' with the best climate</a></li>'+
  '<li><a href="https://expiter.com/app/?sort=Safety&region='+handle(province.Region,1)+'">Safest provinces in '+en(province.Region)+'</a></li>'+
  '</ul>'
  :sb=
  '<p class="menu-label">Start Here</p>'+
  '<ul class="menu-list">'+
  '<li><a href="https://expiter.com/resources/">Italy Expat Resources</a></li>'+
  '<li><a href="https://expiter.com/tools/codice-fiscale-generator/">Codice Fiscale Generator</a></li>'+
  '<li><a href="https://expiter.com/region/regions-of-italy/">Regions of Italy</a></li>'+
'</ul>'+
'<p class="menu-label">Get Inspired</p>'+
'<ul class="menu-list">'+
'<li><a href="https://expiter.com/"><b>Province Comparison Tool</b></a></li>'+
'<li><a href="https://expiter.com/app/?sort=Cheapest&region=All">Cheapest Italian Provinces</a></li>'+
'<li><a href="https://expiter.com/app/?sort=SunshineHours&region=North">Sunniest Provinces in Northern Italy</a></li>'+
'<li><a href="https://expiter.com/app/?sort=Expat-friendly&region=South">Best Places to Live in Souhtern Italy</a></li>'+
'<li><a href="https://expiter.com/app/?sort=DN-friendly&region=All">Best Digital Nomad Destinations in Italy</a></li>'+
'</ul>'

sb+='<br>'+
  '<p class="menu-label">'+
  'About</p>'+
  '<p class="about">Expiter is a data visualization tool for researching and comparing different quality of life factors in Italian cities and provinces.'+
  '<br><br>We provide valuable information for expats, exchange students, full-time travelers, remote workers and digital nomads who are living in (or planning to move to) Italy. </p>'+
  '<br>'+
  '<p class="menu-label">Disclaimer</p>'+
'<p class="disclaimer">The information on this website is for educational purposes only. We collect data from different sources including internal surveys and publicly available databases from external sources.<br><br>'+
'Expiter.com does not endorse or guarantee the accuracy, reliability, or completeness of any products, services, or information mentioned on this website.'+
'  <br><br>Expiter.com participates in affiliate programs, including the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.<br><br>'+
 'This means that we may earn a commission if you click on or purchase products through our links, at no extra cost to you. </p><br><br>'

 return sb
}

export function setNavBar($){
    $("#navbar").append(
    '<div class="navbar-container">'+
    '<input type="checkbox" name="navbar" id="nbar">'+
    '<div class="hamburger-lines">'+
        '<span class="line line1"></span>'+
        '<span class="line line2"></span>'+
        '<span class="line line3"></span>'+
    '</div>'+
    '<ul class="menu-items">'+
        '<li><a href="/">Home</a></li>'+
        '<li><a href="https://expiter.com/resources/">Resources</a></li>'+
        '<li><a href="https://expiter.com/tools/codice-fiscale-generator/">Tools</a></li>'+
        '<li><a href="https://expiter.com/blog/articles/">Blog</a></li>'+
        '<li><a href="https://expiter.com/app/#About">About</a></li>'+
        '<li><a href="https://forms.gle/WiivbZg8336TmeUPA" target="_blank">Take Survey</a></li>'+
        '</ul>'+
        '  <label class="switch" id="switch">'+
        '<input type="checkbox">'+
        '<span class="slider round"></span>'+
      '</label>'+
   '<a href="/"><div class="logo">Italy Expats & Nomads</div></a>'+
  '</div>')
  }
  

export function setNavBarIT($){
    $("#navbar").append(
    '<div class="navbar-container">'+
    '<input type="checkbox" name="navbar" id="nbar">'+
    '<div class="hamburger-lines">'+
        '<span class="line line1"></span>'+
        '<span class="line line2"></span>'+
        '<span class="line line3"></span>'+
    '</div>'+
    '<ul class="menu-items">'+
        '<li><a href="https://expiter.com/it/">Home</a></li>'+
        '<li><a href="https://expiter.com/it/risorse/generatore-codice-fiscale/">Generatore Codice Fiscale</a></li>'+
        '<li><a href="https://expiter.com/it/blog/articoli/">Blog</a></li>'+
        '<li><a href="https://expiter.com/it/app/#About">About</a></li>'+
        '</ul>'+
        '  <label class="switch" id="switch">'+
        '<input type="checkbox">'+
        '<span class="slider round"></span>'+
      '</label>'+
   '<a href="/"><div class="logo">Italy Expats & Nomads</div></a>'+
  '</div>')
  }

  export function setNavBarFR($){
    $("#navbar").append(
    '<div class="navbar-container">'+
    '<input type="checkbox" name="navbar" id="nbar">'+
    '<div class="hamburger-lines">'+
        '<span class="line line1"></span>'+
        '<span class="line line2"></span>'+

    '</div>'+
    '<ul class="menu-items">'+
        '<li><a href="https://expiter.com/fr/">Home</a></li>'+
        '<li><a href="https://expiter.com/fr/ressources/generateur-codice-fiscale/">Generateur Code Fiscal</a></li>'+
        '<li><a href="https://expiter.com/fr/blog/articles/">Blog</a></li>'+
        '<li><a href="https://expiter.com/fr/app/#About">About</a></li>'+
        '</ul>'+
        '  <label class="switch" id="switch">'+
        '<input type="checkbox">'+
        '<span class="slider round"></span>'+
      '</label>'+
   '<a href="/"><div class="logo">Italy Expats & Nomads</div></a>'+
  '</div>')
  }

  export function setNavBarDE($) {
    $("#navbar").append(
        '<div class="navbar-container">' +
        '<input type="checkbox" name="navbar" id="nbar">' +
        '<div class="hamburger-lines">' +
        '<span class="line line1"></span>' +
        '<span class="line line2"></span>' +
        '<span class="line line3"></span>' +
        '</div>' +
        '<ul class="menu-items">' +
        '<li><a href="https://expiter.com/de/">Startseite</a></li>' +
        '<li><a href="https://expiter.com/de/ressourcen/generateur-codice-fiscale/">Steuercode-Generator</a></li>' +
        '<li><a href="https://expiter.com/de/blog/artikel/">Blog</a></li>' +
        '<li><a href="https://expiter.com/de/app/#Über">Über uns</a></li>' +
        '</ul>' +
        '  <label class="switch" id="switch">' +
        '<input type="checkbox">' +
        '<span class="slider round"></span>' +
        '</label>' +
        '<a href="/"><div class="logo">Deutsche Expats & Nomaden</div></a>' +
        '</div>'
    )
}

  
  export 
  function fr(province) {
      // Use a switch case to handle the different cases
      switch (province) {
        // Provinces that change name from Italian to French and are still valid
        case "Agrigento":
          return "Agrigente";
        case "Alessandria":
          return "Alexandrie";
        case "Ancona":
          return "Ancône";
        case "Aosta":
          return "Aoste";
        case "Bolzano":
          return "Bozen";
        case "Caltanissetta":
          return "Caltanisetta";
        case "Catania":
          return "Catane";
        case "Como":
          return "Côme";
        case "Cremona":
          return "Crémone";
        case "Firenze":
          return "Florence";
        case "Forlì-Cesena":
          return "Forlì-Cesène";
        case "Frosinone":
          return "Frosinone";
        case "Genova":
          return "Gênes";
        case "Gorizia":
          return "Goritz";
        case "Livorno":
          return "Livourne";
        case "Lucca":
          return "Lucques";
        case "Mantova":
          return "Mantoue";
        case "Massa-Carrara":
          return "Massa-Carrare";
        case "Messina":
          return "Messine";
        case "Milano":
          return "Milan";
        case "Modena":
          return "Modène";
        case "Monza e Brianza":
          return "Monza et Brianza";
        case "Napoli":
          return "Naples";
        case "Novara":
          return "Novare";
        case "Padova":
          return "Padoue";
        case "Palermo":
          return "Palerme";
        case "Parma":
          return "Parme";
        case "Pavia":
          return "Pavie";
        case "Perugia":
          return "Pérouse";
        case "Pesaro e Urbino":
          return "Pesaro et Urbino";
        case "Piacenza":
          return "Plaisance";
        case "Pisa":
          return "Pise";
        case "Pistoia":
          return "Pistoia";
        case "Prato":
          return "Prato";
        case "Ragusa":
          return "Raguse";
        case "Ravenna":
          return "Ravenne";
        case "Reggio Calabria":
          return "Reggio de Calabre";
        case "Reggio Emilia":
          return "Reggio d'Émilie";
        case "Roma":
          return "Rome";
        case "Salerno":
          return "Salerne";
        case "Savona":
          return "Savone";
        case "Siena":
          return "Sienne";
        case "Siracusa":
          return "Syracuse";
        case "Taranto":
          return "Tarente";
        case "Torino":
          return "Turin";
        case "Treviso":
          return "Trévise";
        case "Udine":
          return "Udine";
        case "Varese":
          return "Varèse";
        case "Venezia":
          return "Venise";
        case "Verona":
          return "Vérone";
        case "Vicenza":
          return "Vicence";
        case "Viterbo":
          return "Viterbe";
        // Provinces that do not change name from Italian to French
        // Add Sud Sardegna province
        case "Sud Sardegna":
          return "Sud Sardaigne";
        // Regions that change name from Italian to French
        case "Abruzzo":
          return "Abruzzes";
        case "Basilicata":
          return "Basilicate";
        case "Calabria":
          return "Calabre";
        case "Campania":
          return "Campanie";
        case "Emilia-Romagna":
          return "Émilie-Romagne";
        case "Friuli-Venezia Giulia":
          return "Frioul-Vénétie julienne";
        case "Lazio":
          return "Latium";
        case "Liguria":
          return "Ligurie";
        case "Lombardia":
          return "Lombardie";
        case "Marche":
          return "Marches";
        case "Molise":
          return "Molise";
        case "Piemonte":
          return "Piémont";
        case "Puglia":
          return "Pouilles";
        case "Sardegna":
          return "Sardaigne";
        case "Sicilia":
          return "Sicile";
        case "Toscana":
          return "Toscane";
        case "Trentino-Alto Adige":
          return "Trentin-Haut-Adige";
        case "Umbria":
          return "Ombrie";
        case "Valle d'Aosta":
          return "Vallée d'Aoste";
        case "Veneto":
          return "Vénétie";
        default:
          // Return the same name
          return province;
      }
    }
    
export function de(name) {
      switch (name) {
          // Regions
          case "Piemonte":
              return "Piemont";
          case "Valle d'Aosta":
              return "Aostatal";
          case "Lombardia":
              return "Lombardei";
          case "Trentino-Alto Adige":
              return "Trentino-Südtirol";
          case "Friuli-Venezia Giulia":
              return "Friaul-Julisch Venetien";
          case "Veneto":
              return "Venetien";
          case "Liguria":
              return "Ligurien";
          case "Umbria":
              return "Umbrien";
          case "Marche":
              return "Marken";
          case "Lazio":
              return "Latium";
          case "Abruzzo":
              return "Abruzzen";
          case "Campania":
              return "Kampanien";
          case "Puglia":
              return "Apulien";
          case "Basilicata":
              return "Basilikata";
          case "Calabria":
              return "Kalabrien";
          case "Sicilia":
              return "Sizilien";
          case "Sardegna":
              return "Sardinien";
  
          // Provinces
          case "Agrigento":
              return "Agrigent";
          case "Bolzano":
              return "Bozen";
          case "Firenze":
              return "Florenz";
          case "Genova":
              return "Genua";
          case "Milano":
              return "Mailand";
          case "Napoli":
              return "Neapel";
          case "Roma":
              return "Rom";
          case "Torino":
              return "Turin";
          case "Trento":
              return "Trient";
          case "Trieste":
              return "Triest";
          case "Venezia":
              return "Venedig";
          case "Siracusa":
              return "Syrakus";
          case "Gorizia":
              return "Görz";
          case "Monza und Brianza":
              return "Monza und Brianza";
          case "Padova":
              return "Padua";
          case "Mantova":
              return "Mantua";
          case "Taranto":
              return "Tarent";
  
          default:
              return name; 
      }
  }
  
  export function handle(str,isUpperCase) {
    // Convert to lowercase
    !isUpperCase?
    str = str.toLowerCase():""

    // Replace spaces with hyphens
    str = str.replace(/ /g, '-');
    str = str.replace(/'/g, '-');

    // Remove non-alphanumeric characters (except hyphens)
    str = str.replace(/[^a-zA-Z0-9-]/g, '');

    return str;
}

function en(word){
  switch (word){
    case "Sicilia":return"Sicily";case "Valle d'Aosta":case "Val d'Aosta":return"Aosta Valley";
    case "Toscana":return"Tuscany";case "Sardegna":return "Sardinia";
    case "Milano":return"Milan";case "Lombardia":return "Lombardy";
    case "Torino":return"Turin";case "Piemonte":return "Piedmont";
    case "Roma":return"Rome";case "Puglia":return "Apulia";
    case "Mantova":return"Mantua";case "Padova":return"Padua";
    case "Venezia":return"Venice";case "Firenze":return"Florence";
    case "Napoli":return"Naples";case "Genova":return"Genoa";
    default: return word;
  }
}
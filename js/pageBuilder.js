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
'<p class="menu-label">Experience</p>'+
'<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>'

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

export function setSideBarIT(province){
  let sb="";
  
  province?sb=
  '<p class="menu-label">Panoramica</p>'+
  '<ul class="menu-list">'+
  '<li><a href="https://expiter.com/it/province/'+handle(province.Name)+'/">Provincia di '+province.Name+'</a></li>'+
  '<li><a href="http://expiter.com/it/comuni/provincia-di-'+handle(province.Name)+'/">Comuni in Provincia di '+province.Name+'</a></li>'+
  '<li><a href="https://expiter.com/it/app/?sort=Name&region='+handle(province.Region,1)+'">Province in '+province.Region+'</a></li>'+
  '</ul>'+
  '<p class="menu-label">Lasciati ispirare</p>'+
  '<ul class="menu-list">'+
  '<li><a href="https://expiter.com/it/"><b>Strumento di Confronto tra Province</b></a></li>'+
  '<li><a href="https://expiter.com/it/app/?sort=Expat-friendly&region='+handle(province.Region,1)+'">I migliori posti dove vivere in '+province.Region+'</a></li>'+
  '<li><a href="https://expiter.com/it/app/?sort=Cheapest&region='+handle(province.Region,1)+'">Le province più economiche in '+province.Region+'</a></li>'+
  '<li><a href="https://expiter.com/it/app/?sort=Climate&region='+handle(province.Region,1)+'">Province in '+province.Region+' con il miglior clima</a></li>'+
  '<li><a href="https://expiter.com/it/app/?sort=Safety&region='+handle(province.Region,1)+'">Le province più sicure in '+province.Region+'</a></li>'+
  '</ul>'
  :sb=
  '<p class="menu-label">Inizia qui</p>'+
  '<ul class="menu-list">'+
  '<li><a href="https://expiter.com/it/risorse/">Risorse per Espatriati</a></li>'+
  '<li><a href="https://expiter.com/it/risorse/generatore-codice-fiscale/">Generatore di Codice Fiscale</a></li>'+
  '<li><a href="https://expiter.com/it/regioni/regioni-italiane/">Regioni d\'Italia</a></li>'+
'</ul>'+
'<p class="menu-label">Lasciati ispirare</p>'+
'<ul class="menu-list">'+
'<li><a href="https://expiter.com/it/"><b>Confronto Province</b></a></li>'+
'<li><a href="https://expiter.com/it/app/?sort=Cheapest&region=All">Le province italiane più economiche</a></li>'+
'<li><a href="https://expiter.com/it/app/?sort=SunshineHours&region=North">Le province più soleggiate del Nord Italia</a></li>'+
'<li><a href="https://expiter.com/it/app/?sort=Expat-friendly&region=South">I migliori posti dove vivere nel Sud Italia</a></li>'+
'<li><a href="https://expiter.com/it/app/?sort=DN-friendly&region=All">Le migliori destinazioni per i Nomadi Digitali in Italia</a></li>'+
'</ul>'

sb+='<br>'+
'<p class="menu-label">Esperienze</p>'+
'<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>'

sb+='<br>'+
  '<p class="menu-label">'+
  'Informazioni</p>'+
  '<p class="about">Expiter è uno strumento di visualizzazione dei dati per la ricerca e il confronto di diversi fattori di qualità della vita nelle città e province italiane.'+
  '<br><br>Forniamo informazioni preziose per espatriati, studenti in scambio, viaggiatori a tempo pieno, lavoratori remoti e nomadi digitali che vivono in (o stanno pianificando di trasferirsi in) Italia. </p>'+
  '<br>'+
  '<p class="menu-label">Disclaimer</p>'+
'<p class="disclaimer">Le informazioni su questo sito web sono solo a scopo educativo. Raccogliamo dati da diverse fonti, compresi sondaggi interni e database pubblicamente disponibili da fonti esterne.<br><br>'+
'Expiter.com non garantisce l\'accuratezza, l\'affidabilità o l\'integrità di qualsiasi prodotto, servizio o informazione menzionata su questo sito web.'+
'  <br><br>Expiter.com partecipa a programmi di affiliazione, tra cui il programma di affiliazione Amazon Services LLC, un programma di pubblicità di affiliazione progettato per fornire un mezzo per i siti di guadagnare commissioni pubblicitarie pubblicizzando e collegando ad Amazon.<br><br>'+
 'Ciò significa che potremmo guadagnare una commissione se fai clic su o acquisti prodotti attraverso i nostri link, senza alcun costo aggiuntivo per te. </p><br><br>'

 return sb
}

export function setSideBarDE(province) {
  let sb = "";

  province?sb =
        '<p class="menu-label">Überblick</p>' +
        '<ul class="menu-list">' +
        '<li><a href="https://expiter.com/de/provinz/' +
        handle(de(province.Name)) +
        '/">Provinz ' +
        de(province.Name) +
        '</a></li>' +
        '<li><a href="http://expiter.com/de/gemeinden/provinz-' +
        handle(de(province.Name)) +
        '/">Gemeinden in der Provinz ' +
        de(province.Name) +
        '</a></li>' +
        '<li><a href="https://expiter.com/de/app/?sort=Name&region=' +
        handle(province.Region, 1) +
        '">Provinzen in ' +
        de(province.Region) +
        '</a></li>' +
        '</ul>' +
        '<p class="menu-label">Lass dich inspirieren</p>' +
        '<ul class="menu-list">' +
        '<li><a href="https://expiter.com/de/"><b>Vergleichstool für Provinzen</b></a></li>' +
        '<li><a href="https://expiter.com/de/app/?sort=Expat-friendly&region=' +
        handle(province.Region, 1) +
        '">Die besten Orte zum Leben in ' +
        de(province.Region) +
        '</a></li>' +
        '<li><a href="https://expiter.com/de/app/?sort=Cheapest&region=' +
        handle(province.Region, 1) +
        '">Die günstigsten Provinzen in ' +
        de(province.Region) +
        '</a></li>' +
        '<li><a href="https://expiter.com/de/app/?sort=Climate&region=' +
        handle(province.Region, 1) +
        '">Provinzen in ' +
        de(province.Region) +
        ' mit dem besten Klima</a></li>' +
        '<li><a href="https://expiter.com/de/app/?sort=Safety&region=' +
        handle(province.Region, 1) +
        '">Die sichersten Provinzen in ' +
        de(province.Region) +
        '</a></li>' +
        '</ul>'
    : sb =
        '<p class="menu-label">Hier geht\'s los</p>' +
        '<ul class="menu-list">' +
        '<li><a href="https://expiter.com/de/ressourcen/">Ressourcen für Expatriates</a></li>' +
        '<li><a href="https://expiter.com/de/ressourcen/steuernummer-generieren//">Italienische Steuernummer Generieren</a></li>' +
        '<li><a href="https://expiter.com/de/regionen/italienische-regionen/">Regionen d\'Italia</a></li>' +
        '</ul>' +
        '<p class="menu-label">Lass dich inspirieren</p>' +
        '<ul class="menu-list">' +
        '<li><a href="https://expiter.com/de/"><b>Vergleich der Provinzen</b></a></li>' +
        '<li><a href="https://expiter.com/de/app/?sort=Cheapest&region=All">Die günstigsten italienischen Provinzen</a></li>' +
        '<li><a href="https://expiter.com/de/app/?sort=SunshineHours&region=North">Die sonnigsten Provinzen Norditaliens</a></li>' +
        '<li><a href="https://expiter.com/de/app/?sort=Expat-friendly&region=South">Die besten Orte zum Leben im Süden Italiens</a></li>' +
        '<li><a href="https://expiter.com/de/app/?sort=DN-friendly&region=All">Die besten Ziele für digitale Nomaden in Italien</a></li>' +
        '</ul>';

        sb+='<br>'+
        '<p class="menu-label">Reiseerfahrungen</p>'+
        '<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>'
      
  sb +=
    '<br>' +
    '<p class="menu-label">' +
    'Informationen</p>' +
    '<p class="about">Expiter ist ein Datenvisualisierungstool zur Untersuchung und Vergleich verschiedener Lebensqualitätsfaktoren in italienischen Städten und Provinzen.' +
    '<br><br>Wir bieten wertvolle Informationen für Expatriates, Austauschstudenten, Vollzeitreisende, Fernarbeiter und digitale Nomaden, die in Italien leben (oder planen, dorthin zu ziehen).' +
    '</p>' +
    '<br>' +
    '<p class="menu-label">Haftungsausschluss</p>' +
    '<p class="disclaimer">Die Informationen auf dieser Website dienen nur zu Bildungszwecken. Wir sammeln Daten aus verschiedenen Quellen, einschließlich interner Umfragen und öffentlich verfügbarer Datenbanken von externen Quellen.' +
    '<br><br>' +
    'Expiter.com garantiert nicht die Genauigkeit, Zuverlässigkeit oder Integrität von Produkten, Dienstleistungen oder Informationen, die auf dieser Website erwähnt werden.' +
    '<br><br>' +
    'Expiter.com nimmt an Partnerprogrammen teil, einschließlich des Amazon Services LLC-Partnerprogramms, eines Partnerwerbeprogramms, das entwickelt wurde, um Mittel für Websites zu schaffen, um Werbegebühren zu verdienen, indem sie Werbung schalten und auf Amazon verlinken.' +
    '<br><br>' +
    'Das bedeutet, dass wir eine Provision verdienen können, wenn Sie auf unsere Links klicken oder Produkte über unsere Links kaufen, ohne dass Ihnen zusätzliche Kosten entstehen.' +
    '</p>' +
    '<br><br>';

  return sb;
}

export function setSideBarFR(province) {
  let sb = "";

  province ? sb =
        '<p class="menu-label">Aperçu</p>' +
        '<ul class="menu-list">' +
        '<li><a href="https://expiter.com/fr/province/' +
        handle(fr(province.Name)) +
        '/">Province de ' +
        fr(province.Name) +
        '</a></li>' +
        '<li><a href="http://expiter.com/fr/municipalites/province-de-' +
        handle(fr(province.Name)) +
        '/">Communes dans la province de ' +
        fr(province.Name) +
        '</a></li>' +
        '<li><a href="https://expiter.com/fr/app/?sort=Name&region=' +
        handle(fr(province.Region), 1) +
        '">Provinces en ' +
        fr(province.Region) +
        '</a></li>' +
        '</ul>' +
        '<p class="menu-label">Laissez-vous inspirer</p>' +
        '<ul class="menu-list">' +
        '<li><a href="https://expiter.com/fr/"><b>Outil de Comparaison des Provinces</b></a></li>' +
        '<li><a href="https://expiter.com/fr/app/?sort=Expat-friendly&region=' +
        handle(fr(province.Region), 1) +
        '">Les meilleurs endroits pour vivre en ' +
        fr(province.Region) +
        '</a></li>' +
        '<li><a href="https://expiter.com/fr/app/?sort=Cheapest&region=' +
        handle(fr(province.Region), 1) +
        '">Les provinces les moins chères en ' +
        fr(province.Region) +
        '</a></li>' +
        '<li><a href="https://expiter.com/fr/app/?sort=Climate&region=' +
        handle(fr(province.Region), 1) +
        '">Provinces en ' +
        fr(province.Region) +
        ' avec le meilleur climat</a></li>' +
        '<li><a href="https://expiter.com/fr/app/?sort=Safety&region=' +
        handle(fr(province.Region), 1) +
        '">Les provinces les plus sûres en ' +
        fr(province.Region) +
        '</a></li>' +
        '</ul>'
    : sb =
        '<p class="menu-label">Commencez ici</p>' +
        '<ul class="menu-list">' +
        '<li><a href="https://expiter.com/fr/ressources/">Ressources pour Expatriés</a></li>' +
        '<li><a href="https://expiter.com/fr/ressources/generateur-codice-fiscale//">Générateur de Code Fiscal Italien</a></li>' +
        '<li><a href="https://expiter.com/fr/regions/regions-italiennes/">Régions d\'Italie</a></li>' +
        '</ul>' +
        '<p class="menu-label">Laissez-vous inspirer</p>' +
        '<ul class="menu-list">' +
        '<li><a href="https://expiter.com/fr/"><b>Comparaison des Provinces</b></a></li>' +
        '<li><a href="https://expiter.com/fr/app/?sort=Cheapest&region=All">Les provinces italiennes les moins chères</a></li>' +
        '<li><a href="https://expiter.com/fr/app/?sort=SunshineHours&region=North">Les provinces les plus ensoleillées du Nord de l\'Italie</a></li>' +
        '<li><a href="https://expiter.com/fr/app/?sort=Expat-friendly&region=South">Les meilleurs endroits pour vivre dans le Sud de l\'Italie</a></li>' +
        '<li><a href="https://expiter.com/fr/app/?sort=DN-friendly&region=All">Les meilleures destinations pour les Nomades Digitaux en Italie</a></li>' +
        '</ul>';

        sb+='<br>'+
        '<p class="menu-label">Expériences</p>'+
        '<div data-gyg-widget="auto" data-gyg-partner-id="56T9R2T"></div>'

  sb +=
    '<br>' +
    '<p class="menu-label">' +
    'Informations</p>' +
    '<p class="about">Expiter est un outil de visualisation des données permettant d\'étudier et de comparer différents facteurs de qualité de vie dans les villes et provinces italiennes.' +
    '<br><br>Nous fournissons des informations précieuses pour les expatriés, les étudiants en échange, les voyageurs à plein temps, les télétravailleurs et les nomades numériques vivant en Italie (ou envisageant de s\'y installer).' +
    '</p>' +
    '<br>' +
    '<p class="menu-label">Clause de non-responsabilité</p>' +
    '<p class="disclaimer">Les informations sur ce site web sont fournies à des fins éducatives uniquement. Nous recueillons des données auprès de différentes sources, y compris des sondages internes et des bases de données disponibles publiquement à partir de sources externes.' +
    '<br><br>' +
    'Expiter.com ne garantit pas l\'exactitude, la fiabilité ou l\'intégrité de tout produit, service ou information mentionnés sur ce site web.' +
    '<br><br>' +
    'Expiter.com participe à des programmes d\'affiliation, y compris le programme d\'affiliation Amazon Services LLC, un programme de publicité d\'affiliation conçu pour fournir un moyen aux sites de gagner des frais de publicité en faisant de la publicité et en établissant un lien vers Amazon.' +
    '<br><br>' +
    'Cela signifie que nous pouvons gagner une commission si vous cliquez sur nos liens ou achetez des produits via nos liens, sans frais supplémentaires pour vous.' +
    '</p>' +
    '<br><br>';

  return sb;
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
        '<li><a href="https://expiter.com/it/risorse/">Risorse</a></li>'+
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
        '<li><a href="https://expiter.com/de/ressourcen/italianische-steuercode-generator/">Steuercode-Generator</a></li>' +
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
    // Replace accented characters with unaccented equivalents
    const accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ';
    const accentsOut = "AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuyNn";
    str = str.split('').map((letter, index) => {
        const accentIndex = accents.indexOf(letter);
        return accentIndex !== -1 ? accentsOut[accentIndex] : letter;
    }).join('');

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

export function addBreaks(inputString) {
  let sentences = inputString.split('. ');
  for (let i = 0; i < sentences.length - 1; i++) {
      if (sentences[i].length > 70 && sentences[i + 1].length > 50 && !sentences[i].endsWith('<br><br>') && !sentences[i + 1].startsWith('<br><br>')) {
          sentences[i] = sentences[i] + '.<br><br>';
      } else {
          sentences[i] = sentences[i] + '.';
      }
  }
  return sentences.join(' ');
}

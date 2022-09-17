var provinces = {};
var facts={};
var selection = [];
var region_filters = [];
var additionalFilters=[];
var dataset;
var avg;
var regions ={};

fetch('https://raw.githubusercontent.com/pietro93/italycities.github.io/main/dataset.json')
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        populateData(data);
        dataset = data;
        if (document.title=="Italy Expats and Nomads")
        filterDataByRegion("All")
        else 
        newPage()
    })
    .catch(function (err) {
        console.log('error: ' + err);
    });


function populateData(data){
      for (let i = 0; i < 107; i++) {
        let province = data[i];
        provinces[province["Name"]]=province;
        provinces[province["Name"]].index=i;
        facts[province["Name"]]={}; //initialize "facts" dictionary with each province
      }
      avg=data[107];
      for (let i = 108; i < data.length; i++) {
        let region = data[i];
        regions[region["Name"]]=region;
        regions[region["Name"]].index=i;
        facts[region["Name"]]={}; //initialize "facts" dictionary with each region
      }
    }

    function addToSelection(filter){
      for (province in provinces){
        if (provinces[province]["Region"]==filter)
        selection.push(provinces[province])
    }
  }


  function filterBy(additionalFilter){
 
    if (!additionalFilters.includes(additionalFilter)&&additionalFilter!=undefined)additionalFilters.push(additionalFilter)
    else if (additionalFilters.includes(additionalFilter))additionalFilters.splice(additionalFilters.indexOf(additionalFilter),1)
    
    filterDataByRegion();
  }

    function filterDataByRegion(filter){
      let regions = ["Abruzzo","Basilicata","Calabria","Campania","Emilia-Romagna","Friuli-Venezia Giulia","Lazio","Liguria","Lombardia","Marche","Molise",
      "Piemonte","Puglia","Sardegna","Sicilia","Toscana","Trentino-Alto Adige","Umbria","Valle d&#39;Aosta","Veneto"];
      let north=["Lombardia","Valle d'Aosta","Piemonte","Liguria","Trentino-Alto Adige", "Friuli-Venezia Giulia","Veneto","Emilia-Romagna"];
      let center=["Lazio","Toscana","Marche","Umbria"];
      let south=["Abruzzo","Molise","Campania","Puglia","Basilicata","Calabria","Sicilia","Sardegna"]

      selection=[];
      if (filter == "All") {
        selection=dataset.slice(0, 107); ;region_filters=north.concat(center).concat(south);
        $(".regionfilter:not(.selected)").toggleClass("selected");
        sortData(selection);
        return("")}
      else if (filter == "Clear"){
        $(".regionfilter.selected").toggleClass("selected");
        region_filters =[];
      }
      else if (filter=="North"){
        $(".regionfilter.selected").toggleClass("selected");
        region_filters =[];
        for (region in north){
            region_filters.push(north[region]);
     
        }
      }
      else if (filter=="Center"){
          $(".regionfilter.selected").toggleClass("selected");
          region_filters =[];
          for (region in center){
              region_filters.push(center[region]);
             
          }
        }
      else if (filter=="South"){
            $(".regionfilter.selected").toggleClass("selected");
            region_filters =[];
            for (region in south){
                region_filters.push(south[region]);
          
            }
      }
      else if (!region_filters.includes(filter)&&(filter!=undefined)){
        region_filters.push(filter);
        $("#"+filter.substring(0,3)).toggleClass("selected");
    }
      else if (region_filters.includes(filter)){
          region_filters.splice(region_filters.indexOf(filter),1);
          $("#"+filter.substring(0,3)).toggleClass("selected");
          
      }

      for (let i=0; i<region_filters.length; i++){
        addToSelection(region_filters[i]);
        $("#"+region_filters[i].substr(0,3)).addClass("selected")
      }

      if (additionalFilters.length!=0){
      let filtered_selection =[];
      for (filter in additionalFilters.sort()){
        
        if (additionalFilters[filter]=="Pop300k-")  filtered_selection=filtered_selection.concat(selection.filter((item) => (item.Population < 300000)))
        else if (additionalFilters[filter]=="Pop300k+") filtered_selection=filtered_selection.concat(selection.filter((item) => (item.Population >= 300000 && item.Population < 500000)))
        else if (additionalFilters[filter]=="Pop500k+")  filtered_selection=filtered_selection.concat(selection.filter((item) => (item.Population >= 500000 && item.Population < 1000000)))
        else if (additionalFilters[filter]=="Pop1m+")  filtered_selection=filtered_selection.concat(selection.filter((item) => (item.Population >= 1000000)))
        }
  
      selection = filtered_selection;
    }
      
      sortData(selection);

    }
  
   
  function getData(province){
    for (let i=0;i<dataset.length;i++){
      if (dataset[i].Name==province) return dataset[i];
    }
  }

  function dynamicSort(property) {
      var sortOrder = 1;
      if(property[0] === "-") {
          sortOrder = -1;
          property = property.substr(1);
      }
      return function (a,b) {
          /* next line works with strings and numbers, 
           * and you may want to customize it to your needs
           */
          var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
          return result * sortOrder;
      }
  }

    function sortData(selection){
      let sortBy = document.querySelector('input[name="sortBy"]:checked').value;
        if (sortBy=="Random"){
          data = selection.sort(() => Math.random() - 0.5);     
        }
        if (sortBy=="Name"||sortBy=="Region"||sortBy=="CostOfLiving"||sortBy=="Crime"){ //ascending order
          data = selection.sort(dynamicSort(sortBy))    
        }
        else {                                                        //descending order
          data = selection.sort(dynamicSort("-"+sortBy))
        }
        appendData(data);
        if (sortBy == "Name"){
          $("#sortBy").text("by Alphabetical Order");
        }
        else if (sortBy == "Random"){
          $("#sortBy").text("by Random Order");
        }
        else if (sortBy == "Region"){
          $("#sortBy").text("by Region");
        }
        else if (sortBy == "CostOfLiving"){
          $("#sortBy").text("");
          $("#bestorworst").text("Cheapest")
        }
        else if (sortBy == "Population"){
          $("#sortBy").text("by Population");
        }
        else if (sortBy == "MonthlyIncome"){
          $("#sortBy").text("by Average Income");
          $("#bestorworst").text("");
        }
        else if (sortBy == 'Expat-friendly' || sortBy == 'LGBT-friendly'){
          $("#sortBy").text("");
          $("#bestorworst").text("Most "+sortBy);
        }
        else if (sortBy == 'DN-friendly' || sortBy == 'Female-friendly'){
          $("#sortBy").text((sortBy=='DN-friendly'?"for Digital Nomads":"for Women"));
          $("#bestorworst").text("Best");
        }
        else if (sortBy == 'SunshineHours'){
          $("#sortBy").text("");
          $("#bestorworst").text("Sunniest");
        }
        else if (sortBy == 'HotDays'||sortBy=='ColdDays'){
          $("#sortBy").text("");
          $("#bestorworst").text((sortBy=='HotDays'?"Hottest":"Coldest"));
        }
        else if (sortBy == 'Safety'){
          $("#sortBy").text("");
          $("#bestorworst").text("Safest");
        }
        else if (sortBy == 'Crime'){
          $("#sortBy").text("by Lowest Amounts of Crime");
          $("#bestorworst").text("");
        }
        else $("#sortBy").text("for "+sortBy);
        if (sortBy == "Climate" || sortBy == "Healthcare" || sortBy == "Culture" || sortBy == "Nightlife" || sortBy == "Education"  ){
          $("#bestorworst").text("Best")
        }

    }

  
function qualityScore(quality,score){
  let expenses=["Cost of Living (Individual)","Cost of Living (Family)","Cost of Living (Nomad)", 
  "StudioRental", "BilocaleRent", "TrilocaleRent", "MonthlyIncome", 
  "StudioSale","BilocaleSale","TrilocaleSale"]
  console.log("checking "+quality+": for province is "+score+" for avg is "+avg[quality])
  if (quality=="CostOfLiving"||quality=="HousingCost"){
    if (score<avg[quality]*.8){return "<score class='excellent short'>cheap</score>"}
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>affordable</score>"}
    else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>average</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>high</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='poor max'>expensive</score>"}
  }
  else if (expenses.includes(quality)){
    if (score<avg[quality]*.8){return "<score class='green'>"+score+"€/m</score>"}
    else if (score>=avg[quality]*0.8&&score<avg[quality]*0.95){return "<score class='green'>"+score+"€/m</score>"}
    else if (score>=avg[quality]*0.95&&score<avg[quality]*1.05){return "<score class='orange'>"+score+"€/m</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='red'>"+score+"€/m</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='red'>"+score+"€/m</score>"}
  }
  else if (quality=="HotDays"||quality=="ColdDays"){ // high score = bad; low score = good
    if (score<avg[quality]*.8){return "<score class='excellent short'>not "+(quality=="HotDays"?"hot":"cold")+"</score>"}
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>not very "+(quality=="HotDays"?"hot":"cold")+"</score>"}
    else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>a bit "+(quality=="HotDays"?"hot":"cold")+"</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>"+(quality=="HotDays"?"hot":"cold")+"</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='poor max'>very "+(quality=="HotDays"?"hot":"cold")+"</score>"}
  }
  else if (quality=="RainyDays"){ // high score = bad; low score = good
    if (score<avg[quality]*.8){return "<score class='excellent short'>very little</score>"}
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>little</score>"}
    else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>average</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>rainy</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='poor max'>a lot</score>"}
  }
  else if (quality=="FoggyDays"){ // high score = bad; low score = good
    if (score<avg[quality]*.265){return "<score class='excellent short'>no fog</score>"}
    else if (score>=avg[quality]*.265&&score<avg[quality]*.6){return "<score class='great medium'>little</score>"}
    else if (score>=avg[quality]*.6&&score<avg[quality]*1.00){return "<score class='good medium'>average</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*3){return "<score class='average long'>foggy</score>"}
    else if (score>=avg[quality]*3){return "<score class='poor max'>a lot</score>"}
  }
  else if (quality=="Crime"||quality=="Traffic"){ // high score = bad; low score = good
    if (score<avg[quality]*.8){return "<score class='excellent short'>very low</score>"}
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>low</score>"}
    else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>average</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>high</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='poor max'>too much</score>"}
  }
  else{ // high score = good; low score = bad
    if (score<avg[quality]*.8){return "<score class='poor short'>poor</score>"}
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='average medium'>okay</score>"}
    else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>good</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='great long'>great</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='excellent max'>excellent</score>"}
  }
}



function doesImageExist(image)
{
/*var http = new XMLHttpRequest();
http.open('HEAD',image,false);
http.send();
return http.status!=404;*/return(true)
}

function clearData(){
  document.getElementById("app").innerHTML="";
}

function appendData(data) {
    clearData();
    let mainContainer = document.getElementById("app");

    let title = document.getElementById("title")
        
    title.innerHTML="<span id='bestorworst'></span> <span id='smallorlarge'></span> Provinces in <span id='chosenArea'>Italy</span> <span id='sortBy'></span>";



    if (selection.length==0) {title.innerHTML="Could not find any provinces based on your filters."}
    else if (region_filters.length==1) {$("#chosenArea").text(region_filters[0])}
    else if (region_filters.length==2) {$("#chosenArea").text(region_filters[0]+" and "+region_filters[1])}
    else if (region_filters.length==3) {$("#chosenArea").text(region_filters[0]+", "+region_filters[1]+" and "+region_filters[2])}
    else if (region_filters.sort().toString() == "Lazio,Marche,Toscana,Umbria") {$("#chosenArea").text("Central Italy")}
    else if (region_filters.sort().toString() == "Abruzzo,Basilicata,Calabria,Campania,Molise,Puglia,Sardegna,Sicilia") {$("#chosenArea").text("Southern Italy")}
    else if (region_filters.sort().toString() == "Emilia-Romagna,Friuli-Venezia Giulia,Liguria,Lombardia,Piemonte,Trentino-Alto Adige,Valle d'Aosta,Veneto") {$("#chosenArea").text("Northern Italy")}
    else if (region_filters.length>3) {$("#chosenArea").text("Italy")}

    if (additionalFilters.sort().toString()=="Pop1m+"||additionalFilters.sort().toString()=="Pop1m+,Pop500k+") $("#smallorlarge").text("Large");
    else if (additionalFilters.sort().toString()=="Pop300k+"||additionalFilters.sort().toString()=="Pop500k+"||additionalFilters.sort().toString()=="Pop300k+,Pop500k+") $("#smallorlarge").text("Medium-sized");
    else if (additionalFilters.sort().toString()=="Pop300k-"||additionalFilters.sort().toString()=="Pop300k+,Pop300k-") $("#smallorlarge").text("Small");
     

    for (let i = 0; i < data.length; i++) {
        let card = document.createElement("card");
        let col = document.createElement("div");

        
        if (data[i].Name.length>14){card.innerHTML = '<div class="frame"><center><h3 class="header" style="font-size:24px" >' + data[i].Name + '</h3> '}
        else card.innerHTML = '<div class="frame"><center><h3 class="header">' + data[i].Name + '</h3> ';
        card.innerHTML += '<p class="region">' + data[i]["Region"];
        card.innerHTML += '<p class="population">👥Population: <b style="color:white">'+data[i].Population.toLocaleString('en', {useGrouping:true}) +'</b>';
        card.innerHTML += '<p>💸Cost: '+ qualityScore("CostOfLiving",data[i].CostOfLiving) +'';
        card.innerHTML += '<p>💰Expenses: '+ qualityScore("Cost of Living (Individual)",data[i]["Cost of Living (Individual)"])+'';
        card.innerHTML += '<p>☀️Climate: '+ qualityScore("Climate",data[i].Climate) +'';
        card.innerHTML += '<p>🚑Healthcare: '+ qualityScore("Healthcare",data[i].Healthcare) +'';
        card.innerHTML += '<p>🚌Transport: '+ qualityScore("PublicTransport",data[i]["PublicTransport"]) +'';
        card.innerHTML += '<p>👮🏽‍♀️Safety: '+ qualityScore("Safety",data[i]["Safety"]) +'';
        card.innerHTML += '<p>📚Education: '+ qualityScore("Education",data[i]["Education"]) +'';
        card.innerHTML += '<p>🏛️Culture: '+ qualityScore("Culture",data[i].Culture) +'';
        card.innerHTML += '<p>🍸Nightlife: '+ qualityScore("Nightlife",data[i].Nightlife) +'';
        card.innerHTML += '<p class="opacity6">⚽Recreation: '+ qualityScore("Sports & Leisure",data[i]["Sports & Leisure"])+'';
        card.innerHTML += '<p class="opacity6">🍃Air quality: '+ qualityScore("AirQuality",data[i]["AirQuality"]) +'';
        card.innerHTML += '<p class="opacity6">🏳️‍🌈LGBTQ+: '+ qualityScore("LGBT-friendly",data[i]["LGBT-friendly"]) +'';
        card.innerHTML += '<p class="opacity4">👩For women: '+ qualityScore("Female-friendly",data[i]["Female-friendly"]) +'';
        card.innerHTML += '<p class="opacity4">👪For family: '+ qualityScore("Family-friendly",data[i]["Family-friendly"]) +'';
        card.innerHTML += '<p class="opacity4">🥗For vegans: '+ qualityScore("Veg-friendly",data[i]["Veg-friendly"]) +'';
        card.innerHTML += '<p class="opacity4">🧳For nomads: '+ qualityScore("DN-friendly",data[i]["DN-friendly"]) +'';
        card.innerHTML += '<button class="more" style="font-size:large;" onclick="location.href=\'./province/'+data[i].Name+'.html\';"> More>> </button>';
        col.classList = 'column';
        card.classList = data[i].Region + ' paracard ';
        let image = 'img/'+data[i].Abbreviation+'.webp';
        card.title=data[i].Name+', '+data[i].Region;
        card.style.backgroundImage = 'url('+image+')';
        card.id = data[i].Name;
        col.innerHTML = card.outerHTML;
        mainContainer.appendChild(col);
    }
    
}

 $(document).ready(function(){
  setNavBar();
  if (!!document.getElementById("filters")){
  let filters = document.getElementById("filters");
  let regions = ["Abruzzo","Basilicata","Calabria","Campania","Emilia-Romagna","Friuli-Venezia Giulia","Lazio","Liguria","Lombardia","Marche","Molise",
  "Piemonte","Puglia","Sardegna","Sicilia","Toscana","Trentino-Alto Adige","Umbria","Valle d&#39;Aosta","Veneto"];
for (i=0;i<regions.length;i++){
if (i==0){
  row = document.createElement("row");
  row.classList="columns is-multiline is-mobile";
  row.innerHTML+='<p class="column is-12">Filter by region:</p>'
  row.innerHTML+='<button class="button column clearfilter" title="Clear Selection" onClick=\'filterDataByRegion('+"\""+"Clear"+"\")"+'\'>'+"🧹Clear"+"</button>";
  row.innerHTML+='<button class="button column allfilter" title="Select All" onClick=\'filterDataByRegion('+"\""+"All"+"\")"+'\'>'+"➕All"+"</button>";
  row.innerHTML+='<button class="button column specialfilter" id="North" onClick=\'filterDataByRegion('+"\""+'North'+"\");$(this).toggleClass(\"selected\")"+'\'>'+'🍹🏔️North'+"</button>";
  row.innerHTML+='<button class="button column specialfilter" id="Center" onClick=\'filterDataByRegion('+"\""+'Center'+"\");$(this).toggleClass(\"selected\")"+'\'>'+'🍷🏛️Center'+"</button>";
  row.innerHTML+='<button class="button column specialfilter" id="South" onClick=\'filterDataByRegion('+"\""+'South'+"\");$(this).toggleClass(\"selected\")"+'\'>'+'🍕🏖️South'+"</button>";
  row.innerHTML+='<p class="column is-12"></p>'
  row.id="regionfilters";
}
row.innerHTML+='<button class="button column regionfilter" id="'+regions[i].substring(0,3)+'" onClick=\'filterDataByRegion('+"\""+regions[i]+"\");"+'\'>'+regions[i]+"</button>";
}
  filters.append(row);

  row = document.createElement("row");
  row.classList="columns is-multiline is-mobile";
  row.innerHTML+='<p class="column is-12">Additional filters:</p>';
  row.innerHTML+='<button class="button column additionalfilter" onClick=\'filterBy("Pop300k-");$(this).toggleClass("selected")\'>'+"Population < 300k"+"</button>";
  row.innerHTML+='<button class="button column additionalfilter" onClick=\'filterBy("Pop300k+");$(this).toggleClass("selected")\'>'+"Population 300k-500k"+"</button>";
  row.innerHTML+='<button class="button column additionalfilter" onClick=\'filterBy("Pop500k+");$(this).toggleClass("selected")\'>'+"Population 500k-1m"+"</button>";
  row.innerHTML+='<button class="button column additionalfilter" onClick=\'filterBy("Pop1m+");$(this).toggleClass("selected")\'>'+"Population > 1m"+"</button>"; 
  row.id="additionalfilters"
  filters.append(row)
  
  createSorting("Expat-friendly");
  createSorting("A-Z","Name");
  createSorting("Random");createSorting("Region");createSorting("Population");createSorting("Climate");
  createSorting("Cost","CostOfLiving");createSorting("Safety");createSorting("Lack of Crime","Crime");createSorting("Nightlife");createSorting("Education");
  createSorting("Sunshine","SunshineHours");createSorting("Hot","HotDays");createSorting("Cold","ColdDays");
  createSorting("Nomad-friendly","DN-friendly");createSorting("LGBTQ+-friendly","LGBT-friendly");createSorting("Women-friendly","Female-friendly");
  createSorting("Family-friendly");createSorting("Vegan-friendly","Veg-friendly");createSorting("Pop. Density","Density");
  filterBy();
}

}

);


function newPage(){
  let province = getData(document.title.split(" - ")[0])
  let info = getInfo(province)

  appendProvinceData(province);
 

  $(".title").text(province.Name+' for Expats and Nomads');
  $("#overview").append(info.overview)
  $("#CoL").append(info.CoL)
  $("#climate").append(info.climate)
  $("#lgbtq").append(info.lgbtq)
  $("#leisure").append(info.leisure)
  $("#healthcare").append(info.healthcare)
  $("#crimeandsafety").append(info.crimeandsafety)
  $("#education").append(info.education)
  $("#transport").append(info.transport)
 }
 

 
function getInfo(province){

  populateFacts();

  let ratio = (province.Men/(Math.min(province.Men,province.Women))).toFixed(2)+":"+(province.Women/(Math.min(province.Men,province.Women))).toFixed(2)
  let name=province.Name;
  let region=regions[province.Region];

  let info = {}
  info.overview="The province of "+province.Name+" is the <b>"+province.SizeByPopulation+(province.SizeByPopulation%10==1?"st":(province.SizeByPopulation%10==2?"nd":province.SizeByPopulation%10==3?"rd":"th"))+" largest Italian province by population</b> with <b>"+province.Population.toLocaleString()+" people</b>, located in the <b>"+province.Region+"</b> region. "+
  (facts[name].overview?facts[name].overview:"")+
  "</br></br>"+
  "The larger "+province.Name+" metropolitan area comprises <b>"+province.Towns+" towns</b> (comuni) and covers an area of "+province.Size.toLocaleString()+" km<sup>2</sup>. "
  +"The <b>population density is "+province.Density+" inhabitants per km<sup>2</sup></b>, making it "+
  (province.Density<100?"sparcely populated.":(province.Density>500?"highly densely populated." : "somewhat densely populated."))+
  " The male to female ratio is "+ratio+"."

  info.CoL="The <b>average monthly income in "+province.Name+" is around "+province.MonthlyIncome+"€</b>, which is "+
  (province.MonthlyIncome>1500&&province.MonthlyIncome<1800?"close to the average for Italy":(province.MonthlyIncome>=1800?"<b class='green'>higher than the average</b> for Italy":"<b class='red'>lower than the average</b> for Italy"))+"."+
  "</br></br>"+
  "The estimated cost of living is around "+province["Cost of Living (Individual)"]+"€ per month for an individual or "+province["Cost of Living (Family)"]+"€ per month for a family of 4. The cost for renting "+
  "a small apartment (2-3 bedrooms) in a main city area is around "+province["MonthlyRental"]+"€ per month."+"</br></br>"+
  "Overall, "+(province["Cost of Living (Individual)"]>avg["Cost of Living (Individual)"]?"<b class='red'>"+province.Name+" is expensive":(province["Cost of Living (Individual)"]<1150?"<b class='green'>"+province.Name+" is cheap":"<b class='green'>"+province.Name+" is affordable"))+"</b> compared to other Italian provinces."
  +" Living in "+province.Name+" is around "+(province['Cost of Living (Individual)']>avg["Cost of Living (Individual)"]?"<b class='red'>"+(province['Cost of Living (Individual)']/avg["Cost of Living (Individual)"]*100-100).toFixed(2)+"% more expensive than the average</b> of all Italian provinces":"<b class='green'>"+(100-province['Cost of Living (Individual)']/avg["Cost of Living (Individual)"]*100).toFixed(2)+"% cheaper than the average</b> of all Italian provinces")
  +"."

  info.climate="The province of "+province.Name+" receives on average <b>"+province.SunshineHours+" hours of sunshine</b> per month, or "+province.SunshineHours/30+" hours of sunshine per day."+
  " This is "+(province.SunshineHours>236?"<b class='green'>"+(province.SunshineHours/236*100-100).toFixed(2)+"% more</b> than the average for Italy":"<b class='red'>"+(100-(province.SunshineHours/236)*100).toFixed(2)+"% less</b> than the average for Italy")+" and "+
  (province.SunshineHours>region.SunshineHours?"<b class='green'>"+(province.SunshineHours/region.SunshineHours*100-100).toFixed(2)+"% more</b> than the average for the region of ":"<b class='red'>"+(100-(province.SunshineHours/region.SunshineHours)*100).toFixed(2)+"% less</b> than the average for the region of ")+province.Region+"."+
  "</br></br>"
  info.climate+=" Throughout the year, <b>it rains on average "+province.RainyDays+" days per month</b>, which is "+
  (province.RainyDays>8?"<b class='red'>well above average":(province.RainyDays<7?"<b class='green'>below average</b>":"<b>an ordinary amount of precipitation"))+"</b> for an Italian province."+
  "</br></br>"+
  "Throughout the autumn and winter season, there are usually "+(province.FoggyDays>5?"<b class='red'>":"<b class='green'>")+province.FoggyDays+" days per month with fog</b> and <b>"+province.ColdDays+" cold days per month</b> with perceived temperatures below 3°C. "+
  " In the summer, there are on average <b>"+province.HotDays+" hot days per month</b> with perceived temperatures above 30°C."
  
  info.lgbtq="<b>"+province.Name+" is "+(province['LGBT-friendly']>7.9?"one of the most LGBTQ-friendly provinces in Italy":(province['LGBT-friendly']>6?"somewhat LGBTQ+ friendly by Italian standards":"not particularly LGBTQ-friendly as far as Italian provinces go"))+
  ".</b> "+(province.LGBTQAssociations>1?"There are "+province.LGBTQAssociations+" local LGBTQ+ associations (Arcigay) in this province.":(province.LGBTQAssociations==1?"There is 1 LGBTQ+ association (Arcigay) in this province.":""))

  info.leisure=province.Name+" has <b>"+(province.Nightlife>7.5?"pretty good nightlife":"somewhat decent nightlife")+"</b> with "+
  province.Bars+" bars and "+province.Restaurants+" restaurants per 10k inhabitants. "
 
  info.healthcare="<b>Healthcare in "+province.Name+" is "+(province.Healthcare>6.74?"<b class='green'>above average":"<b class='red'>below average")+"</b></b>. "+
  "For every 10k inhabitants, there are around "+province.pharmacies+" pharmacies, "+province.GeneralPractitioners+" general practitioners and "+province.SpecializedDoctors+" specialized doctors per 10k inhabitants. "+
  "<b>Average life expectancy in "+province.Name+" is "+(province.LifeExpectancy>82.05?" very high at ":"")+province.LifeExpectancy+" years of age.</b>"
  
  info.crimeandsafety="The province of "+province.Name+" is overall "+(province.Safety>7.33?"<b class='green'>very safe for expats":(province.Safety>6?"<b class='green'>moderately safe for expats":"<b class='red'>less safe than other Italian provinces for expats"))+"</b>. "+
  "As of 2021, there are an average of <b>"+province.ReportedCrimes+" reported crimes per 100k inhabitants</b>. This is "+(province.ReportedCrimes>2835.76?"<b class='red'>"+(((province.ReportedCrimes/2835.76)*100)-100).toFixed(2)+"% higher than the national average</b>":"<b class='green'>"+((100-(province.ReportedCrimes/2835.76)*100).toFixed(2))+"% lower than the national average</b>")+"."+
  "<br><br>"+
  "There have been around <b>"+province.RoadFatalities+" deadly road accidents</b> and <b>"+province.WorkAccidents+" serious work-related injuries</b> per 10k people in "+province.Name+". This is respectively "+
  (province.RoadFatalities>0.54?"<b class='red'>"+(((province.RoadFatalities/0.54)*100-100).toFixed(2))+"% more driving accidents than average":"<b class='green'>"+(((100-(province.RoadFatalities/0.54)*100).toFixed(2))+"% less driving accidents than average"))+"</b> and "+
  (province.RoadFatalities>12.90?"<b class='red'>"+(((province.WorkAccidents/12.90)*100-100).toFixed(2))+"% more work accidents than average":"<b class='green'>"+(((100-(province.WorkAccidents/12.90)*100).toFixed(2))+"% less work accidents than average"))+"</b>."+
  "<br><br>"
  info.crimeandsafety+=(province.CarTheft>70.53?"Car theft is reportedly <b class='red'>"+(((province.CarTheft/70.53)*100)-100).toFixed(2)+"% higher than average</b> with "+province.CarTheft+" cases per 100k inhabitants.":"Car theft is reportedly <b class='green'>"+((100-(province.CarTheft/70.53)*100)).toFixed(2)+"% lower than average</b> with only "+province.CarTheft+" cases per 100k inhabitants.")+" "+
(province.HouseTheft>175.02?"Reports of house thefts are <b class='red'>"+(((province.HouseTheft/175.02)*100)-100).toFixed(2)+"% higher than average</b> with "+province.HouseTheft+" cases per 100k inhabitants.":"Reports of house thefts are <b class='green'>"+((100-(province.HouseTheft/175.02)*100)).toFixed(2)+"% lower</b> than average with "+province.HouseTheft+" cases per 100k inhabitants.")+" "+
(province.Robberies>22.14?"Cases of robbery are not totally uncommon, around <b class='red'>"+(((province.Robberies/22.14)*100)-100).toFixed(2)+"% higher than average</b> with "+province.Robberies+" reports per 100k inhabitants":"Cases of robbery are uncommon with "+province.HouseTheft+" reported cases per 100k inhabitants, about <b class='green'>"+((100-(province.Robberies/22.14)*100)).toFixed(2)+"% less the national average</b>")+". "

  info.education=province.Name+" has a "+(province.HighSchoolGraduates>avg.HighSchoolGraduates?"<b class='green'>higher-than-average percentage of high school graduates":"<b class='red'>lower-than-average percentage of high school graduates")+"</b>, around "+province.HighSchoolGraduates+"%; and a "+(province.UniversityGraduates>avg.UniversityGraduates?"<b class='green'>higher-than-average percentage of university graduates":"<b class='red'>lower-than-average percentage of university graduates")+"</b>, around "+province.UniversityGraduates+"%."+
  " The average number of completed <b>years of schooling</b> for people over 25 is "+province.YearsOfEducation+", which is "+(province.YearsOfEducation>avg.YearsOfEducation*1.05?"<b class='green'>above the national average</b>":(province.YearsOfEducation<avg.YearsOfEducation*.95?"<b class='red'>lower than the national average</b>":"not far from the national average"))+" of "+avg.YearsOfEducation+". "+
  (province.Universities>1?" There are <b>"+province.Universities+" universities</b> within the province":(province.Universities==1?" There is <b>one university</b> in the province":" There are <b>no universities</b> in this province"))+"."

  info.transport="<b>Public transport in "+name+"</b> is "+(province.PublicTransport<avg.PublicTransport*.9?"<b class='red'>lacking":(province.PublicTransport>avg.PublicTransport*1.1?"<b class='green'>quite good":"<b class='green'>fairly decent"))+"</b>, and "+
  (province.Traffic<avg.Traffic*.85?"<b class='green'>traffic is low":(province.Traffic<avg.Traffic?"<b class='green'>traffic is below average":(province.Traffic>avg.Traffic*1.1?"<b class='red'>traffic is very high":"<b class='red'>traffic is somewhat high")))+"</b>. "+
  "There are on average "+province.VehiclesPerPerson+" active vehicles per person, against a national average of "+avg.VehiclesPerPerson+". "+(province.Subway>0?"The city of "+name+" is one of the very few places in Italy with an urban metro system, the <b>Metropolitana di "+name+"</b>. ":"")+
  "<br><br>"+
  "Around "+(province.CyclingLanes/10).toFixed(2)+"km per 10k inhabitants of the main city in "+name+" consist of bicycle lanes. This makes "+name+" "+(province.CyclingLanes>avg.CyclingLanes*.8?"<b class='green'>somewhat bike-friendly by Italian standards":(province.CyclingLanes>avg.CyclingLanes*1.2?"<b class='green'>very bike-friendly by Italian standards":"<b class='red'>not very bike-friendly"))+"</b>. "
  
  return info;
}

function resizeFilterMenu(){
  let arrow = $("#header > .arrow");
  if (!$(".floatBottom").hasClass("toggled")){
    arrow.removeClass("up");
    arrow.addClass("down");
    $(".floatBottom").addClass("toggled")
  }
  else{
    arrow.addClass("up");
    arrow.removeClass("down");
    $(".floatBottom").removeClass("toggled")
  }
}


function populateFacts(){
  
facts.Roma.overview="The <b>city of Rome</b>, with 2.761.632 residents, is the most popolous city and <b>capital of Italy</b>."
facts.Milano.overview="The <b>city of Milan</b>, with 1,371,498 residents, is the second-most popolous city and <b>industrial, commercial and financial capital of Italy</b>."

}

function setNavBar(){
  let navbar = document.getElementsByClassName("navbar")[0];
  navbar.innerHTML=
  '<div class="navbar-container">'+
  '<input type="checkbox" name="navbar" id="navbar">'+
  '<div class="hamburger-lines">'+
      '<span class="line line1"></span>'+
      '<span class="line line2"></span>'+
      '<span class="line line3"></span>'+
  '</div>'+
  '<ul class="menu-items">'+
      '<li><a href="https://pietro93.github.io/italycities.github.io/">Home</a></li>'+
      '<li><a href="https://pietro93.github.io/italycities.github.io/about.html">About</a></li>'+
      '<li><a href="https://forms.gle/WiivbZg8336TmeUPA" target="_blank">Contribute</a></li>'+
      '</ul>'+
 '<a href="https://pietro93.github.io/italycities.github.io/"><h1 class="logo">Italy Expats & Nomads</h1></a>'+
'</div>'
}

function createSorting(label, value){
  if (value==undefined)value=label;
  let sortings = $("#sorting")
  let sorting = '<label class="button radio column">'+
    '<input type="radio" name="sortBy" onClick="filterBy()" value='+value+(value=="Expat-friendly"?" checked":"")+'>'+
    '<span>'+label+'</span>'+
    '</label>'
  sortings.append(sorting)
}

function appendProvinceData(province){
  
  let tab1=$("#tab-item-1 > .column");
  let tab2=$("#tab-item-2 > .column"); 
  let tab3=$("#tab-item-3 > .column"); 
  tab1[0].innerHTML+=('<p>👥Population: <b>'+province.Population.toLocaleString('en', {useGrouping:true}) +'</b>');
  tab1[0].innerHTML+=('<p>🚑Healthcare: '+ qualityScore("Healthcare",province.Healthcare));
  tab1[0].innerHTML+=('<p>📚Education: '+ qualityScore("Education",province.Education));
  tab1[0].innerHTML+=('<p>👮🏽‍♀️Safety: '+ qualityScore("Safety",province.Safety));
  tab1[0].innerHTML+=('<p>🚨Crime: '+ qualityScore("Crime",province.Crime));
  
  tab1[0].innerHTML+=('<p>🚌Transport: '+ qualityScore("PublicTransport",province["PublicTransport"]));
  tab1[0].innerHTML+=('<p>🚥Traffic: '+ qualityScore("Traffic",province["Traffic"]));
  tab1[0].innerHTML+=('<p>🚴‍♂️Cyclable: '+ qualityScore('CyclingLanes',province['CyclingLanes']));
  tab1[0].innerHTML+=('<p>🏛️Culture: '+ qualityScore("Culture",province.Culture));
  tab1[0].innerHTML+=('<p>🍸Nightlife: '+ qualityScore("Nightlife",province.Nightlife));
  tab1[0].innerHTML+=('<p>⚽Recreation: '+ qualityScore("Sports & Leisure",province["Sports & Leisure"]));

  tab1[1].innerHTML+=('<p>🌦️Climate: '+ qualityScore("Climate",province.Climate));
  tab1[1].innerHTML+=('<p>☀️Sunshine: '+ qualityScore("SunshineHours",province.SunshineHours));
  tab1[1].innerHTML+=('<p>🥵Summers: '+ qualityScore("HotDays",province.HotDays));
  tab1[1].innerHTML+=('<p>🥶Winters: '+ qualityScore("ColdDays",province.ColdDays));
  tab1[1].innerHTML+=('<p>🌧️Rain: '+ qualityScore("RainyDays",province.RainyDays));
  tab1[1].innerHTML+=('<p>🌫️Fog: '+ qualityScore("FoggyDays",province.FoggyDays));
  tab1[1].innerHTML+=('<p>🍃Air quality: '+ qualityScore("AirQuality",province["AirQuality"]));

  tab1[1].innerHTML+=('<p>👪For family: '+ qualityScore("Family-friendly",province["Family-friendly"]));
  tab1[1].innerHTML+=('<p>👩For women: '+ qualityScore("Female-friendly",province["Female-friendly"]));
  tab1[1].innerHTML+=('<p>🏳️‍🌈LGBTQ+: '+ qualityScore("LGBT-friendly",province["LGBT-friendly"]));
  tab1[1].innerHTML+=('<p>🥗For vegans: '+ qualityScore("Veg-friendly",province["Veg-friendly"]));
  

  tab2[0].innerHTML+=('<p>📈Cost of Living: '+ qualityScore("CostOfLiving",province["CostOfLiving"]));
  tab2[0].innerHTML+=('<p>🧑🏻Expenses (single person): '+ qualityScore("Cost of Living (Individual)",province["Cost of Living (Individual)"]))
  tab2[0].innerHTML+=('<p>👩🏽‍🏫Expenses (tourist): '+ qualityScore("Cost of Living (Nomad)",province["Cost of Living (Nomad)"]))
  tab2[0].innerHTML+=('<p>🏠Rental (studio apt.): '+ qualityScore("StudioRental",province["StudioRental"]))
  tab2[0].innerHTML+=('<p>🏘️Rental (2-room apt.): '+ qualityScore("BilocaleRent",province["BilocaleRent"]))
  tab2[0].innerHTML+=('<p>🏰Rental (3-room apt.): '+ qualityScore("TrilocaleRent",province["TrilocaleRent"]))

  tab2[1].innerHTML+=('<p>🏙️Housing Cost: '+ qualityScore("HousingCost",province["HousingCost"]));
  tab2[1].innerHTML+=('<p>💵Local Income: '+ qualityScore("MonthlyIncome",province["MonthlyIncome"]));
  tab2[1].innerHTML+=('<p>👪Expenses (small family): '+ qualityScore("Cost of Living (Family)",province["Cost of Living (Family)"]))
  tab2[1].innerHTML+=('<p>🏠Sale (studio apt.): '+ qualityScore("StudioSale",province["StudioSale"]))
  tab2[1].innerHTML+=('<p>🏘️Sale (2-room apt.): '+ qualityScore("BilocaleSale",province["BilocaleSale"]))
  tab2[1].innerHTML+=('<p>🏰Sale (3-room apt.): '+ qualityScore("TrilocaleSale",province["TrilocaleSale"]))
 
  tab3[0].innerHTML+=('<p>👩‍💻Nomad-friendly: '+qualityScore("DN-friendly",province["DN-friendly"]))
  tab3[0].innerHTML+=('<p>💃Fun: '+qualityScore("Fun",province["Fun"]));
  tab3[0].innerHTML+=('<p>🤗Friendliness: '+qualityScore("Friendliness",province["Friendliness"]));
  tab3[0].innerHTML+=('<p>🤐English-speakers: '+qualityScore("English-speakers",province["English-speakers"]));
  tab3[0].innerHTML+=('<p>😊Happiness: '+qualityScore("Antidepressants",province["Antidepressants"]));
 
  tab3[1].innerHTML+=('<p>💸Nomad cost: '+ qualityScore("Cost of Living (Nomad)",province["Cost of Living (Nomad)"]))
  tab3[1].innerHTML+=('<p>📡High-speed Internet: '+qualityScore("HighSpeedInternetCoverage",province["HighSpeedInternetCoverage"]));
  tab3[1].innerHTML+=('<p>📈Innovation: '+qualityScore("Innovation",province["Innovation"]));
  tab3[1].innerHTML+=('<p>🏖️Beach: '+qualityScore("Beach",province["Beach"]));
  tab3[1].innerHTML+=('<p>⛰️Hiking: '+qualityScore("Hiking",province["Hiking"]));
}
import { createServer } from 'http';
import fetch from 'node-fetch';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jsdom = require('jsdom')

createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
  }).listen(8080);

var dataset;
var provinces = {};
var facts={};
var selection = [];
var region_filters = [];
var additionalFilters=[];
var dataset;
var avg;
var regions ={};

fetch('https://expiter.com/dataset.json', {method:"Get"})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        //console.log(dom.window.document.querySelector("body").textContent)
        dataset=data;  
        populateData(data);
        const html = fs.readFileSync('./indexTemplate.html','utf8');
        const dom = new jsdom.JSDOM(html);
  
        const $ = require('jquery')(dom.window);
        init($)
        
        let newHtml = dom.window.document.documentElement.outerHTML;
         fs.writeFile('./app.html', newHtml, function (err, file) {
            if (err) throw err;
            else console.log('app.html'+' Saved!');
        });
        
    })
    .catch(function (err) {
        console.log('error: ' + err);
    }
    )
    

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

function init($){
    console.log("setting nav bar")
    setNavBar($);
    if (!!$("#filters")){
    let filters = $("#filters");
    let regions = ["Abruzzo","Basilicata","Calabria","Campania","Emilia-Romagna","Friuli-Venezia Giulia","Lazio","Liguria","Lombardia","Marche","Molise",
    "Piemonte","Puglia","Sardegna","Sicilia","Toscana","Trentino-Alto Adige","Umbria","Valle d&#39;Aosta","Veneto"];
    let row;
  
  for (let i=0;i<regions.length;i++){
  if (i==0){
    row = "<row id='regionfilters' class='columns is-multiline is-mobile'>";
    row+='<p class="column is-12">Filter by region:</p>'
    row+='<button class="button column clearfilter" title="Clear Selection" onClick=\'filterDataByRegion('+"\""+"Clear"+"\")"+'\'>'+"🧹Clear"+"</button>";
    row+='<button class="button column allfilter" title="Select All" onClick=\'filterDataByRegion('+"\""+"All"+"\")"+'\'>'+"➕All"+"</button>";
    row+='<button class="button column specialfilter" id="North" onClick=\'filterDataByRegion('+"\""+'North'+"\");$(this).toggleClass(\"selected\")"+'\'>'+'🍹🏔️North'+"</button>";
    row+='<button class="button column specialfilter" id="Center" onClick=\'filterDataByRegion('+"\""+'Center'+"\");$(this).toggleClass(\"selected\")"+'\'>'+'🍷🏛️Center'+"</button>";
    row+='<button class="button column specialfilter" id="South" onClick=\'filterDataByRegion('+"\""+'South'+"\");$(this).toggleClass(\"selected\")"+'\'>'+'🍕🏖️South'+"</button>";
    row+='<p class="column is-12"></p>'
  }
  row+='<button class="button column regionfilter" id="'+regions[i].substring(0,3)+'" onClick=\'filterDataByRegion('+"\""+regions[i]+"\");"+'\'>'+regions[i]+"</button>";
}
    row+='</row>' 
    filters.append(row);
  
    row = "<row id='additionalfilters' class='columns is-multiline is-mobile'>";
    row+='<p class="column is-12">Additional filters:</p>';
    row+='<button class="button column additionalfilter pop" onClick=\'filterBy("Pop300k-");$(this).toggleClass("selected")\'>'+"Pop.<300k"+"</button>";
    row+='<button class="button column additionalfilter pop" onClick=\'filterBy("Pop300k+");$(this).toggleClass("selected")\'>'+"Pop.300k-500k"+"</button>";
    row+='<button class="button column additionalfilter pop" onClick=\'filterBy("Pop500k+");$(this).toggleClass("selected")\'>'+"Pop.500k-1m"+"</button>";
    row+='<button class="button column additionalfilter pop" onClick=\'filterBy("Pop1m+");$(this).toggleClass("selected")\'>'+"Pop.>1m"+"</button>";
    row+='<button class="button column additionalfilter col" onClick=\'filterBy("Low-cost");$(this).toggleClass("selected")\'>'+"€ LowCoL"+"</button>";
    row+='<button class="button column additionalfilter col" onClick=\'filterBy("Mid-cost");$(this).toggleClass("selected")\'>'+"€€ MidCoL"+"</button>";
    row+='<button class="button column additionalfilter col" onClick=\'filterBy("High-cost");$(this).toggleClass("selected")\'>'+"€€€ HighCoL"+"</button>";
    row+='<p class="column is-12"></p>';
    row+='<button class="button column additionalfilter clim" onClick=\'filterBy("Hot");$(this).toggleClass("selected")\'>'+"Hot"+"</button>";
    row+='<button class="button column additionalfilter clim" onClick=\'filterBy("Cold");$(this).toggleClass("selected")\'>'+"Cold"+"</button>";
    row+='<button class="button column additionalfilter clim" onClick=\'filterBy("Temperate");$(this).toggleClass("selected")\'>'+"Temperate"+"</button>";
    row+='<button class="button column additionalfilter has" onClick=\'filterBy("HasUni");$(this).toggleClass("selected")\'>'+"Has University"+"</button>";
    row+='<button class="button column additionalfilter has" onClick=\'filterBy("HasMetro");$(this).toggleClass("selected")\'>'+"Has Metro"+"</button>";
    row+='</row>' 
    filters.append(row)
    
    console.log("creating sortings")
    createSorting($,"Expat-friendly");
    createSorting($,"A-Z","Name");
    createSorting($,"Random");createSorting($,"Region");createSorting($,"Population");createSorting($,"Climate");
    createSorting($,"Cost","CostOfLiving");createSorting($,"Safety");createSorting($,"Lack of Crime","Crime");createSorting($,"Nightlife");createSorting($,"Education");
    createSorting($,"Sunshine","SunshineHours");createSorting($,"Hot","HotDays");createSorting($,"Cold","ColdDays");
    createSorting($,"Nomad-friendly","DN-friendly");createSorting($,"LGBTQ+-friendly","LGBT-friendly");createSorting($,"Women-friendly","Female-friendly");
    createSorting($,"Family-friendly");createSorting($,"Vegan-friendly","Veg-friendly");createSorting($,"Pop. Density","Density");
    
    console.log("filtering by")
    filterBy($);
  }
  
}


function createSorting($,label, value){
    if (value==undefined)value=label;
    let sortings = $("#sorting")
    let sorting = '<label class="button radio column">'+
      '<input type="radio" name="sortBy" onClick="filterBy()" value='+value+(value=="Expat-friendly"?" checked":"")+'>'+
      '<span>'+label+'</span>'+
      '</label>'
    sortings.append(sorting)
    
  }

  function filterBy($,additionalFilter){
 
    if (!additionalFilters.includes(additionalFilter)&&additionalFilter!=undefined)additionalFilters.push(additionalFilter)
    else if (additionalFilters.includes(additionalFilter))additionalFilters.splice(additionalFilters.indexOf(additionalFilter),1)
    
    console.log("filtering data by region")
    filterDataByRegion($,"All");
  }

    function filterDataByRegion($,filter){
      let regions = ["Abruzzo","Basilicata","Calabria","Campania","Emilia-Romagna","Friuli-Venezia Giulia","Lazio","Liguria","Lombardia","Marche","Molise",
      "Piemonte","Puglia","Sardegna","Sicilia","Toscana","Trentino-Alto Adige","Umbria","Valle d&#39;Aosta","Veneto"];
      let north=["Lombardia","Valle d'Aosta","Piemonte","Liguria","Trentino-Alto Adige", "Friuli-Venezia Giulia","Veneto","Emilia-Romagna"];
      let center=["Lazio","Toscana","Marche","Umbria"];
      let south=["Abruzzo","Molise","Campania","Puglia","Basilicata","Calabria","Sicilia","Sardegna"]


      selection=[];
      if (filter == "All") {
        selection=dataset.slice(0, 107); region_filters=north.concat(center).concat(south);
        
        $(".regionfilter:not(.selected)").toggleClass("selected");
        console.log("sorting data by 'all'")
        sortData($,selection);
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
        console.log("adding filters to selection")
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
      
    console.log("sorting Data")
      sortData($,selection);

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

    function sortData($,selection){
      let sortBy = $('input[name="sortBy"]:checked')[0].value;
      let data;
      console.log("sort by: "+sortBy)
      console.log("selection: "+selection)
        if (sortBy=="Random"){
          data = selection.sort(() => Math.random() - 0.5);     
        }
        if (sortBy=="Name"||sortBy=="Region"||sortBy=="CostOfLiving"||sortBy=="Crime"){ //ascending order
          data = selection.sort(dynamicSort(sortBy))    
        }
        else {                                                        //descending order
          data = selection.sort(dynamicSort("-"+sortBy))
          console.log("sorted data: "+data)
        }
        console.log("appending data")
        appendData($,data);
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

function clearData($){
  $("#app").innerHTML="";
}

function appendData($,data) {
    console.log("clearing data")
    clearData($);
    console.log("data cleared... appending new data")
    let mainContainer = $("#app");

    let title = $("#title")
        
    title.append("<span id='bestorworst'></span> <span id='smallorlarge'></span> Provinces in <span id='chosenArea'>Italy</span> <span id='sortBy'></span>");



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
        let card = '<card id="'+data[i].Name+'"class="'+(data[i].Name=="Aosta"?"Aosta Valley":data[i].Region)+' paracard" '+
         'title="'+data[i].Name+', '+(data[i].Name=="Aosta"?"Aosta Valley":data[i].Region)+'"'+
         '>';
         
        let col = "<div class='column'>";

        //if ($(window).width() > 765) {
        //card +='<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+data[i].Abbreviation+'.webp?tr=w-190,h-250,c-at_least" alt="'+data[i].Name+'"></img>'
       // }
      //  else{
          card +='<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+data[i].Abbreviation+'.webp?tr=w-180,h-240,c-at_least,q-1,bl-1" alt="'+data[i].Name+'"></img>'
      //  }

        if (data[i].Name.length>14){card += '<div class="frame"><center><h3 class="header" style="font-size:24px" >' + data[i].Name + '</h3></center></div>'}
        else card += '<div class="frame" ><center><h3 class="header">' + data[i].Name + '</h3></center></div> ';
        card += '<p class="region">' + data[i]["Region"]+'</p>';
        card += '<p class="population"><ej>👥</ej>Population: <b style="color:white">'+data[i].Population.toLocaleString('en', {useGrouping:true}) +'</b>'+'</p>';
        card += '<p>&#128184Cost: '+ qualityScore("CostOfLiving",data[i].CostOfLiving) +'';
        card += '<p><ej>💰</ej>Expenses: '+ qualityScore("Cost of Living (Individual)",data[i]["Cost of Living (Individual)"])+'</p>';
        card += '<p><ej>☀️</ej>Climate: '+ qualityScore("Climate",data[i].Climate) +'</p>';
        card += '<p><ej>🚑</ej>Healthcare: '+ qualityScore("Healthcare",data[i].Healthcare) +'</p>';
        card += '<p><ej>🚌</ej>Transport: '+ qualityScore("PublicTransport",data[i]["PublicTransport"]) +'</p>';
        card += '<p><ej>👮🏽‍♀️</ej>Safety: '+ qualityScore("Safety",data[i]["Safety"]) +'</p>';
        card += '<p><ej>📚</ej>Education: '+ qualityScore("Education",data[i]["Education"]) +'</p>';
        card += '<p><ej>🏛️</ej>Culture: '+ qualityScore("Culture",data[i].Culture) +'</p>';
        card += '<p><ej>🍸</ej>Nightlife: '+ qualityScore("Nightlife",data[i].Nightlife) +'</p>';
        card += '<p class="opacity6"><ej>⚽</ej>Recreation: '+ qualityScore("Sports & Leisure",data[i]["Sports & Leisure"])+'</p>';
        card += '<p class="opacity6"><ej>🍃</ej>Air quality: '+ qualityScore("AirQuality",data[i]["AirQuality"]) +'</p>';
        card += '<p class="opacity6"><ej>🏳️‍🌈</ej>LGBTQ+: '+ qualityScore("LGBT-friendly",data[i]["LGBT-friendly"]) +'</p>';
        card += '<p class="opacity4"><ej>👩</ej>For women: '+ qualityScore("Female-friendly",data[i]["Female-friendly"]) +'</p>';
        card += '<p class="opacity4"><ej>👪</ej>For family: '+ qualityScore("Family-friendly",data[i]["Family-friendly"]) +'</p>';
        card += '<p class="opacity4"><ej>🥗</ej>For vegans: '+ qualityScore("Veg-friendly",data[i]["Veg-friendly"]) +'</p>';
        card += '<p class="opacity4"><ej>🧳</ej>For nomads: '+ qualityScore("DN-friendly",data[i]["DN-friendly"]) +'</p>';
        card += '<button class="more" style="font-size:large;" onclick="location.href=\'./province/'+data[i].Name+'.html\';"> More>> </button>';
        card += '</card>'

        col += "<a href='./province/"+data[i].Name+".html\''>"+card+"</a></col>";
        
        mainContainer.append(col);
        
    }
    
}

function setNavBar($){
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
        '<li><a href="/resources.html">Resources</a></li>'+
        '<li><a href="/app#About">About</a></li>'+
        '<li><a href="https://forms.gle/WiivbZg8336TmeUPA" target="_blank">Take Survey</a></li>'+
        '</ul>'+
   '<a href="/"><h1 class="logo">Italy Expats & Nomads</h1></a>'+
  '</div>')
  }
  
import * as pb from './js/pageBuilder.js'
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
        const html = fs.readFileSync('./indexTemplateIT.html','utf8');
        const dom = new jsdom.JSDOM(html);
  
        const $ = require('jquery')(dom.window);
        init($)
        
        let newHtml = dom.window.document.documentElement.outerHTML;
         fs.writeFile('it/app.html', newHtml, function (err, file) {
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
    row+='<button value="Pop300k-" class="button column additionalfilter pop" onClick=\'$(this).toggleClass("selected");filterBy("Pop300k-");\'>'+"👤Pop.<300k"+"</button>";
    row+='<button value="Pop300k+" class="button column additionalfilter pop" onClick=\'$(this).toggleClass("selected");filterBy("Pop300k+")\'>'+"👤👤Pop.300k-500k"+"</button>";
    row+='<button value="Pop500k+" class="button column additionalfilter pop" onClick=\'$(this).toggleClass("selected");filterBy("Pop500k+")\'>'+"👤👤👤Pop.500k-1m"+"</button>";
    row+='<button value="Pop1m+" class="button column additionalfilter pop" onClick=\'$(this).toggleClass("selected");filterBy("Pop1m+")\'>'+"👥👥Pop.>1m"+"</button>";
    row+='<p class="column is-12"></p>';
    row+='<button value="Low-cost" class="button column additionalfilter col" onClick=\'$(this).toggleClass("selected");filterBy("Low-cost")\'>'+"💰 LowCoL"+"</button>";
    row+='<button value="Mid-cost" class="button column additionalfilter col" onClick=\'$(this).toggleClass("selected");filterBy("Mid-cost")\'>'+"💰💰 MidCoL"+"</button>";
    row+='<button value="High-cost" class="button column additionalfilter col" onClick=\'$(this).toggleClass("selected");filterBy("High-cost")\'>'+"💰💰💰 HighCoL"+"</button>";
    row+='<button value="Hot" class="button column additionalfilter clim" onClick=\'$(this).toggleClass("selected");filterBy("Hot")\'>'+"🥵Hot"+"</button>";
    row+='<button value="Cold" class="button column additionalfilter clim" onClick=\'$(this).toggleClass("selected");filterBy("Cold")\'>'+"🥶Cold"+"</button>";
    row+='<button value="Temperate" class="button column additionalfilter clim" onClick=\'$(this).toggleClass("selected");filterBy("Temperate")\'>'+"😎Temperate"+"</button>";
    row+='<p class="column is-12"></p>';
    row+='<button value="HasBeach" class="button column additionalfilter has" onClick=\'$(this).toggleClass("selected");filterBy("HasBeach")\'>'+"⛱️Beach"+"</button>";
    row+='<button value="HasSkiing" class="button column additionalfilter has" onClick=\'$(this).toggleClass("selected");filterBy("HasSkiing")\'>'+"🏂🏻Winter Sports"+"</button>";
    row+='<button value="HasUni" class="button column additionalfilter has" onClick=\'$(this).toggleClass("selected");filterBy("HasUni")\'>'+"👩‍🎓University"+"</button>";
    row+='<button value="HasMetro" class="button column additionalfilter has" onClick=\'$(this).toggleClass("selected");filterBy("HasMetro")\'>'+"🚇Metro"+"</button>";
    row+='<p class="column is-12"></p>';row+='<p class="column is-12"></p>';row+='<p class="column is-12"></p>';
    row+='</row>' 
    filters.append(row)

    console.log("création de tris")
createSorting($,"<ej>👍</ej>Adapté aux expatriés","Expat-friendly");
createSorting($,"<ej>🔠</ej>A-Z","Name");
createSorting($,"<ej>🔀</ej>Aléatoire","Random");
createSorting($,"<ej>🌍</ej>Région","Region");
createSorting($,"<ej>👥</ej>Population","Population");
createSorting($,"<ej>🌦️</ej>Climat","Climate");
createSorting($,"<ej>🤑</ej>Coût","CostOfLiving");
createSorting($,"<ej>👮</ej>Sécurité","Safety");
createSorting($,"<ej>🚨</ej>Manque de criminalité","Crime");
createSorting($,"<ej>🍸</ej>Vie nocturne","Nightlife");
createSorting($,"<ej>📚</ej>Éducation","Education");
createSorting($,"<ej>☀️</ej>Ensoleillement","SunshineHours");
createSorting($,"<ej>♨️</ej>Le plus chaud","HotDays");
createSorting($,"<ej>❄️</ej>Le plus froid","ColdDays");
createSorting($,"<ej>☔</ej>Le plus humide","RainyDays");
createSorting($,"<ej>🧳</ej>Adapté aux nomades","DN-friendly");
createSorting($,"<ej>🏳️‍🌈</ej>Amical LGBTQ+","LGBT-friendly");
createSorting($,"<ej>👩</ej>Amical pour les femmes","Female-friendly");
createSorting($,"<ej>👩‍👦</ej>Adapté aux familles","Family-friendly");
createSorting($,"<ej>🥙</ej>Amical pour les végétaliens","Veg-friendly");
createSorting($,"<ej>🌆</ej>Densité de population","Density");
createSorting($,"<ej>🏖️</ej>Meilleures plages","Beach");
createSorting($,"<ej>⛰️</ej>Meilleures randonnées","Hiking");
createSorting($,"<ej>⛷️</ej>Meilleur ski","WinterSports")

console.log("filtrage par")
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
      //console.log("selection: "+selection)
        if (sortBy=="Random"){
          data = selection.sort(() => Math.random() - 0.5);     
        }
        if (sortBy=="Name"||sortBy=="Region"||sortBy=="CostOfLiving"||sortBy=="Crime"){ //ascending order
          data = selection.sort(dynamicSort(sortBy))    
        }
        else {                                                        //descending order
          data = selection.sort(dynamicSort("-"+sortBy))
          //console.log("sorted data: "+data)
        }
        console.log("appending data")
        appendData($,data);
        $(".provinces").text("Provinces");
        switch(sortBy){ 
        case "Expat-friendly":
          $("span.sortBy").text("for Expats");
          $("span.bestorworst").text("Best")
          break;
        case "Name":
          $("span.sortBy").text("by Alphabetical Order");
          break;
        case "Random":
          $("span.sortBy").text("by Random Order");
          break;
        case "Region":
          $("span.sortBy").text("by Region");
          break;
        case "CostOfLiving":
          $("span.sortBy").text("");
          $("span.bestorworst").text("Cheapest")
          break;
        case "Population":
          $("span.sortBy").text("by Population");
          break;
        case "MonthlyIncome":
          $("span.sortBy").text("by Average Income");
          $("span.bestorworst").text("");
          break;
        case 'Expat-friendly':case'LGBT-friendly':
          $("span.sortBy").text("");
          $("span.bestorworst").text("Most "+sortBy);
          break;
        case 'DN-friendly':case'Female-friendly'
        :case 'Family-friendly':case 'Veg-friendly':
          $("span.sortBy").text((sortBy==='DN-friendly'?"for Digital Nomads":"for Women"));
          (sortBy==='Family-friendly'?$("span.sortBy").text("for Families"):
          (sortBy==='Veg-friendly'?$("span.sortBy").text("for Vegans"):""));
          $("span.bestorworst").text("Best");
          break;
        case 'SunshineHours':
          $("span.sortBy").text("");
          $("span.bestorworst").text("Sunniest");
          break;
        case sortBy == 'HotDays',sortBy=='ColdDays':
          $("span.sortBy").text("");
          $("span.bestorworst").text((sortBy=='HotDays'?"Hottest":"Coldest"));
          break;
        case 'Safety':
          $("span.sortBy").text("");
          $("span.bestorworst").text("Safest");
          break;
        case 'Crime':
          $("span.sortBy").text("by Lowest Amount of Crime");
          $("span.bestorworst").text("");
          break;
        case 'Beach':
          $("span.sortBy").text("");
          $("span.bestorworst").text("Best");
          $("span.provinces").text("Beach Destinations")
          break;
          case 'WinterSports':
          $("span.sortBy").text("");
          $("span.bestorworst").text("Best");
          $("span.provinces").text("Skiing Destinations")
          break;
        default:
        $("span.sortBy").text("for "+sortBy);
        $("span.bestorworst").text("Best");
        }
        /*if (sortBy == "Climate" || sortBy == "Healthcare" || sortBy == "Culture" || sortBy == "Nightlife" || sortBy == "Education"  ){
          $("span.bestorworst").text("Best")
        }*/

        let sortParams=[sortBy]

        $("span#score1").text(selection[0][sortParams[0]].toFixed(1))
        $("span#score2").text(selection[1][sortParams[0]].toFixed(1))
        $("span#score3").text(selection[2][sortParams[0]].toFixed(1))
    }

  
function qualityScore(quality,score){
  let expenses=["Cost of Living (Individual)","Cost of Living (Family)","Cost of Living (Nomad)", 
  "StudioRental", "BilocaleRent", "TrilocaleRent", "MonthlyIncome", 
  "StudioSale","BilocaleSale","TrilocaleSale"]
  if (quality=="CostOfLiving"||quality=="HousingCost"){
    if (score<avg[quality]*.8){return "<score class='excellent short'>pas cher</score>"}
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>abordable</score>"}
    else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>moyen</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>élevé</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='poor max'>cher</score>"}
  
  else if (expenses.includes(quality)){
    if (score<avg[quality]*.8){return "<score class='green'>"+score+"€/m</score>"}
    else if (score>=avg[quality]*0.8&&score<avg[quality]*0.95){return "<score class='green'>"+score+"€/m</score>"}
    else if (score>=avg[quality]*0.95&&score<avg[quality]*1.05){return "<score class='orange'>"+score+"€/m</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='red'>"+score+"€/m</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='red'>"+score+"€/m</score>"}
  }
  else if (quality=="HotDays"||quality=="ColdDays"){ // high score = bad; low score = good
    if (score<avg[quality]*.8){return "<score class='excellent short'>pas "+(quality=="HotDays"?"chaud":"froid")+"</score>"}
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>pas très "+(quality=="HotDays"?"chaud":"froid")+"</score>"}
    else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>un peu "+(quality=="HotDays"?"chaud":"froid")+"</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>"+(quality=="HotDays"?"chaud":"froid")+"</score>"}
    else if (score>=avg[quality]*1.2){return "<score class='poor max'>très "+(quality=="HotDays"?"chaud":"froid")+"</score>"}
  }
  else if (quality=="RainyDays"){ // high score = bad; low score = good
    if (score<avg[quality]*.8){return "<score class='excellent short'>très peu</score>"}
    else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>peu</score>"}
    else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>moyen</score>"}
    else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>pluvieux</score>"}
    else if (quality=="FoggyDays"){ // high score = bad; low score = good
        if (score<avg[quality]*.265){return "<score class='excellent short'>pas de brouillard</score>"}
        else if (score>=avg[quality]*.265&&score<avg[quality]*.6){return "<score class='great medium'>peu</score>"}
        else if (score>=avg[quality]*.6&&score<avg[quality]*1.00){return "<score class='good medium'>moyen</score>"}
        else if (score>=avg[quality]*1.05&&score<avg[quality]*3){return "<score class='average long'>brumeux</score>"}
        else if (score>=avg[quality]*3){return "<score class='poor max'>beaucoup</score>"}
      }
      else if (quality=="Crime"||quality=="Traffic"){ // high score = bad; low score = good
        if (score<avg[quality]*.8){return "<score class='excellent short'>très faible</score>"}
        else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='great medium'>faible</score>"}
        else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>moyen</score>"}
        else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='average long'>élevé</score>"}
        else if (score>=avg[quality]*1.2){return "<score class='poor max'>trop</score>"}
      }
      else{ // high score = good; low score = bad
        if (score<avg[quality]*.8){return "<score class='poor short'>pauvre</score>"}
        else if (score>=avg[quality]*.8&&score<avg[quality]*.95){return "<score class='average medium'>acceptable</score>"}
        else if (score>=avg[quality]*.95&&score<avg[quality]*1.05){return "<score class='good medium'>bon</score>"}
        else if (score>=avg[quality]*1.05&&score<avg[quality]*1.2){return "<score class='great long'>super</score>"}
        else if (score>=avg[quality]*1.2){return "<score class='excellent max'>excellent</score>"}
      }
    }

    function clearData($){
        $("#app").innerHTML="";
      }
    
      function appendData($,data) {
        console.log("effacement des données")
        clearData($);
        console.log("données effacées... ajout de nouvelles données")
        let mainContainer = $("#app");
    
        let title = $("#title")
            
        title.append("<span class='bestorworst'></span> <span class='smallorlarge'></span> Provinces en "+
        "<span class='chosenArea'>Italie</span> <span class='sortBy'></span>");
    
    
    
        if (selection.length==0) {title.innerHTML="Impossible de trouver des provinces en fonction de vos filtres."
      
        $("#output").html(
          "<p>Sur la base de nos données, il n'y a pas de "+
          "<span class='smallorlarge'></span> <span class='hotorcold'></span> "+
          "<span class='costofliving'></span> provinces en <span class='chosenArea'></span> "+
          "<span class='withthings'></span></p>."
          )
        
      }
      else{
        let province1st=selection[0];
        let output="<p>"+
        "Sur la base de nos données, la <span class='bestorworst'></span> <span class='smallorlarge'></span> "+
        "<span class='hotorcold'></span> <span class='costofliving'></span> "+
        "province en <span class='chosenArea'>Italie</span> "+
        "<span class='withthings'></span> <span class='sortBy'></span> est "+
        "<b><a class='province1st'></a></b>, avec un score de <span id='score1'></span>/10.";
        if (selection.length>1){
          for (var i=2;i<=3&i<selection.length;i++){
            output+=(i===3?" et ":"</br>")+
            "<b><a class='province"+i+"'></a></b> se classe "+(i===2?"2ème ":"3ème ")+
            "avec un score de <span id='score"+i+"'></span>/10"
          }output+="."
        }output+="</p>"
    
        $("#output").html("<center>"+output+"</center>")
        
        $("a.province1st").text(fr(province1st.Name))
        $("a.province1st").attr("href","https://expiter.com/fr/province/"+fr(province1st.Name).replace(/\s/g,"-")
         .replace("'","-").toLowerCase()+"/")
        if (selection.length>1){ let province2=selection[1]
        $("a.province2").text(province2.Name)
        $("a.province2").attr("href","https://expiter.com/fr/province/"+fr(province2.Name).replace(/\s/g,"-")
         .replace("'","-").toLowerCase()+"/")}
         if (selection.length>2){ let province3=selection[2]
        $("a.province3").text(province3.Name)
        $("a.province3").attr("href","https://expiter.com/it/province/"+fr(province3.Name).replace(/\s/g,"-")
        .replace("'","-").toLowerCase()+"/")}
       }
       if (region_filters.length==1) {$(".chosenArea").text(region_filters[0])}
       else if (region_filters.length==2) {$(".chosenArea").text(region_filters[0]+" et "+region_filters[1])}
       else if (region_filters.length==3) {$(".chosenArea").text(region_filters[0]+", "+region_filters[1]+" et "+region_filters[2])}
       else if (region_filters.sort().toString() == "Lazio,Marche,Toscana,Umbria") {$(".chosenArea").text("Italie centrale")}
       else if (region_filters.sort().toString() == "Abruzzo,Basilicata,Calabria,Campania,Molise,Puglia,Sardegna,Sicilia") {$(".chosenArea").text("Italie du Sud")}
       else if (region_filters.sort().toString() == "Emilia-Romagna,Friuli-Venezia Giulia,Liguria,Lombardia,Piemonte,Trentino-Alto Adige,Valle d'Aosta,Veneto") {$(".chosenArea").text("Italie du Nord")}
       else if (region_filters.length>3) {$(".chosenArea").text("Italie")}
       
       if (additionalFilters.sort().toString()=="Pop1m+"||additionalFilters.sort().toString()=="Pop1m+,Pop500k+") $(".smallorlarge").text("Grande");
       else if (additionalFilters.sort().toString()=="Pop300k+"||additionalFilters.sort().toString()=="Pop500k+"||additionalFilters.sort().toString()=="Pop300k+,Pop500k+") $(".smallorlarge").text("De taille moyenne");
       else if (additionalFilters.sort().toString()=="Pop300k-"||additionalFilters.sort().toString()=="Pop300k+,Pop300k-") $(".smallorlarge").text("Petite");
            
       
       for (let i = 0; i < Math.min(data.length,30); i++) {
           let card = '<card id="'+data[i].Name+'"class="'+(data[i].Name=="Aosta"?"Vallée d'Aoste":data[i].Region)+' paracard" '+
            'title="'+data[i].Name+', '+(data[i].Name=="Aosta"?"Vallée d'Aoste":data[i].Region)+'"'+
            '>';
            
           let col = "<div class='column'>";

           
        let img;
        switch(data[i].Region){
          case "Abruzzo": img="AQ"; break;
          case "Basilicata": img="MT"; break;
          case "Calabria": img="RC"; break;
          case "Campania": img="NA"; break;
          case "Emilia-Romagna": img="BO"; break;
          case "Friuli-Venezia Giulia": img="TS"; break;
          case "Lazio": img="ROMA"; break;
          case "Liguria": img="GE"; break;
          case "Lombardia": img="MI";break;
          case "Marche": img="AN"; break;
          case "Molise": img="CB"; break;
          case "Piemonte": img="TO"; break;
          case "Puglia": img="BA"; break;
          case "Sardegna": img="CA"; break;
          case "Sicilia": img="PA"; break;
          case "Toscana": img="FI"; break;
          case "Trentino-Alto Adige": img="TR"; break;
          case "Umbria": img="PE"; break;
          case "Valle d'Aosta": img="AO"; break;
          case "Veneto": img="VE"; break;
        }
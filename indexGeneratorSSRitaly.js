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
    pb.setNavBarIT($);
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
    
    console.log("creating sortings")
    createSorting($,"<ej>👍</ej>Expat-friendly","Expat-friendly");
    createSorting($,"<ej>🔠</ej>A-Z","Name");
    createSorting($,"<ej>🔀</ej>Random","Random");
    createSorting($,"<ej>🌍</ej>Region","Region");
    createSorting($,"<ej>👥</ej>Population","Population");
    createSorting($,"<ej>🌦️</ej>Climate","Climate");
    createSorting($,"<ej>🤑</ej>Cost","CostOfLiving");
    createSorting($,"<ej>👮</ej>Safety","Safety");
    createSorting($,"<ej>🚨</ej>Lack of Crime","Crime");
    createSorting($,"<ej>🍸</ej>Nightlife","Nightlife");
    createSorting($,"<ej>📚</ej>Education","Education");
    createSorting($,"<ej>☀️</ej>Sunshine","SunshineHours");
    createSorting($,"<ej>♨️</ej>Hottest","HotDays");
    createSorting($,"<ej>❄️</ej>Coldest","ColdDays");
    createSorting($,"<ej>☔</ej>Wettest","RainyDays");
    createSorting($,"<ej>🧳</ej>Nomad-friendly","DN-friendly");
    createSorting($,"<ej>🏳️‍🌈</ej>LGBTQ+-friendly","LGBT-friendly");
    createSorting($,"<ej>👩</ej>Women-friendly","Female-friendly");
    createSorting($,"<ej>👩‍👦</ej>Family-friendly","Family-friendly");
    createSorting($,"<ej>🥙</ej>Vegan-friendly","Veg-friendly");
    createSorting($,"<ej>🌆</ej>Pop. Density","Density");
    createSorting($,"<ej>🏖️</ej>Best Beaches","Beach");
    createSorting($,"<ej>⛰️</ej>Best Hikes","Hiking");
    createSorting($,"<ej>⛷️</ej>Best Skiing","WinterSports")
    
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
        $(".provinces").text("Province");
        switch(sortBy){ 
        case "Expat-friendly":
          $("span.sortBy").text("per Espatriati");
          $("span.bestorworst").text("Migliori")
          break;
        case "Name":
          $("span.sortBy").text("in Ordine Alfabetico");
          break;
        case "Random":
          $("span.sortBy").text("in Ordine Casuale");
          break;
        case "Region":
          $("span.sortBy").text("per Regione");
          break;
        case "CostOfLiving":
          $("span.sortBy").text("");
          $("span.bestorworst").text("Più economiche")
          break;
        case "Population":
          $("span.sortBy").text("per Popolazione");
          break;
        case "MonthlyIncome":
          $("span.sortBy").text("per Reddito Medio");
          $("span.bestorworst").text("");
          break;
        case 'Expat-friendly':case'LGBT-friendly':
          $("span.sortBy").text("");
          $("span.bestorworst").text("Più "+sortBy);
          break;
        case 'DN-friendly':case'Female-friendly'
        :case 'Family-friendly':case 'Veg-friendly':
          $("span.sortBy").text((sortBy==='DN-friendly'?"per Nomadi Digitali":"per Donne"));
          (sortBy==='Family-friendly'?$("span.sortBy").text("per Famiglie"):
          (sortBy==='Veg-friendly'?$("span.sortBy").text("per Vegani"):""));
          $("span.bestorworst").text("Migliori");
          break;
        case 'SunshineHours':
          $("span.sortBy").text("");
          $("span.bestorworst").text("Più soleggiate");
          break;
        case sortBy == 'HotDays',sortBy=='ColdDays':
          $("span.sortBy").text("");
          $("span.bestorworst").text((sortBy=='HotDays'?"Più calde":"Più fredde"));
          break;
        case 'Safety':
          $("span.sortBy").text("");
          $("span.bestorworst").text("Più sicure");
          break;
        case 'Crime':
          $("span.sortBy").text("con il minor tasso di criminalità");
          $("span.bestorworst").text("");
          break;
        case 'Beach':
          $("span.sortBy").text("");
          $("span.bestorworst").text("Migliori");
          $("span.provinces").text("Destinazioni balneari")
          break;
          case 'WinterSports':
          $("span.sortBy").text("");
          $("span.bestorworst").text("Migliori");
          $("span.provinces").text("Destinazioni sciistiche")
          break;
        default:
        $("span.sortBy").text("per "+sortBy);
        $("span.bestorworst").text("Migliori");
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
        
    title.append("<span class='bestorworst'></span> <span class='smallorlarge'></span> Province in "+
    "<span class='chosenArea'>Italia</span> <span class='sortBy'></span>");



    if (selection.length==0) {title.innerHTML="Non è stato possibile trovare alcuna provincia in base ai tuoi filtri."
  
    $("#output").html(
      "<p>Secondo i nostri dati, non ci sono "+
      "<span class='smallorlarge'></span> <span class='hotorcold'></span> "+
      "<span class='costofliving'></span> province in <span class='chosenArea'></span> "+
      "<span class='withthings'></span></p>."
      )
    
  }
  else{
    let province1st=selection[0];
    let output="<p>"+
    "Secondo i nostri dati, la <span class='bestorworst'></span> <span class='smallorlarge'></span> "+
    "<span class='hotorcold'></span> <span class='costofliving'></span> "+
    "provincia in <span class='chosenArea'>Italia</span> "+
    "<span class='withthings'></span> <span class='sortBy'></span> è "+
    "<b><a class='province1st'></a></b>, con un punteggio di <span id='score1'></span>/10.";
    if (selection.length>1){
      for (var i=2;i<=3&i<selection.length;i++){
        output+=(i===3?" e ":"</br>")+
        "<b><a class='province"+i+"'></a></b> si classifica "+(i===2?"seconda ":"terza ")+
        "con un punteggio di <span id='score"+i+"'></span>/10"
      }output+="."
    }output+="</p>"

    $("#output").html("<center>"+output+"</center>")
    
    $("a.province1st").text(province1st.Name)
    $("a.province1st").attr("href","https://expiter.com/it/province/"+province1st.Name.replace(/\s/g,"-")
     .replace("'","-").toLowerCase()+"/")
    if (selection.length>1){ let province2=selection[1]
    $("a.province2").text(province2.Name)
    $("a.province2").attr("href","https://expiter.com/it/province/"+province2.Name.replace(/\s/g,"-")
     .replace("'","-").toLowerCase()+"/")}
     if (selection.length>2){ let province3=selection[2]
    $("a.province3").text(province3.Name)
    $("a.province3").attr("href","https://expiter.com/it/province/"+province3.Name.replace(/\s/g,"-")
     .replace("'","-").toLowerCase()+"/")}
    }

    if (region_filters.length==1) {$(".chosenArea").text(region_filters[0])}
    else if (region_filters.length==2) {$(".chosenArea").text(region_filters[0]+" and "+region_filters[1])}
    else if (region_filters.length==3) {$(".chosenArea").text(region_filters[0]+", "+region_filters[1]+" and "+region_filters[2])}
    else if (region_filters.sort().toString() == "Lazio,Marche,Toscana,Umbria") {$(".chosenArea").text("Italia Centrale")}
    else if (region_filters.sort().toString() == "Abruzzo,Basilicata,Calabria,Campania,Molise,Puglia,Sardegna,Sicilia") {$(".chosenArea").text("Italia Meridionale")}
    else if (region_filters.sort().toString() == "Emilia-Romagna,Friuli-Venezia Giulia,Liguria,Lombardia,Piemonte,Trentino-Alto Adige,Valle d'Aosta,Veneto") {$(".chosenArea").text("Italia Settentrionale")}
    else if (region_filters.length>3) {$(".chosenArea").text("Italia")}

    if (additionalFilters.sort().toString()=="Pop1m+"||additionalFilters.sort().toString()=="Pop1m+,Pop500k+") $(".smallorlarge").text("Grandi");
    else if (additionalFilters.sort().toString()=="Pop300k+"||additionalFilters.sort().toString()=="Pop500k+"||additionalFilters.sort().toString()=="Pop300k+,Pop500k+") $(".smallorlarge").text("Medie");
    else if (additionalFilters.sort().toString()=="Pop300k-"||additionalFilters.sort().toString()=="Pop300k+,Pop300k-") $(".smallorlarge").text("Piccole");
     

    for (let i = 0; i < Math.min(data.length,30); i++) {
        let card = '<card id="'+data[i].Name+'"class="'+(data[i].Name=="Aosta"?"Aosta Valley":data[i].Region)+' paracard" '+
         'title="'+data[i].Name+', '+(data[i].Name=="Aosta"?"Aosta Valley":data[i].Region)+'"'+
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

        //if ($(window).width() > 765) {
        //card +='<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+data[i].Abbreviation+'.webp?tr=w-190,h-250,c-at_least" alt="'+data[i].Name+'"></img>'
       // }
      //  else{
          card +='<img title="'+data[i].Name+'" '+ (i>2?'loading="lazy"':"") +' src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+img+'.webp?tr=w-180,h-240,c-at_least,q-1,bl-1" width="180" height="240" alt="Provincia di '+data[i].Name+', '+data[i].Region+'"></img>'
      //  }

      if (data[i].Name.length>14){card += '<div class="frame"><center><h3 class="header" style="font-size:24px" >' + data[i].Name + '</h3></center></div>'}
      else card += '<div class="frame" ><center><h3 class="header">' + data[i].Name + '</h3></center></div> ';
      card += '<p class="region">' + data[i]["Region"]+'</p>';
      card += '<p class="population"><ej>👥</ej>Popolazione: <b style="color:white">'+data[i].Population.toLocaleString('en', {useGrouping:true}) +'</b>'+'</p>';
      card += '<p>💸Costo: '+ qualityScore("CostOfLiving",data[i].CostOfLiving) +'';
      card += '<p><ej>💰</ej>Spese: '+ qualityScore("Cost of Living (Individual)",data[i]["Cost of Living (Individual)"])+'</p>';
      card += '<p><ej>☀️</ej>Clima: '+ qualityScore("Climate",data[i].Climate) +'</p>';
      card += '<p><ej>🚑</ej>Assistenza sanitaria: '+ qualityScore("Healthcare",data[i].Healthcare) +'</p>';
      card += '<p><ej>🚌</ej>Trasporto: '+ qualityScore("PublicTransport",data[i]["PublicTransport"]) +'</p>';
      card += '<p><ej>👮🏽‍♀️</ej>Sicurezza: '+ qualityScore("Safety",data[i]["Safety"]) +'</p>';
      card += '<p><ej>📚</ej>Educazione: '+ qualityScore("Education",data[i]["Education"]) +'</p>';
      card += '<p><ej>🏛️</ej>Cultura: '+ qualityScore("Culture",data[i].Culture) +'</p>';
      card += '<p><ej>🍸</ej>Vita notturna: '+ qualityScore("Nightlife",data[i].Nightlife) +'</p>';
      card += '<p class="opacity6"><ej>⚽</ej>Ricreazione: '+ qualityScore("Sports & Leisure",data[i]["Sports & Leisure"])+'</p>';
      card += '<p class="opacity6"><ej>🍃</ej>Qualità dell\'aria: '+ qualityScore("AirQuality",data[i]["AirQuality"]) +'</p>';
      card += '<p class="opacity6"><ej>🏳️‍🌈</ej>LGBTQ+: '+ qualityScore("LGBT-friendly",data[i]["LGBT-friendly"]) +'</p>';
      card += '<p class="opacity4"><ej>👩</ej>Per le donne: '+ qualityScore("Female-friendly",data[i]["Female-friendly"]) +'</p>';
      card += '<p class="opacity4"><ej>👪</ej>Per la famiglia: '+ qualityScore("Family-friendly",data[i]["Family-friendly"]) +'</p>';
      card += '<p class="opacity4"><ej>🥗</ej>Per i vegani: '+ qualityScore("Veg-friendly",data[i]["Veg-friendly"]) +'</p>';
      card += '<p class="opacity4"><ej>🧳</ej>Per i nomadi: '+ qualityScore("DN-friendly",data[i]["DN-friendly"]) +'</p>';
      card += '<button class="more" style="font-size:large;" onclick="location.href=\'https://expiter.com/it/province/'+data[i].Name.replace(/\s+/g, '-').replace(/'/g, '-').toLowerCase()+'/\';"> Più>> </button>';
      card += '</card>'

      col += "<a href='https://expiter.com/it/province/"+data[i].Name.replace(/\s+/g, '-').replace(/'/g, '-').toLowerCase()+"\''>"+card+"</a></div>";
      
      mainContainer.append(col);
      
  }
  
}


var provinces = {};
var selection = [];
var region_filters = [];
var additionalFilters=[];
var dataset;

fetch('../dataset.json')
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
      for (let i = 0; i < data.length; i++) {
        let province = data[i];
        provinces[province["Name"]]=province;
        provinces[province["Name"]].index=i;
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
      let north=["Lombardia","Valle d'Aosta","Piemonte","Liguria","Trentino-Alto Adige", "Friuli-Venezia Giulia","Veneto","Emilia-Romagna"];
      let center=["Lazio","Toscana","Marche","Umbria"];
      let south=["Abruzzo","Molise","Campania","Puglia","Basilicata","Calabria","Sicilia","Sardegna"]

      selection=[];
      if (filter == "All") {
        selection=dataset;region_filters=regions;
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
        if (sortBy=="Name"||sortBy=="Region"||sortBy=="CostOfLiving"){ //ascending order
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
          $("#bestorworst").text("")
        }
        else if (sortBy == "Men" || sortBy == "Women"){
          $("#sortBy").text("by Higher Percentage of "+ sortBy);
          $("#bestorworst").text("")
        }
        else $("#sortBy").text("for "+sortBy);
        if (sortBy == "Healthcare" || sortBy == "Culture" || sortBy == "Nightlife" || sortBy == "Education"  ){
          $("#bestorworst").text("Best")
        }

    }

  
function qualityScore(quality,score){
  if (quality=="CostOfLiving"){
    if (score<4){return "<score class='excellent short'>cheap</score>"}
    else if (score>=4&&score<6){return "<score class='great medium'>affordable</score>"}
    else if (score>=6&&score<7){return "<score class='good medium'>average</score>"}
    else if (score>=7&&score<8.5){return "<score class='average long'>high</score>"}
    else if (score>=8.5){return "<score class='poor max'>expensive</score>"}
  }
  else if (quality=="Monthly Income"){
    if (score<1200){return "<score class='poor short'>"+score+"€/m</score>"}
    else if (score>=1200&&score<1600){return "<score class='average medium'>"+score+"€/m</score>"}
    else if (score>=1600&&score<2000){return "<score class='good medium'>"+score+"€/m</score>"}
    else if (score>=2000&&score<2500){return "<score class='great long'>"+score+"€/m</score>"}
    else if (score>=2500){return "<score class='great long'>"+score+"€/m</score>"}
  }
  else{
    if (score<4){return "<score class='poor short'>poor</score>"}
    else if (score>=4&&score<6){return "<score class='average medium'>okay</score>"}
    else if (score>=6&&score<7){return "<score class='good medium'>good</score>"}
    else if (score>=7&&score<8.5){return "<score class='great long'>great</score>"}
    else if (score>=8.5){return "<score class='excellent max'>excellent</score>"}
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
 
    let title = document.createElement("h2");
        
    title.innerHTML="<span id='bestorworst'></span> <span id='smallorlarge'></span> Provinces in <span id='chosenArea'>Italy</span> <span id='sortBy'></span>";
    title.classList="column is-12 title";


    mainContainer.appendChild(title);


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
        card.innerHTML += '<p>💰Income: '+ qualityScore("Monthly Income",data[i]["MonthlyIncome"])+'';
        card.innerHTML += '<p>💸Cost: '+ qualityScore("CostOfLiving",data[i].CostOfLiving) +'';
        card.innerHTML += '<p>☀️Climate: '+ qualityScore("Climate",data[i].Climate) +'';
        card.innerHTML += '<p>🚑Healthcare: '+ qualityScore("Healthcare",data[i].Healthcare) +'';
        card.innerHTML += '<p>🚌Transport: '+ qualityScore("PublicTransport",data[i]["Public Transport"]) +'';
        card.innerHTML += '<p>👮🏽‍♀️Safety: '+ qualityScore("Safety",data[i]["Safety"]) +'';
        card.innerHTML += '<p>📚Education: '+ qualityScore("Education",data[i]["Education"]) +'';
        card.innerHTML += '<p>🏛️Culture: '+ qualityScore("Culture",data[i].Culture) +'';
        card.innerHTML += '<p>🍸Nightlife: '+ qualityScore("Nightlife",data[i].Nightlife) +'';
        card.innerHTML += '<p class="opacity6>⚽Recreation: '+ qualityScore("Recreation",data[i]["Sports & Leisure"])+'';
        card.innerHTML += '<p class="opacity6">🍃Air quality: '+ qualityScore("Air Quality",data[i]["Air Quality"]) +'';
        card.innerHTML += '<p class="opacity4">👩For women: '+ qualityScore("FemaleFriendly",data[i]["Female-friendly"]) +'';
        card.innerHTML += '<p class="opacity4">👪For family: '+ qualityScore("FamilyFriendly",data[i]["Family-friendly"]) +'';
        card.innerHTML += '<p class="opacity4">🥗For vegans: '+ qualityScore("VegFriendly",data[i]["Veg-friendly"]) +'';
        card.innerHTML += '<button class="opacity4" style="font-size:large;" onclick="location.href=\'./province/'+data[i].Name+'.html\';"> More>> </button>';
        col.classList = 'column';
        card.classList = 'paracard';
        let image = 'img/'+data[i].Abbreviation+'.jpg';
        if (doesImageExist(image)){
        card.title=data[i].Name+', '+data[i].Region;
        card.style.backgroundImage = 'url('+image+')';
      }
        card.id = data[i].Name;
        col.innerHTML = card.outerHTML;
        mainContainer.appendChild(col);
    }
    
}

regions = ["Abruzzo","Basilicata","Calabria","Campania","Emilia-Romagna","Friuli-Venezia Giulia","Lazio","Liguria","Lombardia","Marche","Molise",
           "Piemonte","Puglia","Sardegna","Sicilia","Toscana","Trentino-Alto Adige","Umbria","Valle d&#39;Aosta","Veneto"];

 $(document).ready(function(){
  if (!!document.getElementById("filters")){
  let filters = document.getElementById("filters");
for (i=0;i<regions.length;i++){
if (i==0){
  row = document.createElement("row");
  row.classList="columns is-multiline is-mobile";
  row.innerHTML+='<p class="column is-12">Filter by:</p>'
  row.innerHTML+='<button class="button column clearfilter" title="Clear Selection" onClick=\'filterDataByRegion('+"\""+"Clear"+"\")"+'\'>'+"🧹Clear"+"</button>";
  row.innerHTML+='<button class="button column allfilter" title="Select All" onClick=\'filterDataByRegion('+"\""+"All"+"\")"+'\'>'+"➕All"+"</button>";
  row.innerHTML+='<button class="button column specialfilter" id="North" onClick=\'filterDataByRegion('+"\""+'North'+"\");$(this).toggleClass(\"selected\")"+'\'>'+'🍹🏔️North'+"</button>";
  row.innerHTML+='<button class="button column specialfilter" id="Center" onClick=\'filterDataByRegion('+"\""+'Center'+"\");$(this).toggleClass(\"selected\")"+'\'>'+'🍷🏛️Center'+"</button>";
  row.innerHTML+='<button class="button column specialfilter" id="South" onClick=\'filterDataByRegion('+"\""+'South'+"\");$(this).toggleClass(\"selected\")"+'\'>'+'🍕🏖️South'+"</button>";
  row.innerHTML+='<p class="column is-12"></p>'
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
  filters.append(row)
  
}

}

);


function newPage(){
  let province = getData(document.title)

  appendData([province]);


  $(".title").text(province.Name+' for Expats and Nomads');
  }

function getInfo(name,i){
  
}

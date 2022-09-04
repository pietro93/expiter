var provinces = {};
var facts={};
var selection = [];
var region_filters = [];
var additionalFilters=[];
var dataset;
var avg;

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
        selection=dataset.slice(0, 107); ;region_filters=regions;
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
        card.innerHTML += '<p>💰Income: '+ qualityScore("Monthly Income",data[i]["MonthlyIncome"])+'';
        card.innerHTML += '<p>💸Cost: '+ qualityScore("CostOfLiving",data[i].CostOfLiving) +'';
        card.innerHTML += '<p>☀️Climate: '+ qualityScore("Climate",data[i].Climate) +'';
        card.innerHTML += '<p>🚑Healthcare: '+ qualityScore("Healthcare",data[i].Healthcare) +'';
        card.innerHTML += '<p>🚌Transport: '+ qualityScore("PublicTransport",data[i]["PublicTransport"]) +'';
        card.innerHTML += '<p>👮🏽‍♀️Safety: '+ qualityScore("Safety",data[i]["Safety"]) +'';
        card.innerHTML += '<p>📚Education: '+ qualityScore("Education",data[i]["Education"]) +'';
        card.innerHTML += '<p>🏛️Culture: '+ qualityScore("Culture",data[i].Culture) +'';
        card.innerHTML += '<p>🍸Nightlife: '+ qualityScore("Nightlife",data[i].Nightlife) +'';
        card.innerHTML += '<p class="opacity6>⚽Recreation: '+ qualityScore("Recreation",data[i]["Sports & Leisure"])+'';
        card.innerHTML += '<p class="opacity6">🍃Air quality: '+ qualityScore("AirQuality",data[i]["AirQuality"]) +'';
        card.innerHTML += '<p class="opacity6">🏳️‍🌈LGBTQ+: '+ qualityScore("LGBTFriendly",data[i]["LGBT-friendly"]) +'';
        card.innerHTML += '<p class="opacity4">👩For women: '+ qualityScore("FemaleFriendly",data[i]["Female-friendly"]) +'';
        card.innerHTML += '<p class="opacity4">👪For family: '+ qualityScore("FamilyFriendly",data[i]["Family-friendly"]) +'';
        card.innerHTML += '<p class="opacity4">🥗For vegans: '+ qualityScore("VegFriendly",data[i]["Veg-friendly"]) +'';
        card.innerHTML += '<p class="opacity4">🧳For nomads: '+ qualityScore("DNFriendly",data[i]["DN-friendly"]) +'';
        card.innerHTML += '<button class="more" style="font-size:large;" onclick="location.href=\'./province/'+data[i].Name+'.html\';"> More>> </button>';
        col.classList = 'column';
        card.classList = 'paracard';
        let image = 'img/'+data[i].Abbreviation+'.jpg';
        card.title=data[i].Name+', '+data[i].Region;
        card.style.backgroundImage = 'url('+image+')';
        card.id = data[i].Name;
        col.innerHTML = card.outerHTML;
        mainContainer.appendChild(col);
    }
    
}

regions = ["Abruzzo","Basilicata","Calabria","Campania","Emilia-Romagna","Friuli-Venezia Giulia","Lazio","Liguria","Lombardia","Marche","Molise",
           "Piemonte","Puglia","Sardegna","Sicilia","Toscana","Trentino-Alto Adige","Umbria","Valle d&#39;Aosta","Veneto"];

 $(document).ready(function(){
  setNavBar();
  if (!!document.getElementById("filters")){
  let filters = document.getElementById("filters");
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
  
}

}

);


function newPage(){
  let province = getData(document.title.split(" - ")[0])
  let info = getInfo(province)

  appendData([province]);
 

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
  " This is "+(province.SunshineHours>236?"<b class='green'>"+(province.SunshineHours/236*100-100).toFixed(2)+"% more</b> than the average for Italy":"<b class='red'>"+(100-(province.SunshineHours/236)*100).toFixed(2)+"% less</b> than the average for Italy")+"."+
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
  "Around "+province.CyclingLanes/10+"km per 10k inhabitants of the main city in "+name+" consist of bicycle lanes. This makes "+name+" "+(province.CyclingLanes>avg.CyclingLanes*.8?"<b class='green'>somewhat bike-friendly by Italian standards":(province.CyclingLanes>avg.CyclingLanes*1.2?"<b class='green'>very bike-friendly by Italian standards":"<b class='red'>not very bike-friendly"))+"</b>. "
  
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
      '<li><a href="#">About</a></li>'+
  '</ul>'+
 '<a href="/index.html"><h1 class="logo">Italy Expats & Nomads</h1></a>'+
'</div>'
}
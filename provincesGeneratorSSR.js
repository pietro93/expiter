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
var avg;
var regions ={};

fetch('https://expiter.com/dataset.json', {method:"Get"})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        //console.log(dom.window.document.querySelector("body").textContent)
        dataset=data;  
        const html = fs.readFileSync('./provincesTemplate.html','utf8');
        const dom = new jsdom.JSDOM(html);
  
        const $ = require('jquery')(dom.window);
        setProvinces($)
        setNavBar($)
        let newHtml = dom.window.document.documentElement.outerHTML;
         fs.writeFile('./provinces.html', newHtml, function (err, file) {
            if (err) throw err;
            else console.log('provinces.html'+' Saved!');
        });
        
    })
    .catch(function (err) {
        console.log('error: ' + err);
    }
    )

function setProvinces($){
    let mainContainer = $("#app");
  
    let title = $("#title")
    
    title.append('Italian Provinces by Region')

    avg = dataset[107]
    for (var i=108;i<dataset.length;i++){
        let row = '<row id="'+dataset[i].Name.split(" ")[0]+'" class="columns is-multiline is-mobile"><h2>'+dataset[i].Name+'</h2></row>'
        mainContainer.append(row)
    }
    selection=dataset.slice(0,107)
    let data = selection.sort(dynamicSort("Region")) 

    for (var i=0; i<selection.length; i++){
      console.log("creating card for "+data[i].Name)
     let card = '<card id="'+data[i].Name+'"class="'+(data[i].Name=="Aosta"?"Aosta Valley":data[i].Region)+' paracard" '+
        'title="'+data[i].Name+', '+(data[i].Name=="Aosta"?"Aosta Valley":data[i].Region)+'"'+
         '>';
         
     let col = "<div class='column'>";

        //if ($(window).width() > 765) {
        //card +='<img loading="lazy" src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+data[i].Abbreviation+'.webp?tr=w-190,h-250,c-at_least" alt="'+data[i].Name+'"></img>'
       // }
      //  else{
          card +='<img '+ (i>2?'loading="lazy"':"") +' src="https://ik.imagekit.io/cfkgj4ulo/italy-cities/'+data[i].Abbreviation+'.webp?tr=w-180,h-240,c-at_least,q-1,bl-1" width="180" height="240" alt="'+data[i].Name+'"></img>'
      //  }

        if (data[i].Name.length>14){card += '<div class="frame"><center><h3 class="header" style="font-size:24px" data-toc-skip>' + data[i].Name + '</h3></center></div>'}
        else card += '<div class="frame" ><center><h3 class="header" data-toc-skip>' + data[i].Name + '</h3></center></div> ';
        card += '<p class="region">' + data[i]["Region"]+'</p>';
        card += '<p class="population"><ej>👥</ej>Population: <b style="color:white">'+data[i].Population.toLocaleString('en', {useGrouping:true}) +'</b>'+'</p>';
        card += '<p>&#128184Cost: '+ qualityScore($,"CostOfLiving",data[i].CostOfLiving) +'';
        card += '<p><ej>💰</ej>Expenses: '+ qualityScore($,"Cost of Living (Individual)",data[i]["Cost of Living (Individual)"])+'</p>';
        card += '<p><ej>☀️</ej>Climate: '+ qualityScore($,"Climate",data[i].Climate) +'</p>';
        card += '<p><ej>🚑</ej>Healthcare: '+ qualityScore($,"Healthcare",data[i].Healthcare) +'</p>';
        card += '<p><ej>🚌</ej>Transport: '+ qualityScore($,"PublicTransport",data[i]["PublicTransport"]) +'</p>';
        card += '<p><ej>👮🏽‍♀️</ej>Safety: '+ qualityScore($,"Safety",data[i]["Safety"]) +'</p>';
        card += '<p><ej>📚</ej>Education: '+ qualityScore($,"Education",data[i]["Education"]) +'</p>';
        card += '<p><ej>🏛️</ej>Culture: '+ qualityScore($,"Culture",data[i].Culture) +'</p>';
        card += '<p><ej>🍸</ej>Nightlife: '+ qualityScore($,"Nightlife",data[i].Nightlife) +'</p>';
        card += '<p class="opacity6"><ej>⚽</ej>Recreation: '+ qualityScore($,"Sports & Leisure",data[i]["Sports & Leisure"])+'</p>';
        card += '<p class="opacity6"><ej>🍃</ej>Air quality: '+ qualityScore($,"AirQuality",data[i]["AirQuality"]) +'</p>';
        card += '<p class="opacity6"><ej>🏳️‍🌈</ej>LGBTQ+: '+ qualityScore($,"LGBT-friendly",data[i]["LGBT-friendly"]) +'</p>';
        card += '<p class="opacity4"><ej>👩</ej>For women: '+ qualityScore($,"Female-friendly",data[i]["Female-friendly"]) +'</p>';
        card += '<p class="opacity4"><ej>👪</ej>For family: '+ qualityScore($,"Family-friendly",data[i]["Family-friendly"]) +'</p>';
        card += '<p class="opacity4"><ej>🥗</ej>For vegans: '+ qualityScore($,"Veg-friendly",data[i]["Veg-friendly"]) +'</p>';
        card += '<p class="opacity4"><ej>🧳</ej>For nomads: '+ qualityScore($,"DN-friendly",data[i]["DN-friendly"]) +'</p>';
        card += '<button class="more" style="font-size:large;" onclick="location.href=\'./province/'+data[i].Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()+'/\';"> More>> </button>';
        card += '</card>'

        col += "<a href='./province/"+data[i].Name.replace(/\s+/g, '-').replace(/'/g, '-').toLowerCase()+"\''>"+card+"</a></div>";
   
        $("#"+data[i].Region.split(" ")[0]).append(col)
        }
  }


  function setNavBar($){
    let navbar = $("#navbar");
    navbar.append(
    '<div class="navbar-container">'+
    '<input type="checkbox" name="navbar" id="nbar">'+
    '<div class="hamburger-lines">'+
        '<span class="line line1"></span>'+
        '<span class="line line2"></span>'+
        '<span class="line line3"></span>'+
    '</div>'+
    '<ul class="menu-items">'+
        '<li><a href="/">Home</a></li>'+
        '<li><a href="../resources">Resources</a></li>'+
        '<li><a href="../tools/codice-fiscale-generator/">Tools</a></li>'+
        '<li><a href="../app#About">About</a></li>'+
        '<li><a href="https://forms.gle/WiivbZg8336TmeUPA" target="_blank">Take Survey</a></li>'+
        '</ul>'+
   '<a href="/"><p class="logo">Italy Expats & Nomads</p></a>'+
  '</div>')
  }
  
  
function qualityScore($,quality,score){
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
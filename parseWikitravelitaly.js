import { createServer } from 'http';
import fetch from 'node-fetch';

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

const fs = require("fs");
const https = require("https");


fetch('https://expiter.com/dataset.json', {method:"Get"})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        //console.log(dom.window.document.querySelector("body").textContent)
        dataset=data;  
        fetchData();
    })

function fetchData(){
for (var i=0; i<17; i++){
    let province=dataset[i].Name;
    facts[province]={};

    const file = fs.createWriteStream("temp/it-parsedDataAbout"+province+".txt");

    let wikiUrl = province;
    /*if (province=="Reggio Calabria")wikiUrl="Reggio di Calabria"
    else if (province=="Roma")wikiUrl="Rome"
    else if (province=="Firenze")wikiUrl="Florence"
    else if (province=="Venezia")wikiUrl="Venice"
    else if (province=="Milano")wikiUrl="Milan"
    else if (province=="Padova")wikiUrl="Padua"
    else if (province=="Mantova")wikiUrl="Mantua"
    else if (province=="Lodi")wikiUrl="Lodi_(Lombardy)"*/
    wikiUrl = "https://it.m.wikivoyage.org/wiki/"+wikiUrl.replace(/\s/g,"_");
    console.log("Fetching data from: "+wikiUrl)
    
setTimeout(function(){
  https.get(wikiUrl, response => {
  var stream = response.pipe(file);

  stream.on("finish", function() {
       parseData(province)
       console.log("Success.")
  });
});
},10+i*20+i)
}
console.log("Done!")
}

function parseData(province){
    const html = fs.readFileSync('temp/it-parsedDataAbout'+province+'.txt','utf8');
    console.log("parsing data about "+province+"...")
    const dom = new jsdom.JSDOM(html);
    const $ = require('jquery')(dom.window);
    format($,"#mf-section-0");
    $("#Da_sapere").parent().next().attr("id","infotarget1");
    $("#Cenni_geografici").parent().next().attr("id","infotarget2");
    format($,"#infotarget1");format($,"#infotarget2");
   
    let provinceData=
    $("#mf-section-0 > p").html()+"</br>"+
    ($("#infotarget1 > p").html()!=undefined?$("#infotarget1 > p").html():"")+"</br>"+
    ($("#infotarget2").html()!=undefined?$("#infotarget2").html():"")

    //console.log(">>>>>"+" "+provinceData)
    
    let getAround=$("#Come_spostarsi").parent().next().attr("id","GAtarget")
    format($,"#GAtarget")
    $("#GAtarget > p > style").remove();
    $("#GAtarget > * > .mw-kartographer-maplink").remove();
    
    $("#GAtarget- > a > *").contents().unwrap();
    $("#GAtarget > * > a").contents().unwrap();
    
    $("#GAtarget > div").remove();
    $("#GAtarget > p > abbr").remove();
    
    
    $(".mw-editsection").remove();

    for (var i=0;i<$("#GAtarget > h3").length;i++){
        (($($("#GAtarget > h3")[i]).next().prop("tagName")=="H3")?($($("#GAtarget > h3")[i]).remove()):"")
      } 

    for (var i = 0; i < $("#GAtarget > h3 .mw-headline").length;i++){
    $($("#GAtarget > h3 .mw-headline")[i]).html(
        "<h4>"+$($("#GAtarget > h3 .mw-headline")[i]).text().replace("By ","").replace("On ","")
        .replace("bicycle","Cycling").replace("foot","Walking").replace("car","Driving").toUpperCase()
        +"</h4>")
    }
    
    for (var i = 0; i < $("#GAtarget > * > h4 .mw-headline").length;i++){
    $($("#GAtarget > * > h4 .mw-headline")[i]).html(
        "<h5>"+$($("#GAtarget > * > h4 .mw-headline")[i]).text().replace("By ","").replace("On ","").replace("bicycle","Cycling").replace("foot","Walking").toUpperCase()
        +"</h5>")
    }
    $("#GAtarget > h3 > *").contents().unwrap()
    $("#GAtarget > h3").contents().unwrap()
    //console.log($("#GAtarget > h3 .mw-headline").text())
    $("#GAtarget- > p > span").remove();
    $("#GAtarget > p > div").remove();
    $("#GAtarget > p > sup").remove();
    $("#GAtarget > p > bdi").remove();
    $("#GAtarget > ul > li > bdi").remove();
    $("#GAtarget > ul > li > span").remove();

    getAround=getAround.html();
    getAround= clean(getAround);
    //console.log(">>>>>"+" "+getAround)
    provinceData=clean(provinceData);

    console.log("province data: "+provinceData)
    console.log("getaround: "+getAround)
    
    console.log('Writing temp/it-parsedDataAbout'+province+'.txt...')
    //facts[province]["parsedData"]=provinceData
    let parsedData = provinceData+"%%%"+getAround;
    fs.writeFile('temp/it-parsedDataAbout'+province+'.txt', parsedData, function (err, file) {
     if (err) {console.log("error formatting data about "+province); throw err; }
     })

}

function clean(raw){
 raw = raw + "";
 raw = raw.replace("( )","").replace(new RegExp("<li></li>", 'g'),"").replace(new RegExp("Ã ", 'g'),"à")
 .replace(new RegExp("Ã", 'g'),"à").replace(new RegExp("<ul></ul>", 'g'),"")
 .replace(new RegExp("<p></p>", 'g'),"").replace(new RegExp("<p> </p>", 'g'),"").replace(new RegExp("<p>\n</p>", 'g'),"");
 return raw;
}

function format($,target){
    $(target+" > p > style").remove()
    $(target+" > p > span").remove()
    $(target+" > p > div").remove()
    $(target+" > p > sup").remove()
    $(target+" > p > a > *").contents().unwrap();
    $(target+" > p > * > a").contents().unwrap();
    $(target+" > p > a").contents().unwrap();
    $(target+" > p > :not(p)* + p").remove()
    $(target+" > p > bdi").remove()
    
    
    $(target+" > style").remove()
    $(target+" > span").remove()
    $(target+" > div").remove()
    $(target+" > sup").remove()
    $(target+" > a > *").contents().unwrap();
    $(target+" > * > a").contents().unwrap();
    $(target+" > a").contents().unwrap();
    $(target+" > :not(p)*").remove()
    $(target+" > :not(p)* + p").remove()
    $(target+" > :not(p)* + p").remove()
    $(target+" > bdi").remove()
    
}


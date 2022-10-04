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
for (var i=0; i<107; i++){
    let province=dataset[i].Name;
    facts[province]={};

    const file = fs.createWriteStream("temp/parsedDataAbout"+province+".txt");

    let wikiUrl = province;
    if (province=="Reggio Calabria")wikiUrl="Reggio di Calabria"
    else if (province=="Roma")wikiUrl="Rome"
    else if (province=="Firenze")wikiUrl="Florence"
    else if (province=="Venezia")wikiUrl="Venice"
    else if (province=="Milano")wikiUrl="Milan"
    else if (province=="Padova")wikiUrl="Padua"
    else if (province=="Mantova")wikiUrl="Mantua"
    else if (province=="Lodi")wikiUrl="Lodi_(Lombardy)"
    wikiUrl = "https://en.m.wikivoyage.org/wiki/"+wikiUrl.replace(/\s/g,"_");
    console.log("Fetching data from: "+wikiUrl)
    
setTimeout(function(){
  https.get(wikiUrl, response => {
  var stream = response.pipe(file);

  stream.on("finish", function() {
       parseData(province)
       
  });
});
},10+i*20+i)
}
}

function parseData(province){
    const html = fs.readFileSync('temp/parsedDataAbout'+province+'.txt','utf8');
    console.log("parsing data about "+province+"...")
    const dom = new jsdom.JSDOM(html);
    const $ = require('jquery')(dom.window);
    $("#mf-section-0 > p > style").remove()
    $("#mf-section-0 > p > span").remove()
    $("#mf-section-0 > p > div").remove()
    $("#mf-section-0 > p > sup").remove()
    $("#mf-section-0 > :not(p)*").remove()
    $("#mf-section-0 > p > :not(p)* + p").remove()
    $("#mf-section-0 > :not(p)* + p").remove()
    $("#mf-section-0 > p > bdi").remove()
    $("#mf-section-0 > p > a > *").contents().unwrap();
    $("#mf-section-0 > p > * > a").contents().unwrap();
    $("#mf-section-0 > p > a").contents().unwrap();

    if (province=="Reggio Calabria"){
    for (let i=0;i<$("#mf-section-0 > p*").length;i++){
        
        let p = $("#mf-section-0 > p")[i];
        
        if ($(p).html().length>1){
        let text=$(p).text().replace(/\s/g,"")//replace whitespaces in case they are at the end of string
        if (text[text.length-1]!="."){
            console.log("last character detected: "+text[text.length-1]+" in text: "+$(p).text());
            console.log("removing "+$(p).html());$(p).remove()}
        }
    }}
    
    
    
    let provinceData=$("#mf-section-0").html()+""
    //console.log(">>>>>"+" "+provinceData)

    let getAround=$("#Get_around").parent().next().attr("id","GAtarget")
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

    //console.log("province data: "+provinceData)
    //console.log("getaround: "+getAround)
    

    //facts[province]["parsedData"]=provinceData
    let parsedData = provinceData+"%%%"+getAround
    fs.writeFile('temp/parsedDataAbout'+province+'.txt', parsedData, function (err, file) {
     if (err) throw err;})

}

function clean(raw){
 raw = raw + "";
 raw = raw.replace("( )","").replace(new RegExp("<li></li>", 'g'),"").replace(new RegExp("Ã ", 'g'),"à")
 .replace(new RegExp("Ã", 'g'),"à").replace(new RegExp("<ul></ul>", 'g'),"")
 .replace(new RegExp("<p></p>", 'g'),"").replace(new RegExp("<p> </p>", 'g'),"").replace(new RegExp("<p>\n</p>", 'g'),"");
 return raw;
}
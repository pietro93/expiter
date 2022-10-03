import { createServer } from 'http';
import fetch from 'node-fetch';
import fs from 'fs';

var dataset;
var siteMap= '<?xml version="1.0" encoding="UTF-8"?>'+
'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+
'   <url>'+
'   <loc>https://expiter.com/</loc>'+
'   <priority>1</priority>'+
'   </url>'+

'   <url>'+
'   <loc>https://expiter.com/app/</loc>'+
'   <priority>1</priority>'+
'   </url>'+

'   <url>'+
'   <loc>https://expiter.com/about/</loc>'+
'   <priority>.5</priority>'+
'   </url>'+

'   <url>'+
'   <loc>https://expiter.com/resources/</loc>'+
'   <priority>.5</priority>'+
'   </url>'+

    '<url>'+
'   <loc>https://expiter.com/provinces/</loc>'+
'   <priority>.5</priority>'+
'   </url>'+

    '<url>'+
'   <loc>https://expiter.com/resources/codice-fiscale-generator/</loc>'+
'   <priority>.9</priority>'+
'   </url>'

createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Hello World!');
}).listen(8080);

fetch('https://expiter.com/dataset.json', {method:"Get"})
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        dataset=data;  
        for (let i = 0; i < 107; i++){
            let province = dataset[i];
            console.log("adding /province/" + dataset[i].Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase() +"/ to sitemap")
            siteMap=siteMap.concat('<url>'+
            '<loc>https://expiter.com/province/'+dataset[i].Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()+'/</loc>'+
            '<priority>.8</priority>'+
            '</url>')
        }
        for (let i = 0; i < 107; i++){
            let province = dataset[i];
            console.log("adding /img/" +dataset[i].Abbreviation+ ".webp to sitemap")
            siteMap=siteMap.concat('<url>'+
            '<loc>https://expiter.com/img/'+dataset[i].Abbreviation+'.webp</loc>'+
            '<priority>0</priority>'+
            '</url>')
        }
        for (let i = 108; i < 128; i++){
            let region = dataset[i];
            console.log("adding /img/map/" + dataset[i].Name.replace(/'/g, '-').replace(/\s+/g, '-') +"-provinces.webp to sitemap")
            siteMap=siteMap.concat('<url>'+
            '<loc>https://expiter.com/img/map/'+dataset[i].Name.replace(/'/g, '-').replace(/\s+/g, '-') +"-provinces.webp</loc>"+
            '<priority>0</priority>'+
            '</url>')
        }

        siteMap=siteMap.concat('</urlset>')
        
        var fileName = './autositemap.xml';

        
        var appSiteMap='<?xml version="1.0" encoding="UTF-8"?> '+'\n'+
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> '+'\n'
        const regions = ["Abruzzo","Basilicata","Calabria","Campania","Emilia-Romagna","Friuli-Venezia-Giulia","Lazio","Liguria","Lombardia","Marche","Molise",
            "Piemonte","Puglia","Sardegna","Sicilia","Toscana","Trentino-Alto-Adige","Umbria","Valle-d-Aosta","Veneto"];
        var region_filters = ["All","North","South","Center"].concat(regions)
        /*region_filters = region_filters.concat(
            combine(regions,2)//.concat(combine(regions,3))//.concat(combine(regions,4))
        )*/
        console.log(region_filters)

        const filters = ["Pop300k-","Pop300k+","Pop500k+","Pop1m+","Cold","Hot","Temperate","HasMetro","HasUni","HasBeach","HasSkiing"].sort();
        const sortings = ["Expat-friendly","DN-friendly","LGBT-friendly","Female-friendly","ColdDays","SunshineHours","HotDays",
        "Name","CostOfLiving","Population","Veg-friendly","Family-friendly","Density","Climate","Safety","Nightlife",
        "Education","Crime"
        ,"Beach","WinterSports","Hiking"].sort()
        

        var filter_filters=//filters.concat(
            combine(filters,2).concat(combine(filters,3))//.concat(combine(filters,4))
            //.concat(combine(filters,5)).concat(combine(filters,6)).concat(combine(filters,7))
            //.concat(combine(filters,8)).concat(combine(filters,9))
        //)
        filter_filters= filter_filters.filter(
        item => (!item.includes("Pop300k-","Pop300k+","Pop500k","Pop1m+")))
        .filter(item => (!item.includes("Cold","Hot","Temperate")))
        console.log(filter_filters)
        

        let sm=[]; let appSiteMaps=["",""];
        for (var wf=0;wf<=20;wf++) {sm[wf]="";appSiteMaps[wf]=""}
        
        let rawList="";
        for (var s=0; s<sortings.length; s++){
            rawList+='https://expiter.com/app/?sort='+sortings[s]+'\n';
            sm[0]= sm[0].concat(
                '<url>'+
                '<loc>https://expiter.com/app/?sort='+sortings[s]+'</loc>'+
                '</url> '+'\n'
                    );
            for (var r=0; r<region_filters.length; r++){
                    rawList+='https://expiter.com/app/?sort='+sortings[s]+'&region='+region_filters[r]+'\n';
                    sm[0] = sm[0].concat(
                    '<url>'+
                    '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'</loc>'+
                    '</url> '+'\n'
                        );
                    console.log('adding ?sort='+sortings[s]+'&amp;region='+region_filters[r]+' to sitemap')

                    for (var f=0; f<filter_filters.length; f++){
                        rawList+='https://expiter.com/app/?sort='+sortings[s]+'&region='+region_filters[r]+'&filter='+filter_filters[f]+'\n';
                        if (f<(filter_filters.length)*.044){
                        sm[1]=sm[1].concat(
                        '<url>'+
                        '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                        '</url> '+'\n'
                            );
                        } else if (f>=(filter_filters.length)*.044&f<(filter_filters.length)*.08) {
                            sm[2]=sm[2].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.08&&f<(filter_filters.length)*.125) {
                            sm[3]=sm[3].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.15&&f<(filter_filters.length)*.2) {
                            sm[4]=sm[4].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.2&&f<(filter_filters.length)*.25) {
                            sm[5]=sm[5].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.25&&f<(filter_filters.length)*.3) {
                            sm[6]=sm[6].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.3&&f<(filter_filters.length)*.35) {
                            sm[7]=sm[7].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.35&&f<(filter_filters.length)*.4) {
                            sm[8]=sm[8].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.4&f<(filter_filters.length)*.45) {
                            sm[9]=sm[9].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.45&f<(filter_filters.length)*.5) {
                            sm[10]=sm[10].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.5&f<(filter_filters.length)*.55) {
                            sm[11]=sm[11].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.55&f<(filter_filters.length)*.6) {
                            sm[12]=sm[12].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.6&f<(filter_filters.length)*.66) {
                            sm[13]=sm[13].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.66&f<(filter_filters.length)*.7) {
                            sm[14]=sm[14].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.75&f<(filter_filters.length)*.8) {
                            sm[15]=sm[15].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.8&f<(filter_filters.length)*.85) {
                            sm[16]=sm[16].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.85&f<(filter_filters.length)*.9) {
                            sm[17]=sm[17].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.9&f<(filter_filters.length)*.95) {
                            sm[18]=sm[18].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.95&f<(filter_filters.length)*1) {
                            sm[19]=sm[19].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else {
                            sm[20]=sm[20].concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        console.log('adding ?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+' to sitemap')
                }
            }
        }

        console.log("generating appSiteMap(s)")
        
        appSiteMaps[0]=appSiteMap.concat(sm[0]).concat(sm[1]).concat('</urlset>');
        for (var i=2;i<=20;i++){
        appSiteMaps[i]=appSiteMap.concat(sm[i]).concat('</urlset>');
        }
                
        var fileName2 = './app-sitemap.xml';
            
        fs.writeFile(fileName, siteMap, function (err, file) {
            if (err) throw err;
            else console.log(fileName+' Saved!'+" Urls submitted: "+(siteMap.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap.xml', appSiteMaps[0], function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap.xml'+' Saved!'+" Urls submitted: "+(appSiteMaps[0].split("<url>").length - 1));
        });
        for (var i=2;i<=20;i++){
            let x=i;
        fs.writeFile('sitemap/app-sitemap-'+(x)+'.xml', appSiteMaps[x], function (err, file) {
            if (err) throw err;
            else "done";
        });
        console.log('./app-sitemap-'+x+'.xml'+' Saved!'+" Urls submitted: "+(appSiteMaps[x].split("<url>").length - 1))}
        /*
        fs.writeFile('sitemap/app-sitemap-3.xml', appSiteMap3, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-3.xml'+' Saved!'+" Urls submitted: "+(appSiteMap3.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-4.xml', appSiteMap4, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-4.xml'+' Saved!'+" Urls submitted: "+(appSiteMap4.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-5.xml', appSiteMap5, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-5.xml'+' Saved!'+" Urls submitted: "+(appSiteMap5.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-6.xml', appSiteMap6, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-6.xml'+' Saved!'+" Urls submitted: "+(appSiteMap6.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-7.xml', appSiteMap7, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-7.xml'+' Saved!'+" Urls submitted: "+(appSiteMap7.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-8.xml', appSiteMap8, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-8.xml'+' Saved!'+" Urls submitted: "+(appSiteMap8.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-9.xml', appSiteMap9, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-9.xml'+' Saved!'+" Urls submitted: "+(appSiteMap9.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-10.xml', appSiteMap10, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-10.xml'+' Saved!'+" Urls submitted: "+(appSiteMap10.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-11.xml', appSiteMap11, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-11.xml'+' Saved!'+" Urls submitted: "+(appSiteMap11.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-12.xml', appSiteMap12, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-12.xml'+' Saved!'+" Urls submitted: "+(appSiteMap12.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-13.xml', appSiteMap13, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-13.xml'+' Saved!'+" Urls submitted: "+(appSiteMap13.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-14.xml', appSiteMap14, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-14.xml'+' Saved!'+" Urls submitted: "+(appSiteMap14.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-15.xml', appSiteMap15, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-15.xml'+' Saved!'+" Urls submitted: "+(appSiteMap15.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-16.xml', appSiteMap16, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-16.xml'+' Saved!'+" Urls submitted: "+(appSiteMap16.split("<url>").length - 1));
        });*/
        fs.writeFile('sitemap/rawlist.txt', rawList, function (err, file) {
            if (err) throw err;
            else console.log('./rawlist.txt'+' Saved!'+" Urls submitted: "+(rawList.split("\n").length - 1));
        });
    });         



function combine(arr, k, prefix=[]) {
        if (k == 0) return [prefix];
        return arr.flatMap((v, i) =>
            combine(arr.slice(i+1), k-1, [...prefix, v])
        ).map(num => {
      return String(num);
    });;
    }


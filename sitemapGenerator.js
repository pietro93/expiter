import { createServer } from 'http';
import fetch from 'node-fetch';
import fs from 'fs';
const {gzip, ungzip} = require('node-gzip');

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
        //region_filters = region_filters.concat(
            //combine(regions,2)//.concat(combine(regions,3))//.concat(combine(regions,4))
        //)
        console.log(region_filters)

        const filters = ["Pop300k-","Pop300k+","Pop500k+","Pop1m+","Cold","Hot","Temperate","HasMetro","HasUni"];
        const sortings = ["Expat-friendly","DN-friendly","LGBT-friendly","Female-friendly","ColdDays","SunshineHours","HotDays",
        "Name","CostOfLiving","Population","Veg-friendly","Family-friendly","Density","Climate","Safety","Nightlife","Education","Crime"].sort()

        var filter_filters=filters.concat(
            combine(filters,2).concat(combine(filters,3)).concat(combine(filters,4))
            .concat(combine(filters,5)).concat(combine(filters,6)).concat(combine(filters,7))
            .concat(combine(filters,8)).concat(combine(filters,9))
        )
        filter_filters= filter_filters.filter(
        item => (!item.includes("Pop300k-,Pop300k+,Pop500k,Pop1m+")))
        .filter(item => (!item.includes("Cold,Hot,Temperate")))
        console.log(filter_filters)
        

        let noFilters="";
        let withFilters1="";
        let withFilters2="";
        let withFilters3="";
        let withFilters4="";
        let withFilters5="";
        let withFilters6="";
        let withFilters7="";
        let withFilters8="";
        let withFilters9="";
        let withFilters10="";
        let withFilters11="";
        let withFilters12="";
        let withFilters13="";
        for (var s=0; s<sortings.length; s++){
            noFilters= noFilters.concat(
                '<url>'+
                '<loc>https://expiter.com/app/?sort='+sortings[s]+'</loc>'+
                '</url> '+'\n'
                    );
            for (var r=0; r<region_filters.length; r++){
                
                    noFilters = noFilters.concat(
                    '<url>'+
                    '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'</loc>'+
                    '</url> '+'\n'
                        );
                    console.log('adding ?sort='+sortings[s]+'&amp;region='+region_filters[r]+' to sitemap')

                    for (var f=0; f<filter_filters.length; f++){
                        if (f<(filter_filters.length)*.06){
                        withFilters1=withFilters1.concat(
                        '<url>'+
                        '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                        '</url> '+'\n'
                            );
                        } else if (f>=(filter_filters.length)*.06&f<(filter_filters.length)*.13) {
                            withFilters2=withFilters2.concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.13&&f<(filter_filters.length)*.20) {
                            withFilters3=withFilters3.concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.2&&f<(filter_filters.length)*.27) {
                            withFilters4=withFilters4.concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.27&&f<(filter_filters.length)*.35) {
                            withFilters5=withFilters5.concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.35&&f<(filter_filters.length)*.43) {
                            withFilters6=withFilters6.concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.43&&f<(filter_filters.length)*.5) {
                            withFilters7=withFilters7.concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.5&&f<(filter_filters.length)*.57) {
                            withFilters8=withFilters8.concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.57&f<(filter_filters.length)*.64) {
                            withFilters9=withFilters9.concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.64&f<(filter_filters.length)*.72) {
                            withFilters10=withFilters10.concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.72&f<(filter_filters.length)*.82) {
                            withFilters11=withFilters11.concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else if (f>=(filter_filters.length)*.82&f<(filter_filters.length)*.91) {
                            withFilters12=withFilters12.concat(
                                '<url>'+
                                '<loc>https://expiter.com/app/?sort='+sortings[s]+'&amp;region='+region_filters[r]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '</url>'+'\n'
                                    );
                        }
                        else {
                            withFilters13=withFilters13.concat(
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

        var appSiteMap1=appSiteMap.concat(noFilters).concat(withFilters1).concat('</urlset>');
        var appSiteMap2=appSiteMap.concat(withFilters2).concat('</urlset>');
        var appSiteMap3=appSiteMap.concat(withFilters3).concat('</urlset>');
        var appSiteMap4=appSiteMap.concat(withFilters4).concat('</urlset>');
        var appSiteMap5=appSiteMap.concat(withFilters5).concat('</urlset>');
        var appSiteMap6=appSiteMap.concat(withFilters6).concat('</urlset>');
        var appSiteMap7=appSiteMap.concat(withFilters7).concat('</urlset>');
        var appSiteMap8=appSiteMap.concat(withFilters8).concat('</urlset>');
        var appSiteMap9=appSiteMap.concat(withFilters9).concat('</urlset>');
        var appSiteMap10=appSiteMap.concat(withFilters10).concat('</urlset>');
        var appSiteMap11=appSiteMap.concat(withFilters11).concat('</urlset>');
        var appSiteMap12=appSiteMap.concat(withFilters12).concat('</urlset>');
        var appSiteMap13=appSiteMap.concat(withFilters13).concat('</urlset>');
                
        var fileName2 = './app-sitemap.xml';
            
        fs.writeFile(fileName, siteMap, function (err, file) {
            if (err) throw err;
            else console.log(fileName+' Saved!'+" Urls submitted: "+(siteMap.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap.xml', appSiteMap1, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap.xml'+' Saved!'+" Urls submitted: "+(appSiteMap1.split("<url>").length - 1));
        });
        fs.writeFile('sitemap/app-sitemap-2.xml', appSiteMap2, function (err, file) {
            if (err) throw err;
            else console.log('./app-sitemap-2.xml'+' Saved!'+" Urls submitted: "+(appSiteMap2.split("<url>").length - 1));
        });
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
    });         



function combine(arr, k, prefix=[]) {
        if (k == 0) return [prefix];
        return arr.flatMap((v, i) =>
            combine(arr.slice(i+1), k-1, [...prefix, v])
        ).map(num => {
      return String(num);
    });;
    }


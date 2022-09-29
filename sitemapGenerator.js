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
        const regions = ["Abruzzo","Basilicata","Calabria","Campania","Emilia-Romagna","Friuli-Venezia Giulia","Lazio","Liguria","Lombardia","Marche","Molise",
            "Piemonte","Puglia","Sardegna","Sicilia","Toscana","Trentino-Alto Adige","Umbria","Valle d&#39;Aosta","Veneto"];
        var region_filters = ["All","North","South","Center"].concat(regions)
        region_filters = region_filters.concat(
            combine(regions,2)//.concat(combine(regions,3))//.concat(combine(regions,4))
        )
        console.log(region_filters)

        const filters = ["Pop300k-","Pop300k+","Pop500k+","Pop1m+","Cold","Hot","Temperate","HasMetro","HasUni"];
        const sortings = ["Expat-friendly","DN-friendly","LGBT-friendly","Female-friendly","ColdDays","SunshineHours","HotDays",
        "Name","CostOfLiving","Population","Veg-friendly","Family-friendly","Density","Climate","Safety","Nightlife","Education","Crime"].sort()

        var filter_filters=filters.concat(
            combine(filters,2).concat(combine(filters,3)).concat(combine(filters,4))
            .concat(combine(filters,5)).concat(combine(filters,6)).concat(combine(filters,7))
            //.concat(combine(filters,8)).concat(combine(filters,9))
        )
        filter_filters= filter_filters.filter(
        item => (!item.includes("Pop300k-","Pop300k+","Pop500k+","Pop1m+")))
        .filter(item => (!item.includes("Cold","Hot","Temperate")))
        console.log(filter_filters)
        

        let noFilters="";
        let withFilters1="";
        let withFilters2="";
        let withFilters3="";
        for (var s=0; s<sortings.length; s++){
            noFilters= noFilters.concat(
                '<url>'+
                '<loc>https://expiter.com/app/?sort='+sortings[s]+'</loc>'+
                '<priority>2</priority>'+
                '</url> '+'\n'
                    );
            for (var r=0; r<region_filters.length; r++){
                
                    noFilters = noFilters.concat(
                    '<url>'+
                    '<loc>https://expiter.com/app/?region='+region_filters[r]+'&amp;sort='+sortings[s]+'</loc>'+
                    '<priority>1</priority>'+
                    '</url> '+'\n'
                        );
                    console.log('adding ?region='+region_filters[r]+'&sort='+sortings[s]+' to sitemap')

                    for (var f=0; f<filter_filters.length; f++){
                        if (f%2==0&&f<(filter_filters.length)*.7){
                        withFilters1=withFilters1.concat(
                        '<url>'+
                        '<loc>https://expiter.com/app/?region='+region_filters[r]+'&amp;sort='+sortings[s]+'&amp;filter='+filter_filters[f]+'</loc>'+
                        '<priority>0</priority>'+
                        '</url> '+'\n'
                            );
                        } else if (f%2!=0&&f<(filter_filters.length)*.7) {
                            withFilters2=withFilters2.concat(
                                '<url>'+
                                '   <loc>https://expiter.com/app/?region='+region_filters[r]+'&amp;sort='+sortings[s]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '   <priority>0</priority>'+
                                '   </url>'+'\n'
                                    );
                        }
                        else {
                            withFilters3=withFilters3.concat(
                                '<url>'+
                                '   <loc>https://expiter.com/app/?region='+region_filters[r]+'&amp;sort='+sortings[s]+'&amp;filter='+filter_filters[f]+'</loc>'+
                                '   <priority>0</priority>'+
                                '   </url>'+'\n'
                                    );
                        }
                        console.log('adding ?region='+region_filters[r]+'&sort='+sortings[s]+'&filter='+filter_filters[f]+' to sitemap')
                }
            }
        }

        console.log("generating appSiteMap")

        var appSiteMap1=appSiteMap.concat(noFilters).concat('</urlset>');
        var appSiteMap2=appSiteMap.concat(withFilters1).concat('</urlset>');
        var appSiteMap3=appSiteMap.concat(withFilters2).concat('</urlset>');
        var appSiteMap4=appSiteMap.concat(withFilters3).concat('</urlset>');

        console.log(appSiteMap1)
        
                
        var fileName2 = './app-sitemap.xml';
            
        fs.writeFile(fileName, siteMap, function (err, file) {
            if (err) throw err;
            else console.log(fileName+' Saved!');
        });
        fs.writeFile('./app-sitemap.xml', appSiteMap1, function (err, file) {
            if (err) throw err;
            else console.log(fileName2+' Saved!');
        });
        fs.writeFile('./app-sitemap-2.xml', appSiteMap2, function (err, file) {
            if (err) throw err;
            else console.log(fileName2+' Saved!');
        });
        fs.writeFile('./app-sitemap-3.xml', appSiteMap3, function (err, file) {
            if (err) throw err;
            else console.log(fileName2+' Saved!');
        });
        fs.writeFile('./app-sitemap-4.xml', appSiteMap4, function (err, file) {
            if (err) throw err;
            else console.log(fileName2+' Saved!');
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


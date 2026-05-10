import fs from 'fs';
import fetch from "node-fetch";

export default async function() {
  console.log("Building towns data...");
  const towns = [];
  
  const response = await fetch("https://expiter.com/dataset.json");
  const data = await response.json();
  const provinces = data.slice(0, 107);
  const avg = data[107];
  
  let comdata = [];
  if (fs.existsSync('comuni.json')) {
    comdata = JSON.parse(fs.readFileSync('comuni.json', 'utf8'));
  }
  const comindex = {};
  for (const item of comdata) {
    if (item.Name) {
      comindex[item.Name.toLowerCase()] = item;
    }
  }
  
  for (const province of provinces) {
    const tempFile = `temp/${province.Name}-comuni.json`;
    if (fs.existsSync(tempFile)) {
      const parsedData = fs.readFileSync(tempFile, 'utf8');
      const comuniDic = JSON.parse(parsedData);
      
      for (const key in comuniDic) {
        let comune = comuniDic[key];
        comune.Name = comune.Name.charAt(0).toUpperCase() + comune.Name.slice(1).toLowerCase();
        
        // Attach province and dataset data for templates
        comune.provinceName = province.Name;
        comune.provinceAbbreviation = province.Abbreviation;
        comune.provinceRegion = province.Region;
        comune.provincePopulation = province.Population;
        comune.provinceData = province; // full province stats
        
        let extra = comindex[comune.Name.toLowerCase()];
        if (extra) {
            comune.Landmarks = extra.Landmarks || extra.Attrazioni;
            comune.History = extra.History || extra.Storia;
        }
        
        towns.push(comune);
      }
    }
  }
  
  console.log(`Loaded ${towns.length} towns.`);
  return towns;
}

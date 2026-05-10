import fetch from "node-fetch";

export default async function() {
  console.log("Fetching dataset...");
  const response = await fetch("https://expiter.com/dataset.json");
  const data = await response.json();
  
  const provinces = data.slice(0, 107);
  const avg = data[107];
  const regions = data.slice(108);

  const regionMap = {};
  for (const region of regions) {
    regionMap[region.Name] = region;
  }
  
  const provinceMap = {};
  for (const province of provinces) {
    provinceMap[province.Name] = province;
  }
  
  return {
    raw: data,
    provinces,
    avg,
    regions,
    regionMap,
    provinceMap
  };
}

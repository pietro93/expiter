export default function(eleventyConfig) {
  // Passthrough copy for CSS, JS, and image assets
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("fonts.css");
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("src/trellis.css");
  eleventyConfig.addPassthroughCopy("bulma.min.css");
  eleventyConfig.addPassthroughCopy("jquery3.6.0.js");
  eleventyConfig.addPassthroughCopy("script.js");
  eleventyConfig.addPassthroughCopy("bootstrap-toc.js");

  // Nunjucks configuration
  eleventyConfig.setNunjucksEnvironmentOptions({
    throwOnUndefined: true,
    autoescape: false, // HTML in datasets should not be escaped
  });

  eleventyConfig.addFilter("qualityScore", function(score, quality, avg) {
    let expenses=["Cost of Living (Individual)","Cost of Living (Family)","Cost of Living (Nomad)", 
    "StudioRental", "BilocaleRent", "TrilocaleRent", "MonthlyIncome", 
    "StudioSale","BilocaleSale","TrilocaleSale"];
    
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
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};

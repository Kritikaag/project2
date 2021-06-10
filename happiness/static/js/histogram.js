

// set the dimensions and margins of the graph
var margin = {top: 75, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// get the data
d3.json("/test").then(function(data) {
   console.log(data)
  // X axis: scale and draw:

 var year = data.map(y => y.year);

//console.log(year)

//   //console.log(year)
  var sel = document.getElementById('selDataset');
  
  for(var i = 0; i < year.length; i++) {
      var opt = year[i];
      var el = document.createElement("option")
      el.textContent = opt;
      el.value = opt;
      sel.appendChild(el);
      [].slice.call(sel.options)
      .map(function(a){
      if(this[a.value]){ 
      sel.removeChild(a); 
    } else { 
      this[a.value]=1; 
    } 
  },{});

  }});

  d3.selectAll("#selDataset").on("change", updatePlotly);
  //This function is called when a dropdown menu item is selected
 function updatePlotly() {
     
    d3.select(".histogram").selectAll("*").remove();
     
    // Use D3 to select the dropdown menu
   var dropdownMenu = d3.select("#selDataset");
    // Assign the value of the dropdown menu option to a variable
   var dataset1 = dropdownMenu.property("value");
   console.log(dataset1)
   
   d3.json("/test").then(function(data) {
   //var year = data.map(y => { return{year: y.year}});
   // console.log(Object.entries(data))
   
   
   // Create a loop to check through the list of sample id to get relevant x and y values
   var dataset = data.filter (function (el){
       return el.year===dataset1
   })

  console.log(dataset);


    var x = d3.scaleLinear()
    .domain([0, 10])
    .rangeRound([0, width]);
    var y = d3.scaleLinear()
    .range([height, 0]);

    var histogram = d3.histogram()
    .value(function(d) { return d.happiness_rating; })   // I need to give the vector of value
    .domain(x.domain())  // then the domain of the graphic
    .thresholds(x.ticks(10)); // then the numbers of bins

    var svg = d3.select(".histogram")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    var bins = histogram(dataset);

    y.domain([0, d3.max(bins, function(d) { return d.length; })]);
  
    svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .style("fill", "#69b3a2");

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));
        

    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 100))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("Histogram - World");

})};
  
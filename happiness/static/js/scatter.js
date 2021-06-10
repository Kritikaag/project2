// Setting variable for height and width
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// get the data and prepare slicing for dropdown
d3.json("/data").then(function (data) {
    // console.log(data)
    var year = data.map(y => y.year);
    // console.log(year)

    var sel = document.getElementById('selDataset');

    for (var i = 0; i < year.length; i++) {
        var opt = year[i];
        var el = document.createElement("option")
        el.textContent = opt;
        el.value = opt;
        sel.appendChild(el);
        [].slice.call(sel.options)
            .map(function (a) {
                if (this[a.value]) {
                    sel.removeChild(a);
                } else {
                    this[a.value] = 1;
                }
            }, {});

    }
});

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
        d3.max(data, d => d[chosenXAxis]) * 1.1
        ])
        .range([0, width]);

    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) - 1,
        d3.max(data, d => d[chosenYAxis]) + 1
        ])
        .range([height, 0]);

    return yLinearScale;
}

// function used for updating xAxis const upon click on axis label
function renderXAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis const upon click on axis label
function renderYAxes(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// functions used for updating circles group with a transition to
// new circles for both X and Y coordinates
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// functions used for updating circles text with a transition on
// new circles for both X and Y coordinates
function renderXText(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

function renderYText(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis]) + 5);

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {
    var xlabel = "";
    if (chosenXAxis === "gdp_per_capita") {
        xlabel = "Log GDP per capita";
    } else if (chosenXAxis === "life_expectancy") {
        xlabel = "Life expectancy";
    } else {
        xlabel = "Social Support";
    }

    var ylabel = "";
    if (chosenYAxis === "happiness_rating") {
        ylabel = "Happiness Score";
    } else if (chosenYAxis === "freedom") {
        ylabel = "Freedom";
    } else {
        ylabel = "Generosity";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([50, -75])
        .html(function (d) {
            return (`${d.country}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`)
        });

    circlesGroup.call(toolTip);

    // mouseover event
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data) {
            toolTip.hide(data, this);
        });

    return circlesGroup;
}

d3.selectAll("#selDataset").on("change", updatePlot);
//This function is called when a dropdown menu item is selected
function updatePlot() {
    d3.select("#scatter").selectAll("*").remove();

    // Use D3 to select the dropdown menu
    var dropdownMenu = d3.select("#selDataset");
    // Assign the value of the dropdown menu option to a variable
    var selectedYear = dropdownMenu.property("value");
    // console.log(selectedYear)

    d3.json("/data").then(function (data) {
        // Create a loop to check through the list of sample id to get relevant x and y values
        var dataset = data.filter(function (el) {
            return el.year === +selectedYear
        })

        console.log(dataset);
        dataset.forEach(function (data) {
            continent = data.continent;
            data.happiness_rating = +data.happiness_rating;
            data.gdp_per_capita = +data.gdp_per_capita;
            data.social_support = +data.social_support;
            data.life_expectancy = +data.life_expectancy;
            data.freedom = +data.freedom;
            data.generosity = +data.generosity;
            data.corruption = +data.corruption;
        });

        // Create an SVG wrapper, append an SVG group that will hold our chart,
        // and shift the latter by left and top margins.
        var svg = d3
            .select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight + 40); // extra padding for third label

        // Append an SVG group
        var chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Initial Params
        var chosenXAxis = "gdp_per_capita";
        var chosenYAxis = "happiness_rating";

        // Initialize scale functions
        var xLinearScale = xScale(dataset, chosenXAxis);
        var yLinearScale = yScale(dataset, chosenYAxis);

        // Initialize axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append x and y axes to the chart
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // Create scatterplot and append initial circles
        var circlesGroup = chartGroup.selectAll("g circle")
            .data(dataset)
            .enter()
            .append("g")
            .attr("visibility", function (d) {
                if (d.happiness_rating == 0) return "hidden"
                else if (d.gdp_per_capita == 0) return "hidden"
                else if (d.social_support == 0) return "hidden"
                else if (d.life_expectancy == 0) return "hidden"
                else if (d.freedom == 0) return "hidden"
                else if (d.generosity == 0) return "hidden"
                else if (d.corruption == 0) return "hidden";
            })
        // Deletes all circles which are "hidden"
        d3.selectAll("g[visibility=hidden]").remove();

        var circlesXY = circlesGroup.append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 15)
            .classed("countryCircle", true)
            .style("fill", function (d) {
                if (d.continent === "Africa") { return "#f7b3b1" }
                else if (d.continent === "Asia") { return "#fbe0d1" }
                else if (d.continent === "Europe") { return "#bbf7c9" }
                else if (d.continent === "North America") { return "#afe9f7" }
                else if (d.continent === "South America") { return "#f8bbf2" }
                else if (d.continent === "Oceania") { return "#bfabf5" }
                ;
            });

        // Legend
        svg.append("circle").attr("cx", 140).attr("cy", 60).attr("r", 6).style("fill", "#f7b3b1")
        svg.append("text").attr("x", 160).attr("y", 60).text("Africa").style("font-size", "15px").attr("alignment-baseline", "middle")
        svg.append("circle").attr("cx", 140).attr("cy", 80).attr("r", 6).style("fill", "#fbe0d1")
        svg.append("text").attr("x", 160).attr("y", 80).text("Asia").style("font-size", "15px").attr("alignment-baseline", "middle")
        svg.append("circle").attr("cx", 140).attr("cy", 100).attr("r", 6).style("fill", "#bbf7c9")
        svg.append("text").attr("x", 160).attr("y", 100).text("Europe").style("font-size", "15px").attr("alignment-baseline", "middle")
        svg.append("circle").attr("cx", 140).attr("cy", 120).attr("r", 6).style("fill", "#afe9f7")
        svg.append("text").attr("x", 160).attr("y", 120).text("North America").style("font-size", "15px").attr("alignment-baseline", "middle")
        svg.append("circle").attr("cx", 140).attr("cy", 140).attr("r", 6).style("fill", "#f8bbf2")
        svg.append("text").attr("x", 160).attr("y", 140).text("South America").style("font-size", "15px").attr("alignment-baseline", "middle")
        svg.append("circle").attr("cx", 140).attr("cy", 160).attr("r", 6).style("fill", "#bfabf5")
        svg.append("text").attr("x", 160).attr("y", 160).text("Oceania").style("font-size", "15px").attr("alignment-baseline", "middle")


        var circlesText = circlesGroup.append("text")
            .text(d => d.id)
            .attr("dx", d => xLinearScale(d[chosenXAxis]))
            .attr("dy", d => yLinearScale(d[chosenYAxis]) + 5)
            .classed("countryText", true);

        // Create group for 3 x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height})`);

        var gdpLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "gdp_per_capita") // value to grab for event listener
            .text("Log GDP per capita")
            .classed("active", true);

        var LifeExpectancyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "life_expectancy") // value to grab for event listener
            .text("Life Expectancy (Age)")
            .classed("inactive", true);

        var SocialSupportLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 80)
            .attr("value", "social_support") // value to grab for event listener
            .text("Social Support")
            .classed("inactive", true);

        // Create group for 3 y-axis labels
        var ylabelsGroup = chartGroup.append("g");

        var happinessLabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height / 2))
            .attr("y", -40)
            .attr("value", "happiness_rating") // value to grab for event listener
            .text("Happiness Score")
            .classed("active", true);

        var freedomLabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height / 2))
            .attr("y", -60)
            .attr("value", "freedom") // value to grab for event listener
            .text("Freedom")
            .classed("inactive", true);

        var generosityLabel = ylabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height / 2))
            .attr("y", -80)
            .attr("value", "generosity") // value to grab for event listener
            .text("Generosity")
            .classed("inactive", true);

        // initial tooltips
        circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

        // x axis labels event listener
        xlabelsGroup.selectAll("text")
            .on("click", function () {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {

                    // replaces chosenXAxis with value
                    chosenXAxis = value;

                    // updates x scale for new data
                    xLinearScale = xScale(dataset, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesXY = renderXCircles(circlesXY, xLinearScale, chosenXAxis);

                    // updates circles text with new x values
                    circlesText = renderXText(circlesText, xLinearScale, chosenXAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

                    // changes classes to change bold text
                    if (chosenXAxis === "life_expectancy") {
                        gdpLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        LifeExpectancyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        SocialSupportLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenXAxis === "social_support") {
                        gdpLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        LifeExpectancyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        SocialSupportLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                    else {
                        gdpLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        LifeExpectancyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        SocialSupportLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                }
            });

        // y axis labels event listener
        ylabelsGroup.selectAll("text")
            .on("click", function () {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {

                    // replaces chosenYAxis with value
                    chosenYAxis = value;

                    // updates y scale for new data
                    yLinearScale = yScale(dataset, chosenYAxis);

                    // updates y axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    // updates circles with new y values
                    circlesXY = renderYCircles(circlesXY, yLinearScale, chosenYAxis);

                    // updates circles text with new y values
                    circlesText = renderYText(circlesText, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

                    // changes classes to change bold text
                    if (chosenYAxis === "freedom") {
                        happinessLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        freedomLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        generosityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenYAxis === "generosity") {
                        happinessLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        freedomLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        generosityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                    else {
                        happinessLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        freedomLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        generosityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                }
            });
    }).catch(function (error) {
        console.log(error);
    })
};

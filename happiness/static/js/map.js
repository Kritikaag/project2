// get the data and prepare slicing for dropdown
d3.json("/data").then(function (data) {
    //console.log(data)
    var year = data.map(y => y.year);
    //console.log(year)

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

google.charts.load('current', {
    'packages': ['geochart'],
    'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
});
google.charts.setOnLoadCallback(drawRegionsMap);


d3.selectAll("#selDataset").on("change", drawRegionsMap);

//This function is called when a dropdown menu item is selected
function drawRegionsMap() {
    d3.select("#regions_div").selectAll("*").remove();

    // Use D3 to select the dropdown menu
    var dropdownMenu = d3.select("#selDataset");
        
    // Assign the value of the dropdown menu option to a variable
    var selectedYear = dropdownMenu.property("value");
    // console.log(selectedYear)
    
    d3.json("/data").then(function (data) {
        // Create a loop to check through the list of sample id to get relevant x and y values
        var dataset = data.filter(function (el) {
            return el.year === +selectedYear
        });

        var dataArray = [['Country', 'Happiness Score', 'Log GDP Per Capita']];

        for (var i = 0; i < dataset.length; i++) {
            dataArray.push([dataset[i].country, +dataset[i].happiness_rating, +dataset[i].gdp_per_capita]);
        }
        // console.log(dataArray)
        var data = new google.visualization.arrayToDataTable(dataArray);
        // console.log(data)

        var options = {
            sizeAxis: { minValue: 3, maxValue: 8 },
            //region: '155', // Western Europe
            displayMode: 'region',
            colorAxis: { minValue: 3, colors: ['#f7b3b1', '#fbe0d1', '#f8bbf2', '#bfabf5', '#afe9f7', '#bbf7c9'] },
            backgroundColor: '#EBF5FB',
            datalessRegionColor: '#D7DBDD',
            defaultColor: '#f5f5f5',
        };

        var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

        chart.draw(data, options);
       
    });
};
d3.select("#regions_div").selectAll("*").remove();

    // Use D3 to select the dropdown menu
    var dropdownMenu = d3.select("#selDataset");
        
    // Assign the value of the dropdown menu option to a variable
    var selectedYear = dropdownMenu.property("value");
    // console.log(selectedYear)
    
    d3.json("/data").then(function (data) {
        // Create a loop to check through the list of sample id to get relevant x and y values
        var dataset = data.filter(function (el) {
            return el.year === 2020
        });

        var dataArray = [['Country', 'Happiness Score', 'Log GDP Per Capita']];

        for (var i = 0; i < dataset.length; i++) {
            dataArray.push([dataset[i].country, +dataset[i].happiness_rating, +dataset[i].gdp_per_capita]);
        }
        // console.log(dataArray)
        var data = new google.visualization.arrayToDataTable(dataArray);
        // console.log(data)

        var options = {
            sizeAxis: { minValue: 3, maxValue: 8 },
            //region: '155', // Western Europe
            displayMode: 'region',
            colorAxis: { minValue: 3, colors: ['#f7b3b1', '#fbe0d1', '#f8bbf2', '#bfabf5', '#afe9f7', '#bbf7c9'] },
            backgroundColor: '#EBF5FB',
            datalessRegionColor: '#D7DBDD',
            defaultColor: '#f5f5f5',
        };

        var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

        chart.draw(data, options);
       
    });






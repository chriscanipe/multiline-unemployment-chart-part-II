//Global functions are declared outside of functions.
//Global means we can access them from anywhere in our script.
//These are all variables we have named ourselves

let chart = {};

let parseTime = d3.timeParse("%Y-%m-%d");

let recessionsArray = [{
    start: parseTime("2001-03-01"),
    end: parseTime("2001-11-30"),
}, {
    start: parseTime("2007-12-01"),
    end: parseTime("2009-06-30"),
}];



//Here's where we call our data. Once we have it, we can do stuff with it in the "callback"
d3.csv("data/fredgraph.csv", function(error, data) {
    if (error) throw error;

    //This is the callback.
    //It's the stuff that happens once the data has been called.
    init(data);
})



function init(data) {

    let normalName = {
        "UNRATE": "United States",
        "MOUR": "State of Missouri",
        "CLMUR": "Columbia, Missouri"
    }

    chart.colors = {
        "UNRATE": "#f6f6f6",
        "MOUR": "#7e8083",
        "CLMUR": "#f58667"
    }

    //This is called a ternary operator. It's a shorthand if/else statement.
    //If `data` exists, theData is equal to `data`. If it doesnt' exist, define it as null.
    chart.theData = ["UNRATE", "MOUR", "CLMUR"].map(id => {
        return {
            id: id,
            name: normalName[id],
            values: data.map(d => {
                return {
                    date: parseTime(d["DATE"]),
                    val: +d[id]
                }
            })
        }
    });


    //Append our elements to the page. This only happens on load.
    appendElements();

    //Update positions and styles for everything on the page
    //whenever we update the page (on re-size, for example).
    update();

}

function update() {
    setDimensions();
    setScales();
    updateElements();
}

function setDimensions() {

    //there are two main types of data elements in JavaScript:
    //1. Object {}
    //Objects are accessible by keys, example: margin.top where ".top" is the key value.
    //2. Array []
    //Arrays are lists ex: [1,2,3,4,5];
    //Arrays can contain objects [{foo: bar, color: "green"}, {hat: brown, "dog" : "fido"}]

    //This is an object
    chart.margin = {
        top: 30,
        right: 140,
        bottom: 40,
        left: 50
    };


    let chartWidth = document.querySelector(".chart").offsetWidth;
    let chartHeight = document.querySelector(".chart").offsetHeight;

    chart.width = chartWidth - chart.margin.left - chart.margin.right;
    chart.height = chartHeight - chart.margin.top - chart.margin.bottom;
}


function setScales() {

    //These d3.scaleLinear() elements are functions that exist in D3
    chart.xScale = d3.scaleTime() //This is a linear scale
        .rangeRound([0, chart.width]) //Its "range" is the width of `this.plot`
        .domain([parseTime("2000-01-01"), parseTime("2019-01-01")]); //Its "domain" defaults to 0 to 100.

    chart.yScale = d3.scaleLinear()
        .rangeRound([chart.height, 0])
        .domain([0, 10]);

    chart.line = d3.line()
        .x(d => {
            return chart.xScale(d.date);
        })
        .y(d => {
            return chart.yScale(d.val);
        })


}




function appendElements() {

    //SVG is the container.
    chart.svg = d3.select(".chart").append("svg");

    //The plot is where the charting action happens.
    chart.plot = chart.svg.append("g").attr("class", "chart-g");

    //The xAxis and yAxis group tags will hold our xAxis elements (ticks, etc.)
    chart.xAxis = chart.plot.append("g")
        .classed("axis x-axis", true);

    chart.yAxis = chart.plot.append("g")
        .classed("axis y-axis", true);

    chart.recessions = chart.plot.selectAll(".recession")
        .data(recessionsArray)
        .enter()
        .append("rect")
        .attr("class", "recession");

    chart.lineGroup = chart.plot.selectAll(".line-group")
        .data(chart.theData)
        .enter()
        .append("g")
        .attr("class", d => {
            return `line-group ${d.id}`;
        })

    chart.linePath = chart.lineGroup.append("path");

    chart.lineLabel = chart.lineGroup.append("text");

    chart.dot = chart.lineGroup.append("circle");

}


function updateElements() {

    //The this.svg will be the FULL width and height of the parent container (this.element)
    chart.svg.attr("width", chart.width + chart.margin.left + chart.margin.right);
    chart.svg.attr("height", chart.height + chart.margin.top + chart.margin.bottom);

    //this.plot is offset from the top and left of the this.svg
    chart.plot.attr("transform", `translate(${chart.margin.left},${chart.margin.top})`);

    //This is where the axis elements get drawn. The "transform" property positions them
    //And the the .call() method draws the axis within that tag.
    //Most of the logic is behind the scenes
    chart.xAxis.attr("transform", "translate(0," + (chart.height + 20) + ")")
        .call(
            d3.axisBottom(chart.xScale)
            .tickSize(-20)
            .tickValues([parseTime("2000-01-01"), parseTime("2010-01-01"), parseTime("2019-01-01")])
        );

    chart.yAxis.attr("transform", `translate(-20,0)`)
        .call(
            d3.axisLeft(chart.yScale)
            .tickSize(-chart.width - 20)
            .ticks(5)
            .tickFormat(d => {
                return `${d}%`
            })
        );

    chart.recessions.attr("x", d => {
            return chart.xScale(d.start);
        })
        .attr("y", 0)
        .attr("width", d => {
            return chart.xScale(d.end) - chart.xScale(d.start);
        })
        .attr("height", chart.height)
        .lower();

    chart.linePath.each(d => {
            console.log(d);
        })
        .attr("d", d => {
            return chart.line(d.values);
        })

    chart.lineLabel.text(d => {
            return d.name;
        })
        .attr("x", d => {
            let lastVal = d.values[d.values.length - 1];
            return chart.xScale(lastVal.date) + 10;
        })
        .attr("y", d => {
            let lastVal = d.values[d.values.length - 1];
            return chart.yScale(lastVal.val);
        })

    chart.dot.attr("cx", d => {
            let lastVal = d.values[d.values.length - 1];
            return chart.xScale(lastVal.date);
        })
        .attr("cy", d => {
            let lastVal = d.values[d.values.length - 1];
            return chart.yScale(lastVal.val);
        })
        .attr("r", 4)



}

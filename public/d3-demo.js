// Dataset: the relative frequency of letters in the English language
var alphabet = [
    {
        "letter": "E",
        "frequency": 0.12702
    },
    {
        "letter": "T",
        "frequency": 0.09056
    },
    {
        "letter": "A",
        "frequency": 0.08167
    },
    {
        "letter": "O",
        "frequency": 0.07507
    },
    {
        "letter": "I",
        "frequency": 0.06966
    },
    {
        "letter": "N",
        "frequency": 0.06749
    },
    {
        "letter": "S",
        "frequency": 0.06327
    },
    {
        "letter": "H",
        "frequency": 0.06094
    },
    {
        "letter": "R",
        "frequency": 0.05987
    },
    {
        "letter": "D",
        "frequency": 0.04253
    },
    {
        "letter": "L",
        "frequency": 0.04025
    },
    {
        "letter": "C",
        "frequency": 0.02782
    },
    {
        "letter": "U",
        "frequency": 0.02758
    },
    {
        "letter": "M",
        "frequency": 0.02406
    },
    {
        "letter": "W",
        "frequency": 0.0236
    },
    {
        "letter": "F",
        "frequency": 0.02288
    },
    {
        "letter": "G",
        "frequency": 0.02015
    },
    {
        "letter": "Y",
        "frequency": 0.01974
    },
    {
        "letter": "P",
        "frequency": 0.01929
    },
    {
        "letter": "B",
        "frequency": 0.01492
    },
    {
        "letter": "V",
        "frequency": 0.00978
    },
    {
        "letter": "K",
        "frequency": 0.00772
    },
    {
        "letter": "J",
        "frequency": 0.00153
    },
    {
        "letter": "X",
        "frequency": 0.0015
    },
    {
        "letter": "Q",
        "frequency": 0.00095
    },
    {
        "letter": "Z",
        "frequency": 0.00074
    }
]

// https://observablehq.com/@d3/bar-chart
function barChart(data, {
    x = (d, i) => i, // given d in data, returns the (ordinal) x-value
    y = d => d, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    marginTop = 20, // the top margin, in pixels
    marginRight = 0, // the right margin, in pixels
    marginBottom = 30, // the bottom margin, in pixels
    marginLeft = 40, // the left margin, in pixels
    width = 640, // the outer width of the chart, in pixels
    height = 400, // the outer height of the chart, in pixels
    xDomain, // an array of (ordinal) x-values
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // y-scale type
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    xPadding = 0.1, // amount of x-range to reserve to separate bars
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    color = "steelblue" // bar fill color
} = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);

    // Compute default domains, and unique the x-domain.
    if (xDomain === undefined) xDomain = X;
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    xDomain = new d3.InternSet(xDomain);

    // Omit any data not present in the x-domain.
    const I = d3.range(X.length).filter(i => xDomain.has(X[i]));

    // Construct scales, axes, and formats.
    const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);

    // Compute titles.
    if (title === undefined) {
        const formatValue = yScale.tickFormat(100, yFormat);
        title = i => `${X[i]}\n${formatValue(Y[i])}`;
    } else {
        const O = d3.map(data, d => d);
        const T = title;
        title = i => T(O[i], i, data);
    }

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));

    const bar = svg.append("g")
        .attr("fill", color)
        .selectAll("rect")
        .data(I)
        .join("rect")
        .attr("x", i => xScale(X[i]))
        .attr("y", i => yScale(Y[i]))
        .attr("height", i => yScale(0) - yScale(Y[i]))
        .attr("width", xScale.bandwidth());

    if (title) bar.append("title")
        .text(title);

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);

    document.getElementById("input").addEventListener("change", e => {
        let thres = document.getElementById("input").value;
        let str = ""
        svg.selectAll("rect")
            .attr("height", i => {
                let ret = Y[i] < thres ? 0 : yScale(0) - yScale(Y[i])
                str += ret + "\n"
                return ret
            })
        console.log(str)

        // svg.selectAll("rect").each(d => console.log(d, this));
    })

    return svg.node();
}

let chart = barChart(alphabet, {
    x: d => d.letter,
    y: d => d.frequency,
    xDomain: d3.groupSort(alphabet, ([d]) => -d.frequency, d => d.letter), // sort by descending frequency
    yFormat: "%",
    yLabel: "↑ Frequency",
    height: 500,
    color: "steelblue"
});

document.getElementById("d3-demo-container").appendChild(chart);
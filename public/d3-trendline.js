(function() {

    window.addEventListener("load", init);

    async function init() {
        let cData = await getData();
        let chart = StackedAreaChart(cData, {
            x: d => d['YEAR'],
            y: d => d['TOTAL'],
            z: d => d['SEVERITYDESC'],
            xDomain: ["2004", "2021"],
            yLabel: "Number of pedestrian and cyclist collisions",
            xLabel: "Year",
            width: 650,
            height: 200
        });

        let slider = document.getElementById("yearInput");
        slider.addEventListener('input', async () => {
            let input = event.target.value;
            currYear = input;
            updateLine(currYear, chart)

        });
        document.getElementById("d3-trendline-container").appendChild(chart)
    }

    async function getData() {
        try {
            data = await d3.csv('data/collisions_agg.csv')
            return data;
        } catch(err) {
            console.error(err);
        }
    }

    function StackedAreaChart(data, {
        x = ([x]) => x, // given d in data, returns the (ordinal) x-value
        y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
        z = () => 1, // given d in data, returns the (categorical) z-value
        marginTop = 20, // top margin, in pixels
        marginRight = 30, // right margin, in pixels
        marginBottom = 30, // bottom margin, in pixels
        marginLeft = 40, // left margin, in pixels
        width = 650, // outer width, in pixels
        height = 400, // outer height, in pixels
        xType = d3.scaleLinear, // type of x-scale
        xDomain, // [xmin, xmax]
        xRange = [marginLeft, width - marginRight], // [left, right]
        yType = d3.scaleLinear, // type of y-scale
        yDomain, // [ymin, ymax]
        yRange = [height - marginBottom, marginTop], // [bottom, top]
        zDomain, // array of z-values
        offset = d3.stackOffsetDiverging, // stack offset method
        order = d3.stackOrderNone, // stack order method
        xFormat, // a format specifier string for the x-axis
        yFormat, // a format specifier for the y-axis
        yLabel, // a label for the y-axis
        xLabel, // a label for x-axis
      } = {}) {
        // Compute values.
        const X = d3.map(data, x);
        const Y = d3.map(data, y);
        const Z = d3.map(data, z);
      
        // Compute default x- and z-domains, and unique the z-domain.
        if (xDomain === undefined) xDomain = d3.extent(X);
        if (zDomain === undefined) zDomain = Z;
        zDomain = new d3.InternSet(zDomain);

        // Omit any data not present in the z-domain.
        const I = d3.range(X.length).filter(i => zDomain.has(Z[i]));
      
        // Compute a nested array of series where each series is [[y1, y2], [y1, y2],
        // [y1, y2], …] representing the y-extent of each stacked rect. In addition,
        // each tuple has an i (index) property so that we can refer back to the
        // original data point (data[i]). This code assumes that there is only one
        // data point for a given unique x- and z-value.
        const series = d3.stack()
            .keys(zDomain)
            .value(([x, I], z) => Y[I.get(z)])
            .order(order)
            .offset(offset)
          (d3.rollup(I, ([i]) => i, i => X[i], i => Z[i]))
          .map(s => s.map(d => Object.assign(d, {i: d.data[1].get(s.key)})));
      
        // Compute the default y-domain. Note: diverging stacks can be negative.
        if (yDomain === undefined) yDomain = d3.extent(series.flat(2));
      
        // Construct scales and axes.
        const xScale = xType(xDomain, xRange);
        const yScale = yType(yDomain, yRange);
        const xAxis = d3.axisBottom(xScale).ticks(width / 80, xFormat).tickSizeOuter(0).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(yScale).ticks(height / 50, yFormat);
      
        const area = d3.area()
            .x(({i}) => xScale(X[i]))
            .y0(([y1]) => yScale(y1))
            .y1(([, y2]) => yScale(y2));
      
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
                .attr("x", -marginLeft + 5)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .text(yLabel));
      
        svg.append("g")
          .selectAll("path")
          .data(series)
          .join("path")
            .attr("fill", ([{i}]) => determineColor(Z[i]))
            .attr("d", area)
          .append("title")
            .text(([{i}]) => Z[i]);
      
        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(xAxis)
            .call(g => g.append("text")
                .attr("x", width / 2)
                .attr("y", 30)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text(xLabel));
      
        const marketLine = svg
            .append('line')
            .attr('x1', 40)
            .attr('x2', 40)
            .attr('y1', 20)
            .attr('y2', height - 30)
            .attr('stroke-width', 3)
            .attr('stroke', 'white')
            .attr('opacity', 1)
        
        return Object.assign(svg.node(), {scales: {color}});
      }

      /**
   * Determines the color of the plot points in regard to collision severity level
   */
  function determineColor(d) {
    if (d === 'Property Damage Only Collision') {
        return "#85FFDE";
    } else if (d === 'Fatality Collision') {
        return "#FF002B";
    } else if (d === 'Injury Collision') {
        return "#92A1E5";
    } else if (d === 'Serious Injury Collision') {
        return "#B548CB";
    } else {
        return "gray";
    }
  }

  function updateLine(year) {
    d3.select("#d3-trendline-container")
        .select("svg")
        .selectAll('line').remove();

    let change = (year - 2004) * 34 + 40;
    d3.select("#d3-trendline-container")
        .select("svg")
        .append('line')
        .attr('x1', change)
        .attr('x2', change)
        .attr('y1', 20)
        .attr('y2', 170)
        .attr('stroke-width', 3)
        .attr('stroke', 'white')
        .attr('opacity', 1)
  }
})();
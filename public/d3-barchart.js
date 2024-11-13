
(function() {
    d3.csv("data/collisions.csv").then(data => {
        var pdata = data;
        drawBar(pdata);
    });

    function drawBar(pdata) {
        var margin = 75;
        var width = 750;
        var height = 400;
        // extract years
        years = d3.extent(pdata, d => d.YEAR)

        // filter all the data of the first year, 2004
       var dataInitial = pdata.filter(d => d.YEAR === years[0])
       var propDam, fataColl, injColl, serInjColl
       propDam = fataColl = injColl = serInjColl = 0
       for (i = 0; i < dataInitial.length; i++){
           if (dataInitial[i].SEVERITYDESC === 'Property Damage Only Collision') {
               propDam += Number(dataInitial[i].PEDORBIKECOUNT)
           } else if (dataInitial[i].SEVERITYDESC === 'Fatality Collision') {
               fataColl += Number(dataInitial[i].PEDORBIKECOUNT)
           } else if (dataInitial[i].SEVERITYDESC === 'Injury Collision') {
               injColl += Number(dataInitial[i].PEDORBIKECOUNT)
           } else if (dataInitial[i].SEVERITYDESC === 'Serious Injury Collision') {
               serInjColl += Number(dataInitial[i].PEDORBIKECOUNT)
           }
       }

       // create a new array containg only severity description and
       // number of pedestrian and cyclist collisions
       let newData = [
           {severity: 'Property Damage Only Collision', count: propDam},
           {severity: 'Injury Collision', count: injColl},
           {severity: 'Serious Injury Collision', count: serInjColl},
           {severity: 'Fatality Collision', count: fataColl}
       ];

       // make container
        var svg = d3.select('#d3-barchart-container')
            .append('svg')
            .attr('width', width - margin)
            .attr('height', height - margin)
            .attr('viewBox', [0, 0, width, height]);

        // sets x axis scale
        var x = d3.scaleBand()
            .domain(d3.range(newData.length))
            .range([margin / 2, width - margin / 2])
            .padding(0.1);

       // sets y axis scale
        var y = d3.scaleLinear()
        .domain([0, 850])
        .range([height - margin / 2, margin / 2])

        // makes the bar chart
        var severities = svg
            .append('g')
            .selectAll('rect')
            .data(newData)
            .join('rect')
                .attr('fill', d => determineColor(d.severity))
                .attr("fill-opacity", .6)
                .attr('x', (d, i) => x(i))
                .attr('y', (d, i) => y(d.count))
                .attr('height', (d, i) => y(0) - y(d.count))
                .attr('width', x.bandwidth())

        // setting the x axis in the correct location
        function xAxis(g) {
            g.attr('transform', `translate(0, ${height - margin / 2})`)
            .call(d3.axisBottom(x).tickFormat(i => newData[i].severity))
            .attr('font-size', '12px')
            .append("text")
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .attr("x", (width + 100) / 2)
            .attr("y", (margin - 10) / 2)
            .text("Severity Description")
        }

        // setting the y axis in the correct location
        function yAxis(g) {
            g.attr('transform', `translate(${margin / 2}, 0)`)
            .attr('class', "y-axis")
            .call(d3.axisLeft(y).ticks(null, newData.format))
            .attr('font-size', '12px')
            .append("text")
            .attr("transform", "translate(20, 0) rotate(-90)")
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .attr("x", (-height + 250) / 2)
            .attr("y", (-margin - 50) / 2)
            .text("Number of pedestrian and cyclist collisions");
        }

        // gets the color for each severity
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

        // upadtes the graph and text
        function update(newYear) {
            dataInitial = pdata.filter(d => d.YEAR === newYear)
            propDam = fataColl = injColl = serInjColl = 0
            for (i = 0; i < dataInitial.length; i++){
                if (dataInitial[i].SEVERITYDESC === 'Property Damage Only Collision') {
                    propDam += Number(dataInitial[i].PEDORBIKECOUNT)
                } else if (dataInitial[i].SEVERITYDESC === 'Fatality Collision') {
                    fataColl += Number(dataInitial[i].PEDORBIKECOUNT)
                } else if (dataInitial[i].SEVERITYDESC === 'Injury Collision') {
                    injColl += Number(dataInitial[i].PEDORBIKECOUNT)
                } else if (dataInitial[i].SEVERITYDESC === 'Serious Injury Collision') {
                    serInjColl += Number(dataInitial[i].PEDORBIKECOUNT)
                }
            }
            // load newData with selected year
            newData = [
                {severity: 'Property Damage Only Collision', count: propDam},
                //{severity: 'Fatality Collision', count: fataColl},
                {severity: 'Injury Collision', count: injColl},
                {severity: 'Serious Injury Collision', count: serInjColl},
                {severity: 'Fatality Collision', count: fataColl}
            ];

            severities.remove()
            // make new bar chart with updated values
            severities = svg
            .append('g')
            .selectAll('rect')
            .data(newData)
            .join('rect')
                .attr('fill', d => determineColor(d.severity))
                .attr("fill-opacity", .6)
                .attr('x', (d, i) => x(i))
                .attr('y', (d, i) => y(d.count))
                .attr('height', (d, i) => y(0) - y(d.count))
                .attr('width', x.bandwidth())

            // displays the number of collisions when hovering over a bar
            severities.append('title').text(d => d.count)

            // does the hovering
            severities
                .on("mouseover", function (evt) {
                    d3.select(evt.target).attr("stroke", "#FFF").attr("stroke-width", 2);
                })
                    .on("mouseout", function (evt) {
                    d3.select(evt.target).attr("stroke", null);
                });
        }

        let slider = document.getElementById("yearInput");
        slider.addEventListener('input', async () => {
            let input = event.target.value;
            currYear = input;
            update(currYear)
        });
        // starting value
        update("2004")
        svg.append('g').call(yAxis)
        svg.append('g').call(xAxis)
        return svg.node();
    }
})();

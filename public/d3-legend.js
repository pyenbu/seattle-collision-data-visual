function color(d) {
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

function legend() {
    var labels = ['Property Damage Only Collision','Injury Collision', 'Serious Injury Collision', 'Fatality Collision'];
    var svg = d3.select("#d3-legend-container")
        .append('svg')
        .attr("width", 400)
        .attr("height", 230);
        
    svg.append("text")
        .attr("x", 110)
        .attr("y", 75)
        .attr("class", "legend-title")
        .style("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("font-size", "22px")
        .text("Collision Severity");
    
    svg.selectAll("mydots")
        .data(labels)
        .enter()
        .append("ellipse")
        .attr("cx", 22)
        .attr("cy", function(d,i){ return 100 + i*25})
        .attr("rx", 7)
        .attr("ry", 7)
        .attr("stroke", function(d) {return color(d, 10)})
        .attr("stroke-width", 1)
        .attr("fill-opacity", .6)
        .style("fill", function(d){ return color(d)});

    svg.selectAll("mylabels")
        .data(labels)
        .enter()
        .append("text")
        .attr("x", 40)
        .attr("y", function(d,i){ return 100 + i*25})
        .text(function(d){ return d})
        .attr("font-size", "14px")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");
    return svg.node();
}

legend();

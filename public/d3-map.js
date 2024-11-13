(function() {

  window.addEventListener("load", init);
  // Global variable that stores the map svg
  let map;
  // A string Global variable that keeps track of the current year
  // the data will display
  let currYear;
  // The current data set we're working with, in .csv format
  let currData;
  let accessToken;

  async function init() {
    accessToken = await getAPIKey();
    // initial year
    let collisionData = await getCollisionData();
    currYear = '2004';
    currData = getFilteredData(collisionData, currYear);
    //let dataMap = getDatamap();

    map = makeLeaflet();
    plotPoints(map, currData);
    map.on("moveend", update);

    let slider = document.getElementById("yearInput");
    slider.addEventListener('input', async () => {
      let input = event.target.value;
      currYear = input;
      changeYearBySlider(input);
      currData = getFilteredData(collisionData, currYear);
      // *
      // map.off();
      // map.remove();
      // map = makeLeaflet();
      d3.selectAll("circle").remove();
      plotPoints(map, currData);

    });

  }

  /**
   * Returns the collision data in a geoJSON format
   */
  async function getCollisionData() {
      try {
          data = await d3.csv('data/collisions.csv')
          console.log("collision data:")
          console.dir(data['features']);
          return data;
      } catch(err) {
          console.error(err);
      }
  }

  /**
   * Uses Leaflet API to make
   */
  function makeLeaflet() {
    // map is the id of the div where the map will appear
    var map = L
    .map('map')
    .setView([47.60620595, -122.3181105], 11);   // center position + zoom

    // Add a tile to the map = a background. Comes from OpenStreetmap
    L.tileLayer(
        //'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        'https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=H3cXo4EjqJUt4VNqmLAuLbd6yabFz1WzOoiArfj3xjkYZArDqyrkbUzoVhsAB9Zd', {
          attribution: '<a href="http://jawg.io/" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright%22%3EOpenStreetMap</a> contributors'


    }).addTo(map);

    L.svg().addTo(map);

    return map;
  }

  /**
   * Takes in a map svg, the geoJSON collision data, and:
   * 1. Extracts the latitude and longitude from the collision data.
   * 2. Plots out each points onto the map
   */
  function plotPoints(map, collisionData) {
    console.log('calling plot points');

    d3.select("#map")
      .select("svg")
      .selectAll("myCircles")
      .data(collisionData)
      .join (
        function(enter) {
            return enter
            .append("circle")
            .attr("cx", function(d){
                if (d['X']) {
                    return map.latLngToLayerPoint([d['Y'], d['X']]).x
                }
            })
            .attr("cy", function(d){
                if (d['X']) {
                    return map.latLngToLayerPoint([d['Y'], d['X']]).y
                }
            })
            .style("fill", function(d) {return determineColor(d, 10)})
            .attr("r", 5)
            .attr("stroke", function(d) {return determineColor(d, 10)})
            .attr("stroke-width", 1)
            .attr("fill-opacity", .6)
        },
        function (update) {
            return update;
        },
        function(exit) {
            return exit.remove();
        }
      )

  }

  /**
   * Determines the color of the plot points in regard to collision severity level
   */
  function determineColor(d) {
    if (d['SEVERITYDESC'] === 'Property Damage Only Collision') {
        return "#85FFDE";
    } else if (d['SEVERITYDESC'] === 'Fatality Collision') {
        return "#FF002B";
    } else if (d['SEVERITYDESC'] === 'Injury Collision') {
        return "#92A1E5";
    } else if (d['SEVERITYDESC'] === 'Serious Injury Collision') {
        return "#B548CB";
    } else {
        return "gray";
    }
  }

  /**
   * Takes in the collision data and returns a new geoJSON that's filtered by year
   */
  function filterByYear(d, year) {

    let newData = [];
    if (d['YEAR'] == year) {
      newData.push(d);
    }
    return newData;
  }

  // Takes in the dataset and a year (as a string) and
  // gets a subset of the data based on the year
  // data = d3 csv
  function getFilteredData(data, year) {
    return data.filter(function(d) { return d['YEAR'] === year; });
  }


  /**
   * Updates the plotted points position when the map is zoomed in
   */
  function update() {
    console.log("Update called")
    d3.selectAll("circle")
      .attr("cx", function(d){
        if (d['X']) {
            return map.latLngToLayerPoint([d['Y'], d['X']]).x
        }
    })
      .attr("cy", function(d){
        if (d['X']) {
            return map.latLngToLayerPoint([d['Y'], d['X']]).y
        }
    })
  }

  function changeYearBySlider(value) {
    console.log("log from changeYearBySlider: ");
    let newYear = value;
    let yearBox = document.getElementById("currYear")
    yearBox.textContent = newYear;
  }

  /**
   * Fetches the API key from the backend (app.js)
   */
  async function getAPIKey() {
    try {
      let res = await fetch('/getApiKey');
      await statusCheck(res);
      res = await res.text();
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Takes in a promise object and checks if the promise request succeeded.
  * Throws a new error if the request did not succeed.
  * @param {response} response - a promise object
  * @returns {Promise} promise object
  */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }


})();

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
});

var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
});

var satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

var myMap = L.map("mapid", {
    center: [42.706437, -116.693899],
    zoom: 5,
    layers: [streetmap]
});

var baseMaps = {
    "Street Map": streetmap,
    "Satellite Map": satelliteStreets,
    "Dark Map": darkmap
};

var quakeMarkers = new L.LayerGroup();
var tectonic = new L.LayerGroup();

var overlayMaps = {
    "Earthquakes": quakeMarkers,
    "Tectonic Plates": tectonic
};

L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);

d3.json(queryUrl, function(data) {

    function styleOptions(feature) {
        console.log(feature.geometry.coordinates[2]);
        return {
            fillOpacity: 0.8,
            fillColor: getColor(feature.geometry.coordinates[2]),
            stroke: false,
            radius: getRadius(feature.properties.mag)
        };
    }

    function getColor(depth) {
        if (depth < 10) {
            return color = "#7fff00";
        } else if (depth < 30) {
            return color = "#ffff48";
        } else if (depth < 50) {
            return color = "#f5c300";
        } else if (depth < 70) {
            return color = "#ff8c00";
        } else if (depth < 90) {
            return color = "#be8c00";
        } else {
            return color = "#dd2713";
        }
    }

    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 5;
    }

  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng);
    },

    style: styleOptions,

    onEachFeature: function(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
}).addTo(quakeMarkers);

quakeMarkers.addTo(myMap);

});

var legend = L.control({
    position: "bottomright"
});

legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");

    const depths = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];
    const colors = ["#7fff00", "#ffff48", "#f5c300", "#ff8C00", "#be8C00", "#dd2713"];

    for (var i=0; i < depths.length; i++) {
        console.log(colors[i]);
        div.innerHTML +=
            "<i style='background-color: " + colors[i] + "'></i> " + depths[i] + "<br>";
    }
    return div;
};

legend.addTo(myMap);

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(plateData) {
    L.geoJson(plateData, {
        color: "#ff6500",
        weight: 2
    }).addTo(tectonic);
    tectonic.addTo(myMap);
});
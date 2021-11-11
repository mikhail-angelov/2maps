mapboxgl.accessToken = window.mapBoxKey;
const mendeUrl = window.mendeUrl;
const osmUrl = window.osmUrl;
// const mendeUrl = 'http://localhost:3000/map-mende/{z}/{x}/{y}.jpg';
// const osmUrl = "http://localhost:3000/map-osm/tile/{z}/{x}/{y}.pbf";

export const getSecondMap = (center, zoom) => {
  const map = new mapboxgl.Map({
    container: "map",
    style: {
      "version": 8,
      "name": "Bright",
      "metadata": {
        "mapbox:autocomposite": false,
        "mapbox:groups": {
          "1444849242106.713": {"collapsed": false, "name": "Places"},
          "1444849334699.1902": {"collapsed": true, "name": "Bridges"},
          "1444849345966.4436": {"collapsed": false, "name": "Roads"},
          "1444849354174.1904": {"collapsed": true, "name": "Tunnels"},
          "1444849364238.8171": {"collapsed": false, "name": "Buildings"},
          "1444849382550.77": {"collapsed": false, "name": "Water"},
          "1444849388993.3071": {"collapsed": false, "name": "Land"}
        },
        "mapbox:type": "template",
        "openmaptiles:mapbox:owner": "openmaptiles",
        "openmaptiles:mapbox:source:url": "mapbox://openmaptiles.4qljc88t",
        "openmaptiles:version": "3.x"
      },
      "center": [0, 0],
      "zoom": 1,
      "bearing": 0,
      "pitch": 0,
      "sources": {
        "openmaptiles": {
          "type": "vector",
          "tilejson": "2.1.0",
          "name": "tilemaker_default",
          "description": "Tiles made with Tilemaker",
          "version": "1.0.0",
          "scheme": "xyz",
          "tiles": [osmUrl],
          "minzoom": 0,
          "maxzoom": 14,
          "bounds": [ -180, -85.05112877980659, 180, 85.0511287798066 ],
          "center": [ -1.247,51.761,10 ]        
        },
        "mende-tiles": {
          type: "raster",
          tiles: [mendeUrl],
          tileSize: 256,
          attribution: "Map tiles Mende",
        },
      },
      "sprite": "https://openmaptiles.github.io/osm-bright-gl-style/sprite",
      "glyphs": "http://localhost:3000/fonts/{fontstack}/{range}.pbf",
      "layers": [
        {
          id: "m-tiles",
          type: "raster",
          source: "mende-tiles",
          minzoom: 2,
          maxzoom: 19,
        },
        // {
        //   "id": "background",
        //   "type": "background",
        //   "paint": {"background-color": "#f8f4f0"}
        // },
        {
          "id": "landcover-glacier",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849388993.3071"},
          "source": "openmaptiles",
          "source-layer": "landcover",
          "filter": ["==", "subclass", "glacier"],
          "layout": {"visibility": "visible"},
          "paint": {
            "fill-color": "#fff",
            "fill-opacity": {"base": 1, "stops": [[0, 0.9], [10, 0.3]]}
          }
        },
        {
          "id": "landuse-residential",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849388993.3071"},
          "source": "openmaptiles",
          "source-layer": "landuse",
          "filter": [
            "all",
            ["in", "class", "residential", "suburb", "neighbourhood"]
          ],
          "layout": {"visibility": "visible"},
          "paint": {
            "fill-color": {
              "base": 1,
              "stops": [
                [12, "hsla(30, 19%, 90%, 0.4)"],
                [16, "hsla(30, 19%, 90%, 0.2)"]
              ]
            }
          }
        },
        {
          "id": "landuse-commercial",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849388993.3071"},
          "source": "openmaptiles",
          "source-layer": "landuse",
          "filter": [
            "all",
            ["==", "$type", "Polygon"],
            ["==", "class", "commercial"]
          ],
          "layout": {"visibility": "visible"},
          "paint": {"fill-color": "hsla(0, 60%, 87%, 0.23)"}
        },
        {
          "id": "landuse-industrial",
          "type": "fill",
          "source": "openmaptiles",
          "source-layer": "landuse",
          "filter": [
            "all",
            ["==", "$type", "Polygon"],
            ["in", "class", "industrial", "garages", "dam"]
          ],
          "layout": {"visibility": "visible"},
          "paint": {"fill-color": "hsla(49, 100%, 88%, 0.34)"}
        },
        {
          "id": "landuse-cemetery",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849388993.3071"},
          "source": "openmaptiles",
          "source-layer": "landuse",
          "filter": ["==", "class", "cemetery"],
          "paint": {"fill-color": "#e0e4dd"}
        },
        {
          "id": "landuse-hospital",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849388993.3071"},
          "source": "openmaptiles",
          "source-layer": "landuse",
          "filter": ["==", "class", "hospital"],
          "paint": {"fill-color": "#fde"}
        },
        {
          "id": "landuse-school",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849388993.3071"},
          "source": "openmaptiles",
          "source-layer": "landuse",
          "filter": ["==", "class", "school"],
          "paint": {"fill-color": "#f0e8f8"}
        },
        {
          "id": "landuse-railway",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849388993.3071"},
          "source": "openmaptiles",
          "source-layer": "landuse",
          "filter": ["==", "class", "railway"],
          "layout": {"visibility": "visible"},
          "paint": {"fill-color": "hsla(30, 19%, 90%, 0.4)"}
        },
        {
          "id": "landcover-wood",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849388993.3071"},
          "source": "openmaptiles",
          "source-layer": "landcover",
          "filter": ["==", "class", "wood"],
          "paint": {
            "fill-antialias": {"base": 1, "stops": [[0, false], [9, true]]},
            "fill-color": "#6a4",
            "fill-opacity": 0.1,
            "fill-outline-color": "hsla(0, 0%, 0%, 0.03)"
          }
        },
        {
          "id": "landcover-grass",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849388993.3071"},
          "source": "openmaptiles",
          "source-layer": "landcover",
          "filter": ["==", "class", "grass"],
          "paint": {"fill-color": "#d8e8c8", "fill-opacity": 0.5}
        },
        {
          "id": "landcover-grass-park",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849388993.3071"},
          "source": "openmaptiles",
          "source-layer": "park",
          "filter": ["==", "class", "public_park"],
          "paint": {"fill-color": "#d8e8c8", "fill-opacity": 0.5}
        },
        {
          "id": "waterway_tunnel",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "waterway",
          "minzoom": 14,
          "filter": [
            "all",
            ["in", "class", "river", "stream", "canal"],
            ["==", "brunnel", "tunnel"]
          ],
          "layout": {"line-cap": "round", "visibility": "visible"},
          "paint": {
            "line-color": "#a0c8f0",
            "line-dasharray": [2, 4],
            "line-width": {"base": 1.3, "stops": [[13, 0.5], [20, 6]]}
          }
        },
        {
          "id": "waterway-other",
          "type": "line",
          "metadata": {"mapbox:group": "1444849382550.77"},
          "source": "openmaptiles",
          "source-layer": "waterway",
          "filter": [
            "all",
            ["!in", "class", "canal", "river", "stream"],
            ["==", "intermittent", 0]
          ],
          "layout": {"line-cap": "round", "visibility": "visible"},
          "paint": {
            "line-color": "#a0c8f0",
            "line-width": {"base": 1.3, "stops": [[13, 0.5], [20, 2]]}
          }
        },
        {
          "id": "waterway-other-intermittent",
          "type": "line",
          "metadata": {"mapbox:group": "1444849382550.77"},
          "source": "openmaptiles",
          "source-layer": "waterway",
          "filter": [
            "all",
            ["!in", "class", "canal", "river", "stream"],
            ["==", "intermittent", 1]
          ],
          "layout": {"line-cap": "round", "visibility": "visible"},
          "paint": {
            "line-color": "#a0c8f0",
            "line-dasharray": [4, 3],
            "line-width": {"base": 1.3, "stops": [[13, 0.5], [20, 2]]}
          }
        },
        {
          "id": "waterway-stream-canal",
          "type": "line",
          "metadata": {"mapbox:group": "1444849382550.77"},
          "source": "openmaptiles",
          "source-layer": "waterway",
          "filter": [
            "all",
            ["in", "class", "canal", "stream"],
            ["!=", "brunnel", "tunnel"],
            ["==", "intermittent", 0]
          ],
          "layout": {"line-cap": "round", "visibility": "visible"},
          "paint": {
            "line-color": "#a0c8f0",
            "line-width": {"base": 1.3, "stops": [[13, 0.5], [20, 6]]}
          }
        },
        {
          "id": "waterway-stream-canal-intermittent",
          "type": "line",
          "metadata": {"mapbox:group": "1444849382550.77"},
          "source": "openmaptiles",
          "source-layer": "waterway",
          "filter": [
            "all",
            ["in", "class", "canal", "stream"],
            ["!=", "brunnel", "tunnel"],
            ["==", "intermittent", 1]
          ],
          "layout": {"line-cap": "round", "visibility": "visible"},
          "paint": {
            "line-color": "#a0c8f0",
            "line-dasharray": [4, 3],
            "line-width": {"base": 1.3, "stops": [[13, 0.5], [20, 6]]}
          }
        },
        {
          "id": "waterway-river",
          "type": "line",
          "metadata": {"mapbox:group": "1444849382550.77"},
          "source": "openmaptiles",
          "source-layer": "waterway",
          "filter": [
            "all",
            ["==", "class", "river"],
            ["!=", "brunnel", "tunnel"],
            ["==", "intermittent", 0]
          ],
          "layout": {"line-cap": "round", "visibility": "visible"},
          "paint": {
            "line-color": "#a0c8f0",
            "line-width": {"base": 1.2, "stops": [[10, 0.8], [20, 6]]}
          }
        },
        {
          "id": "waterway-river-intermittent",
          "type": "line",
          "metadata": {"mapbox:group": "1444849382550.77"},
          "source": "openmaptiles",
          "source-layer": "waterway",
          "filter": [
            "all",
            ["==", "class", "river"],
            ["!=", "brunnel", "tunnel"],
            ["==", "intermittent", 1]
          ],
          "layout": {"line-cap": "round", "visibility": "visible"},
          "paint": {
            "line-color": "#a0c8f0",
            "line-dasharray": [3, 2.5],
            "line-width": {"base": 1.2, "stops": [[10, 0.8], [20, 6]]}
          }
        },
        {
          "id": "water-offset",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849382550.77"},
          "source": "openmaptiles",
          "source-layer": "water",
          "maxzoom": 8,
          "filter": ["==", "$type", "Polygon"],
          "layout": {"visibility": "visible"},
          "paint": {
            "fill-color": "#a0c8f0",
            "fill-opacity": 1,
            "fill-translate": {"base": 1, "stops": [[6, [2, 0]], [8, [0, 0]]]}
          }
        },
        {
          "id": "water",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849382550.77"},
          "source": "openmaptiles",
          "source-layer": "water",
          "filter": ["all", ["!=", "intermittent", 1], ["!=", "brunnel", "tunnel"]],
          "layout": {"visibility": "visible"},
          "paint": {"fill-color": "hsl(210, 67%, 85%)", "fill-opacity": 0.5}
        },
        {
          "id": "water-intermittent",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849382550.77"},
          "source": "openmaptiles",
          "source-layer": "water",
          "filter": ["all", ["==", "intermittent", 1]],
          "layout": {"visibility": "visible"},
          "paint": {"fill-color": "hsl(210, 67%, 85%)", "fill-opacity": 0.7}
        },
        {
          "id": "water-pattern",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849382550.77"},
          "source": "openmaptiles",
          "source-layer": "water",
          "filter": ["all"],
          "layout": {"visibility": "visible"},
          "paint": {"fill-pattern": "wave", "fill-translate": [0, 2.5]}
        },
        {
          "id": "landcover-ice-shelf",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849382550.77"},
          "source": "openmaptiles",
          "source-layer": "landcover",
          "filter": ["==", "subclass", "ice_shelf"],
          "layout": {"visibility": "visible"},
          "paint": {
            "fill-color": "#fff",
            "fill-opacity": {"base": 1, "stops": [[0, 0.9], [10, 0.3]]}
          }
        },
        {
          "id": "landcover-sand",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849382550.77"},
          "source": "openmaptiles",
          "source-layer": "landcover",
          "filter": ["all", ["==", "class", "sand"]],
          "layout": {"visibility": "visible"},
          "paint": {"fill-color": "rgba(245, 238, 188, 1)", "fill-opacity": 0.6}
        },
        {
          "id": "building",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849364238.8171"},
          "source": "openmaptiles",
          "source-layer": "building",
          "paint": {
            "fill-antialias": true,
            "fill-color": {"base": 1, "stops": [[15.5, "#f2eae2"], [16, "#dfdbd7"]]}
          }
        },
        {
          "id": "building-top",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849364238.8171"},
          "source": "openmaptiles",
          "source-layer": "building",
          "layout": {"visibility": "visible"},
          "paint": {
            "fill-color": "#f2eae2",
            "fill-opacity": {"base": 1, "stops": [[13, 0], [16, 1]]},
            "fill-outline-color": "#dfdbd7",
            "fill-translate": {"base": 1, "stops": [[14, [0, 0]], [16, [-2, -2]]]}
          }
        },
        {
          "id": "tunnel-service-track-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "tunnel"],
            ["in", "class", "service", "track"]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#cfcdca",
            "line-dasharray": [0.5, 0.25],
            "line-width": {"base": 1.2, "stops": [[15, 1], [16, 4], [20, 11]]}
          }
        },
        {
          "id": "tunnel-motorway-link-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "tunnel"],
            ["==", "class", "motorway"],
            ["==", "ramp", 1]
          ],
          "layout": {"line-join": "round", "visibility": "visible"},
          "paint": {
            "line-color": "rgba(200, 147, 102, 1)",
            "line-dasharray": [0.5, 0.25],
            "line-width": {
              "base": 1.2,
              "stops": [[12, 1], [13, 3], [14, 4], [20, 15]]
            }
          }
        },
        {
          "id": "tunnel-minor-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": ["all", ["==", "brunnel", "tunnel"], ["==", "class", "minor"]],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#cfcdca",
            "line-opacity": {"stops": [[12, 0], [12.5, 1]]},
            "line-width": {
              "base": 1.2,
              "stops": [[12, 0.5], [13, 1], [14, 4], [20, 15]]
            },
            "line-dasharray": [0.5, 0.25]
          }
        },
        {
          "id": "tunnel-link-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "tunnel"],
            ["in", "class", "trunk", "primary", "secondary", "tertiary"],
            ["==", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#e9ac77",
            "line-opacity": 1,
            "line-width": {
              "base": 1.2,
              "stops": [[12, 1], [13, 3], [14, 4], [20, 15]]
            },
            "line-dasharray": [0.5, 0.25]
          }
        },
        {
          "id": "tunnel-secondary-tertiary-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "tunnel"],
            ["in", "class", "secondary", "tertiary"],
            ["!=", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#e9ac77",
            "line-opacity": 1,
            "line-width": {"base": 1.2, "stops": [[8, 1.5], [20, 17]]},
            "line-dasharray": [0.5, 0.25]
          }
        },
        {
          "id": "tunnel-trunk-primary-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "tunnel"],
            ["in", "class", "primary", "trunk"],
            ["!=", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#e9ac77",
            "line-width": {
              "base": 1.2,
              "stops": [[5, 0.4], [6, 0.6], [7, 1.5], [20, 22]]
            }
          }
        },
        {
          "id": "tunnel-motorway-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "tunnel"],
            ["==", "class", "motorway"],
            ["!=", "ramp", 1]
          ],
          "layout": {"line-join": "round", "visibility": "visible"},
          "paint": {
            "line-color": "#e9ac77",
            "line-dasharray": [0.5, 0.25],
            "line-width": {
              "base": 1.2,
              "stops": [[5, 0.4], [6, 0.6], [7, 1.5], [20, 22]]
            }
          }
        },
        {
          "id": "tunnel-path",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "brunnel", "tunnel"],
            ["==", "class", "path"]
          ],
          "paint": {
            "line-color": "#cba",
            "line-dasharray": [1.5, 0.75],
            "line-width": {"base": 1.2, "stops": [[15, 1.2], [20, 4]]}
          }
        },
        {
          "id": "tunnel-motorway-link",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "tunnel"],
            ["==", "class", "motorway"],
            ["==", "ramp", 1]
          ],
          "layout": {"line-join": "round", "visibility": "visible"},
          "paint": {
            "line-color": "rgba(244, 209, 158, 1)",
            "line-width": {
              "base": 1.2,
              "stops": [[12.5, 0], [13, 1.5], [14, 2.5], [20, 11.5]]
            }
          }
        },
        {
          "id": "tunnel-service-track",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "tunnel"],
            ["in", "class", "service", "track"]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#fff",
            "line-width": {"base": 1.2, "stops": [[15.5, 0], [16, 2], [20, 7.5]]}
          }
        },
        {
          "id": "tunnel-link",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "tunnel"],
            ["in", "class", "trunk", "primary", "secondary", "tertiary"],
            ["==", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#fff4c6",
            "line-width": {
              "base": 1.2,
              "stops": [[12.5, 0], [13, 1.5], [14, 2.5], [20, 11.5]]
            }
          }
        },
        {
          "id": "tunnel-minor",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "tunnel"],
            ["==", "class", "minor_road"]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#fff",
            "line-opacity": 1,
            "line-width": {"base": 1.2, "stops": [[13.5, 0], [14, 2.5], [20, 11.5]]}
          }
        },
        {
          "id": "tunnel-secondary-tertiary",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "tunnel"],
            ["in", "class", "secondary", "tertiary"],
            ["!=", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#fff4c6",
            "line-width": {"base": 1.2, "stops": [[6.5, 0], [7, 0.5], [20, 10]]}
          }
        },
        {
          "id": "tunnel-trunk-primary",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "tunnel"],
            ["in", "class", "primary", "trunk"],
            ["!=", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#fff4c6",
            "line-width": {"base": 1.2, "stops": [[6.5, 0], [7, 0.5], [20, 18]]}
          }
        },
        {
          "id": "tunnel-motorway",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "tunnel"],
            ["==", "class", "motorway"],
            ["!=", "ramp", 1]
          ],
          "layout": {"line-join": "round", "visibility": "visible"},
          "paint": {
            "line-color": "#ffdaa6",
            "line-width": {"base": 1.2, "stops": [[6.5, 0], [7, 0.5], [20, 18]]}
          }
        },
        {
          "id": "tunnel-railway",
          "type": "line",
          "metadata": {"mapbox:group": "1444849354174.1904"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": ["all", ["==", "brunnel", "tunnel"], ["==", "class", "rail"]],
          "paint": {
            "line-color": "#bbb",
            "line-dasharray": [2, 2],
            "line-width": {"base": 1.4, "stops": [[14, 0.4], [15, 0.75], [20, 2]]}
          }
        },
        {
          "id": "ferry",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": ["all", ["in", "class", "ferry"]],
          "layout": {"line-join": "round", "visibility": "visible"},
          "paint": {
            "line-color": "rgba(108, 159, 182, 1)",
            "line-dasharray": [2, 2],
            "line-width": 1.1
          }
        },
        {
          "id": "aeroway-taxiway-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "aeroway",
          "minzoom": 12,
          "filter": ["all", ["in", "class", "taxiway"]],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "rgba(153, 153, 153, 1)",
            "line-opacity": 1,
            "line-width": {"base": 1.5, "stops": [[11, 2], [17, 12]]}
          }
        },
        {
          "id": "aeroway-runway-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "aeroway",
          "minzoom": 12,
          "filter": ["all", ["in", "class", "runway"]],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "rgba(153, 153, 153, 1)",
            "line-opacity": 1,
            "line-width": {"base": 1.5, "stops": [[11, 5], [17, 55]]}
          }
        },
        {
          "id": "aeroway-area",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "aeroway",
          "minzoom": 4,
          "filter": [
            "all",
            ["==", "$type", "Polygon"],
            ["in", "class", "runway", "taxiway"]
          ],
          "layout": {"visibility": "visible"},
          "paint": {
            "fill-color": "rgba(255, 255, 255, 1)",
            "fill-opacity": {"base": 1, "stops": [[13, 0], [14, 1]]}
          }
        },
        {
          "id": "aeroway-taxiway",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "aeroway",
          "minzoom": 4,
          "filter": [
            "all",
            ["in", "class", "taxiway"],
            ["==", "$type", "LineString"]
          ],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "rgba(255, 255, 255, 1)",
            "line-opacity": {"base": 1, "stops": [[11, 0], [12, 1]]},
            "line-width": {"base": 1.5, "stops": [[11, 1], [17, 10]]}
          }
        },
        {
          "id": "aeroway-runway",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "aeroway",
          "minzoom": 4,
          "filter": [
            "all",
            ["in", "class", "runway"],
            ["==", "$type", "LineString"]
          ],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "rgba(255, 255, 255, 1)",
            "line-opacity": {"base": 1, "stops": [[11, 0], [12, 1]]},
            "line-width": {"base": 1.5, "stops": [[11, 4], [17, 50]]}
          }
        },
        {
          "id": "road_area_pier",
          "type": "fill",
          "metadata": {},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": ["all", ["==", "$type", "Polygon"], ["==", "class", "pier"]],
          "layout": {"visibility": "visible"},
          "paint": {"fill-antialias": true, "fill-color": "#f8f4f0"}
        },
        {
          "id": "road_pier",
          "type": "line",
          "metadata": {},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": ["all", ["==", "$type", "LineString"], ["in", "class", "pier"]],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "#f8f4f0",
            "line-width": {"base": 1.2, "stops": [[15, 1], [17, 4]]}
          }
        },
        {
          "id": "highway-area",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": ["all", ["==", "$type", "Polygon"], ["!in", "class", "pier"]],
          "layout": {"visibility": "visible"},
          "paint": {
            "fill-antialias": false,
            "fill-color": "hsla(0, 0%, 89%, 0.56)",
            "fill-opacity": 0.9,
            "fill-outline-color": "#cfcdca"
          }
        },
        {
          "id": "highway-motorway-link-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 12,
          "filter": [
            "all",
            ["!in", "brunnel", "bridge", "tunnel"],
            ["==", "class", "motorway"],
            ["==", "ramp", 1]
          ],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "#e9ac77",
            "line-opacity": 1,
            "line-width": {
              "base": 1.2,
              "stops": [[12, 1], [13, 3], [14, 4], [20, 15]]
            }
          }
        },
        {
          "id": "highway-link-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 13,
          "filter": [
            "all",
            ["!in", "brunnel", "bridge", "tunnel"],
            ["in", "class", "trunk", "primary", "secondary", "tertiary"],
            ["==", "ramp", 1]
          ],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "#e9ac77",
            "line-opacity": 1,
            "line-width": {
              "base": 1.2,
              "stops": [[12, 1], [13, 3], [14, 4], [20, 15]]
            }
          }
        },
        {
          "id": "highway-minor-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["!=", "brunnel", "tunnel"],
            ["in", "class", "minor", "service", "track"]
          ],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "#cfcdca",
            "line-opacity": {"stops": [[12, 0], [12.5, 1]]},
            "line-width": {
              "base": 1.2,
              "stops": [[12, 0.5], [13, 1], [14, 4], [20, 15]]
            }
          }
        },
        {
          "id": "highway-secondary-tertiary-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["!in", "brunnel", "bridge", "tunnel"],
            ["in", "class", "secondary", "tertiary"],
            ["!=", "ramp", 1]
          ],
          "layout": {
            "line-cap": "butt",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "#e9ac77",
            "line-opacity": 1,
            "line-width": {"base": 1.2, "stops": [[8, 1.5], [20, 17]]}
          }
        },
        {
          "id": "highway-primary-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 5,
          "filter": [
            "all",
            ["!in", "brunnel", "bridge", "tunnel"],
            ["in", "class", "primary"],
            ["!=", "ramp", 1]
          ],
          "layout": {
            "line-cap": "butt",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "#e9ac77",
            "line-opacity": {"stops": [[7, 0], [8, 1]]},
            "line-width": {
              "base": 1.2,
              "stops": [[7, 0], [8, 0.6], [9, 1.5], [20, 22]]
            }
          }
        },
        {
          "id": "highway-trunk-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 5,
          "filter": [
            "all",
            ["!in", "brunnel", "bridge", "tunnel"],
            ["in", "class", "trunk"],
            ["!=", "ramp", 1]
          ],
          "layout": {
            "line-cap": "butt",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "#e9ac77",
            "line-opacity": {"stops": [[5, 0], [6, 1]]},
            "line-width": {
              "base": 1.2,
              "stops": [[5, 0], [6, 0.6], [7, 1.5], [20, 22]]
            }
          }
        },
        {
          "id": "highway-motorway-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 4,
          "filter": [
            "all",
            ["!in", "brunnel", "bridge", "tunnel"],
            ["==", "class", "motorway"],
            ["!=", "ramp", 1]
          ],
          "layout": {
            "line-cap": "butt",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "#e9ac77",
            "line-opacity": {"stops": [[4, 0], [5, 1]]},
            "line-width": {
              "base": 1.2,
              "stops": [[4, 0], [5, 0.4], [6, 0.6], [7, 1.5], [20, 22]]
            }
          }
        },
        {
          "id": "highway-path",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["!in", "brunnel", "bridge", "tunnel"],
            ["==", "class", "path"]
          ],
          "paint": {
            "line-color": "#cba",
            "line-dasharray": [1.5, 0.75],
            "line-width": {"base": 1.2, "stops": [[15, 1.2], [20, 4]]}
          }
        },
        {
          "id": "highway-motorway-link",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 12,
          "filter": [
            "all",
            ["!in", "brunnel", "bridge", "tunnel"],
            ["==", "class", "motorway"],
            ["==", "ramp", 1]
          ],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "#fc8",
            "line-width": {
              "base": 1.2,
              "stops": [[12.5, 0], [13, 1.5], [14, 2.5], [20, 11.5]]
            }
          }
        },
        {
          "id": "highway-link",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 13,
          "filter": [
            "all",
            ["!in", "brunnel", "bridge", "tunnel"],
            ["in", "class", "trunk", "primary", "secondary", "tertiary"],
            ["==", "ramp", 1]
          ],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "#fea",
            "line-width": {
              "base": 1.2,
              "stops": [[12.5, 0], [13, 1.5], [14, 2.5], [20, 11.5]]
            }
          }
        },
        {
          "id": "highway-minor",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["!=", "brunnel", "tunnel"],
            ["in", "class", "minor", "service", "track"]
          ],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "#fff",
            "line-opacity": 1,
            "line-width": {"base": 1.2, "stops": [[13.5, 0], [14, 2.5], [20, 11.5]]}
          }
        },
        {
          "id": "highway-secondary-tertiary",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["!in", "brunnel", "bridge", "tunnel"],
            ["in", "class", "secondary", "tertiary"],
            ["!=", "ramp", 1]
          ],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "#fea",
            "line-width": {"base": 1.2, "stops": [[6.5, 0], [8, 0.5], [20, 13]]}
          }
        },
        {
          "id": "highway-primary",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["!in", "brunnel", "bridge", "tunnel"],
            ["in", "class", "primary"],
            ["!=", "ramp", 1]
          ],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "#fea",
            "line-width": {"base": 1.2, "stops": [[8.5, 0], [9, 0.5], [20, 18]]}
          }
        },
        {
          "id": "highway-trunk",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["!in", "brunnel", "bridge", "tunnel"],
            ["in", "class", "trunk"],
            ["!=", "ramp", 1]
          ],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "#fea",
            "line-width": {"base": 1.2, "stops": [[6.5, 0], [7, 0.5], [20, 18]]}
          }
        },
        {
          "id": "highway-motorway",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 5,
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["!in", "brunnel", "bridge", "tunnel"],
            ["==", "class", "motorway"],
            ["!=", "ramp", 1]
          ],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "#fc8",
            "line-width": {"base": 1.2, "stops": [[6.5, 0], [7, 0.5], [20, 18]]}
          }
        },
        {
          "id": "railway-transit",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "class", "transit"],
            ["!in", "brunnel", "tunnel"]
          ],
          "layout": {"visibility": "visible"},
          "paint": {
            "line-color": "hsla(0, 0%, 73%, 0.77)",
            "line-width": {"base": 1.4, "stops": [[14, 0.4], [20, 1]]}
          }
        },
        {
          "id": "railway-transit-hatching",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "class", "transit"],
            ["!in", "brunnel", "tunnel"]
          ],
          "layout": {"visibility": "visible"},
          "paint": {
            "line-color": "hsla(0, 0%, 73%, 0.68)",
            "line-dasharray": [0.2, 8],
            "line-width": {"base": 1.4, "stops": [[14.5, 0], [15, 2], [20, 6]]}
          }
        },
        {
          "id": "railway-service",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "class", "rail"],
            ["has", "service"]
          ],
          "paint": {
            "line-color": "hsla(0, 0%, 73%, 0.77)",
            "line-width": {"base": 1.4, "stops": [[14, 0.4], [20, 1]]}
          }
        },
        {
          "id": "railway-service-hatching",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "class", "rail"],
            ["has", "service"]
          ],
          "layout": {"visibility": "visible"},
          "paint": {
            "line-color": "hsla(0, 0%, 73%, 0.68)",
            "line-dasharray": [0.2, 8],
            "line-width": {"base": 1.4, "stops": [[14.5, 0], [15, 2], [20, 6]]}
          }
        },
        {
          "id": "railway",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["!has", "service"],
            ["!in", "brunnel", "bridge", "tunnel"],
            ["==", "class", "rail"]
          ],
          "paint": {
            "line-color": "#bbb",
            "line-width": {"base": 1.4, "stops": [[14, 0.4], [15, 0.75], [20, 2]]}
          }
        },
        {
          "id": "railway-hatching",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["!has", "service"],
            ["!in", "brunnel", "bridge", "tunnel"],
            ["==", "class", "rail"]
          ],
          "paint": {
            "line-color": "#bbb",
            "line-dasharray": [0.2, 8],
            "line-width": {"base": 1.4, "stops": [[14.5, 0], [15, 3], [20, 8]]}
          }
        },
        {
          "id": "bridge-motorway-link-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "bridge"],
            ["==", "class", "motorway"],
            ["==", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#e9ac77",
            "line-opacity": 1,
            "line-width": {
              "base": 1.2,
              "stops": [[12, 1], [13, 3], [14, 4], [20, 19]]
            }
          }
        },
        {
          "id": "bridge-link-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "bridge"],
            ["in", "class", "trunk", "primary", "secondary", "tertiary"],
            ["==", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#e9ac77",
            "line-opacity": 1,
            "line-width": {
              "base": 1.2,
              "stops": [[12, 1], [13, 3], [14, 4], [20, 19]]
            }
          }
        },
        {
          "id": "bridge-secondary-tertiary-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "bridge"],
            ["in", "class", "secondary", "tertiary"],
            ["!=", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#e9ac77",
            "line-opacity": 1,
            "line-width": {
              "base": 1.2,
              "stops": [[5, 0.4], [7, 0.6], [8, 1.5], [20, 21]]
            }
          }
        },
        {
          "id": "bridge-trunk-primary-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "bridge"],
            ["in", "class", "primary", "trunk"],
            ["!=", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "hsl(28, 76%, 67%)",
            "line-width": {
              "base": 1.2,
              "stops": [[5, 0.4], [6, 0.6], [7, 1.5], [20, 26]]
            }
          }
        },
        {
          "id": "bridge-motorway-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "bridge"],
            ["==", "class", "motorway"],
            ["!=", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#e9ac77",
            "line-width": {
              "base": 1.2,
              "stops": [[5, 0.4], [6, 0.6], [7, 1.5], [20, 26]]
            }
          }
        },
        {
          "id": "bridge-minor-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "brunnel", "bridge"],
            ["in", "class", "minor", "service", "track"]
          ],
          "layout": {"line-cap": "butt", "line-join": "round"},
          "paint": {
            "line-color": "#cfcdca",
            "line-opacity": {"stops": [[12, 0], [12.5, 1]]},
            "line-width": {
              "base": 1.2,
              "stops": [[12, 0.5], [13, 1], [14, 6], [20, 24]]
            }
          }
        },
        {
          "id": "bridge-path-casing",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "brunnel", "bridge"],
            ["==", "class", "path"]
          ],
          "paint": {
            "line-color": "#f8f4f0",
            "line-width": {"base": 1.2, "stops": [[15, 1.2], [20, 18]]}
          }
        },
        {
          "id": "bridge-path",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "brunnel", "bridge"],
            ["==", "class", "path"]
          ],
          "paint": {
            "line-color": "#cba",
            "line-dasharray": [1.5, 0.75],
            "line-width": {"base": 1.2, "stops": [[15, 1.2], [20, 4]]}
          }
        },
        {
          "id": "bridge-motorway-link",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "bridge"],
            ["==", "class", "motorway"],
            ["==", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#fc8",
            "line-width": {
              "base": 1.2,
              "stops": [[12.5, 0], [13, 1.5], [14, 2.5], [20, 11.5]]
            }
          }
        },
        {
          "id": "bridge-link",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "bridge"],
            ["in", "class", "trunk", "primary", "secondary", "tertiary"],
            ["==", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#fea",
            "line-width": {
              "base": 1.2,
              "stops": [[12.5, 0], [13, 1.5], [14, 2.5], [20, 11.5]]
            }
          }
        },
        {
          "id": "bridge-minor",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "brunnel", "bridge"],
            ["in", "class", "minor", "service", "track"]
          ],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "#fff",
            "line-opacity": 1,
            "line-width": {"base": 1.2, "stops": [[13.5, 0], [14, 2.5], [20, 11.5]]}
          }
        },
        {
          "id": "bridge-secondary-tertiary",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "bridge"],
            ["in", "class", "secondary", "tertiary"],
            ["!=", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#fea",
            "line-width": {"base": 1.2, "stops": [[6.5, 0], [8, 0.5], [20, 13]]}
          }
        },
        {
          "id": "bridge-trunk-primary",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "bridge"],
            ["in", "class", "primary", "trunk"],
            ["!=", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#fea",
            "line-width": {"base": 1.2, "stops": [[6.5, 0], [7, 0.5], [20, 18]]}
          }
        },
        {
          "id": "bridge-motorway",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "brunnel", "bridge"],
            ["==", "class", "motorway"],
            ["!=", "ramp", 1]
          ],
          "layout": {"line-join": "round"},
          "paint": {
            "line-color": "#fc8",
            "line-width": {"base": 1.2, "stops": [[6.5, 0], [7, 0.5], [20, 18]]}
          }
        },
        {
          "id": "bridge-railway",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": ["all", ["==", "brunnel", "bridge"], ["==", "class", "rail"]],
          "paint": {
            "line-color": "#bbb",
            "line-width": {"base": 1.4, "stops": [[14, 0.4], [15, 0.75], [20, 2]]}
          }
        },
        {
          "id": "bridge-railway-hatching",
          "type": "line",
          "metadata": {"mapbox:group": "1444849334699.1902"},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": ["all", ["==", "brunnel", "bridge"], ["==", "class", "rail"]],
          "paint": {
            "line-color": "#bbb",
            "line-dasharray": [0.2, 8],
            "line-width": {"base": 1.4, "stops": [[14.5, 0], [15, 3], [20, 8]]}
          }
        },
        {
          "id": "cablecar",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 13,
          "filter": ["==", "class", "cable_car"],
          "layout": {"line-cap": "round", "visibility": "visible"},
          "paint": {
            "line-color": "hsl(0, 0%, 70%)",
            "line-width": {"base": 1, "stops": [[11, 1], [19, 2.5]]}
          }
        },
        {
          "id": "cablecar-dash",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 13,
          "filter": ["==", "class", "cable_car"],
          "layout": {"line-cap": "round", "visibility": "visible"},
          "paint": {
            "line-color": "hsl(0, 0%, 70%)",
            "line-dasharray": [2, 3],
            "line-width": {"base": 1, "stops": [[11, 3], [19, 5.5]]}
          }
        },
        {
          "id": "boundary-land-level-4",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "boundary",
          "filter": [
            "all",
            [">=", "admin_level", 3],
            ["<=", "admin_level", 8],
            ["!=", "maritime", 1]
          ],
          "layout": {"line-join": "round", "visibility": "visible"},
          "paint": {
            "line-color": "#9e9cab",
            "line-dasharray": [3, 1, 1, 1],
            "line-width": {"base": 1.4, "stops": [[4, 0.4], [5, 1], [12, 3]]}
          }
        },
        {
          "id": "boundary-land-level-2",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "boundary",
          "filter": [
            "all",
            ["==", "admin_level", 2],
            ["!=", "maritime", 1],
            ["!=", "disputed", 1]
          ],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "hsl(248, 7%, 66%)",
            "line-width": {
              "base": 1,
              "stops": [[0, 0.6], [4, 1.4], [5, 2], [12, 8]]
            }
          }
        },
        {
          "id": "boundary-land-disputed",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "boundary",
          "filter": ["all", ["!=", "maritime", 1], ["==", "disputed", 1]],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "hsl(248, 7%, 70%)",
            "line-dasharray": [1, 3],
            "line-width": {
              "base": 1,
              "stops": [[0, 0.6], [4, 1.4], [5, 2], [12, 8]]
            }
          }
        },
        {
          "id": "boundary-water",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "boundary",
          "minzoom": 4,
          "filter": ["all", ["in", "admin_level", 2, 4], ["==", "maritime", 1]],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "rgba(154, 189, 214, 1)",
            "line-opacity": {"stops": [[6, 0.6], [10, 1]]},
            "line-width": {
              "base": 1,
              "stops": [[0, 0.6], [4, 1.4], [5, 2], [12, 8]]
            }
          }
        },
        {
          "id": "waterway-name",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "waterway",
          "minzoom": 13,
          "filter": ["all", ["==", "$type", "LineString"], ["has", "name:latin"]],
          "layout": {
            "symbol-placement": "line",
            "symbol-spacing": 350,
            "text-field": "{name:latin} {name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Italic"],
            "text-letter-spacing": 0.2,
            "text-max-width": 5,
            "text-rotation-alignment": "map",
            "text-size": 14
          },
          "paint": {
            "text-color": "#74aee9",
            "text-halo-color": "rgba(255,255,255,0.7)",
            "text-halo-width": 1.5
          }
        },
        {
          "id": "water-name-lakeline",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "water_name",
          "filter": ["==", "$type", "LineString"],
          "layout": {
            "symbol-placement": "line",
            "symbol-spacing": 350,
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Italic"],
            "text-letter-spacing": 0.2,
            "text-max-width": 5,
            "text-rotation-alignment": "map",
            "text-size": 14
          },
          "paint": {
            "text-color": "#74aee9",
            "text-halo-color": "rgba(255,255,255,0.7)",
            "text-halo-width": 1.5
          }
        },
        {
          "id": "water-name-ocean",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "water_name",
          "filter": ["all", ["==", "$type", "Point"], ["==", "class", "ocean"]],
          "layout": {
            "symbol-placement": "point",
            "symbol-spacing": 350,
            "text-field": "{name:latin}",
            "text-font": ["KlokanTech Noto Sans Italic"],
            "text-letter-spacing": 0.2,
            "text-max-width": 5,
            "text-rotation-alignment": "map",
            "text-size": 14
          },
          "paint": {
            "text-color": "#74aee9",
            "text-halo-color": "rgba(255,255,255,0.7)",
            "text-halo-width": 1.5
          }
        },
        {
          "id": "water-name-other",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "water_name",
          "filter": ["all", ["==", "$type", "Point"], ["!in", "class", "ocean"]],
          "layout": {
            "symbol-placement": "point",
            "symbol-spacing": 350,
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Italic"],
            "text-letter-spacing": 0.2,
            "text-max-width": 5,
            "text-rotation-alignment": "map",
            "text-size": {"stops": [[0, 10], [6, 14]]},
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#74aee9",
            "text-halo-color": "rgba(255,255,255,0.7)",
            "text-halo-width": 1.5
          }
        },
        {
          "id": "poi-level-3",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "poi",
          "minzoom": 16,
          "filter": [
            "all",
            ["==", "$type", "Point"],
            [">=", "rank", 25],
            ["any", ["!has", "level"], ["==", "level", 0]]
          ],
          "layout": {
            "icon-image": "{class}_11",
            "text-anchor": "top",
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-max-width": 9,
            "text-offset": [0, 0.6],
            "text-padding": 2,
            "text-size": 12,
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#666",
            "text-halo-blur": 0.5,
            "text-halo-color": "#ffffff",
            "text-halo-width": 1
          }
        },
        {
          "id": "poi-level-2",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "poi",
          "minzoom": 15,
          "filter": [
            "all",
            ["==", "$type", "Point"],
            ["<=", "rank", 24],
            [">=", "rank", 15],
            ["any", ["!has", "level"], ["==", "level", 0]]
          ],
          "layout": {
            "icon-image": "{class}_11",
            "text-anchor": "top",
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-max-width": 9,
            "text-offset": [0, 0.6],
            "text-padding": 2,
            "text-size": 12,
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#666",
            "text-halo-blur": 0.5,
            "text-halo-color": "#ffffff",
            "text-halo-width": 1
          }
        },
        {
          "id": "poi-level-1",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "poi",
          "minzoom": 14,
          "filter": [
            "all",
            ["==", "$type", "Point"],
            ["<=", "rank", 14],
            ["has", "name:latin"],
            ["any", ["!has", "level"], ["==", "level", 0]]
          ],
          "layout": {
            "icon-image": "{class}_11",
            "text-anchor": "top",
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-max-width": 9,
            "text-offset": [0, 0.6],
            "text-padding": 2,
            "text-size": 12,
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#666",
            "text-halo-blur": 0.5,
            "text-halo-color": "#ffffff",
            "text-halo-width": 1
          }
        },
        {
          "id": "poi-railway",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "poi",
          "minzoom": 13,
          "filter": [
            "all",
            ["==", "$type", "Point"],
            ["has", "name:latin"],
            ["==", "class", "railway"],
            ["==", "subclass", "station"]
          ],
          "layout": {
            "icon-allow-overlap": false,
            "icon-ignore-placement": false,
            "icon-image": "{class}_11",
            "icon-optional": false,
            "text-allow-overlap": false,
            "text-anchor": "top",
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-ignore-placement": false,
            "text-max-width": 9,
            "text-offset": [0, 0.6],
            "text-optional": true,
            "text-padding": 2,
            "text-size": 12
          },
          "paint": {
            "text-color": "#666",
            "text-halo-blur": 0.5,
            "text-halo-color": "#ffffff",
            "text-halo-width": 1
          }
        },
        {
          "id": "road_oneway",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 15,
          "filter": [
            "all",
            ["==", "oneway", 1],
            [
              "in",
              "class",
              "motorway",
              "trunk",
              "primary",
              "secondary",
              "tertiary",
              "minor",
              "service"
            ]
          ],
          "layout": {
            "icon-image": "oneway",
            "icon-padding": 2,
            "icon-rotate": 90,
            "icon-rotation-alignment": "map",
            "icon-size": {"stops": [[15, 0.5], [19, 1]]},
            "symbol-placement": "line",
            "symbol-spacing": 75
          },
          "paint": {"icon-opacity": 0.5}
        },
        {
          "id": "road_oneway_opposite",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 15,
          "filter": [
            "all",
            ["==", "oneway", -1],
            [
              "in",
              "class",
              "motorway",
              "trunk",
              "primary",
              "secondary",
              "tertiary",
              "minor",
              "service"
            ]
          ],
          "layout": {
            "icon-image": "oneway",
            "icon-padding": 2,
            "icon-rotate": -90,
            "icon-rotation-alignment": "map",
            "icon-size": {"stops": [[15, 0.5], [19, 1]]},
            "symbol-placement": "line",
            "symbol-spacing": 75
          },
          "paint": {"icon-opacity": 0.5}
        },
        {
          "id": "highway-name-path",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "transportation_name",
          "minzoom": 15.5,
          "filter": ["==", "class", "path"],
          "layout": {
            "symbol-placement": "line",
            "text-field": "{name:latin} {name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-rotation-alignment": "map",
            "text-size": {"base": 1, "stops": [[13, 12], [14, 13]]}
          },
          "paint": {
            "text-color": "hsl(30, 23%, 62%)",
            "text-halo-color": "#f8f4f0",
            "text-halo-width": 0.5
          }
        },
        {
          "id": "highway-name-minor",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "transportation_name",
          "minzoom": 15,
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["in", "class", "minor", "service", "track"]
          ],
          "layout": {
            "symbol-placement": "line",
            "text-field": "{name:latin} {name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-rotation-alignment": "map",
            "text-size": {"base": 1, "stops": [[13, 12], [14, 13]]}
          },
          "paint": {
            "text-color": "#765",
            "text-halo-blur": 0.5,
            "text-halo-width": 1
          }
        },
        {
          "id": "highway-name-major",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "transportation_name",
          "minzoom": 12.2,
          "filter": ["in", "class", "primary", "secondary", "tertiary", "trunk"],
          "layout": {
            "symbol-placement": "line",
            "text-field": "{name:latin} {name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-rotation-alignment": "map",
            "text-size": {"base": 1, "stops": [[13, 12], [14, 13]]}
          },
          "paint": {
            "text-color": "#765",
            "text-halo-blur": 0.5,
            "text-halo-width": 1
          }
        },
        {
          "id": "highway-shield",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "transportation_name",
          "minzoom": 8,
          "filter": [
            "all",
            ["<=", "ref_length", 6],
            ["==", "$type", "LineString"],
            ["!in", "network", "us-interstate", "us-highway", "us-state"]
          ],
          "layout": {
            "icon-image": "road_{ref_length}",
            "icon-rotation-alignment": "viewport",
            "icon-size": 1,
            "symbol-placement": {"base": 1, "stops": [[10, "point"], [11, "line"]]},
            "symbol-spacing": 200,
            "text-field": "{ref}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-rotation-alignment": "viewport",
            "text-size": 10
          },
          "paint": {}
        },
        {
          "id": "highway-shield-us-interstate",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "transportation_name",
          "minzoom": 7,
          "filter": [
            "all",
            ["<=", "ref_length", 6],
            ["==", "$type", "LineString"],
            ["in", "network", "us-interstate"]
          ],
          "layout": {
            "icon-image": "{network}_{ref_length}",
            "icon-rotation-alignment": "viewport",
            "icon-size": 1,
            "symbol-placement": {
              "base": 1,
              "stops": [[7, "point"], [7, "line"], [8, "line"]]
            },
            "symbol-spacing": 200,
            "text-field": "{ref}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-rotation-alignment": "viewport",
            "text-size": 10
          },
          "paint": {"text-color": "rgba(0, 0, 0, 1)"}
        },
        {
          "id": "highway-shield-us-other",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "transportation_name",
          "minzoom": 9,
          "filter": [
            "all",
            ["<=", "ref_length", 6],
            ["==", "$type", "LineString"],
            ["in", "network", "us-highway", "us-state"]
          ],
          "layout": {
            "icon-image": "{network}_{ref_length}",
            "icon-rotation-alignment": "viewport",
            "icon-size": 1,
            "symbol-placement": {"base": 1, "stops": [[10, "point"], [11, "line"]]},
            "symbol-spacing": 200,
            "text-field": "{ref}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-rotation-alignment": "viewport",
            "text-size": 10
          },
          "paint": {"text-color": "rgba(0, 0, 0, 1)"}
        },
        {
          "id": "airport-label-major",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "aerodrome_label",
          "minzoom": 10,
          "filter": ["all", ["has", "iata"]],
          "layout": {
            "icon-image": "airport_11",
            "icon-size": 1,
            "text-anchor": "top",
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-max-width": 9,
            "text-offset": [0, 0.6],
            "text-optional": true,
            "text-padding": 2,
            "text-size": 12,
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#666",
            "text-halo-blur": 0.5,
            "text-halo-color": "#ffffff",
            "text-halo-width": 1
          }
        },
        {
          "id": "place-other",
          "type": "symbol",
          "metadata": {"mapbox:group": "1444849242106.713"},
          "source": "openmaptiles",
          "source-layer": "place",
          "filter": [
            "!in",
            "class",
            "city",
            "town",
            "village",
            "state",
            "country",
            "continent"
          ],
          "layout": {
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Bold"],
            "text-letter-spacing": 0.1,
            "text-max-width": 9,
            "text-size": {"base": 1.2, "stops": [[12, 10], [15, 14]]},
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#633",
            "text-halo-color": "rgba(255,255,255,0.8)",
            "text-halo-width": 1.2
          }
        },
        {
          "id": "place-village",
          "type": "symbol",
          "metadata": {"mapbox:group": "1444849242106.713"},
          "source": "openmaptiles",
          "source-layer": "place",
          "filter": ["==", "class", "village"],
          "layout": {
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-max-width": 8,
            "text-size": {"base": 1.2, "stops": [[10, 12], [15, 22]]},
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#333",
            "text-halo-color": "rgba(255,255,255,0.8)",
            "text-halo-width": 1.2
          }
        },
        {
          "id": "place-town",
          "type": "symbol",
          "metadata": {"mapbox:group": "1444849242106.713"},
          "source": "openmaptiles",
          "source-layer": "place",
          "filter": ["==", "class", "town"],
          "layout": {
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-max-width": 8,
            "text-size": {"base": 1.2, "stops": [[10, 14], [15, 24]]},
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#333",
            "text-halo-color": "rgba(255,255,255,0.8)",
            "text-halo-width": 1.2
          }
        },
        {
          "id": "place-city",
          "type": "symbol",
          "metadata": {"mapbox:group": "1444849242106.713"},
          "source": "openmaptiles",
          "source-layer": "place",
          "filter": ["all", ["!=", "capital", 2], ["==", "class", "city"]],
          "layout": {
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-max-width": 8,
            "text-size": {"base": 1.2, "stops": [[7, 14], [11, 24]]},
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#333",
            "text-halo-color": "rgba(255,255,255,0.8)",
            "text-halo-width": 1.2
          }
        },
        {
          "id": "place-city-capital",
          "type": "symbol",
          "metadata": {"mapbox:group": "1444849242106.713"},
          "source": "openmaptiles",
          "source-layer": "place",
          "filter": ["all", ["==", "capital", 2], ["==", "class", "city"]],
          "layout": {
            "icon-image": "star_11",
            "icon-size": 0.8,
            "text-anchor": "left",
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["KlokanTech Noto Sans Regular"],
            "text-max-width": 8,
            "text-offset": [0.4, 0],
            "text-size": {"base": 1.2, "stops": [[7, 14], [11, 24]]},
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#333",
            "text-halo-color": "rgba(255,255,255,0.8)",
            "text-halo-width": 1.2
          }
        },
        {
          "id": "place-state",
          "type": "symbol",
          "metadata": {"mapbox:group": "1444849242106.713"},
          "source": "openmaptiles",
          "source-layer": "place",
          "filter": [
            "in",
            "class",
            "state"
          ],
          "layout": {
            "text-field": "{name:latin}",
            "text-font": ["KlokanTech Noto Sans Bold"],
            "text-letter-spacing": 0.1,
            "text-max-width": 9,
            "text-size": {"base": 1.2, "stops": [[12, 10], [15, 14]]},
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#633",
            "text-halo-color": "rgba(255,255,255,0.8)",
            "text-halo-width": 1.2
          }
        },
        {
          "id": "place-country-other",
          "type": "symbol",
          "metadata": {"mapbox:group": "1444849242106.713"},
          "source": "openmaptiles",
          "source-layer": "place",
          "filter": [
            "all",
            ["==", "class", "country"],
            [">=", "rank", 3],
            ["!has", "iso_a2"]
          ],
          "layout": {
            "text-field": "{name:latin}",
            "text-font": ["KlokanTech Noto Sans Italic"],
            "text-max-width": 6.25,
            "text-size": {"stops": [[3, 11], [7, 17]]},
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#334",
            "text-halo-blur": 1,
            "text-halo-color": "rgba(255,255,255,0.8)",
            "text-halo-width": 2
          }
        },
        {
          "id": "place-country-3",
          "type": "symbol",
          "metadata": {"mapbox:group": "1444849242106.713"},
          "source": "openmaptiles",
          "source-layer": "place",
          "filter": [
            "all",
            ["==", "class", "country"],
            [">=", "rank", 3],
            ["has", "iso_a2"]
          ],
          "layout": {
            "text-field": "{name:latin}",
            "text-font": ["KlokanTech Noto Sans Bold"],
            "text-max-width": 6.25,
            "text-size": {"stops": [[3, 11], [7, 17]]},
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#334",
            "text-halo-blur": 1,
            "text-halo-color": "rgba(255,255,255,0.8)",
            "text-halo-width": 2
          }
        },
        {
          "id": "place-country-2",
          "type": "symbol",
          "metadata": {"mapbox:group": "1444849242106.713"},
          "source": "openmaptiles",
          "source-layer": "place",
          "filter": [
            "all",
            ["==", "class", "country"],
            ["==", "rank", 2],
            ["has", "iso_a2"]
          ],
          "layout": {
            "text-field": "{name:latin}",
            "text-font": ["KlokanTech Noto Sans Bold"],
            "text-max-width": 6.25,
            "text-size": {"stops": [[2, 11], [5, 17]]},
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#334",
            "text-halo-blur": 1,
            "text-halo-color": "rgba(255,255,255,0.8)",
            "text-halo-width": 2
          }
        },
        {
          "id": "place-country-1",
          "type": "symbol",
          "metadata": {"mapbox:group": "1444849242106.713"},
          "source": "openmaptiles",
          "source-layer": "place",
          "filter": [
            "all",
            ["==", "class", "country"],
            ["==", "rank", 1],
            ["has", "iso_a2"]
          ],
          "layout": {
            "text-field": "{name:latin}",
            "text-font": ["KlokanTech Noto Sans Bold"],
            "text-max-width": 6.25,
            "text-size": {"stops": [[1, 11], [4, 17]]},
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#334",
            "text-halo-blur": 1,
            "text-halo-color": "rgba(255,255,255,0.8)",
            "text-halo-width": 2
          }
        },
        {
          "id": "place-continent",
          "type": "symbol",
          "metadata": {"mapbox:group": "1444849242106.713"},
          "source": "openmaptiles",
          "source-layer": "place",
          "maxzoom": 1,
          "filter": ["==", "class", "continent"],
          "layout": {
            "text-field": "{name:latin}",
            "text-font": ["KlokanTech Noto Sans Bold"],
            "text-max-width": 6.25,
            "text-size": 14,
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "text-color": "#334",
            "text-halo-blur": 1,
            "text-halo-color": "rgba(255,255,255,0.8)",
            "text-halo-width": 2
          }
        }
      ],
      "id": "bright"
    },
    // style: {
    //   version: 8,
    //   sources: {
    //     "mende-tiles": {
    //       type: "raster",
    //       tiles: [tilesUrl],
    //       tileSize: 256,
    //       attribution: "Map tiles Mende",
    //     },
    //   },
    //   layers: [
    //     {
    //       id: "m-tiles",
    //       type: "raster",
    //       source: "mende-tiles",
    //       minzoom: 2,
    //       maxzoom: 19,
    //     },
    //   ],
    // },
    center,
    zoom,
  });

  map.on("load", () => {
    //this is hack to solve incorrect map scale on init
    map.resize();
  });
  
  return map;
};

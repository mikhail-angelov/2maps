import { setUrlParams } from "../urlParams.js";

mapboxgl.accessToken = window.mapBoxKey;

const RASTER_LAYER = {
  id: "m-tiles",
  type: "raster",
  source: "raster-tiles",
  minzoom: 2,
  maxzoom: 19,
};
const RASTER_SOURCE_ID = "raster-tiles";
const RasterSource = (mapName) => ({
  type: "raster",
  tiles: [`/tiles/${mapName}/{z}/{x}/{y}.jpg`],
  tileSize: 256,
  attribution: "Map tiles",
});

const debounce = function (func, delay) {
  let timer;
  return function () {
    //anonymous function
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};

export const createSecondMap = (center, zoom, mapName) => {
  let hasWiki = false;
  let hasTerrain = false;
  let hasYandex = true;
  let opacity = 1;
  const map = new mapboxgl.Map({
    container: "map",

    style: {
      version: 8,
      sources: {
        [RASTER_SOURCE_ID]: RasterSource(mapName),
      },
      layers: [RASTER_LAYER],
      glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    },
    center,
    zoom,
  });
  const onLocationUpdate = debounce(() => {
    const { lat, lng } = map.getCenter();
    const zoom = map.getZoom();
    setUrlParams({ center: `${lng},${lat}`, zoom });
  }, 1000);

  map.on("load", () => {
    //this is hack to solve incorrect map scale on init
    map.resize();
  });
  map.on("zoom", onLocationUpdate);
  map.on("moveend", onLocationUpdate);

  map.getMap = () => mapName;
  map.setMap = (newMap) => {
    mapName = newMap;
    map.removeLayer(RASTER_LAYER.id);
    map.removeSource(RASTER_SOURCE_ID);
    map.addSource(RASTER_SOURCE_ID, RasterSource(newMap));
    map.addLayer(RASTER_LAYER);
  };

  map.setOpacity = (newOpacity) => {
    opacity = newOpacity;
    if (!hasYandex) {
      map.setPaintProperty(
        "mapbox-satellite-streets",
        "raster-opacity",
        opacity
      );
    }
  };

  map.getYandex = () => hasYandex;
  map.setYandex = (isYandex) => {
    hasYandex = isYandex;
    console.log("setYandex", isYandex);
    if (isYandex) {
      document.getElementById("ymap").style.visibility = "visible";
      map.removeLayer("mapbox-satellite-streets");
      map.removeSource("mapbox");
    } else {
      document.getElementById("ymap").style.visibility = "hidden";
      map.addSource("mapbox", {
        type: "raster",
        tiles: [
          `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/{z}/{x}/{y}?access_token=${window.mapBoxKey}`,
        ],
      });
      map.addLayer({
        id: "mapbox-satellite-streets",
        source: "mapbox",
        type: "raster",
        layout: { visibility: "visible" },
      });
      map.setPaintProperty(
        "mapbox-satellite-streets",
        "raster-opacity",
        opacity
      );
    }
  };
  map.getWiki = () => hasWiki;
  map.setWiki = (isEnable) => {
    hasWiki = isEnable;
    console.log("load wiki", isEnable);
    if (isEnable) {
      map.addSource("wiki", {
        type: "vector",
        tiles: [`${location.origin}/wikimapia/{z}/{x}/{y}.mvt`],
        minzoom: 11,
        maxzoom: 14,
      });

      map.addLayer({
        id: "wiki2",
        type: "line",
        source: "wiki",
        "source-layer": "wikiLayer",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#ff0000",
          "line-width": 1.5,
        },
      });
      map.addLayer({
        id: "wiki3",
        type: "fill",
        source: "wiki",
        "source-layer": "wikiLayer",
        paint: {
          "fill-color": "rgba(200, 100, 240, 0.2)",
          "fill-outline-color": "rgba(200, 100, 240, 1)",
        },
      });

      map.addLayer({
        id: "wiki-label",
        type: "symbol",
        source: "wiki",
        "source-layer": "wikiLayer",
        paint: {
          "text-color": "red",
        },
        layout: {
          "text-field": ["format", ["get", "name"], { "font-scale": 1.0 }],
        },
      });
      map.on("click", "wiki3", (e) => {
        console.log("---", e.features[0].properties);
        window.open(
          `https://wikimapia.org/${e.features[0].properties.id}`,
          "wiki",
          "popup,right=10,top=10,width=440,height=640"
        );
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(e.features[0].properties.name)
          .addTo(map);
      });

      // Change the cursor to a pointer when
      // the mouse is over the states layer.
      map.on("mouseenter", "wiki3", () => {
        console.log("---enter");
        map.getCanvas().style.cursor = "pointer";
      });

      // Change the cursor back to a pointer
      // when it leaves the states layer.
      map.on("mouseleave", "wiki3", () => {
        map.getCanvas().style.cursor = "";
      });
    } else {
      map.removeLayer("wiki-label");
      map.removeLayer("wiki2");
      map.removeLayer("wiki3");
      map.removeSource("wiki");
    }
  };
  map.getTerrain = () => hasTerrain;
  map.setTerrain = (isEnable) => {
    hasTerrain = isEnable;
    console.log("load terain", isEnable);
    if (isEnable) {
      map.addSource("mapbox-terrain", {
        type: "vector",
        // Use any Mapbox-hosted tileset using its tileset id.
        // Learn more about where to find a tileset id:
        // https://docs.mapbox.com/help/glossary/tileset-id/
        url: "mapbox://mapbox.mapbox-terrain-v2",
        index: 2,
      });
      map.addLayer({
        id: "terrain-data",
        type: "line",
        source: "mapbox-terrain",
        "source-layer": "contour",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#0000ff",
          "line-width": 1,
        },
      });
    } else {
      map.removeLayer("terrain-data");
      map.removeSource("mapbox-terrain");
    }
  };

  return map;
};

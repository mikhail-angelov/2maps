import { MAPS } from "../flux/mapsStore.js";
import { setUrlParams } from "../urlParams.js";
import { debounce } from "../utils.js";
import { render } from "../libs/htm.js";
import { EditMarker, ViewMarker } from "./marks.js";

mapboxgl.accessToken = window.mapBoxKey;

const PRIMARY_SOURCE_ID = "primary-tiles";
const SECONDARY_SOURCE_ID = "secondary-tiles";
const MARKERS_SOURCE_ID = "markers";
const RASTER_LAYER = {
  type: "raster",
  source: "raster-tiles",
  minzoom: 2,
  maxzoom: 19,
};
const RASTER_SOURCE = {
  type: "raster",
  tileSize: 256,
  attribution: "Map tiles",
};

export const createSecondMap = ({
  center,
  zoom,
  trackStore,
  markerStore,
  mapsStore,
  uiStore,
}) => {
  let drawData = {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  };

  const map = new mapboxgl.Map({
    container: "map",

    style: {
      version: 8,
      sources: {},
      layers: [],
      glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    },
    center,
    zoom,
  });

  const reloadMaps = () => {
    const layers = map.getStyle().layers;
    layers.forEach((layer) => {
      map.removeLayer(layer.id);
    });
    const sources = map.getStyle().sources;
    Object.keys(sources).forEach((sourceId) => {
      map.removeSource(sourceId);
    });
    map.addSource(PRIMARY_SOURCE_ID, {
      ...RASTER_SOURCE,
      tiles: [mapsStore.primary.url],
    });
    map.addLayer({
      ...RASTER_LAYER,
      source: PRIMARY_SOURCE_ID,
      id: PRIMARY_SOURCE_ID,
    });
    if (mapsStore.secondary) {
      map.addSource(SECONDARY_SOURCE_ID, {
        ...RASTER_SOURCE,
        tiles: [mapsStore.secondary.url],
      });
      map.addLayer({
        ...RASTER_LAYER,
        source: SECONDARY_SOURCE_ID,
        id: SECONDARY_SOURCE_ID,
      });
    }
    map.addSource(MARKERS_SOURCE_ID, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: markerStore.getFeatures(),
      },
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    });
    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: MARKERS_SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#11b4da",
        "circle-radius": 5,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    });
    map.addLayer({
      id: "clusters",
      type: "circle",
      source: MARKERS_SOURCE_ID,
      filter: ["has", "point_count"],
      paint: {
        // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
        // with three steps to implement three types of circles:
        //   * Blue, 20px circles when point count is less than 100
        //   * Yellow, 30px circles when point count is between 100 and 750
        //   * Pink, 40px circles when point count is greater than or equal to 750
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#51bbd6",
          5,
          "#f1f075",
          10,
          "#f28cb1",
        ],
        "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
      },
    });
    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: MARKERS_SOURCE_ID,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
    });
    map.addLayer({
      id: MARKERS_SOURCE_ID + "-label",
      source: MARKERS_SOURCE_ID,
      type: "symbol",
      layout: {
        "icon-image": "custom-marker",
        "text-field": ["get", "title"],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        // 'text-color': 'white',
        "text-offset": [0, 1.25],
        "text-anchor": "top",
      },
    });
   
    setOpacity();
  };
  const setOpacity = () => {
    if (map.getLayer(SECONDARY_SOURCE_ID)) {
      map.setPaintProperty(
        SECONDARY_SOURCE_ID,
        "raster-opacity",
        1 - uiStore.opacity / 100
      );
    }
  };
  markerStore.on("STORE_REFRESH", () => {
    map.getSource(MARKERS_SOURCE_ID).setData({
      type: "FeatureCollection",
      features: markerStore.getFeatures(),
    });
  });
  mapsStore.on(MAPS.SET_PRIMARY, reloadMaps);
  mapsStore.on(MAPS.SET_SECONDARY, reloadMaps);
  mapsStore.on(MAPS.SET_WIKIMAPIA, (hasWiki) => {
    if (hasWiki) {
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
  });
  mapsStore.on(MAPS.SET_TERRAIN, (hasTerrain) => {
    if (hasTerrain) {
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
  });

  uiStore.on("STORE_REFRESH", setOpacity);

  const onLocationUpdate = debounce(() => {
    const { lat, lng } = map.getCenter();
    const zoom = map.getZoom();
    setUrlParams({ center: `${lng},${lat}`, zoom });
  }, 1000);

  map.on("load", () => {
    //this is hack to solve incorrect map scale on init
    map.resize();
    reloadMaps();
    setOpacity();
    map.on("zoom", onLocationUpdate);
    map.on("moveend", onLocationUpdate);
    map.on("click", "clusters", (e) => {
      console.log("clusters", e);
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      const clusterId = features[0].properties.cluster_id;
      map
        .getSource(MARKERS_SOURCE_ID)
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        });
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on("click", "unclustered-point", (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const { title, description = "", rate } = e.features[0].properties;
      console.log("click", title);
      const view = ViewMarker({
        marker: { name: title, description, rate },
        onCancel: () => {
          popup?.remove();
        },
      });

      const popup = new mapboxgl.Popup({ closeButton: false, maxWidth: 400 })
        .setLngLat(coordinates)
        .setHTML(`<div></div>`)
        .addTo(map);
      render(view, popup.getElement().childNodes[1]);
    });

    map.on("contextmenu", (e) => {
      e.preventDefault();
      console.log("right", e);
      const menu = EditMarker({
        onSave: (data) => {
          markerStore.add({
            ...data,
            point: { lat: e.lngLat.lat, lng: e.lngLat.lng },
          });
          popup?.remove();
        },
        onCancel: () => {
          console.log("cancel");
          popup?.remove();
        },
      });

      const popup = new mapboxgl.Popup({ closeButton: false, maxWidth: 400 })
        .setLngLat(e.lngLat)
        .setHTML('<div id="mapMenu"></div>')
        .addTo(map);
      render(menu, popup.getElement().childNodes[1]);
    });

    map.on("mouseenter", "clusters", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", () => {
      map.getCanvas().style.cursor = "";
    });
  });

  const getDrawSource = () => {
    const source = map.getSource("draw");
    if (source) {
      return source;
    }
    map.addSource("draw", {
      type: "geojson",
      data: drawData,
    });
    map.addLayer({
      id: "draw",
      type: "line",
      source: "draw",
      layout: {},
      paint: {
        "line-color": "red",
        "line-width": 3,
      },
    });
    return map.getSource("draw");
  };
  map.draw = (geoJson) => {
    getDrawSource().setData(geoJson);
  };
  map.closeDraw = () => {
    map.removeLayer("draw");
    map.removeSource("draw");
  };

  map.saveDraw = (geoJson) => {
    const d = new Date();
    trackStore.add({
      id: `${Date.now()}`,
      name: `draw-${d.getFullYear()}-${
        d.getMonth() + 1
      }-${d.getDate()}_${d.getHours()}:${d.getMinutes()}`,
      geoJson,
      timestamp: Date.now(),
    });
  };

  return map;
};

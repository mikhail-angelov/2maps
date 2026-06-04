import { MAPS } from "../flux/mapsStore.js";
import { setUrlParams } from "../urlParams.js";
import { debounce } from "../utils.js";
import { render } from "../libs/htm.js";
import { EditMarker, ViewMarker } from "./marks.js";
import { UI_EVENTS } from "../flux/uiStore.js";
import { removeVectorTileLayer, vectorMapStyle } from "./vectorMapStyles.js";
import { removeRasterTileLayer, rasterMapStyle } from "./rasterMapStyles.js";


const PRIMARY_SOURCE_ID = "primary-tiles";
const SECONDARY_SOURCE_ID = "secondary-tiles";
const MARKERS_SOURCE_ID = "markers";
const MARKERS_LABELS_SOURCE_ID = "markers-labels";
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

export const createMap = ({ center, zoom, trackStore, markerStore, mapsStore, uiStore }) => {
  const drawData = {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  };

  const style = mapsStore.primary.type === "vector" ? vectorMapStyle : rasterMapStyle;
  const sourceId = mapsStore.primary.type === "vector" ? "composite" : "mapbox-satellite";
  style.sources[sourceId].tiles = [mapsStore.primary.url];

  const map = new maplibregl.Map({
    container: "map", // container ID
    center,
    zoom,
    projection: "globe",
    style,
  });
  map.addControl(
    new maplibregl.ScaleControl({
      maxWidth: 120,
      unit: "metric",
    }),
    "bottom-right",
  );

  const nominatimGeocoder = {
    forwardGeocode: async (config) => {
      const features = [];
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(config.query)}&format=geojson&polygon_geojson=1&addressdetails=1`;
        const response = await fetch(url);
        const geojson = await response.json();
        for (const feature of geojson.features) {
          const center = [
            feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
            feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
          ];
          features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: center },
            place_name: feature.properties.display_name,
            properties: feature.properties,
            text: feature.properties.display_name,
            place_type: ["place"],
            center,
          });
        }
      } catch (e) {
        console.error("Nominatim geocode error", e);
      }
      return { features };
    },
  };
  try {
    map.addControl(
      new window.MaplibreGeocoder(nominatimGeocoder, {
        maplibregl,
        marker: false,
        collapsed: true,
        clearAndBlurOnEsc: true,
        clearOnBlur: true,
        flyTo: { duration: 0 },
      }),
      "top-right",
    );
  } catch (e) {
    console.warn("Geocoder failed to load", e);
  }

  const setOpacity = () => {
    if (map.getLayer(SECONDARY_SOURCE_ID)) {
      map.setPaintProperty(SECONDARY_SOURCE_ID, "raster-opacity", 1 - uiStore.opacity / 100);
    }
  };
  markerStore.onRefresh(() => {
    const data = { type: "FeatureCollection", features: markerStore.getFeatures() };
    map.getSource(MARKERS_SOURCE_ID)?.setData(data);
    map.getSource(MARKERS_LABELS_SOURCE_ID)?.setData(data);
  });
  const addSecondaryLayer = (beforeId) => {
    if (map.getLayer(SECONDARY_SOURCE_ID)) map.removeLayer(SECONDARY_SOURCE_ID);
    if (map.getSource(SECONDARY_SOURCE_ID)) map.removeSource(SECONDARY_SOURCE_ID);
    const sec = mapsStore.secondary;
    if (!sec?.url) return;
    if (sec.type === "vector") {
      map.addSource(SECONDARY_SOURCE_ID, { type: "vector", tiles: [sec.url], minzoom: 0, maxzoom: 22 });
    } else {
      map.addSource(SECONDARY_SOURCE_ID, { ...RASTER_SOURCE, tiles: [sec.url] });
      const insertBefore = beforeId ?? (map.getLayer(MARKERS_SOURCE_ID) ? MARKERS_SOURCE_ID : undefined);
      map.addLayer({ ...RASTER_LAYER, source: SECONDARY_SOURCE_ID, id: SECONDARY_SOURCE_ID }, insertBefore);
    }
  };

  const initMarkersAndSecondary = () => {
    if (map.getSource(MARKERS_SOURCE_ID)) return;
    const data = { type: "FeatureCollection", features: markerStore.getFeatures() };
    const clusterOpts = { cluster: true, clusterMaxZoom: 14, clusterRadius: 50 };

    // Circle-only source: no symbol layers here so glyph errors never block circle rendering
    map.addSource(MARKERS_SOURCE_ID, { type: "geojson", data, ...clusterOpts });
    map.addLayer({
      id: MARKERS_SOURCE_ID,
      type: "circle",
      source: MARKERS_SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#4264fb",
        "circle-radius": 7,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });
    map.addLayer({
      id: "clusters",
      type: "circle",
      source: MARKERS_SOURCE_ID,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": ["step", ["get", "point_count"], "#51bbd6", 5, "#f1f075", 10, "#f28cb1"],
        "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
      },
    });

    // Separate labels source: symbol layers here are isolated from the circle source
    map.addSource(MARKERS_LABELS_SOURCE_ID, { type: "geojson", data, ...clusterOpts });
    map.addLayer({
      id: `${MARKERS_SOURCE_ID}-label`,
      source: MARKERS_LABELS_SOURCE_ID,
      type: "symbol",
      filter: ["!", ["has", "point_count"]],
      layout: {
        "text-field": ["get", "title"],
        "text-font": ["Noto Sans Bold"],
        "text-offset": [0, 1.2],
        "text-anchor": "top",
      },
      paint: { "text-color": "#2244cc", "text-halo-color": "#ffffff", "text-halo-width": 1 },
    });
    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: MARKERS_LABELS_SOURCE_ID,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["Noto Sans Bold"],
        "text-size": 12,
      },
    });

    addSecondaryLayer(MARKERS_SOURCE_ID);
    setOpacity();
  };

  mapsStore.on(MAPS.SET_PRIMARY, () => {
    let style = rasterMapStyle;
    let sourceId = "mapbox-satellite";
    if (mapsStore.primary.type === "vector") {
      style = vectorMapStyle;
      sourceId = "composite";
    }
    style.sources[sourceId].tiles = [mapsStore.primary.url];
    map.setStyle(style);
    map.once("style.load", initMarkersAndSecondary);
  });
  mapsStore.on(MAPS.SET_SECONDARY, () => {
    if (!map.isStyleLoaded()) return;
    addSecondaryLayer();
    setOpacity();
  });
  mapsStore.on(MAPS.SET_WIKIMAPIA, (hasWiki) => {
    if (hasWiki) {
      map.addSource("wiki", {
        type: "vector",
        tiles: [`${window.location.origin}/wikimapia/{z}/{x}/{y}.mvt`],
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
          "popup,right=10,top=10,width=440,height=640",
        );
        new maplibregl.Popup()
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
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
        encoding: "terrarium",
        tileSize: 256,
        maxzoom: 14,
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 2.5 });
    } else {
      map.removeSource("mapbox-dem");
    }
  });

  uiStore.on(UI_EVENTS.LEFT_WIDTH, () => {
    map.resize();
  });

  uiStore.on(UI_EVENTS.OPACITY, () => {
    setOpacity();
  });

  const onLocationUpdate = debounce(() => {
    const { lat, lng } = map.getCenter();
    const z = map.getZoom();
    setUrlParams({ center: `${lng},${lat}`, zoom: z });
  }, 1000);

  map.on("load", () => {
    const viewPopup = new maplibregl.Popup({
      closeButton: false,
      maxWidth: 400,
    });
    const editPopup = new maplibregl.Popup({
      closeButton: false,
      maxWidth: 440,
    });

    initMarkersAndSecondary();
    map.on("zoom", onLocationUpdate);
    map.on("moveend", onLocationUpdate);

    map.on("click", "clusters", (e) => {
      console.log("clusters", e);
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      const clusterId = features[0].properties.cluster_id;
      map.getSource(MARKERS_SOURCE_ID).getClusterExpansionZoom(clusterId, (err, z) => {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: z,
        });
      });
    });

    map.on("click", MARKERS_SOURCE_ID, (e) => {
      const coordinates = e.features[0].geometry.coordinates;
      const { id, title, description = "", rate } = e.features[0].properties;
      console.log("click", title, coordinates);
      map.flyTo({
        center: coordinates,
      });
      const editForm = EditMarker({
        marker: {
          id,
          name: title,
          description,
          rate,
          lat: coordinates[1],
          lng: coordinates[0],
        },
        onSave: (data) => {
          markerStore.update({
            ...data,
            lat: coordinates[1],
            lng: coordinates[0],
          });
          editPopup?.remove();
        },
        onCancel: () => {
          console.log("cancel");
          editPopup?.remove();
        },
        pureHtml: true,
      });
      editPopup.setLngLat(coordinates).setHTML("<div></div>").addTo(map);
      render(editForm, editPopup.getElement().childNodes[1]);
    });
    map.on("mouseenter", MARKERS_SOURCE_ID, (e) => {
      const coordinates = e.features[0].geometry.coordinates;
      const { title, description = "", rate } = e.features[0].properties;
      console.log("mouseenter", title);
      const view = ViewMarker({
        marker: { name: title, description, rate, coordinates },
        onCancel: () => {
          viewPopup?.remove();
        },
      });

      viewPopup.setLngLat(coordinates).setHTML("<div></div>").addTo(map);
      render(view, viewPopup.getElement().childNodes[1]);
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", MARKERS_SOURCE_ID, () => {
      map.getCanvas().style.cursor = "";
      viewPopup.remove();
    });

    map.on("contextmenu", (e) => {
      e.preventDefault();
      const editForm = EditMarker({
        onSave: (data) => {
          markerStore.add({
            ...data,
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
          });
          editPopup?.remove();
        },
        onCancel: () => {
          console.log("cancel");
          editPopup?.remove();
        },
        pureHtml: true,
        marker: {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        },
      });

      editPopup.setLngLat(e.lngLat).setHTML('<div id="mapMenu"></div>').addTo(map);
      render(editForm, editPopup.getElement().childNodes[1]);
    });

    map.on("mouseenter", "clusters", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", () => {
      map.getCanvas().style.cursor = "";
    });

    const canvas = map.getCanvas();

    canvas.addEventListener(
      "wheel",
      (e) => {
        // Check if Shift key is pressed
        if (e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();

          // Calculate opacity change based on wheel delta
          // Invert the delta so scrolling up increases opacity
          const delta = -e.deltaY;

          // Adjust sensitivity - smaller values for trackpad, larger for mouse wheel
          const sensitivity = e.deltaMode === 0 ? 0.5 : 2; // 0 = pixels, 1 = lines, 2 = pages

          // Calculate new opacity
          let newOpacity = uiStore.opacity + delta * sensitivity;

          // Clamp between 0 and 100
          newOpacity = Math.max(0, Math.min(100, newOpacity));

          // Update opacity if it changed
          if (Math.abs(newOpacity - uiStore.opacity) >= 1) {
            uiStore.setOpacity(Math.round(newOpacity));
          }
        }
      },
      { passive: false },
    );

    // this is hack to solve incorrect map scale on init
    map.resize();
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

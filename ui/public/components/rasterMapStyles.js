export const removeRasterTileLayer = (map) => {
  for (const layer of rasterMapStyle.layers) {
    if (map.getLayer(layer.id)) map.removeLayer(layer.id);
  }
};

export const rasterMapStyle = {
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  center: [55.13, 25.12],
  zoom: 12,
  version: 8,
  layers: [
    {
      id: "background",
      type: "background",
      layout: {},
      minzoom: 0,
      paint: { "background-color": "hsl(222, 56%, 4%)", "background-opacity": 0.9 },
    },
    {
      id: "satellite",
      type: "raster",
      source: "mapbox-satellite",
      layout: {},
      minzoom: 0,
      paint: {},
    },
  ],
  sources: {
    "mapbox-satellite": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "Map tiles",
    },
  },
};

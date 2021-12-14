mapboxgl.accessToken = window.mapBoxKey;

const RASTER_LAYER = {
  id: "m-tiles",
  type: "raster",
  source: "raster-tiles",
  minzoom: 2,
  maxzoom: 19,
}
const RASTER_SOURCE_ID = "raster-tiles";
const RasterSource = (mapName) => ({
  type: "raster",
  tiles: [`/tiles/${mapName}/{z}/{x}/{y}.jpg`],
  tileSize: 256,
  attribution: "Map tiles",
})

export const createSecondMap = (center, zoom, mapName) => {
  const map = new mapboxgl.Map({
    container: "map",

    style: {
      version: 8,
      sources: {
        [RASTER_SOURCE_ID]: RasterSource(mapName),
      },
      layers: [RASTER_LAYER],
    },
    center,
    zoom,
  });

  map.on("load", () => {
    //this is hack to solve incorrect map scale on init
    map.resize();
  });

  map.setMap = (newMap) => {
    map.removeLayer(RASTER_LAYER.id);
    map.removeSource(RASTER_SOURCE_ID);
    map.addSource(RASTER_SOURCE_ID, RasterSource(newMap))
    map.addLayer(RASTER_LAYER);
  }

  return map;
};

import { setUrlParams } from '../urlParams.js'

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

const debounce = function (func, delay) {
  let timer;
  return function () {     //anonymous function
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args)
    }, delay);
  }
}


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
  const onLocationUpdate = debounce(() => {
    const { lat, lng } = map.getCenter()
    const zoom = map.getZoom()
    setUrlParams({ center: `${lng},${lat}`, zoom })
  }, 1000)

  map.on("load", () => {
    //this is hack to solve incorrect map scale on init
    map.resize();
  });
  map.on("zoom", onLocationUpdate);
  map.on("moveend", onLocationUpdate);

  map.setMap = (newMap) => {
    map.removeLayer(RASTER_LAYER.id);
    map.removeSource(RASTER_SOURCE_ID);
    map.addSource(RASTER_SOURCE_ID, RasterSource(newMap))
    map.addLayer(RASTER_LAYER);
  }

  return map;
};

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
      glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
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

    map.addSource('wiki', {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': []
      }
    })
    map.addLayer({
      'id': 'wiki-boundary',
      'type': 'line',
      'source': 'wiki',
      'paint': {
        'line-width': 1.5,
        'line-color': 'red',
        'line-opacity': 0.4,
      },
      'filter': ['==', '$type', 'Polygon']
    });
    map.addLayer({
      'id': 'wiki-label',
      'type': 'symbol',
      'source': 'wiki',
      'paint': {
        'text-color': 'red'
      },
      'layout': {
        'text-field': [
          'format',
          ['get', 'title'],
          { 'font-scale': 0.9 }
        ],
      },
      'filter': ['==', '$type', 'Polygon']
    });

    //ter
    // map.addSource('mapbox-terrain', {
    //   type: 'vector',
    //   // Use any Mapbox-hosted tileset using its tileset id.
    //   // Learn more about where to find a tileset id:
    //   // https://docs.mapbox.com/help/glossary/tileset-id/
    //   url: 'mapbox://mapbox.mapbox-terrain-v2'
    // });
    // map.addLayer({
    //   'id': 'terrain-data',
    //   'type': 'line',
    //   'source': 'mapbox-terrain',
    //   'source-layer': 'contour',
    //   'layout': {
    //     'line-join': 'round',
    //     'line-cap': 'round'
    //   },
    //   'paint': {
    //     'line-color': '#0000ff',
    //     'line-width': 1
    //   }
    // });
  });
  map.on("zoom", onLocationUpdate);
  map.on("moveend", onLocationUpdate);

  map.setMap = (newMap) => {
    map.removeLayer(RASTER_LAYER.id);
    map.removeSource(RASTER_SOURCE_ID);
    map.addSource(RASTER_SOURCE_ID, RasterSource(newMap))
    map.addLayer(RASTER_LAYER);
  }

  map.refreshWiki = (features) => {
    console.log('load features', features)
    map.getSource('wiki').setData({
      'type': 'FeatureCollection',
      features
    })
  }

  return map;
};

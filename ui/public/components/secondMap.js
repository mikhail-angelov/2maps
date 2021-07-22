mapboxgl.accessToken = window.mapBoxKey;
const tilesUrl = window.mapnnUrl;

export const getSecondMap = (center, zoom) => {
  const map = new mapboxgl.Map({
    container: "map",
    style: {
      version: 8,
      sources: {
        "mende-tiles": {
          type: "raster",
          tiles: [tilesUrl],
          tileSize: 256,
          attribution: "Map tiles Mende",
        },
      },
      layers: [
        {
          id: "m-tiles",
          type: "raster",
          source: "mende-tiles",
          minzoom: 2,
          maxzoom: 19,
        },
      ],
    },
    center,
    zoom,
  });

  map.on("load", () => {
    //this is hack to solve incorrect map scale on init
    map.resize();
  });
  
  return map;
};

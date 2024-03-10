import { Store } from './store.js';
import { get } from '../utils.js';
import { getLocal, saveLocal } from '../storage.js';

export const MAPS = {
  SET_PRIMARY: 'SET_PRIMARY',
  SET_SECONDARY: 'SET_SECONDARY',
  SET_WIKIMAPIA: 'SET_WIKIMAPIA',
  SET_TERRAIN: 'SET_TERRAIN',
  REFRESH_MAP_LIST: 'REFRESH_MAP_LIST',
};

export class MapsStore extends Store {
  maps = [
    {
      id: 'mapbox',
      name: 'mapbox',
      url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/{z}/{x}/{y}?access_token=${window.mapBoxKey}`,
      type: 'raster',
    },
    {
      id: 'cyclosm',
      name: 'cyclosm',
      url: 'https://c.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
      type: 'raster',
    },
    {
      id: 'OSM',
      name: 'OSM',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      type: 'raster',
    },
    {
      id: 'MtbMap',
      name: 'MtbMap',
      url: 'http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &amp; USGS',
      type: 'raster',
    },
    {
      id: 'Esri',
      name: 'Esri',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
      type: 'raster',
    },
    {
      id: 'ESRIsatellite',
      name: 'ESRI satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      type: 'raster',
    },
    {
      id: 'google',
      name: 'Google satellite',
      url: 'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      type: 'raster',
    },
    {
      id: 'terrain1',
      name: 'terrain',
      url: `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=${window.mapBoxKey}`,
      type: 'raster',
    },
  ];

  secondaryMaps = [];

  primary = this.maps[0];

  secondary = null;

  hasWiki = false;

  hasTerrain = false;

  loading = false;

  constructor() {
    super();
    const { primary } = getLocal();
    this.primary = this.maps.find(({ id }) => id === primary) || this.maps[0];
    this.loadMaps();
  }

  async loadMaps() {
    try {
      const { secondary } = getLocal();
      const list = await get('/tiles/list');
      if (list?.length > 0) {
        this.secondaryMaps = [
          ...this.secondaryMaps,
          ...list.map(({ name, key }) => ({
            id: key,
            name,
            url: `/tiles/${name}/{z}/{x}/{y}.jpg`,
          })),
        ];
        this.secondary = this.secondaryMaps.find(({ id }) => id === secondary);
        this.emit(MAPS.SET_SECONDARY, this.secondary);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('cannot get maps', e);
    }
    this.emit(MAPS.REFRESH_MAP_LIST);
  }

  selectPrimary(mapId) {
    this.primary = this.maps.find(({ id }) => id === mapId);
    this.emit(MAPS.SET_PRIMARY, this.primary);
    saveLocal({ primary: mapId });
  }

  selectSecondary(mapId) {
    this.secondary = this.secondaryMaps.find(({ id }) => id === mapId);
    this.emit(MAPS.SET_SECONDARY, this.secondary);
    saveLocal({ secondary: mapId });
  }

  setWikimapia(value) {
    this.hasWiki = value;
    this.emit(MAPS.SET_WIKIMAPIA, value);
  }

  setTerrain(value) {
    this.hasTerrain = value;
    this.emit(MAPS.SET_TERRAIN, value);
  }
}

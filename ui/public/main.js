import { parseUrlParams } from './urlParams.js';
import { createOpacitySlider } from './components/opacitySlider.js';
import { createLeftPanel } from './components/leftPanel.js';
import { createMap } from './components/map.js';
import { createMapLayer } from './components/mapLayers.js';
import { createMapRuler } from './components/mapRuler.js';
import { createAuth } from './components/auth.js';
import { AuthStore } from './flux/authStore.js';
import { MarkerStore } from './flux/markerStore.js';
import { TrackStore } from './flux/trackStore.js';
import { MapsStore } from './flux/mapsStore.js';
import { UiStore } from './flux/uiStore.js';

const { zoom, center: position } = parseUrlParams();
const authStore = new AuthStore();
const markerStore = new MarkerStore(authStore);
const trackStore = new TrackStore();
const mapsStore = new MapsStore();
const uiStore = new UiStore();
authStore.subscribeAuth(() => {
  if (authStore.isAuthenticated()) {
    trackStore.loadAll();
  }
});

createAuth(authStore);

const map = createMap({
  center: position,
  zoom,
  trackStore,
  markerStore,
  mapsStore,
  uiStore,
});
createOpacitySlider(uiStore);
createLeftPanel({
  map,
  markerStore,
  trackStore,
  authStore,
  uiStore,
});
// createMapDraw({ map, trackStore });
createMapRuler({ map });
createMapLayer(mapsStore);

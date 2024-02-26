import { parseUrlParams } from "./urlParams.js";
import { createOpacitySlider } from "./components/opacitySlider.js";
import { createLeftPanel } from "./components/leftPanel.js";
import { createSecondMap } from "./components/secondMap.js";
import { createMapLayer } from "./components/mapLayers.js";
import { createMapDraw } from "./components/mapDraw.js";
import { createAuth } from "./components/auth.js";
import { isMobile } from "./utils.js";
import { AuthStore } from "./flux/authStore.js";
import { MarkerStore } from "./flux/markerStore.js";
import { TrackStore } from "./flux/trackStore.js";
import { MapsStore } from "./flux/mapsStore.js";
import { UiStore } from "./flux/uiStore.js";

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

const secondMap = createSecondMap({
  center: position,
  zoom,
  trackStore,
  markerStore,
  mapsStore,
  uiStore,
});
createOpacitySlider(uiStore);
createLeftPanel({
  yandexMap: {},
  secondMap,
  markerStore,
  trackStore,
  authStore,
});
createMapDraw({ map: secondMap, trackStore });
createMapLayer(mapsStore);

if (isMobile()) {
  document.getElementById("slider").setAttribute("class", "map-overlay mobile");
} else {
  document
    .getElementById("slider")
    .setAttribute("class", "map-overlay desktop");
}

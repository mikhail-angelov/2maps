import { MAPS } from "../flux/mapsStore.js";
import { html, render, useState } from "../libs/htm.js";
import { IconButton, Button } from "./common.js";

export const createMapLayer = (mapsStore) => {
  render(
    html`<${MapLayer} mapsStore=${mapsStore} />`,
    document.getElementById("layers")
  );
};

const MapLayer = ({  mapsStore }) => {
  const [collapsed, setCollapsed] = useState(true);
  const onToggle = () => setCollapsed(!collapsed);

  mapsStore.on(MAPS.REFRESH_MAP_LIST, () => {
  })

  if (collapsed) {
    return html`<${Button}
      className="layer-icon"
      icon="assets/layer.svg"
      onClick=${onToggle}
    />`
  }

  return html`<div class="layer-list">
    <div class="layer-list-header">
      Select map
      <${IconButton}
        className="header-button"
        icon="assets/close.svg"
        onClick=${onToggle}
      />
    </div>
    <div style="background: white;">
      <ul class="map-list">
        ${mapsStore.maps.map(({id, name}) => html`<li class="map-item">
            <input
              type="radio"
              id=${id}
              name="primaryMap"
              checked=${mapsStore.primary?.id === id}
              onChange=${() => mapsStore.selectPrimary(id)}
            />
            <label for=${id}>${name}</label>
          </li>`)}
      </ul>   
    </div>
    <div style="background: white;">
    <input
      type="checkbox"
      id="map-wiki"
      name="map-wiki"
      onChange=${() => mapsStore.setWikimapia(!mapsStore.hasWiki)}
      checked=${mapsStore.hasWiki}
    />
    <label for="map-wiki">Wikimapia</label>
    </div>
    <div style="background: white;">
    <input
      type="checkbox"
      id="map-Terrain"
      name="map-Terrain"
      onChange=${() => mapsStore.setTerrain(!mapsStore.hasTerrain)}
      checked=${mapsStore.hasTerrain}
    />
    <label for="map-Terrain">Terrain</label>
    </div>
    <ul class="map-list">
      ${mapsStore.secondaryMaps.map(({ id, name }) => html`<li class="map-item">
          <input
            type="radio"
            id=${id}
            name="secondaryMap"
            checked=${mapsStore.secondary?.id === id}
            onChange=${() => mapsStore.selectSecondary(id)}
          />
          <label for=${id}>${name}</label>
        </li>`)}
    </ul>
  </div>`;
};

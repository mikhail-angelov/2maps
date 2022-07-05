import { html, render, useState } from "../libs/htm.js";
import { IconButton } from "./common.js";

export const createMapLayer = ({ map, mapList }) => {
  render(
    html`<${MapLayer} map=${map} mapList=${mapList} />`,
    document.getElementById("layers")
  );
};

const MapLayer = ({ map, mapList }) => {
  const [collapsed, setCollapsed] = useState(true);
  const selected = map.getMap();
  const hasYandex = map.getYandex();
  const hasWiki = map.getWiki();
  const hasTerrain = map.getTerrain();

  const onToggle = () => setCollapsed(!collapsed);

  return collapsed
    ? html`<${IconButton}
        className="layer-icon"
        icon="assets/layer.svg"
        onClick=${onToggle}
      />`
    : html`<div class="layer-list">
        <div class="layer-list-header">
          Select map
          <${IconButton}
            className="header-button"
            icon="assets/close.svg"
            onClick=${onToggle}
          />
        </div>
        <div style="background: white;">
        <input
          type="checkbox"
          id="map-yandex"
          name="map-yandex"
          onChange=${() => map.setYandex(!map.getYandex())}
          checked=${hasYandex}
        />
        <label for="map-yandex">карта Яндекс</label>
        </div>
        <div style="background: white;">
        <input
          type="checkbox"
          id="map-wiki"
          name="map-wiki"
          onChange=${() => map.setWiki(!map.getWiki())}
          checked=${hasWiki}
        />
        <label for="map-wiki">Wikimapia</label>
        </div>
        <div style="background: white;">
        <input
          type="checkbox"
          id="map-Terrain"
          name="map-Terrain"
          onChange=${() => map.setTerrain(!map.getTerrain())}
          checked=${hasTerrain}
        />
        <label for="map-Terrain">Terrain</label>
        </div>
        <ul class="map-list">
          ${mapList.map(
            ({ key, name }) => html`<li class="map-item">
              <input
                type="radio"
                id=${key}
                name="mapItem"
                checked=${selected === key}
                onChange=${() => map.setMa(key)}
              />
              <label for=${key}>${name}</label>
            </li>`
          )}
        </ul>
      </div>`;
};

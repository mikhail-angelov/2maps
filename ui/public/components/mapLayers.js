import { MAPS } from '../flux/mapsStore.js';
import { html, render, useState } from '../libs/htm.js';
import { SmallIconButton, Button } from './common.js';

const MapLayer = ({ mapsStore }) => {
  const [collapsed, setCollapsed] = useState(true);
  const onToggle = () => setCollapsed(!collapsed);

  mapsStore.on(MAPS.REFRESH_MAP_LIST, () => {});

  if (collapsed) {
    return html`<${Button}
      className="small"
      icon="assets/layer.svg"
      onClick=${onToggle}
    />`;
  }

  return html`<div class="col" style=${{ backgroundColor: 'white' }}>
    <div class="row between">
      <h5>Карты</h5>
      <${SmallIconButton}
        className="normal"
        icon="assets/close.svg"
        onClick=${onToggle}
      />
    </div>
    <div class="col">
      ${mapsStore.maps.map(
    ({ id, name }) => html`<div
          class="input-group row"
          style=${{ alignItems: 'center', display: 'flex' }}
        >
          <input
            type="radio"
            id=${id}
            name="primaryMap"
            checked=${mapsStore.primary?.id === id}
            onChange=${() => mapsStore.selectPrimary(id)}
          />
          <label for=${id}>${name}</label>
        </div>`,
  )}
    </div>
    <hr />
    <div
      class="input-group row"
      style=${{ alignItems: 'center', display: 'flex' }}
    >
      <input
        type="checkbox"
        id="map-wiki"
        name="map-wiki"
        onChange=${() => mapsStore.setWikimapia(!mapsStore.hasWiki)}
        checked=${mapsStore.hasWiki}
      />
      <label for="map-wiki">Wikimapia</label>
    </div>
    <div
      class="input-group row"
      style=${{ alignItems: 'center', display: 'flex' }}
    >
      <input
        type="checkbox"
        id="map-Terrain"
        name="map-Terrain"
        onChange=${() => mapsStore.setTerrain(!mapsStore.hasTerrain)}
        checked=${mapsStore.hasTerrain}
      />
      <label for="map-Terrain">Terrain</label>
    </div>
    <hr />
    <div class="col">
      ${mapsStore.secondaryMaps.map(
    ({ id, name }) => html`<div
          class="input-group row"
          style=${{ alignItems: 'center', display: 'flex' }}
        >
          <input
            type="radio"
            id=${id}
            name="secondaryMap"
            checked=${mapsStore.secondary?.id === id}
            onChange=${() => mapsStore.selectSecondary(id)}
          />
          <label for=${id}>${name}</label>
        </div>`,
  )}
    </div>
  </div>`;
};

export const createMapLayer = (mapsStore) => {
  render(
    html`<${MapLayer} mapsStore=${mapsStore} />`,
    document.getElementById('layers'),
  );
};

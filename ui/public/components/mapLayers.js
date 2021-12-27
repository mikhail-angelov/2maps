import { html, render, useState } from "../libs/htm.js";
import { IconButton } from './common.js';

export const createMapLayer = ({ maps, selected, setMap }) => {
  render(html`<${MapLayer} maps=${maps} selected=${selected} setMap=${setMap} />`, document.getElementById("layers"));
};

const MapLayer = ({ maps, selected, setMap }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [current, setCurrent] = useState(selected);

  const onToggle = () => setCollapsed(!collapsed);
  const onSetMap = (map) => {
    setMap(map)
    setCurrent(map);
    setCollapsed(true);
  };

  return collapsed ?
    html`<${IconButton} className="layer-icon" icon="assets/layer.svg" onClick=${onToggle} />` :
    html`<div class="layer-list">
      <div class="layer-list-header">
      Select map 
      <${IconButton} className="header-button" icon="assets/close.svg" onClick=${onToggle} />
      </div>
      <ul class="map-list">
      ${maps.map(({key, name}) => html`<li class="map-item">
      <input type="radio" id=${key} name="maps" checked=${current === key} onChange=${() => onSetMap(key)}/>
      <label for=${key}>${name}</label>
    </li>`)}
      </ul>
      </div>`;
};

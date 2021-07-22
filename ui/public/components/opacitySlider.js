import { html, render } from "../libs/htm.js";
import { isMobile } from "../utils.js";
import { saveOpacity } from "../storage.js";

export const createOpacitySlider = (mapSelector, init) => {
  let opacity = init;
  const applyOpacity = () => {
    const mapElements = document.querySelectorAll(mapSelector);
    mapElements.forEach((e) => (e.style.opacity = opacity / 100));

  };
  const onInput = (e) => {
    opacity = parseInt(e.target.value, 10);
    applyOpacity();
  };
  const setOpacity = (e) => {
    onInput(e);
    saveOpacity(opacity);
  };
  applyOpacity()

  render(
    html`<div class="map-overlay-inner">
      <input
        type="range"
        min="0"
        max="100"
        step="0"
        value=${opacity}
        onChange=${setOpacity}
        onInput=${onInput}
      />
    </div>`,
    document.getElementById("slider")
  );


};

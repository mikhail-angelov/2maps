import { html, render } from "../libs/htm.js";
import { isMobile } from "../utils.js";
import { saveOpacity } from "../storage.js";

export const createOpacitySlider = (init, onChange) => {
  let opacity = init;

  const onInput = (e) => {
    opacity = parseInt(e.target.value, 10);
    onChange(opacity);
  };
  const setOpacity = (e) => {
    onInput(e);
    saveOpacity(opacity);
  };
  onChange(init)

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

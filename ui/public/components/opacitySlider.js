import { html, render } from "../libs/htm.js";
import { UI_EVENTS } from "../flux/uiStore.js";

export const createOpacitySlider = (uiStore) => {
  let { opacity } = uiStore;
  let sliderElement = null;

  const onInput = (e) => {
    opacity = parseInt(e.target.value, 10);
    uiStore.setOpacity(opacity);
  };

  const setOpacity = (e) => {
    onInput(e);
  };

  const updateSlider = (newOpacity) => {
    opacity = newOpacity;
    if (sliderElement) {
      sliderElement.value = opacity;
    }
  };

  // Listen to opacity changes from the store
  uiStore.on(UI_EVENTS.OPACITY, updateSlider);

  // Create the slider
  const template = html`<div class="row">
    <input
      class="col-sm-12"
      type="range"
      min="0"
      max="100"
      step="1"
      value=${opacity}
      onChange=${setOpacity}
      onInput=${onInput}
      ref=${(el) => {
        sliderElement = el;
      }}
    />
  </div>`;

  render(template, document.getElementById("slider"));

  // Return cleanup function (optional, for completeness)
  return () => {
    uiStore.off(UI_EVENTS.OPACITY, updateSlider);
  };
};

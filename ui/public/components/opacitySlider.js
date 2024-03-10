import { html, render } from '../libs/htm.js';

export const createOpacitySlider = (uiStore) => {
  let { opacity } = uiStore;

  const onInput = (e) => {
    opacity = parseInt(e.target.value, 10);
    uiStore.setOpacity(opacity);
  };
  const setOpacity = (e) => {
    onInput(e);
  };

  render(
    html`<div class="row">
      <input
        class="col-sm-12"
        type="range"
        min="0"
        max="100"
        step="0"
        value=${opacity}
        onChange=${setOpacity}
        onInput=${onInput}
      />
    </div>`,
    document.getElementById('slider'),
  );
};

import { html, render, useState } from "../libs/htm.js";
import { Button } from "./common.js";

export const createMapDraw = ({ map }) => {
  render(html`<${MapDraw} map=${map} />`, document.getElementById("draw"));
};

const MapDraw = ({ map }) => {
  const [active, setActive] = useState(false);
  const [draw, setDraw] = useState(false);
  const [path, setPath] = useState([]);

  const onToggle = () => setActive(!active);
  const onMouseDown = (e) => {
    setDraw(true);
    setPath([]);
  };
  const onMouseUp = (e) => {
    setDraw(false);
  };
  const onMouseMove = (e) => {
    if (draw) {
      const { layerX, layerY } = e;
      const { lat, lng } = map.unproject([layerX, layerY]);
      const newPath = [...path, [lng, lat]];
      setPath(newPath);
      map.draw(newPath);
    }
  };

  return html`${active
      ? html`<div
          className="drawOverlay"
          onMouseDown=${onMouseDown}
          onMouseUp=${onMouseUp}
          onMouseMove=${onMouseMove}
        ></div>`
      : null}
    <${Button}
      className=${active ? "draw-icon red" : "draw-icon"}
      icon="assets/draw.svg"
      onClick=${onToggle}
    />`;
};

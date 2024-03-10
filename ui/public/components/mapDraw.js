import { html, render, useState } from '../libs/htm.js';
import { Button } from './common.js';

const MapDraw = ({ map, trackStore }) => {
  const [active, setActive] = useState(false);
  const [draw, setDraw] = useState(false);
  const [path, setPath] = useState([]);
  const [geoJson, setGeoJson] = useState({
    type: 'FeatureCollection',
    features: [],
  });
  const track = trackStore.selected;
  // const [clientRect, setClientRect] = useState({});

  map.on('resize', (e) => {
    console.log('resize', e);
    const clientRect = e.target.getCanvasContainer().getClientRects()[0];
    const overlayStyle = document.getElementById('draw').style;
    overlayStyle.left = `${clientRect.left}px`;
  });

  const onToggle = () => setActive(!active);
  const onSave = () => {
    map.saveDraw(geoJson);
    setActive(false);
  };
  const onCloseTack = () => {
    trackStore.select(null);
    setActive(false);
    map.closeDraw();
  };
  const onMouseDown = () => {
    setDraw(true);
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
      properties: {
        name: `draw ${new Date()}`,
      },
    };
    setGeoJson({
      ...geoJson,
      features: [...geoJson.features, feature],
    });
    setPath([]);
  };
  const onMouseUp = () => {
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: path,
      },
      properties: {
        name: `draw ${new Date()}`,
      },
    };
    setGeoJson({
      ...geoJson,
      features: [...geoJson.features, feature],
    });
    setDraw(false);
  };
  const onMouseMove = (e) => {
    if (draw) {
      const { layerX, layerY } = e;
      const { lat, lng } = map.unproject([layerX, layerY]);
      const newPath = [...path, [lng, lat]];
      setPath(newPath);
      const feature = geoJson.features.pop();
      const newFeature = {
        ...feature,
        geometry: { ...feature.geometry, coordinates: newPath },
      };
      const newGeoJson = {
        ...geoJson,
        features: [...geoJson.features, newFeature],
      };
      setGeoJson(newGeoJson);
      map.draw(newGeoJson);
    }
  };
  if (track) {
    return html`<${Button}
      className="draw-icon"
      icon="assets/hide.svg"
      onClick=${onCloseTack}
    />`;
  }
  if (active) {
    return html`<div
        className="drawOverlay"
        onMouseDown=${onMouseDown}
        onMouseUp=${onMouseUp}
        onMouseMove=${onMouseMove}
      ></div>
      <${Button}
        className=${active ? 'draw-icon red' : 'draw-icon'}
        icon="assets/draw.svg"
        onClick=${onToggle}
      /><${Button}
        className="draw-save"
        icon="assets/save.svg"
        onClick=${onSave}
      />`;
  }

  return html`${active
    ? html`<div
          className="drawOverlay"
          onMouseDown=${onMouseDown}
          onMouseUp=${onMouseUp}
          onMouseMove=${onMouseMove}
        ></div>`
    : null}
    <${Button}
      className=${active ? 'draw-icon red' : 'draw-icon'}
      icon="assets/draw.svg"
      onClick=${onToggle}
    />
    ${active
    ? html`<${Button}
          className="draw-save"
          icon="assets/save.svg"
          onClick=${onSave}
        />`
    : null}`;
};

export const createMapDraw = ({ map, trackStore }) => {
  trackStore.onRefresh(() => {
    render(
      html`<${MapDraw} map=${map} trackStore=${trackStore} />`,
      document.getElementById('draw'),
    );
  });
  render(
    html`<${MapDraw} map=${map} trackStore=${trackStore} />`,
    document.getElementById('draw'),
  );
};

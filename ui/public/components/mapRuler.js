
import { html, render, useState, useEffect } from '../libs/htm.js';
import { Button } from './common.js';

const getDistance = (lngLat1, lngLat2) => {
  const R = 6371e3; // metres
  const φ1 = (lngLat1[1] * Math.PI) / 180;
  const φ2 = (lngLat2[1] * Math.PI) / 180;
  const Δφ = ((lngLat2[1] - lngLat1[1]) * Math.PI) / 180;
  const Δλ = ((lngLat2[0] - lngLat1[0]) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

const formatDistance = (m) => {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
};

const MapRuler = ({ map }) => {
  const [active, setActive] = useState(false);
  const [points, setPoints] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);

  useEffect(() => {
    if (!active) {
      if (map.getLayer('ruler-line')) map.removeLayer('ruler-line');
      if (map.getLayer('ruler-points')) map.removeLayer('ruler-points');
      if (map.getLayer('ruler-labels')) map.removeLayer('ruler-labels');
      if (map.getSource('ruler')) map.removeSource('ruler');
      setPoints([]);
      setTotalDistance(0);
      return;
    }

    if (!map.getSource('ruler')) {
      map.addSource('ruler', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: 'ruler-line',
        type: 'line',
        source: 'ruler',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#ff0000',
          'line-width': 3,
        },
        filter: ['==', '$type', 'LineString'],
      });

      map.addLayer({
        id: 'ruler-points',
        type: 'circle',
        source: 'ruler',
        paint: {
          'circle-radius': 5,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ff0000',
        },
        filter: ['==', '$type', 'Point'],
      });

      map.addLayer({
        id: 'ruler-labels',
        type: 'symbol',
        source: 'ruler',
        layout: {
          'text-field': ['get', 'distance'],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': 12,
          'text-offset': [0, -1.5],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#ff0000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
        filter: ['==', '$type', 'Point'],
      });
    }

    const onClick = (e) => {
      const newPoint = [e.lngLat.lng, e.lngLat.lat];
      setPoints((prev) => {
        const next = [...prev, newPoint];
        updateRuler(next);
        return next;
      });
    };

    map.on('click', onClick);
    map.getCanvas().style.cursor = 'crosshair';

    return () => {
      map.off('click', onClick);
      map.getCanvas().style.cursor = '';
    };
  }, [active]);

  const updateRuler = (newPoints) => {
    if (!map.getSource('ruler')) return;

    const features = [];
    let total = 0;

    newPoints.forEach((p, i) => {
      let distText = '';
      if (i > 0) {
        const d = getDistance(newPoints[i - 1], p);
        total += d;
        distText = formatDistance(total);
      } else {
          distText = '0 m';
      }

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: p,
        },
        properties: {
          distance: distText,
        },
      });
    });

    if (newPoints.length > 1) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: newPoints,
        },
      });
    }

    map.getSource('ruler').setData({
      type: 'FeatureCollection',
      features,
    });
    setTotalDistance(total);
  };

  const onToggle = () => setActive(!active);
  const onClear = () => {
    setPoints([]);
    setTotalDistance(0);
    if (map.getSource('ruler')) {
      map.getSource('ruler').setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  };

  return html`
    <div className="ruler-container" style=${{ position: 'fixed', top: '210px', right: '20px', display: 'flex', flexDirection: 'column' }}>
        <${Button}
          className=${active ? 'ruler-icon red' : 'ruler-icon'}
          icon="assets/ruler.svg"
          onClick=${onToggle}
          title="Ruler"
        />
        ${active && points.length > 0
          ? html`<${Button}
              className="ruler-clear"
              icon="assets/remove.svg"
              onClick=${onClear}
              title="Clear ruler"
            />`
          : null}
        ${active && points.length > 0
          ? html`<div className="ruler-total" style=${{ background: 'white', padding: '2px 5px', borderRadius: '3px', marginTop: '5px', border: '1px solid #ccc', fontSize: '12px', textAlign: 'center' }}>
              ${formatDistance(totalDistance)}
            </div>`
          : null}
    </div>
  `;
};

export const createMapRuler = ({ map }) => {
  const container = document.createElement('div');
  container.id = 'ruler-widget';
  document.body.appendChild(container);
  render(html`<${MapRuler} map=${map} />`, container);
};

const ZOOM = 'zoom';
const CENTER = 'center';
const OPACITY = 'opacity';
const PLACEMARKS = 'placemarks';
const NAME = 'name';

const parsePlacemarks = (data) => {
  try {
    return JSON.parse(decodeURIComponent(data));
  } catch (e) {
    return [];
  }
};
const encodePlacemarks = (placemarks) => encodeURIComponent(JSON.stringify(placemarks));

export const parseUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  const zoom = params.get(ZOOM) ? +params.get(ZOOM) : 13;
  const opacity = params.get(OPACITY);
  const name = params.get(NAME);
  const center = params.get(CENTER)
    ? params
      .get(CENTER)
      .split(',')
      .map((i) => +i)
    : [44.001789, 56.328293];
  const placemarks = params.get(PLACEMARKS)
    ? parsePlacemarks(params.get(PLACEMARKS))
    : [];
  const resetToken = params.get('reset-token');
  return {
    zoom,
    center,
    opacity,
    placemarks,
    name,
    resetToken,
  };
};

export const setUrlParams = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });
  const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${searchParams.toString()}`;
  window.history.pushState({ path: newurl }, '', newurl);
};

export const composeUrlLink = ({
  zoom, center, opacity, placemarks,
}) => {
  const placemarksParma = placemarks && placemarks.length > 0
    ? `${PLACEMARKS}=${encodePlacemarks(placemarks)}`
    : '';
  return `${window.location.origin}?${ZOOM}=${zoom}&${CENTER}=${center.join(
    ',',
  )}&${OPACITY}=${opacity}&${placemarksParma}`;
};

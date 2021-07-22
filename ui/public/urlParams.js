const ZOOM = "zoom";
const CENTER = "center";
const OPACITY = "opacity";
const PLACEMARKS = "placemarks";
const NAME = "name";

export const parseUrlParams = () => {
  const params = new URLSearchParams(location.search);
  const zoom = params.get(ZOOM) ? +params.get(ZOOM) : 13;
  const opacity = params.get(OPACITY)
  const name = params.get(NAME)
  const center = params.get(CENTER)
    ? params
        .get(CENTER)
        .split(",")
        .map((i) => +i)
    : [44.001789, 56.328293];
  const placemarks = params.get(PLACEMARKS)
    ? parsePlacemarks(params.get(PLACEMARKS))
    : [];
  return {
    zoom,
    center,
    opacity,
    placemarks,
    name,
  };
};

export const setUrlParams = () => {};

export const composeUrlLink = ({ zoom, center, opacity, placemarks }) => {
  const placemarksParma =
    placemarks && placemarks.length > 0
      ? `${PLACEMARKS}=${encodePlacemarks(placemarks)}`
      : "";
  return `${location.origin}?${ZOOM}=${zoom}&${CENTER}=${center.join(
    ","
  )}&${OPACITY}=${opacity}&${placemarksParma}`;
};

const parsePlacemarks = (data) => {
  try {
    return JSON.parse(decodeURIComponent(data));
  } catch (e) {
    return [];
  }
};
const encodePlacemarks = (placemarks) => {
  return encodeURIComponent(JSON.stringify(placemarks));
};

export const savePlacemarksLocal = (placemarks) => {
  const toSore = placemarks.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    rate: p.rate,
    removed: p.removed,
    point: p.point,
    timestamp: p.timestamp || 0,
  }));
  localStorage.setItem("placemarks", JSON.stringify(toSore));
};

export const loadPlacemarksLocal = () => {
  const s = localStorage.getItem("placemarks");
  try {
    return JSON.parse(s) || [];
  } catch {
    return [];
  }
};

export const saveOpacity = (opacity) => {
  localStorage.setItem("opacity", "" + opacity);
};

export const loadOpacity = () => {
  const o = localStorage.getItem("opacity");
  return o ? +o : 50;
};

export const saveTripsLocal = (trips) => {
  const toSore = trips.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    marks: t.marks,
    removed: t.removed,
    timestamp: t.timestamp || 0,
  }));
  localStorage.setItem("trips", JSON.stringify(toSore));
};

export const loadTripsLocal = () => {
  const s = localStorage.getItem("trips");
  try {
    return JSON.parse(s) || [];
  } catch {
    return [];
  }
};

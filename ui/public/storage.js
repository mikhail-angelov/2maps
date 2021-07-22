export const savePlacemarksLocal = (placemarks) => {
  const toSore = placemarks.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
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

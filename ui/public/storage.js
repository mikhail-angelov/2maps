export const savePlacemarksLocal = (placemarks) => {
  localStorage.setItem("placemarks", JSON.stringify(placemarks));
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
  localStorage.setItem("opacity", `${opacity}`);
};

export const loadOpacity = () => {
  const o = localStorage.getItem("opacity");
  return o ? +o : 50;
};

export const savePanelWidth = (width) => {
  console.log("savePanelWidth", width);
  localStorage.setItem("panel-width", `${width}`);
};

export const loadPanelWidth = () => {
  const o = localStorage.getItem("panel-width");
  console.log("loadPanelWidth", o);
  return o ? +o : 200;
};

export const getLocal = () => {
  const data = localStorage.getItem("2-maps");
  try {
    return JSON.parse(data) || {};
  } catch (e) {
    return {};
  }
};

export const saveLocal = (partial) => {
  if (typeof partial !== "object") {
    return;
  }
  const data = getLocal();
  localStorage.setItem("2-maps", JSON.stringify({ ...data, ...partial }));
};

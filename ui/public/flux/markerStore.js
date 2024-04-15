import { Store } from "./store.js";
import { post, remove, put, postLarge } from "../utils.js";
import { loadPlacemarksLocal, savePlacemarksLocal } from "../storage.js";

export const MARKER = {
  ADD: "ADD",
  REMOVE: "REMOVE",
  UPDATE: "UPDATE",
  LOAD: "LOAD",
  REFRESH: "REFRESH",
};

export class MarkerStore extends Store {
  markers = [];
  selected = null;
  loading = false;
  authStore;

  constructor(authStore) {
    super();
    // todo implement url params

    this.authStore = authStore;
    this.markers = loadPlacemarksLocal();
  }

  getFeatures() {
    return this.markers.map((mark) => ({
      type: "Feature",
      properties: {
        id: mark.id,
        description: mark.description,
        title: mark.name,
        rate: mark.rate,
      },
      geometry: {
        type: "Point",
        coordinates: [mark.lng, mark.lat],
      },
    }));
  }

  async loadAll() {
    if (!this.authStore.authenticated) {
      // eslint-disable-next-line no-console
      console.log("not authenticated");
      return;
    }
    // it returns all synced markers
    const res = await postLarge("/marks/sync", this.markers);
    this.markers = res.filter((item) => !!item.id);
    savePlacemarksLocal(this.markers);
    this.refresh();
  }

  downloadPlacemarks() {
    const file = new Blob([JSON.stringify(this.markers)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = "poi.json";
    a.click();
  }

  importPlacemarks(files) {
    if (files.length === 0) {
      // eslint-disable-next-line no-console
      console.log("No file is selected");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const items = data.filter(
          (item) => item && item.id && item.name && item.lat && item.lng
        );
        this.markers = items;
        savePlacemarksLocal(items);
        this.refresh();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("File content error:", e);
      }
    };
    reader.readAsText(files[0]);
  }

  async add(mark) {
    try {
      if (this.authStore.authenticated) {
        await post("/marks", mark);
      }
      this.markers = [...this.markers, mark];
      savePlacemarksLocal(this.markers);
      this.refresh();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("failed to add marker");
    }
  }

  async remove(id) {
    this.markers = this.markers.filter((item) => item.id !== id);
    if (this.authStore.authenticated) {
      await remove(`/marks/${id}`);
    }
    savePlacemarksLocal(this.markers);
    this.refresh();
  }

  async update(mark) {
    if (this.authStore.authenticated) {
      await put("/marks", mark);
    }
    this.markers = this.markers.map((item) =>
      item.id === mark.id ? mark : item
    );
    savePlacemarksLocal(this.markers);
    this.refresh();
  }

  select(mark) {
    this.selected = mark;
    this.refresh();
  }
}

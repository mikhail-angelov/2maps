import { html } from "../libs/htm.js";
import { loadPlacemarksLocal, savePlacemarksLocal } from "../storage.js";
import { getId, postLarge } from "../utils.js";
import { composeUrlLink } from "../urlParams.js";
import { IconButton } from "./common.js";
import "../libs/qrcode.js";

const blackStars = "★★★★★";
const whiteStars = "☆☆☆☆☆";

export class Marks {
  constructor(yandexMap, panel, store) {
    this.yandexMap = yandexMap;
    this.panel = panel;
    this.store = store;
    this.placemarks = [];

    let localItems = loadPlacemarksLocal();
    this.placemarks = localItems.map((p) => {
      const mapItem = this.yandexMap.addPlacemark(p);
      return { ...p, mapItem };
    });
  }

  async syncMarks() {
    const items = this.placemarks.map(
      ({ id, name, description, rate, point, timestamp, removed }) => ({
        id,
        name,
        description,
        rate,
        lat: point.lat,
        lng: point.lng,
        timestamp,
        removed,
      })
    );
    // it returns all synced markers
    const res = await postLarge(`/marks/sync`, items);
    console.log("sync", res.length);
    const toSave = res
      .filter((item) => !!item.id)
      .map(({ id, name, description, rate, lng, lat, timestamp }) => ({
        id,
        name,
        description,
        rate,
        point: { lat, lng },
        timestamp,
      }));
    savePlacemarksLocal(toSave);
    //todo make it without reload
    location.reload();
  }

  async copyUrl({ items }) {
    const text = composeUrlLink({
      zoom: this.yandexMap.getZoom() - 1,
      center: this.yandexMap.getCenter().reverse(),
      opacity: 100,
      placemarks: items,
    });
    try {
      await navigator.clipboard.writeText(text);
      alert(`${text} is copied`);
    } catch (e) {
      console.log(e);
      alert(`error copy ${e}`);
    }
  }
  downloadPlacemarks() {
    const toSore = this.placemarks.map((p) => ({
      id: p.id,
      name: p.name,
      point: p.point,
      timestamp: p.timestamp,
      description: p.description,
      rate: p.rate,
      removed: p.removed,
    }));
    const file = new Blob([JSON.stringify(toSore)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = "poi.json";
    a.click();
  }
  importPlacemarks(files) {
    if (files.length === 0) {
      console.log("No file is selected");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const items = data
          .filter(
            (item) =>
              item &&
              item.id &&
              item.name &&
              item.point &&
              item.point.lat &&
              item.point.lng
          )
          .map(
            ({ id, name, point, description, rate, removed, timestamp }) => ({
              id,
              name,
              point,
              description,
              rate,
              removed,
              timestamp,
            })
          );
        this.addItems(items);
      } catch (e) {
        console.log("File content error:", e);
      }
    };
    reader.readAsText(files[0]);
  }

  PItem({
    id,
    name,
    rate,
    distance,
    removed,
    onRemove,
    onEdit,
    copyUrl,
    onCenter,
  }) {
    const formatDistance = (distance) => {
      const d = Math.round(distance || 0);
      return d > 800 ? `${(d / 1000).toFixed(2)} км` : `${d} м`;
    };
    const Rate = (rate = 0) => {
      return html`<div class="rate">
        ${blackStars.substr(0, rate) + whiteStars.substr(0, 5 - rate)}
      </div>`;
    };
    return html`<li
      class="place-item"
      key="${id}"
      onClick=${onCenter}
      disabled=${removed}
    >
      <div class="title">
        <div>${name}</div>
        <div class="sub-title">${Rate(rate)} ${formatDistance(distance)}</div>
      </div>
      <${IconButton}
        icon="assets/link.svg"
        tooltips="Скопировать линк"
        onClick=${copyUrl}
        disabled=${removed}
      />
      <${IconButton}
        icon="assets/edit.svg"
        tooltips="Редактировать линк"
        onClick=${onEdit}
        disabled=${removed}
      />
      <${IconButton}
        icon="assets/remove.svg"
        tooltips="Удалить все"
        onClick=${onRemove}
        disabled=${removed}
      />
    </li>`;
  }

  addItems(items) {
    const added = items.map(({ name, description, rate, point }) => {
      const placeMark = {
        id: getId(),
        name,
        description,
        rate,
        point,
        timestamp: Date.now(),
      };
      const mapItem = this.yandexMap.addPlacemark(placeMark);
      return { ...placeMark, mapItem };
    });

    const updatedPlacemarks = [...this.placemarks, ...added];
    this.placemarks = updatedPlacemarks;
    savePlacemarksLocal(updatedPlacemarks);
    this.panel.refresh();
  }

  removeItem(id, mapItem) {
    const updatedPlacemarks = this.placemarks.map((p) =>
      p.id === id ? { ...p, removed: true } : p
    );
    if (mapItem) {
      this.yandexMap.geoObjects.remove(mapItem);
    }
    this.placemarks = updatedPlacemarks;
    savePlacemarksLocal(updatedPlacemarks);
    this.panel.refresh();
  }

  onEdit(p) {
    this.yandexMap.onEditMark({
      ...p,
      onSubmit: (e) => {
        e.preventDefault();
        this.yandexMap.balloon.close();
        const formData = new FormData(e.target);
        const id = formData.get("id");
        const name = formData.get("name");
        const description = formData.get("description");
        const rate = +formData.get("rate") ? +formData.get("rate") : 0;
        const timestamp = Date.now();
        const updatedPlacemarks = this.placemarks.map((p) =>
          p.id === id ? { ...p, name, description, timestamp, rate } : p
        );
        this.placemarks = updatedPlacemarks;
        savePlacemarksLocal(updatedPlacemarks);
        this.panel.refresh();
      },
    });
  }

  formatPlacemarks(placemarks) {
    const center = this.yandexMap.getCenter();
    const items = placemarks
      .map((item) => {
        const distance = ymaps.coordSystem.geo.getDistance(center, [
          item.point.lat,
          item.point.lng,
        ]);
        return { ...item, distance };
      })
      .sort((a, b) => a.distance - b.distance);
    return items;
  }

  render() {
    const items = this.formatPlacemarks(this.placemarks);
    return html` <ul class="list">
      ${items.map(
        ({ id, name, rate, point, distance, removed, mapItem }) =>
          html`<${this.PItem}
            ...${{ id, name, rate, distance, removed }}
            onRemove=${() => this.removeItem(id, mapItem)}
            onEdit=${() => this.onEdit({ id, name, rate, point })}
            copyUrl=${() => this.copyUrl([{ id, name, point }])}
            onCenter=${() => this.yandexMap.setCenter([point.lat, point.lng])}
          />`
      )}
    </ul>
    <div class="footer">
    <div class="import-export">
    <label class="upload" htmlFor="upload">
    Импорт
    </label>
    <input type="file" id="upload" onChange=${(e) =>
      this.importPlacemarks(e.target.files)} hidden></input>
    <button class="icon-button footer-button" onClick=${() =>
      this.downloadPlacemarks()}>
      Экспорт
    </button>
    <button class="icon-button footer-button" onClick=${() => this.syncMarks()}>
      Синхр.
    </button>
  </div></div>`;
  }
}

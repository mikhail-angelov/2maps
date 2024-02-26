import { html, render, useState } from "../libs/htm.js";
import { getId } from "../utils.js";
import { IconButton } from "./common.js";

const blackStars = "★★★★★";
const whiteStars = "☆☆☆☆☆";

export const EditMarker = ({ marker = {}, onSave, onCancel }) => {
  const id = marker.id;
  const [name, setName] = useState(marker.name || "");
  const [description, setDescription] = useState(marker.description || "");
  const [rate, setRate] = useState(marker.rate || 0);

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const description = formData.get("description");
    const rate = +formData.get("rate") ? +formData.get("rate") : 0;
    console.log("-", rate, formData.get("rate"), formData);

    onSave({
      id: id || getId(),
      name,
      description,
      rate,
      point: marker.point,
      timestamp: Date.now(),
    });
  };

  return html`<form class="form marker-form" onSubmit=${onSubmit}>
    <h2>${id ? "Обновить метку" : "Добавить метку?"}</h2>
    <div class="row">
      <p class="label">Название:</p>
      <input
        name="name"
        class="form-input"
        value="${name}"
        onChange=${(e) => setName(e.target.value)}
      />
    </div>
    <div class="row">
      <p class="label">Описание:</p>
      <input
        name="description"
        class="form-input"
        value="${description}"
        onChange=${(e) => setDescription(e.target.value)}
      />
    </div>
    <div class="row">
      <p class="label">Рейт:</p>
      <input
        name="rate"
        class="form-input"
        value="${rate}"
        type="number"
        onChange=${(e) => setRate(e.target.value)}
      />
    </div>

    <div class="row">
      <button class="form-button primary">
        ${id ? "Сохранить" : "Добавить"}
      </button>
      <button class="form-button" onClick=${onCancel}>Отмена</button>
    </div>
  </form>`;
};
export const ViewMarker = ({ marker = {}, onCancel }) => {
  return html`<div class="form marker-form">
      <b class="label">${marker.name||''}</b>
      <p class="label">${marker.description||''}</p>
      <button class="form-button" onClick=${onCancel}>Отмена</button>
    </div>`;
};

export class Marks {
  constructor(panel, markerStore) {
    this.panel = panel;
    this.markerStore = markerStore;

    markerStore.on("STORE_REFRESH", () => {
      this.panel.refresh();
    });
  }

  async syncMarks() {
    this.markerStore.loadAll();
  }

  async copyUrl({ items }) {
    // const text = composeUrlLink({
    //   zoom: this.yandexMap.getZoom() - 1,
    //   center: this.yandexMap.getCenter().reverse(),
    //   opacity: 100,
    //   placemarks: items,
    // });
    // try {
    //   await navigator.clipboard.writeText(text);
    //   alert(`${text} is copied`);
    // } catch (e) {
    //   console.log(e);
    //   alert(`error copy ${e}`);
    // }
  }
  downloadPlacemarks() {
    this.markerStore.downloadPlacemarks();
  }
  importPlacemarks(files) {
    this.markerStore.importPlacemarks(files);
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

  removeItem(id, mapItem) {
    this.markerStore.remove(id);
    this.panel.refresh();
  }

  onEdit(marker) {
    const modal = document.getElementById("marker-modal");
    modal.style.display = "flex";
    const onCancel = () => {
      modal.style.display = "none";
      modal.innerHTML = "";
    };
    const onSave = (mark) => {
      this.markerStore.update(mark);
      onCancel();
    };
    const form = EditMarker({ marker, onSave: onSave.bind(this), onCancel: onCancel.bind(this) });

    render(
      html`<div class="modal-content">
        <button class="close-button" onClick=${onCancel}>✕</button>${form}
      </div>`,
      modal
    );
  }

  formatPlacemarks(placemarks) {
    // const center = this.yandexMap.getCenter();
    const items = placemarks
      .map((item) => {
        // const distance = ymaps.coordSystem.geo.getDistance(center, [
        //   item.point.lat,
        //   item.point.lng,
        // ]);
        return { ...item, distance: 0 };
      })
      .sort((a, b) => a.distance - b.distance);
    return items;
    return [];
  }

  render() {
    const items = this.formatPlacemarks(this.markerStore.markers);
    return html` <ul class="list">
      ${items.map(
        ({ id, name, rate, point, distance, removed, mapItem }) =>
          html`<${this.PItem}
            ...${{ id, name, rate, distance, removed }}
            onRemove=${() => this.removeItem.bind(this)(id, mapItem)}
            onEdit=${() => this.onEdit.bind(this)({ id, name, rate, point })}
            copyUrl=${() => this.copyUrl([{ id, name, point }])}
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
      <button class="icon-button footer-button" onClick=${() =>
        this.syncMarks()}>
        Синхр.
      </button>
      </div>
    </div>
    <div id="marker-modal" class="modal hidden"></div>`;
  }
}

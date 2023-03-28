import { html } from "../libs/htm.js";
import { getId, get } from "../utils.js";
import { composeUrlLink } from "../urlParams.js";
import { IconButton } from "./common.js";
import { kmlToJson } from "../libs/togeojson.js";
import bbox from "../libs/geojson-bbox.js";
import "../libs/qrcode.js";

const blackStars = "★★★★★";
const whiteStars = "☆☆☆☆☆";

export class Tracks {
  constructor({ yandexMap, secondMap, panel, trackStore }) {
    this.yandexMap = yandexMap;
    this.secondMap = secondMap;
    this.panel = panel;
    this.store = trackStore;
    this.store.onRefresh(() => {
      this.panel.refresh();
    });
    this.onSelect = this.onSelect.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.copyUrl = this.copyUrl.bind(this);
  }

  async test() {}
  async copyUrl({ items }) {
    const text = composeUrlLink({
      zoom: this.yandexMap.getZoom() - 1,
      center: this.yandexMap.getCenter().reverse(),
      opacity: 100,
      track: items,
    });
    try {
      await navigator.clipboard.writeText(text);
      alert(`${text} is copied`);
    } catch (e) {
      console.log(e);
      alert(`error copy ${e}`);
    }
  }
  importKml(files) {
    const parser = new DOMParser();
    if (files.length === 0) {
      console.log("No file is selected");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const doc = parser.parseFromString(
          event.target.result,
          "application/xml"
        );
        const geoJson = kmlToJson.kml(doc);
        this.store.add({
          id: `${Date.now()}`,
          name: files[0].name,
          geoJson,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.log("File content error:", e);
      }
    };
    reader.readAsText(files[0]);
  }

  PItem({ id, name, onRemove, copyUrl, onSelect }) {
    return html`<li class="place-item" key="${id}" onClick=${onSelect}>
      <div class="title">
        <div>${name}</div>
      </div>
      <${IconButton}
        icon="assets/link.svg"
        tooltips="Скопировать линк"
        onClick=${copyUrl}
      />
      <${IconButton}
        icon="assets/remove.svg"
        tooltips="Удалить все"
        onClick=${onRemove}
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

  onRemove(id) {
    const updatedPlacemarks = this.placemarks.map((p) =>
      p.id === id ? { ...p, removed: true } : p
    );
    // if (mapItem) {
    //   this.yandexMap.geoObjects.remove(mapItem);
    // }
    this.placemarks = updatedPlacemarks;
    savePlacemarksLocal(updatedPlacemarks);
    this.panel.refresh();
  }

  async onSelect(id) {
    if (this.store.selected?.id === id) {
      this.store.select(null);
    } else {
      const track = await get(`tracks/${id}`);
      if (track?.geoJson) {
        this.store.select(track);
        this.secondMap.draw(track.geoJson);
        const bounds = bbox(track.geoJson);
        this.yandexMap.setBounds(
          [
            [bounds[1], bounds[0]],
            [bounds[3], bounds[2]],
          ],
          {
            checkZoomRange: true,
          }
        );
      } else {
        alert("track not found");
      }
    }
  }

  render() {
    const items = this.store.getAll();
    console.log("render track", items);
    const isBlankList = !items || items.length === 0;
    return html`${
      isBlankList
        ? html`<div className="list">not tracks</div>`
        : html`<ul class="list">
            ${items.map(
              ({ id, name, geoJson }) =>
                html`<${this.PItem}
                  ...${{ id, name }}
                  onRemove=${() => this.onRemove(id)}
                  copyUrl=${() => this.copyUrl([{ id, name, geoJson }])}
                  onSelect=${() => this.onSelect(id)}
                />`
            )}
          </ul>`
    }
    <div class="footer">
    <div class="import-export">
    <label class="upload" htmlFor="upload">
    Импорт
    </label>
    <input type="file" id="upload" onChange=${(e) =>
      this.importKml(e.target.files)} hidden></input>
    <button class="icon-button footer-button" onClick=${() => this.test()}>
      Тест
    </button></div></div>`;
  }
}

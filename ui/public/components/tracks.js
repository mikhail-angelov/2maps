import { html } from "../libs/htm.js";
import { getId, get } from "../utils.js";
import { composeUrlLink } from "../urlParams.js";
import { IconButton } from "./common.js";
import { kmlToJson } from "../libs/togeojson.js";
import bbox from "../libs/geojson-bbox.js";
import "../libs/qrcode.js";

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
    this.onDownload = this.onDownload.bind(this);
  }

  async test() {}
  async onDownload(id) {
    window.open(`/tracks/${id}/kml`, "__blank");
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

  PItem({ id, name, selected, onRemove, onDownload, onSelect }) {
    return html`<li class="place-item" key="${id}" onClick=${onSelect}>
      <div class="title">
        <div class=${selected ? "red" : ""}>${name}</div>
      </div>
      <${IconButton}
        icon="assets/download.svg"
        tooltips="Скачать KML"
        onClick=${onDownload}
      />
      <${IconButton}
        icon="assets/remove.svg"
        tooltips="Удалить"
        onClick=${onRemove}
      />
    </li>`;
  }

  onRemove(id, name) {
    if (window.confirm(`Вы хотите удалить трек ${name}?`)) {
      if (this.store.selected?.id === id) {
        this.store.select(null);
        this.secondMap.closeDraw();
      }
      this.store.remove(id);
    }
  }

  async onSelect(id) {
    if (this.store.selected?.id === id) {
      this.store.select(null);
      this.secondMap.closeDraw();
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
    const isBlankList = !items || items.length === 0;
    return html`${
      isBlankList
        ? html`<div className="list">not tracks</div>`
        : html`<ul class="list">
            ${items.map(
              ({ id, name }) =>
                html`<${this.PItem}
                  ...${{ id, name, selected: id === this.store.selected?.id }}
                  onRemove=${(e) => {
                    e.stopPropagation();
                    this.onRemove(id, name);
                  }}
                  onDownload=${(e) => {
                    e.stopPropagation();
                    this.onDownload(id);
                  }}
                  onSelect=${(e) => this.onSelect(id)}
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
    </div></div>`;
  }
}

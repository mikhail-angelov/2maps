import { html } from "../libs/htm.js";
import { getId, get, postLarge } from "../utils.js";
import { IconButton } from "./common.js";
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

    // let localItems = loadPlacemarksLocal();
    // this.placemarks = localItems.map((p) => {
    //   const mapItem = this.yandexMap.addPlacemark(p);
    //   return { ...p, mapItem };
    // });
  }

  async syncMarks() {}

  // async copyUrl({items}) {
  //   const text = composeUrlLink({
  //     zoom: this.yandexMap.getZoom() - 1,
  //     center: this.yandexMap.getCenter().reverse(),
  //     opacity: 100,
  //     placemarks: items,
  //   });
  //   try {
  //     await navigator.clipboard.writeText(text);
  //     alert(`${text} is copied`);
  //   } catch (e) {
  //     console.log(e);
  //     alert(`error copy ${e}`);
  //   }
  // }
  // downloadPlacemarks(items) {
  //   const toSore = items.map((p) => ({
  //     id: p.id,
  //     name: p.name,
  //     point: p.point,
  //     timestamp: p.timestamp,
  //     description: p.description,
  //     rate: p.rate,
  //     removed: p.removed,
  //   }));
  //   const file = new Blob([JSON.stringify(toSore)], {
  //     type: "application/json",
  //   });
  //   const a = document.createElement("a");
  //   a.href = URL.createObjectURL(file);
  //   a.download = "poi.json";
  //   a.click();
  // }
  importKml(files) {
    if (files.length === 0) {
      console.log("No file is selected");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      // try {
      //   const data = JSON.parse(event.target.result);
      //   const items = data
      //     .filter(
      //       (item) =>
      //         item &&
      //         item.id &&
      //         item.name &&
      //         item.point &&
      //         item.point.lat &&
      //         item.point.lng
      //     )
      //     .map(
      //       ({ id, name, point, description, rate, removed, timestamp }) => ({
      //         id,
      //         name,
      //         point,
      //         description,
      //         rate,
      //         removed,
      //         timestamp,
      //       })
      //     );
      //   this.addItems(items);
      // } catch (e) {
      //   console.log("File content error:", e);
      // }
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

  removeItem(id) {
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
      this.store.select(track);
      this.secondMap.draw(track.geoJson);
      // this.yandexMap.setCenter([point.lat, point.lng])
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
                  onRemove=${() => this.removeItem(id)}
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
    <button class="icon-button footer-button" onClick=${() => this.syncMarks()}>
      Тест
    </button></div></div>`;
  }
}

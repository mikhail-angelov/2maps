import {
  html, render, useState, useEffect,
} from '../libs/htm.js';
import { getId } from '../utils.js';
import { SmallIconButton } from './common.js';
import { composeUrlLink } from '../urlParams.js';

const blackStars = '★★★★★';
const whiteStars = '☆☆☆☆☆';

const Rate = (value = 0) => html`<div class="rate">
  ${blackStars.substr(0, value) + whiteStars.substr(0, 5 - value)}
</div>`;

const formatDistance = (distance) => {
  const d = Math.round(+distance || 0);
  return d > 800 ? `${(d / 1000).toFixed(2)} км` : `${d} м`;
};

export const EditMarker = ({
  marker = {}, onSave, onCancel, pureHtml,
}) => {
  const { id } = marker;
  console.log('-e--', pureHtml, marker);
  const [name, setName] = useState(marker.name || '');
  const [description, setDescription] = useState(marker.description || '');
  const [rate, setRate] = useState(marker.rate || 0);
  useEffect(() => {
    setName(marker.name || '');
    setDescription(marker.description || '');
    setRate(marker.rate || 0);
    console.log('-eff--', pureHtml, marker);
  }, [marker]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (pureHtml) {
      const formData = new FormData(e.target);
      onSave({
        id: id || getId(),
        name: formData.get('name'),
        description: formData.get('description'),
        rate: +formData.get('rate') ? +formData.get('rate') : 0,
        point: marker.point,
        timestamp: Date.now(),
      });
    } else {
      onSave({
        id: id || getId(),
        name,
        description,
        rate,
        point: marker.point,
        timestamp: Date.now(),
      });
    }
  };

  return html`<form
    class="card"
    style=${{ maxWidth: '400px', margin: pureHtml ? 0 : 'auto' }}
    onSubmit=${onSubmit}
  >
    <label class="modal-close"></label>
    <button
      style=${{
    backgroundColor: 'transparent',
    position: 'absolute',
    right: 0,
    top: '-4px',
  }}
      onClick=${onCancel}
    >
      ✕
    </button>
    <fieldset>
      <legend>${id ? 'Обновить метку' : 'Добавить метку?'}</legend>
      <div class="input-group vertical">
        <label for="name">Название</label>
        <input
          id="name"
          name="name"
          value=${pureHtml ? marker.name : name}
          onChange=${(e) => setName(e.target.value)}
        />
      </div>
      <div class="input-group vertical">
        <label for="description">Описание</label>
        <input
          id="description"
          name="description"
          value=${pureHtml ? marker.description : description}
          onChange=${(e) => setDescription(e.target.value)}
        />
      </div>
      <div class="input-group vertical">
        <label for="rate">Рейт</label>
        <input
          id="rate"
          name="rate"
          value=${pureHtml ? marker.rate : rate}
          type="number"
          onChange=${(e) => setRate(e.target.value)}
        />
      </div>
      <div class="row">
        <button class="form-button primary">
          ${id ? 'Сохранить' : 'Добавить'}
        </button>
        <button class="form-button" onClick=${onCancel}>Отмена</button>
      </div>
    </fieldset>
  </form> `;
};

export const ViewMarker = ({ marker = {} }) => html`<div
  class="col center"
  style=${{ 'min-width': '100px' }}
>
  <b class="label">${marker.name || '-'}</b>
  ${marker.description
    ? html`<p class="label">${marker.description}</p>`
    : null}
</div>`;

const PItem = ({
  id,
  name,
  rate,
  distance,
  removed,
  onRemove,
  onEdit,
  copyUrl,
  onCenter,
}) => html`<li
    class="row col-sm-12"
    key="${id}"
    onDClick=${onCenter}
    disabled=${removed}
    style=${{ cursor: 'pointer', borderBottom: '1px solid' }}
  >
    <div class="col-sm-8">
      <div>${name}</div>
      <div class="sub-title">${Rate(rate)} ${formatDistance(distance)}</div>
    </div>
    <div class="row col-sm-4 end">
      <${SmallIconButton}
        icon="assets/link.svg"
        tooltips="Скопировать линк"
        className="small"
        onClick=${copyUrl}
        disabled=${removed}
      />
      <${SmallIconButton}
        icon="assets/edit.svg"
        tooltips="Редактировать линк"
        className="small"
        onClick=${onEdit}
        disabled=${removed}
      />
      <${SmallIconButton}
        icon="assets/remove.svg"
        tooltips="Удалить все"
        className="small"
        onClick=${onRemove}
        disabled=${removed}
      />
    </div>
  </li>`;

export class Marks {
  constructor({ map, panel, markerStore }) {
    this.map = map;
    this.panel = panel;
    this.markerStore = markerStore;

    markerStore.onRefresh(() => {
      this.panel.refresh();
    });
  }

  async syncMarks() {
    this.markerStore.loadAll();
  }

  async copyUrl({ items }) {
    const text = composeUrlLink({
      zoom: this.map.getZoom() - 1,
      center: this.map.getCenter().reverse(),
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
    this.markerStore.downloadPlacemarks();
  }

  importPlacemarks(files) {
    this.markerStore.importPlacemarks(files);
  }

  removeItem(id) {
    this.markerStore.remove(id);
    this.panel.refresh();
  }

  onEdit(marker) {
    const modal = document.getElementById('marker-modal');
    modal.style.display = 'flex';
    const onCancel = () => {
      modal.style.display = 'none';
      modal.innerHTML = '';
    };
    const onSave = (mark) => {
      this.markerStore.update(mark);
      onCancel();
    };

    render(
      html`<${EditMarker}
        marker=${marker}
        onCancel=${onCancel}
        onSave=${onSave}
      />`,
      modal,
    );
  }

  onCenter(point) {
    this.map.flyTo({ center: point });
  }

  formatPlacemarks(placemarks) {
    const { lng, lat } = this.map.getCenter();
    const current = new window.mapboxgl.LngLat(lng, lat);
    const items = placemarks
      .map((item) => {
        const distance = current.distanceTo(
          new window.mapboxgl.LngLat(item.point.lng, item.point.lat),
        );
        return { ...item, distance };
      })
      .sort((a, b) => a.distance - b.distance);
    return items;
  }

  render() {
    const items = this.formatPlacemarks(this.markerStore.markers);
    return html` <ul class="col h-100" style=${{
      overflow: 'hidden auto',
      backgroundColor: 'aliceblue',
      margin: '0 5px 0 0',
    }}>
      ${items.map(
    ({
      id,
      name,
      description,
      rate,
      point,
      distance,
      removed,
      mapItem,
    }) => html`<${PItem}
          ...${{
    id,
    name,
    rate,
    distance,
    removed,
    onRemove: () => this.removeItem.bind(this)(id, mapItem),
    onEdit: () => this.onEdit.bind(this)({
      id,
      name,
      description,
      rate,
      point,
    }),
    onCenter: () => this.onCenter.bind(this)(point),
    copyUrl: () => this.copyUrl([{ id, name, point }]),
  }}
        />`,
  )}
    </ul>
    <div class="row inverse-color center">
      <label class="button small inverse" htmlFor="upload">
      Импорт
      </label>
      <input type="file" id="upload" onChange=${(e) => this.importPlacemarks(e.target.files)} hidden></input>
      <button class="col-sm-3 small inverse" onClick=${() => this.downloadPlacemarks()}>
        Экспорт
      </button>
      <button class="col-sm-3 small inverse" onClick=${() => this.syncMarks()}>
        Синхр.
      </button>
    </div>
    <div id="marker-modal" class="modal" style=${{ display: 'none' }}></div>`;
  }
}

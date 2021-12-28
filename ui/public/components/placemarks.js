import { html, render, Component } from "../libs/htm.js";
import { loadPlacemarksLocal, savePlacemarksLocal } from "../storage.js";
import { isMobile, getId, delay, postLarge } from "../utils.js";
import { composeUrlLink, parseUrlParams } from "../urlParams.js";
import { createAuth } from './auth.js'
import  {IconButton} from './common.js';
import '../libs/qrcode.js'

const blackStars = '★★★★★'
const whiteStars = '☆☆☆☆☆'

export const createPlacemarksPanel = ({ yandexMap }) => {
  const panel = { addItems: () => { }, refresh: () => { } };
  let authenticated = false

  let localItems = loadPlacemarksLocal();
  const init = localItems.map((p) => {
    const mapItem = yandexMap.addPlacemark(p);
    return { ...p, mapItem };
  });

  const auth = createAuth((value) => {
    console.log('on auth update', value)
    authenticated = value;
    panel.refresh()
  })

  const {resetToken} = parseUrlParams()
  if (resetToken) {
    auth.showPasswordReset()
  }

  const syncMarks = async (data) => {
    const items = data.map(({ id, name, description, rate, point, timestamp, removed }) => ({ id, name, description, rate, lat: point.lat, lng: point.lng, timestamp, removed }))
    // it returns all synced markers
    const res = await postLarge(`/marks/sync`, items)
    console.log('sync', res.length)
    const toSave = res
      .filter(item=>!!item.id)
      .map(({ id, name, description, rate, lng, lat, timestamp }) => ({ id, name, description, rate, point: { lat, lng }, timestamp }))
    savePlacemarksLocal(toSave)
    //todo make it without reload
    location.reload()
  }

  const copyUrl = async (items) => {
    const text = composeUrlLink({
      zoom: yandexMap.getZoom() - 1,
      center: yandexMap.getCenter().reverse(),
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
  };
  const downloadPlacemarks = (items) => {
    const toSore = items.map((p) => ({
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
  };
  const importPlacemarks = (files) => {
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
          .map(({ id, name, point, description, rate, removed, timestamp }) => ({ id, name, point, description, rate, removed, timestamp }));
        panel.addItems(items);
      } catch (e) {
        console.log("File content error:", e);
      }
    };
    reader.readAsText(files[0]);
  };

  const formatDistance = (distance) => {
    const d = Math.round(distance || 0);
    return d > 800 ? `${(d / 1000).toFixed(2)} км` : `${d} м`;
  };

  const PItem = ({ id, name, rate, point, distance, removed, onRemove, onEdit }) =>
    html`<li
      class="place-item"
      key="${id}"
      onClick=${() => yandexMap.setCenter([point.lat, point.lng])}
      disabled=${removed}
    >
      <div class="title">
        <div>${name}</div>
        <div class="sub-title">${Rate(rate)} ${formatDistance(distance)}</div>
      </div>
      <${IconButton}
        icon="assets/link.svg"
        tooltips="Скопировать линк"
        onClick=${() => copyUrl([{ id, name, point }])}
        disabled=${removed}
      />
      <${IconButton}
        icon="assets/edit.svg"
        tooltips="Редактировать линк"
        onClick=${() => onEdit([{ id, name, point }])}
        disabled=${removed}
      />
      <${IconButton}
        icon="assets/remove.svg"
        tooltips="Удалить все"
        onClick=${() => onRemove()}
        disabled=${removed}
      />
    </li>`;

  const Rate = (rate=0) => html`<div class="rate">${blackStars.substr(0, rate) + whiteStars.substr(0, 5 - rate)}</div>`;

  class App extends Component {
    componentDidMount() {
      panel.addItems = this.addItems.bind(this);
      panel.refresh = this.refresh.bind(this);
      this.setShowPanel(!isMobile());
      this.setState({
        placemarks: this.props.init,
        showPanel: !isMobile(),
        refresh: Date.now(),
        mapUrl: '',
      });
    }

    refresh() {
      this.setState({ refresh: Date.now() });
    }

    addItems(items) {
      const { placemarks } = this.state;
      const added = items.map(({ name, description, point }) => {
        const placemark = { id: getId(), name, description, point, timestamp: Date.now() };
        const mapItem = yandexMap.addPlacemark(placemark);
        return { ...placemark, mapItem };
      });

      const updatedPlacemarks = [...placemarks, ...added];
      this.setState({ placemarks: updatedPlacemarks });
      savePlacemarksLocal(updatedPlacemarks);
    }

    removeItem(id, mapItem) {
      const { placemarks } = this.state;
      const updatedPlacemarks = placemarks.map((p) => p.id === id? { ...p, removed: true } : p);
      if (mapItem) {
        yandexMap.geoObjects.remove(mapItem);
      }
      this.setState({ placemarks: updatedPlacemarks });
      savePlacemarksLocal(updatedPlacemarks);
    }

    onEdit(p) {
      yandexMap.onEditMark({
        ...p,
        onSubmit: (e) => {
          e.preventDefault();
          yandexMap.balloon.close();
          const formData = new FormData(e.target);
          const id = formData.get("id");
          const name = formData.get("name");
          const description = formData.get("description");
          const rate = +formData.get("rate")?+formData.get("rate"):0;
          const timestamp = Date.now()
          const { placemarks } = this.state;
          const updatedPlacemarks = placemarks.map((p) =>
            p.id === id ? { ...p, name, description, timestamp, rate } : p
          );
          this.setState({ placemarks: updatedPlacemarks });
          savePlacemarksLocal(updatedPlacemarks);
        },
      });
    }

    setShowPanel(value) {
      this.setState({ showPanel: value }, () => {
        delay(800, () => yandexMap.refreshMe()); // hack to let containers resize, then resize map
      });
    }

    formatPlacemarks(placemarks) {
      const center = yandexMap.getCenter();
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

    onShowQR() {
      const typeNumber = 4;
      const errorCorrectionLevel = 'L';
      const qr = window.qrcode(typeNumber, errorCorrectionLevel);
      const map = 'test'
      const mapUrl = `${location.origin}/download/${map}`
      qr.addData(mapUrl);
      qr.make();
      document.getElementById('qr').innerHTML = qr.createImgTag();
      this.setState({ mapUrl })
    }
    onCloseQR() {
      document.getElementById('qr').innerHTML = '';
      this.setState({ mapUrl: '' })
    }

    render({ }, { placemarks = [], showPanel, mapUrl }) {
      const items = this.formatPlacemarks(placemarks);
      return showPanel
        ? html` <div class="placemark">
                  <div class="header">
                    <div class="title">Метки</div>
                    <${IconButton}
                      icon="assets/close.svg"
                      onClick=${() => this.setShowPanel(false)}
                    />
                  </div>
                  <ul class="list">
                    ${items.map(
          (p) =>
            html`<${PItem}
                          ...${p}
                          onRemove=${() => this.removeItem(p.id, p.mapItem)}
                          onEdit=${() => this.onEdit(p)}
                        />`
        )}
                  </ul>
                  <div class="footer">
                  <div class="auth-sync">
                  ${authenticated
            ? html`<button class="icon-button footer-button" onClick=${() => syncMarks(placemarks)}>Sync Markers</button>
                    <button class="icon-button footer-button" onClick=${() => this.onShowQR()}>閙</button>
                    <div class="qr">
                    ${mapUrl ? html`<button class="icon-button footer-button qr-close" onClick=${() => this.onCloseQR()}>✕</button>` : null}
                    <div id="qr">
                    </div>
                    </div>
                    <button class="icon-button footer-button" onClick=${() => auth.logout()}>Logout</button>`
            : html`<button class="icon-button footer-button" onClick=${() => auth.showLogin()}>Login</button>/
                    <button class="icon-button footer-button" onClick=${() => auth.showSignUp()}>Sign Up</button>`}
                  </div>
                  <div class="import-export">
                    <label class="upload" htmlFor="upload">
                    Импорт
                    </label>
                    <input type="file" id="upload" onChange=${(e) =>
            importPlacemarks(e.target.files)} hidden></input>
                    <button class="icon-button footer-button" onClick=${() =>
            downloadPlacemarks(placemarks)}>
                      Экспорт
                    </button>
                  </div>
                  <a class="link" href="http://www.etomesto.ru/">карты c etomesto.ru</a>
                  <a class="link" href="https://github.com/mikhail-angelov/mapnn">
                  <img src="assets/github.svg"></img>исходники
                  </a>
                  </div>
                </div>`
        : html`<${IconButton}
            class="icon-button footer-button"
            icon="assets/place.svg"
            onClick=${() => this.setShowPanel(true)}
          />`;
    }
  }

  render(html`<${App} init=${init} />`, document.getElementById("placemarks"));

  return panel;
};

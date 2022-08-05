import { html, render, Component } from "../libs/htm.js";
import { loadPlacemarksLocal, savePlacemarksLocal, loadTripsLocal, saveTripsLocal } from "../storage.js";
import { isMobile, getId, delay, postLarge } from "../utils.js";
import { composeUrlLink, parseUrlParams } from "../urlParams.js";
import { createAuth } from './auth.js'
import { IconButton } from './common.js';
import { editTripPanel } from "./trip.js";
import '../libs/qrcode.js'

const blackStars = '★★★★★'
const whiteStars = '☆☆☆☆☆'

export const createPlacemarksPanel = ({ yandexMap }) => {
  const panel = { addItems: () => { }, refresh: () => { }, addTripItems: () => { } };
  let authenticated = false

  let localPlacemarkItems = loadPlacemarksLocal();
  let localTripItems = loadTripsLocal();
  const init = localPlacemarkItems.map((p) => {
    const mapItem = yandexMap.addPlacemark(p);
    return { ...p, mapItem };
  });
  const tripInit = localTripItems;

  const auth = createAuth((value) => {
    console.log('on auth update', value)
    authenticated = value;
    panel.refresh()
  })

  const { resetToken } = parseUrlParams()
  if (resetToken) {
    auth.showPasswordReset()
  }

  const syncMarks = async (data) => {
    const items = data.map(({ id, name, description, rate, point, timestamp, removed }) => ({ id, name, description, rate, lat: point.lat, lng: point.lng, timestamp, removed }))
    // it returns all synced markers
    const res = await postLarge(`/marks/sync`, items)
    console.log('sync', res.length)
    const toSave = res
      .filter(item => !!item.id)
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

    const TItem = ({ id, name, marks, removed, onRemove, onEdit }) =>
    html`<li
      class="place-item"
      key="${id}"
      disabled=${removed}
      onClick=${() => onEdit()}
    >
      <div class="title">
        <div>${name}</div>
      </div>
      <${IconButton}
        icon="assets/remove.svg"
        tooltips="Удалить все"
        onClick=${() => onRemove()}
        disabled=${removed}
      />
    </li>`;

  const Rate = (rate = 0) => html`<div class="rate">${blackStars.substr(0, rate) + whiteStars.substr(0, 5 - rate)}</div>`;

  const onEditTripList = ({ id, name, description, marks, onSubmit }) => {
    let trip = {
      id: id || "",
      name: name || "",
      description: description || "",
      marks: marks || "",
    }
    editTripPanel({trip, isOpenPanel: true, yandexMap });
    document.getElementById("onConfirmTrip").addEventListener("submit", onSubmit);
  };

  class App extends Component {
    componentDidMount() {
      panel.addItems = this.addItems.bind(this);
      panel.addTripItems = this.addTripItems.bind(this);
      panel.refresh = this.refresh.bind(this);
      this.setShowPanel(!isMobile());
      this.setShowTrip(false);
      this.setState({
        placemarks: this.props.init,
        showPanel: !isMobile(),
        showTrip: false,
        trips: this.props.tripInit,
        refresh: Date.now(),
        mapUrl: '',
      });
    }

    refresh() {
      this.setState({ refresh: Date.now() });
    }

    addItems(items) {
      const { placemarks } = this.state;
      const added = items.map(({ name, description, rate, point }) => {
        const placeMark = { id: getId(), name, description, rate, point, timestamp: Date.now() };
        const mapItem = yandexMap.addPlacemark(placeMark);
        return { ...placeMark, mapItem };
      });

      const updatedPlacemarks = [...placemarks, ...added];
      this.setState({ placemarks: updatedPlacemarks });
      savePlacemarksLocal(updatedPlacemarks);
    }

    removeItem(id, mapItem) {
      const { placemarks } = this.state;
      const updatedPlacemarks = placemarks.map((p) => p.id === id ? { ...p, removed: true } : p);
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
          const rate = +formData.get("rate") ? +formData.get("rate") : 0;
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

    onChangeTripList(t) {
      onEditTripList({
        ...t,
        onSubmit: (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          let id = formData.get("id");
          const name = formData.get("name");
          const description = formData.get("description");
          const timestamp = Date.now()
          const { trips } = this.state;
          let updatedTrips = undefined;
          if (!id) {
            const newTrip = { id: getId(), name, description, marks: "", timestamp };
            updatedTrips = [...trips, newTrip]
          } else {
            updatedTrips = trips.map((t) =>
            t.id === id ? { ...t, name, description, timestamp, } : t
          );
          }
          saveTripsLocal(updatedTrips);
          this.setState({ trips: updatedTrips });
          editTripPanel({trip: undefined, isOpenPanel: false, yandexMap });
        },
      });
    }

    setShowPanel(value) {
      this.setState({ showPanel: value }, () => {
        delay(800, () => yandexMap.refreshMe()); // hack to let containers resize, then resize map
      });
    }

    setShowTrip(value) {
      this.setState({ showTrip: value }, () => {
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
      location.href = '/admin';
      // const typeNumber = 4;
      // const errorCorrectionLevel = 'L';
      // const qr = window.qrcode(typeNumber, errorCorrectionLevel);
      // const map = 'test'
      // const mapUrl = `${location.origin}/download/${map}`
      // qr.addData(mapUrl);
      // qr.make();
      // document.getElementById('qr').innerHTML = qr.createImgTag();
      // this.setState({ mapUrl })
    }
    onCloseQR() {
      document.getElementById('qr').innerHTML = '';
      this.setState({ mapUrl: '' })
    }

    addTripItems(tripItems) {
      const { trips } = this.state;
      const added = tripItems.map(({ name, description, marks }) => {
        const trip = { id: getId(), name, description, marks: marks || "", timestamp: Date.now() };
        return trip;
      });

      const updatedTrips = [...trips, ...added];
      this.setState({ trips: updatedTrips });
      saveTripsLocal(updatedTrips);
    }

    removeTripItem(id) {
      const { trips } = this.state;
      console.log()
      const updatedTrips = trips.map((t) => t.id === id ? { ...t, removed: true } : t);
      this.setState({ trips: updatedTrips });
      saveTripsLocal(updatedTrips);
    }

    render({ }, { placemarks = [], showPanel, mapUrl, showTrip, trips = [] }) {
      const placemarkItems = this.formatPlacemarks(placemarks);
      return showPanel
        ? html` <div class="placemark">
                  <div class="header">
                    <button class="icon-button title" onClick=${() => this.setShowTrip(false)}>Метки</button>
                    <button class="icon-button title" onClick=${() => this.setShowTrip(true)}>Маршруты</button>
                    <${IconButton}
                      icon="assets/close.svg"
                      onClick=${() => this.setShowPanel(false)}
                    />
                  </div>
                  ${showTrip
                  ? html`<div class="trip-list">
                    <ul class="list">
                      ${trips.map(
                        (t) =>
                          html`<${TItem}
                          ...${t}
                          onRemove=${() => this.removeTripItem(t.id)}
                          onEdit=${() => this.onChangeTripList(t)}
                        />`
                      )}
                    </ul>
                    <div class="trip-button">
                      <${IconButton}
                        className="add"
                        icon="assets/add.svg"
                        tooltips="Добавить маршрут"
                        onClick=${() => this.onChangeTripList()}
                      />
                    </div>
                  </div>`
                  : html`<ul class="list">
                      ${placemarkItems.map(
                        (p) =>
                          html`<${PItem}
                          ...${p}
                          onRemove=${() => this.removeItem(p.id, p.mapItem)}
                          onEdit=${() => this.onEdit(p)}
                        />`
                      )}
                    </ul>`
                  }  
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

  render(html`<${App} init=${init} tripInit=${tripInit} />`, document.getElementById("placemarks"));

  return panel;
};

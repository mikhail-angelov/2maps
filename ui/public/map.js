import { loadOpacity } from "./storage.js";
import { parseUrlParams } from "./urlParams.js";
import { createOpacitySlider } from "./components/opacitySlider.js";
import { createPlacemarksPanel } from "./components/placemarks.js";
import { createSecondMap } from "./components/secondMap.js";
import { createMapLayer } from "./components/mapLayers.js";
import { isMobile, get, rateToColor } from "./utils.js";

let { zoom, center: position, name, opacity, placemarks: marks } = parseUrlParams();
let mapName = 'mende-nn';
const secondMap = createSecondMap(position, zoom, mapName);
opacity = opacity ? +opacity : loadOpacity();

ymaps.ready(() => {
  const yandexMap = new ymaps.Map(
    "ymap",
    {
      center: position.reverse(), // yandex point is in reverse order
      zoom: zoom + 1, // zoom is different by 1
      type: "yandex#hybrid",
    },
    {
      searchControlProvider: "yandex#search",
    }
  );

  const centerObject = new ymaps.Placemark(
    yandexMap.getCenter(),
    {},
    {
      preset: "islands#geolocationIcon",
    }
  );
  yandexMap.geoObjects.add(centerObject);

  yandexMap.events.add("actionend", function (e) {
    const [lat, lng] = e.originalEvent.map.getCenter();
    const z = e.originalEvent.map.getZoom();
    // console.log("on actionend", z, lat, lng);
    secondMap.setCenter({ lat, lng });
    secondMap.setZoom(z - 1);
    centerObject.geometry.setCoordinates(yandexMap.getCenter());
    panel.refresh();
  });

  yandexMap.events.add("actiontick", function (e) {
    centerObject.geometry.setCoordinates(yandexMap.getCenter());
    const [lat, lng] = e.originalEvent.map.getCenter();
    const z = e.originalEvent.map.getZoom();
    // console.log("on tickend", z, lat, lng);
    secondMap.setCenter({ lat, lng });
    secondMap.setZoom(z - 1);
    centerObject.geometry.setCoordinates(yandexMap.getCenter());
  });

  yandexMap.onEditMark = ({ id, name, description = '', point, rate = 0, onSubmit }) => {
    if (yandexMap.balloon.isOpen()) {
      yandexMap.balloon.close();
    }
    yandexMap.balloon
      .open([point.lat, point.lng], {
        contentHeader: `${id ? "Обновить метку" : "Добавить метку?"}`,
        contentBody: `<form id="onAdd">
        <p>Название: <input name="name" value="${name}"/></p>
        <p>Описание: <input name="description" value="${description}"/></p>
        <p>Рейт: <input name="rate" value="${rate}" type="number"/></p>
        <input name="point" value="${point.lat},${point.lng}" hidden/>
        <input name="id" value="${id}" hidden/>
        <p><sup>координаты: ${point.lat.toFixed(6)},${point.lng.toFixed(6)}</sup></p>
        <button>${id ? "Сохранить" : "Добавить"}</button></form>`,
      })
      .then(() => {
        document.getElementById("onAdd").addEventListener("submit", onSubmit);
      });
  };
  yandexMap.addPlacemark = ({ name, description, rate, point }) => {
    return addObject(name, description, rate, [point.lat, point.lng], "main");
  };

  yandexMap.events.add("contextmenu", function (e) {
    if (!yandexMap.balloon.isOpen()) {
      const [lat, lng] = e.get("coords");
      yandexMap.onEditMark({
        name: "",
        description: "...",
        rate: 0,
        point: { lat, lng },
        onSubmit: addMapItem,
      });
    } else {
      const point = yandexMap.balloon.getPosition();
      yandexMap.setCenter(point);
      yandexMap.balloon.close();
    }
  });
  yandexMap.events.add("balloonopen", function (e) {
    const copyButton = document.querySelector('.balloon .icon-button')
    copyButton?.addEventListener('click', () => {
      const inputValue = document.querySelector('.balloon input')
      const link = inputValue?.value
      console.log('copy', link)
      navigator.clipboard.writeText(link).then(() => {
        inputValue.value = 'copied'
        setTimeout(() => {
          inputValue.value = link
        }, 300)
      }, (err) => {
        console.error('oops: Could not copy text: ', err);
      });
    })
  });

  yandexMap.refreshMe = () => {
    yandexMap.container.fitToViewport();
    secondMap.resize();
  };

  createOpacitySlider(opacity, (value) => {
    const mapElements = document.querySelectorAll("#ymap");
    mapElements.forEach((e) => (e.style.opacity = value / 100));
    secondMap.setOpacity(value / 100);
  });
  marks.forEach((p) => addMark(p));
  const panel = createPlacemarksPanel({ yandexMap });
  get('/tiles/list').then((mapList) => {
    createMapLayer({mapList, map: secondMap});
  })

  if (isMobile()) {
    document.getElementById("slider").setAttribute('class', 'map-overlay mobile')
  } else {
    document.getElementById("slider").setAttribute('class', 'map-overlay desktop')
  }

  if (name) {
    const mark = addMark({ name, description: '', point: { lat: position[0], lng: position[1] } });
    mark.balloon.open()
  }

  function addMapItem(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const description = formData.get("description");
    const rate = +formData.get("rate") ? +formData.get("rate") : 0;
    console.log('-', rate, formData.get("rate"), formData )
    const [lat, lng] = yandexMap.balloon.getPosition();
    yandexMap.balloon.close();
    panel.addItems([{ name, description, rate, point: { lat, lng } }]);
  }
  function addBalloon(name, description, rate, coords) {
    const n = encodeURIComponent(name)
    const d = encodeURIComponent(description)
    return `<div class="balloon">
      <h4 style="display: flex;"><div style="width:20px;height:20px;border-radius:50%;margin-right:10px;background-color:${rateToColor(rate)};"></div>${name}</h4>
      <p>${description}</p>
      <div class="row"><a href="https://app.onesoil.ai/@${coords[0]},${coords[1]},14z" target="__blank">OneSoil link</a></div>
      <div class="row">
        <input disabled value="${location.origin}/?center=${coords[1]},${coords[0]}&name=${n}&description=${d}"/>
        <button class="icon-button">
          <img src="assets/copy.svg"></img>
        </button>
      </div>
      </div>`
  }

  function addObject(name, description = "", rate = 0, coords, type) {
    const placemark = new ymaps.Placemark(
      coords,
      {
        balloonContent: addBalloon(name, description, rate, coords),
        hintContent: `${name}:${description}`,
        hintOptions: {
          maxWidth: 100,
          showTimeout: 200,
        },
      },
      {
        iconColor: rateToColor(rate),
        preset:
          type === "guest"
            ? "islands#greenCircleDotIcon"
            : "islands#blueCircleDotIcon",
      }
    );
    yandexMap.geoObjects.add(placemark);
    return placemark;
  }
  function addMark({ name, description, rate, point }) {
    return addObject(name, description, rate, [point.lat, point.lng], "guest");
  }
});

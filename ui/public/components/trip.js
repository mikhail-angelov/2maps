import { html, render } from "../libs/htm.js";
import { IconButton } from './common.js';
import { delay } from "../utils.js";

export const editTripPanel = ({ trip, isOpenPanel, yandexMap }) => {
  delay(800, () => yandexMap.refreshMe())
  render(
    html`<${EditTripPanel} trip=${trip} isOpenPanel=${isOpenPanel} yandexMap=${yandexMap}/>`,
    document.getElementById("trip")
  );
};

const EditTripPanel = ({ trip, isOpenPanel, yandexMap }) => {
  return trip && isOpenPanel
    ? html`<div class="edit-trip-panel">
      <div class="header">
        <${IconButton}
          icon="assets/close.svg"
          onClick=${() => editTripPanel({trip: undefined, isOpenPanel: false, yandexMap})}
        />
        <div class="label">${trip.id ? "Сохранить" : "Добавить"} Маршрут</div>
      </div>
      <form id="onConfirmTrip">
        <p>Название: <input required name="name" value="${trip.name}"/></p>
        <p>Описание: <input name="description" value="${trip.description}"/></p>
        <input name="id" value="${trip.id}" hidden/>
        <button>${trip.id ? "Сохранить" : "Добавить"}</button>
      </form>
    </div>`
    : null;
};

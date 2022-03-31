import { html, render, useState } from "../libs/htm.js";
import { IconButton } from './common.js';

const Maps = {
    Yandex: "yandex",
    MapBox: "mapBox"
}

const Wikimapia = ({ map }) => {
    const [enabled, setEnabled] = useState(false);
    const [mainMap, setMainMap] = useState(Maps.Yandex);

    const onToggle = () => {
        setEnabled(!enabled)
        map.toggleWiki(!enabled)
        if (enabled) {
            setMainMap(Maps.Yandex)
            map.toggleMap(false)
        }
    }
    const onToggleSetMap = () => {
        if (mainMap === Maps.MapBox) {
            setMainMap(Maps.Yandex)
        } else {
            setMainMap(Maps.MapBox)
        }
        map.toggleMap(mainMap === Maps.Yandex)
    }

    return enabled ?
        html`<div>
        <${IconButton} className="layer-icon" icon="assets/disableWiki.svg" onClick=${onToggle} />
        <${IconButton} className="layer-icon" icon=${mainMap === Maps.Yandex ? "assets/mb.svg" : "assets/yandex.svg"} onClick=${onToggleSetMap} />
        </div>` :
        html`<${IconButton} className="layer-icon" icon="assets/wiki.svg" onClick=${onToggle} />`
}

export const createWikimapia = (map) => {
    render(html`<${Wikimapia} map=${map} />`, document.getElementById("wiki"));
}
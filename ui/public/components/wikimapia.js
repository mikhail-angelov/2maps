import { html, render, useState } from "../libs/htm.js";
import { IconButton } from './common.js';

const Wikimapia = ({ map }) => {
    const [enabled, setEnabled] = useState(false);

    const onToggle = () => {
        setEnabled(!enabled)
        map.toggleWiki(!enabled)
    }

    return enabled ?
        html`<${IconButton} className="layer-icon" icon="assets/disableWiki.svg" onClick=${onToggle} />` :
        html`<${IconButton} className="layer-icon" icon="assets/wiki.svg" onClick=${onToggle} />`
}

export const createWikimapia = (map) => {
    render(html`<${Wikimapia} map=${map} />`, document.getElementById("wiki"));
}
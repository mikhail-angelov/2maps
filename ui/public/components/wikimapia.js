import { html, render, useState } from "../libs/htm.js";
import { IconButton } from './common.js';
import { get } from "../utils.js";

const delay = (d)=>new Promise(cb=>setTimeout(cb, d))
const loadWiki = async (sw, ne) => {
    const url = `http://api.wikimapia.org/?function=box&bbox=${sw.lng},${sw.lat},${ne.lng},${ne.lat}&key=example&count=100&format=json`
    const items = []
    let data = null
    try {
        let data = await get(url)
        if(data.debug){
            throw data.debug.message
        }
        const found = +data.found
        let loaded = data.count
        let page = 1
        items.push(...data.folder)
        console.log('loaded of ', found, page, loaded)
        while (loaded < found && page < 1000) {
            page++
            await delay(30000) // 30 sec, to avoid wikimapia limits
            data = await get(`${url}&page=${page}`)
            if(data.debug){
                throw data.debug.message
            }
            loaded += data.count
            items.push(...data.folder)
            console.log('loaded of ', found, page, loaded)
        }
    } catch (e) {
        console.log('error ', e, data)
        alert(e)
        //message: 'Maximum number (10000) of objects per area reached. Request smaller area to get other places.'
    }
    return items
}
const toFeature = (data) => {
    if (!data?.polygon || data.polygon.length < 3) {
      return null
    }
    const coordinates = data.polygon.map((item) => [item.x, item.y])
    return {
      type: 'Feature',
      id: data.id,
      name: data.name,
      properties: {
        title: data.name,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    }
  }

const Wikimapia = ({ map }) => {
    const [enabled, setEnabled] = useState(false);

    const onToggle = () => {
        setEnabled(!enabled)
        if (!enabled) {
            onRefresh()
        } else {
            map.refreshWiki([])
        }
    }
    const onRefresh = async () => {
        const zoom = map.getZoom();
        if (zoom < 12) {
            alert('refresh wiki on zoom 12 and above')
            return
        }
        const bounds = map.getBounds();
        console.log(bounds)
        let features = await loadWiki(bounds.getSouthWest(), bounds.getNorthEast())
        map.refreshWiki(features.map(toFeature))
    }

    return enabled ?
        html`<div>
        <${IconButton} className="layer-icon" icon="assets/refreshWeb.svg" onClick=${onRefresh} />
        <${IconButton} className="layer-icon" icon="assets/disableWiki.svg" onClick=${onToggle} />
        </div>` :
        html`<${IconButton} className="layer-icon" icon="assets/wiki.svg" onClick=${onToggle} />`
}

export const createWikimapia = (map) => {
    render(html`<${Wikimapia} map=${map} />`, document.getElementById("wiki"));
}
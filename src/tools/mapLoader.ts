import _ from 'lodash'
import axios from 'axios'
import rdl from 'readline'
import fs from 'fs'
import { createDBConnection, closeConnections } from '../tilesDb'
import { Tile } from '../entitiesMap/tile'

const loader = async (url: string): Promise<any> => {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'curl/7.64.1',
      'Accept': '*/*',
    }
  })
  return response.data
}

const tileXYToQuadKey = (tileX: number, tileY: number, levelOfDetail: number): string => {
  let quadKey = ''
  for (let i = levelOfDetail; i > 0; i--) {
    let digit = 0;
    let mask = 1 << (i - 1);
    if ((tileX & mask) != 0) {
      digit++;
    }
    if ((tileY & mask) != 0) {
      digit++;
      digit++;
    }
    quadKey = quadKey + `${digit}`
  }
  return quadKey;
}
// `https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/${this.tileXYToQuadKey(x,y,z)}?mkt=ru-RU&it=G,LC,BX,RL&shading=t&n=z&og=1489&cstl=vb&o=webp`


const latLngToTileIndex = ({ lat, lng, zoom }: { lat: number, lng: number, zoom: number }) => {
  const n = Math.pow(2, zoom)
  const xtile = Math.floor(n * ((lng + 180) / 360))
  const latRad = lat * Math.PI / 180
  const ytile = Math.floor((1.0 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2.0 * n)
  return [xtile, ytile]
}

const indexTileToLatLng = ({ xtile, ytile, zoom }: { xtile: number, ytile: number, zoom: number }) => {
  const n = Math.pow(2, zoom)
  const lon = xtile / n * 360.0 - 180.0
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * ytile / n)))
  const lat = latRad * 180 / Math.PI
  return [lat, lon]
}

const progress = (value: any, cursor: number = 1) => {
  rdl.cursorTo(process.stdout, cursor, 0);
  process.stdout.write(value)
}
const downloadMap = async ({ url, name }: { url: string, name: string }) => {
  let start = Date.now() / 1000
  const fileName = `./tmp/${name}.sqlitedb`
  try {
    fs.unlinkSync(fileName)
  } catch (e) { }
  console.log('start load', name, url, start)
  const connection = await createDBConnection( name )
  // await connection.query('CREATE TABLE tiles (x int, y int, z int, s int, image blob, PRIMARY KEY (x,y,z,s));')
  await connection.query('CREATE INDEX IND on tiles (x,y,z,s)')


  const leftBottom = { lat: 56.963702, lng: 42.977057 }
  const rightTop = { lat: 55.191112, lng: 46.121449 }
  let cursor = 4
  let zz = 4
  let zz_end = 13
  let s = 0
  try {
    for (let zoom = zz; zoom <= zz_end; zoom++) {
      let startZoom = Date.now() / 1000
      let count = 0
      let [xx, yy] = latLngToTileIndex({ ...leftBottom, zoom })
      let [xx_end, yy_end] = latLngToTileIndex({ ...rightTop, zoom })
      const total = (xx_end - xx + 1) * (yy_end - yy + 1)
      console.log('start zoom', zoom, '/', zz_end, total, 'tiles')
      cursor++
      for (let x = xx; x <= xx_end; x++) {
        for (let y = yy; y <= yy_end; y++) {
          // const url = `https://a.tile.openstreetmap.org/${zoom}/${x}/${y}.png`
          const url = `http://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${zoom}`
          try {
            const image = await loader(url)
            s++
            await connection.getRepository(Tile).insert({ x, y, z: zoom, s, image });
            count++;
            progress(`${count}/${total} - ${Date.now() / 1000 - startZoom} | ${x}-${y}`, cursor)
            startZoom = Date.now() / 1000
          } catch (e) {
            console.log('error load tile', x, y, zoom, e)
          }
        }
      }
    }
  } catch (e) {
    console.log('opps, load error', name, e)
    throw 'cancel on error'
  }
  console.log('end load', name, Date.now() / 1000 - start)
  await closeConnections()

  return { status: 'ok' }
}

// downloadMap({ url: '', name: 'test' })

const TILE_SIZE = 256;

function createInfoWindowContent(lat: number, lng: number, zoom: number) {
  const scale = 1 << zoom;
  const [x, y] = project(lat, lng);
  const pixelCoordinate = [
    Math.floor(x * scale),
    Math.floor(y * scale)
  ];
  const tileCoordinate = [
    Math.floor((x * scale) / TILE_SIZE),
    Math.floor((y * scale) / TILE_SIZE)
  ];
  console.log(pixelCoordinate, tileCoordinate);
  return [
    "Chicago, IL",
    "Zoom level: " + zoom,
    "Pixel Coordinate: " + pixelCoordinate,
    "Tile Coordinate: " + tileCoordinate,
  ].join("<br>");
}

// The mapping between latitude, longitude and pixels is defined by the web
// mercator projection.
function project(lat: number, lng: number) {
  let siny = Math.sin((lat * Math.PI) / 180);

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  siny = Math.min(Math.max(siny, -0.9999), 0.9999);
  return [TILE_SIZE * (0.5 + lng / 360), TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI))];
}

const leftTop = { lat: 56.852812, lng: 43.360428 }
const rightBottom = { lat: 554.977790, lng: 45.859073 }

createInfoWindowContent(56.32407255482896, 44.005093481506336, 14)

console.log(latLngToTileIndex({ lat: 56.32407255482896, lng: 44.005093481506336, zoom: 14 }))

downloadMap({ url: 'google', name: 'google' })
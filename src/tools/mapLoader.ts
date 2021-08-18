import _ from 'lodash'
import axios from 'axios'
import rdl from 'readline'
import fs from 'fs'
import { createDBConnection, closeConnection } from '../db'
import { EtoMesto } from '../entities/etoMesto'

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
  const connection = await createDBConnection({ file: fileName, name })
  // await connection.query('CREATE TABLE tiles (x int, y int, z int, s int, image blob, PRIMARY KEY (x,y,z,s));')
  await connection.query('CREATE INDEX IND on tiles (x,y,z,s)')


  const leftBottom = { lat: 56.963702, lng: 42.977057 }
  const rightTop = { lat: 55.191112, lng: 46.121449 }
  let cursor = 4
  let zz = 0
  let zz_end = 14

  try {
    for (let zoom = zz; zoom <= zz_end; zoom++) {
      let s = Date.now() / 1000
      let count = 0
      let [xx, yy] = latLngToTileIndex({ ...leftBottom, zoom })
      let [xx_end, yy_end] = latLngToTileIndex({ ...rightTop, zoom })
      const total = (xx_end - xx + 1) * (yy_end - yy + 1)
      console.log('start zoom', zoom, '/', zz_end, total, 'tiles')
      cursor++
      for (let x = xx; x <= xx_end; x++) {
        for (let y = yy; y <= yy_end; y++) {
          const url = `https://a.tile.openstreetmap.org/${zoom}/${x}/${y}.png`
          const image = await loader(url)
          await connection.getRepository(EtoMesto).insert({ x, y, z: zoom, s: 0, image });
          count++;
          progress(`${count}/${total} - ${Date.now() / 1000 - s} | ${x}-${y}`, cursor)
          s = Date.now() / 1000
        }
      }
    }
  } catch (e) {
    console.log('opps, load error', name, e)
    throw 'cancel on error'
  }
  console.log('end load', name, Date.now() / 1000 - start)
  await closeConnection(connection)

  return { status: 'ok' }
}

downloadMap({ url: '', name: 'test' })
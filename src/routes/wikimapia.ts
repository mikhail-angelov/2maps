import { CommonRoutesConfig, maxAge } from "./common";
import express from "express";
import axios from "axios";
import { gzipSync } from "zlib";
import * as vtpbf from "vt-pbf";
import geojsonVt from "geojson-vt";
import { DataSource, Repository } from "typeorm";
import { WikiTile } from "../entities.sqlite/wiki";

const VERSION = 1;

export class Wikimapia implements CommonRoutesConfig {
  wikiRepo: Repository<WikiTile>;
  constructor(db: DataSource) {
    this.wikiRepo = db.getRepository(WikiTile);
  }

  getRoutes() {
    const router = express.Router();
    router.get("/:z/:x/:y.mvt", async (req, res) => {
      const { x, y, z } = req.params;
      const coords = { x: +x, y: +y, z: +z };
      console.log("proxy");
      try {
        let tile = await this.getTile(coords);
        if (!tile || tile.version < VERSION) {
          const wikiTile = await getWikiTile(coords);
          const blob = gzipSync(Buffer.from(wikiTile));
          tile = tile
            ? await this.updateTile(tile.id, blob)
            : await this.addTile(coords, blob);
        }
        if (!tile) {
          console.error("cannot get wiki tile");
          res.status(400).send("error");
          return;
        }

        res.writeHead(200, {
          "Content-Type": "application/x-protobuf",
          "Content-Encoding": "gzip",
          "Cache-Control": `max-age=${maxAge}`,
        });
        res.end(tile.image, "binary");
      } catch (e) {
        console.error("get wiki tile error", e);
        res.status(400).send("error");
      }
    });
    return router;
  }
  async getTile(coords: Coord) {
    const tile = await this.wikiRepo.findOne({ where: coords });
    return tile;
  }
  async addTile(coords: Coord, image: Buffer) {
    return await this.wikiRepo.save({ ...coords, image, version: VERSION });
  }
  async updateTile(id: string, image: Buffer) {
    await this.wikiRepo.update(id, { image, version: VERSION });
    return await this.wikiRepo.findOne({ where: { id } });
  }
}

//todo: refactor it

interface Coord {
  x: number;
  y: number;
  z: number;
}
interface Place {
  type: string;
  properties: any;
  geometry: {
    type: string;
    coordinates: number[][];
  };
}
interface Tile {
  places: Place[];
  tileId: string;
  coords: {
    x: number;
    y: number;
    z: number;
  };
  hasChildren: boolean;
}

const getWikiTile = async (coords: Coord) => {
  const url = makeTileUrl(coords);
  const resp = await axios.get(url);
  const features = await parseTile(resp.data, {});
  const tileindex = geojsonVt({
    type: "FeatureCollection",
    features: features.places,
  });
  const tile = tileindex.getTile(coords.z, coords.x, coords.y);
  const buff = vtpbf.fromGeojsonVt({ wikiLayer: tile }, { version: 2 });
  console.log("getWikiTile", url.replace, resp.data.length, buff.length);
  return buff;
};

// (1233,130,5) -> "032203"
/* tslint:disable:no-bitwise */
function getTileId({ x, y, z }: Coord) {
  const id = [];
  y = (1 << z) - y - 1;
  z += 1;
  while (z) {
    id.push((x & 1) + (y & 1) * 2);
    x >>= 1;
    y >>= 1;
    z -= 1;
  }
  return id.reverse().join("");
}
/* tslint:enable:no-bitwise */

function makeTileUrl(coords: Coord) {
  const tileId = getTileId(coords);
  const urlPath = tileId.replace(/(\d{3})(?!$)/gu, "$1/"); // "033331022" -> "033/331/022"
  return `http://wikimapia.org/z1/itiles/${urlPath}.xy?998736`;
}

/* tslint:disable:no-bitwise */
function tileIdToCoords(tileId: string) {
  const z = tileId.length - 1;
  let x = 0;
  let y = 0;
  for (const id of tileId) {
    const c = parseInt(id, 10);
    x <<= 1;
    y <<= 1;
    x += c & 1;
    y += c >> 1;
  }
  y = (1 << z) - y - 1;
  return { x, y, z };
}
/* tslint:enable:no-bitwise */

// function getWikimapiaTileCoords(coords: Coord, viewTileSize: number) {
//   let z = coords.z - 2;
//   if (z < 0) {
//     z = 0;
//   }
//   if (z > 15) {
//     z = 15;
//   }
//   const q = 2 ** (z - coords.z + Math.log2(viewTileSize / 256));
//   let x = Math.floor(coords.x * q),
//     y = Math.floor(coords.y * q);
//   return { x, y, z };
// }

function decodeTitles(s: string) {
  const titles: any = {};
  for (const title of s.split("\x1f")) {
    if (title.length > 2) {
      const langCode = title.charCodeAt(0) - 32;
      titles[langCode.toString()] = title.substring(1);
    }
  }
  return titles;
}

function chooseTitle(titles: any) {
  const popularLanguages = [
    "1",
    "0",
    "3",
    "2",
    "5",
    "4",
    "9",
    "28",
    "17",
    "27",
  ];
  for (const langCode of popularLanguages) {
    if (langCode in titles) {
      return titles[langCode];
    }
  }
  for (const langCode of Object.keys(titles)) {
    return titles[langCode];
  }
  return "";
}

/* tslint:disable:no-bitwise */
function decodePolygon(s: string) {
  let i = 0;
  const coords = [];
  let lat = 0;
  let lng = 0;
  while (i < s.length) {
    let p;
    let l = 0;
    let c = 0;
    do {
      p = s.charCodeAt(i++) - 63; // eslint-disable-line no-plusplus
      c |= (p & 31) << l;
      l += 5;
    } while (p >= 32);
    lng += c & 1 ? ~(c >> 1) : c >> 1;
    l = 0;
    c = 0;
    do {
      p = s.charCodeAt(i++) - 63; // eslint-disable-line no-plusplus
      c |= (p & 31) << l;
      l += 5;
    } while (p >= 32);
    lat += c & 1 ? ~(c >> 1) : c >> 1;
    coords.push([lat / 1e6, lng / 1e6]);
  }
  return coords;
}
/* tslint:enable:no-bitwise */

function asap() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function simplifyPolygon(
  latlngs: number[][],
  tileCoords: Coord,
  tileHasChildren: boolean,
  projectObj: any
) {
  // const
  //     x = tileCoords.x * 1024,
  //     y = tileCoords.y * 1024,
  // p0 = projectObj.unproject([x, y], tileCoords.z + 2),
  // p1 = projectObj.unproject([x + 1, y + 1], tileCoords.z + 2);
  // let pixelDegSize = p0.lat - p1.lat;
  // if (!tileHasChildren && tileCoords.z < 15) {
  //     pixelDegSize /= (1 << (15 - tileCoords.z));
  // }
  const points = [];
  for (const ll of latlngs) {
    points.push({ x: ll[1], y: ll[0] });
  }
  //todo: investigate
  // points = L.LineUtil.simplify(points, pixelDegSize * 2);
  latlngs = [];
  for (const p of points) {
    latlngs.push([p.x, p.y]);
  }
  return latlngs;
}

async function parseTile(s: string, projectObj: any) {
  const tile: Tile = {
    places: [],
    tileId: "",
    coords: { x: 0, y: 0, z: 0 },
    hasChildren: false,
  };
  const places = tile.places;
  const lines = s.split("\n");
  if (lines.length < 1) {
    throw new Error("No data in tile");
  }
  const fields0 = lines[0].split("|");
  const tileId = fields0[0];
  if (!tileId || !tileId.match(/^[0-3]+$/u)) {
    throw new Error("Invalid tile header");
  }
  tile.tileId = tileId;
  tile.coords = tileIdToCoords(tileId);
  tile.hasChildren = fields0[1] === "1";

  // FIXME: ignore some errors
  let prevTime = Date.now();
  for (const line of lines.slice(2)) {
    const curTime = Date.now();
    if (curTime - prevTime > 20) {
      await asap();
      prevTime = Date.now();
    }
    const place: Place = {
      type: "Feature",
      properties: { name: "", id: 0 },
      geometry: {
        // "type": "Polygon",
        type: "LineString",
        coordinates: [[]],
      },
    };
    const fields = line.split("|");
    if (fields.length < 6) {
      continue;
    }
    const placeId = fields[0];
    if (!placeId.match(/^\d+$/u)) {
      // throw new Error('Invalid place id');
      continue;
    }
    place.properties.id = parseInt(placeId, 10);
    place.properties.name = chooseTitle(decodeTitles(fields[5]));
    if (fields[6] !== "1") {
      throw new Error(
        `Unknown wikimapia polygon encoding type: "${fields[6]}"`
      );
    }

    const bounds = fields[2].match(/^([-\d]+),([-\d]+),([-\d]+),([-\d]+)$/u);
    if (!bounds) {
      throw new Error("Invalid place bounds");
    }
    // place.boundsWESN = bounds.slice(1).map((x) => parseInt(x, 10) / 1e7);

    const c = fields.slice(7).join("|");

    const coords = decodePolygon(c);
    if (coords.length < 3) {
      throw new Error(`Polygon has ${coords.length} points`);
    }
    const polygon = simplifyPolygon(
      coords,
      tile.coords,
      tile.hasChildren,
      projectObj
    );
    place.geometry.coordinates = polygon;
    // place.localPolygon = makeCoordsLocal(polygon, tile.coords, projectObj);
    places.push(place);
  }
  return tile;
}

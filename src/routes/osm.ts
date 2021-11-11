import { CommonRoutesConfig, maxAge } from './common';
import express from 'express';
import { Connection } from "typeorm";
import { MbTile } from '../entities/mbTile'


export class OsmTiles implements CommonRoutesConfig {
  db: Connection
  constructor(db: Connection) {
    this.db = db;
  }

  getRoutes() {
    const router = express.Router();
    // (we'll add the actual route configuration here next)
    router.get("/:z/:x/:y.pbf", async (req, res) => {
      const { x, y, z } = req.params;
      console.log("osm", req.params);
      const tile = await this.onTile(+x, +y, +z);
      if (!tile) {
        return res.status(404).send("out of range");
      }

      res.writeHead(200, {
        "Content-Type": "application/x-protobuf",
        "Content-Encoding": "gzip",
        "Cache-Control": `max-age=${maxAge}`,
      });
      res.end(tile.tileData, "binary");
    });
    return router;
  }

  async onTile(x: number, y: number, z: number) {
    try {
      const tileRow = 2 ** z - y - 1
      const tile = await this.db.getRepository(MbTile).findOne({ tileColumn: x, zoomLevel: z, tileRow });
      return tile;
    } catch (e) {
      console.error("err", e);
      return null;
    }
  }

}
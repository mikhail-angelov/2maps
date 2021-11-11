import { CommonRoutesConfig, maxAge } from './common';
import express from 'express';
import { Connection } from "typeorm";
import { EtoMesto } from '../entities/etoMesto'

export class MendeTiles implements CommonRoutesConfig {
  db: Connection
  constructor(db: Connection) {
    this.db = db;
  }

  getRoutes() {
    const router = express.Router();
    // (we'll add the actual route configuration here next)
    router.get("/:z/:x/:y.jpg", async (req, res) => {
      const { x, y, z } = req.params;
      const tile = await this.onTile(+x, +y, +z);
      if (!tile) {
        console.log("mende out of range", req.params);
        return res.status(404).send("out of range");
      }
      res.writeHead(200, {
        "Content-Type": "image/jpeg",
        "Cache-Control": `max-age=${maxAge}`
      });
      res.end(tile.image, "binary");
    });
    return router;
  }

  async onTile(x: number, y: number, z: number) {
    try {
      //this is translation standard mercator x/y/z to DB format
      const zoom = 17 - z;
      if (!x || !y || zoom > 7 || zoom < 3) {
        return null;
      }
      const tile = await this.db.getRepository(EtoMesto).findOne({ x, y, z: zoom })
      return tile;

    } catch (e) {
      console.warn("mende error", e);
      return null;
    }
  }

}
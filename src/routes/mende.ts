import { CommonRoutesConfig } from './common';
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
    router.get("/:z/:x/:y.jpg", (req, res) => {
      const { x, y, z } = req.params;
      const zoom = 17 - +z;
      if (!x || !y || zoom > 7 || zoom < 3) {
        return res.status(404).send("out of range");
      }
      //this is translation standard mercator x/y/z to DB format
      console.log("map", req.params);
      this.onTile(+x, +y,  zoom, res);
    });
    return router;
  }

  async onTile(x: number, y: number, z: number, res: express.Response) {
    try {
      const tile = await this.db.getRepository(EtoMesto).findOne({ x, y, z })
      if (!tile) {
        return res.status(404).send("out of range");
      }

      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(tile.image, "binary");
    } catch (e) {
      console.error("err", e);
      res.status(404).send("out of range");
    }
  }

}
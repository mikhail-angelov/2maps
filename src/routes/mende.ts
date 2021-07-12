import { CommonRoutesConfig } from './common';
import express from 'express';
import { Connection } from "typeorm";
import { EtoMesto } from '../entities/etoMesto'

export class MendeTiles extends CommonRoutesConfig {
  db: Connection
  constructor(app: express.Application, db: Connection) {
    super(app, 'MendeTiles');
    this.db = db;
  }

  configureRoutes() {
    // (we'll add the actual route configuration here next)
    this.app.get("/map/mende/:z/:x/:y.jpg", (req, res) => {
      const { x, y, z } = req.params;
      const zoom = 17 - +z;
      if (!x || !y || zoom > 7 || zoom < 3) {
        return res.status(404).send("out of range");
      }
      //this is translation standard mercator x/y/z to DB format
      console.log("map", req.params);
      this.onTile(+x, +y, 17 - +z, res);
    });
    return this.app;
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
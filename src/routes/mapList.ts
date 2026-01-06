import { CommonRoutesConfig, maxAge } from './common';
import express from 'express';
import fs from 'fs';
import { DataSource, In } from "typeorm";
import { getTile } from "../tilesDb";
import { TileSource } from '../entities.sqlite/tileSource'

export class MapList implements CommonRoutesConfig {
  db: DataSource
  constructor(db: DataSource) {
    this.db = db;
    try {
      this.refineTileSourcesInDB()
    } catch (e) {
      console.error(e)
    }
  }
  async refineTileSourcesInDB() {
    const files = fs.readdirSync(`${__dirname}/../../data`)
    console.log('files', files)
    const mapFiles = files.filter(f => f.endsWith('.mbtiles') && !f.startsWith('user')).map(f => f.replace('.mbtiles', ''))

    const existingSources = await this.db.getRepository(TileSource).find()
    const existingKeys = existingSources.map(({ key }) => key)
    const newSources = mapFiles.filter((key) => key && !existingKeys.includes(key)).map(key => ({ key, name: key, description: key }))
    if (newSources.length > 0) {
      await this.db.getRepository(TileSource).save(newSources)
    }
    const missingSources = existingSources.filter(({ key }) => !mapFiles.includes(key)).map(({ key }) => key)
    if (missingSources.length > 0) {
      await this.db.getRepository(TileSource).delete({ key: In(missingSources) })
    }
  }
  getRoutes() {
    const router = express.Router();
    router.get("/:name/:z/:x/:y.jpg", async (req, res) => {
      try {
        const { name, x, y, z } = req.params;
        const tile = await this.onTile(name, +x, +y, +z);
        if (!tile) {
          console.log("tile out of range", req.params);
          return res.status(404).send("out of range");
        }
        res.writeHead(200, {
          "Content-Type": "image/jpeg",
          "Cache-Control": `max-age=${maxAge}`
        });
        res.end(tile.tileData, "binary");
      } catch (e) {
        console.error(e)
        res.status(404).send("error")
      }
    });
    router.get("/list", async (req, res) => {
      try {
        const list = await this.db.getRepository(TileSource).find();
        const result = list.map(({ key, name, description }) => ({ key, name, description }));
        res.status(200).json(result)
      } catch (e) {
        console.log('get list error', e)
        res.status(400).json({ error: 'invalid request' })
      }

    });
    return router;
  }

  async onTile(name: string, x: number, y: number, z: number) {
    try {
      if (!name || !x || !y || !z || z < 3) {
        return null;
      }
      const tile = await getTile({ name, x, y, z })
      return tile;

    } catch (e) {
      console.warn("get tile error", e);
      return null;
    }
  }

}
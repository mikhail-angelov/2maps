import { CommonRoutesConfig, maxAge } from './common';
import express from 'express';
import fs from 'fs';
import { DataSource, In } from "typeorm";
import { getTile } from "../tilesDb";
import { TileSource } from '../entities.sqlite/tileSource'
import sqlite3 from 'sqlite3';

const getTileFormat = (name: string): Promise<string> => {
  return new Promise((resolve) => {
    const path = `${__dirname}/../../data/${name}.mbtiles`;
    const db = new sqlite3.Database(path, sqlite3.OPEN_READONLY, (err) => {
      if (err) return resolve('jpg');
    });
    db.get("SELECT value FROM metadata WHERE name='format' LIMIT 1", (err, row: any) => {
      db.close();
      if (err || !row) return resolve('jpg');
      resolve(row.value || 'jpg');
    });
  });
};

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

    const serveTile = async (req: express.Request, res: express.Response, contentType: string) => {
      try {
        const { name, x, y, z } = req.params;
        const tile = await this.onTile(name, +x, +y, +z);
        if (!tile) {
          return res.status(404).send("out of range");
        }
        res.writeHead(200, {
          "Content-Type": contentType,
          "Cache-Control": `max-age=${maxAge}`
        });
        res.end(tile.tileData, "binary");
      } catch (e) {
        console.error(e);
        res.status(404).send("error");
      }
    };

    router.get("/:name/:z/:x/:y.jpg", (req, res) => serveTile(req, res, "image/jpeg"));
    router.get("/:name/:z/:x/:y.png", (req, res) => serveTile(req, res, "image/png"));
    router.get("/:name/:z/:x/:y.pbf", (req, res) => serveTile(req, res, "application/x-protobuf"));

    router.get("/list", async (req, res) => {
      try {
        const list = await this.db.getRepository(TileSource).find();
        const result = await Promise.all(
          list.map(async ({ key, name, description }) => {
            const format = await getTileFormat(key);
            return { key, name, description, format };
          })
        );
        res.status(200).json(result);
      } catch (e) {
        console.log('get list error', e);
        res.status(400).json({ error: 'invalid request' });
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
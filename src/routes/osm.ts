import express from 'express';
import { CommonRoutesConfig, maxAge } from './common';
import { getOSMTile } from '../mbTilesDb';

export class OsmTiles implements CommonRoutesConfig {

  getRoutes() {
    const router = express.Router();
    router.get("/:name/:z/:x/:y.pbf", async (req, res) => {
      try {
        const { name, x, y, z } = req.params;
        const tile = await getOSMTile({name, x:+x, y:+y, z:+z});
        if (!tile) {
          console.log("osm out of range", req.params);
          return res.status(404).send("out of range");
        }
        res.writeHead(200, {
          "Content-Type": "application/x-protobuf",
          "Content-Encoding": "gzip",
          "Cache-Control": `max-age=${maxAge}`,
        });
        res.end(tile.tileData, "binary");
      } catch (e) {
        console.error(e)
        res.status(404).send("error")
      }
    });
    return router;
  }
}
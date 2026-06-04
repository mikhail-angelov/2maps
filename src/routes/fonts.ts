import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { CommonRoutesConfig } from './common';

const FONTS_CACHE_DIR = process.env.FONTS_CACHE_DIR ||
  path.join(__dirname, '../../data/fonts-cache');

const UPSTREAM = 'https://demotiles.maplibre.org/font';

export class Fonts implements CommonRoutesConfig {
  getRoutes() {
    const router = express.Router();

    router.get('/:fontstack/:range.pbf', async (req, res) => {
      const { fontstack, range } = req.params;
      const cacheDir = path.join(FONTS_CACHE_DIR, fontstack);
      const cacheFile = path.join(cacheDir, `${range}.pbf`);

      try {
        if (fs.existsSync(cacheFile)) {
          res.set('Content-Type', 'application/x-protobuf');
          res.set('Cache-Control', 'public, max-age=86400');
          return res.sendFile(cacheFile);
        }

        const url = `${UPSTREAM}/${encodeURIComponent(fontstack)}/${range}.pbf`;
        const upstream = await fetch(url);
        if (!upstream.ok) {
          return res.status(404).send();
        }

        const buffer = Buffer.from(await upstream.arrayBuffer());

        fs.mkdirSync(cacheDir, { recursive: true });
        fs.writeFileSync(cacheFile, new Uint8Array(buffer));

        res.set('Content-Type', 'application/x-protobuf');
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(buffer);
      } catch (e) {
        console.error('fonts proxy error', e);
        res.status(500).send();
      }
    });

    return router;
  }
}

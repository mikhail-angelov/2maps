import { CommonRoutesConfig } from './common';
import express from 'express';
import multer from 'multer'
import _ from 'lodash'
import { CRequest } from '../../types/express'
import { Connection } from "typeorm";
import { Mark } from '../entities/mark'
import { Auth } from './auth'


const upload = multer()

const mapToEntity = ({ id, name, description, lat, lng, timestamp }: WebMark, userId: string): Mark => {
  return { id: id.toString(), name, description: description || '', lat, lng, userId, timestamp: timestamp || Date.now() }
}

export interface WebMark {
  id: string | number;
  name: string;
  description?: string;
  lat: number;
  lng: number;
  timestamp?: number;
  old?: boolean;
}

export class Marks implements CommonRoutesConfig {
  db: Connection
  auth: Auth
  constructor(db: Connection, auth: Auth) {
    this.db = db;
    this.auth = auth;
  }

  getRoutes() {
    const router = express.Router();
    router.post("/sync", this.auth.authMiddleware, upload.none(), async (req: CRequest, res: express.Response) => {
      try {
        const user = req.user
        const marks = await this.syncMarks(user, req.body)
        res.status(200).json(marks)
      } catch (e) {
        console.log('sync error', e)
        res.status(400).json({ error: 'invalid request' })
      }
    });
    router.post("/m/sync", this.auth.authMiddlewareMobile, upload.none(), async (req: CRequest, res: express.Response) => {
      try {
        const user = req.user
        const clientMarkers = JSON.parse(req.body.value)
        const marks = await this.syncMarks(user, clientMarkers)
        res.status(200).json(marks)
      } catch (e) {
        console.log('msync error', e)
        res.status(400).json({ error: 'invalid request' })
      }
    });
    return router;
  }

  async syncMarks({ id }: any, clientMarks: WebMark[]) {
    const marks = _.uniqBy(clientMarks, 'id')
    const marksMap = _.keyBy(marks, 'id')
    const savedMarks = await this.db.getRepository(Mark).find({ userId: id })
    for (let mark of savedMarks) {
      const existed = marksMap[mark.id]
      if (existed) {
        existed.old = true
        if (existed.timestamp && existed.timestamp < mark.timestamp) {
          await this.db.getRepository(Mark).update(mark.id, mapToEntity(existed, id))
        }
      }
    }

    const addedMarks = marks.filter(item => !item.old).map(item => mapToEntity(item, id))
    await this.db.getRepository(Mark).save(addedMarks)
    console.log('Added', addedMarks.length, 'marks')

    return await this.db.getRepository(Mark).find({ userId: id })
  }

}
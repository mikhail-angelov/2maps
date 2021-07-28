import { CommonRoutesConfig } from './common';
import express from 'express';
import { CRequest } from '../../types/express'
import { Connection } from "typeorm";
import { Mark } from '../entities/mark'
import { Auth } from './auth'


export interface WebMark {
  id: string;
  name: string;
  description?: string;
  lat: number;
  lng: number;
  timestamp: number;
  old: boolean;
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
    router.post("/sync", this.auth.authMiddleware, async (req: CRequest, res: express.Response) => {
      try {
        const user = req.user
        const marks = await this.syncMarks(user, req.body)
        res.status(200).json(marks)
      } catch (e) {
        res.status(400).json({ error: 'invalid request' })
      }
    });
    router.post("/m/sync", this.auth.authMiddlewareMobile, async (req: CRequest, res: express.Response) => {
      try {
        const user = req.user
        const marks = await this.syncMarks(user, req.body)
        res.status(200).json(marks)
      } catch (e) {
        res.status(400).json({ error: 'invalid request' })
      }
    });
    return router;
  }

  async syncMarks({ id }: any, marks: WebMark[]) {
    const marksMap = marks.reduce((acc: { [key: string]: WebMark }, mark) => ({ ...acc, [mark.id]: mark }), {})
    const savedMarks = await this.db.getRepository(Mark).find({ userId: id })
    for (let mark of savedMarks) {
      const existed = marksMap[mark.id]
      if (existed) {
        existed.old = true
        if (existed.timestamp < mark.timestamp) {
          await this.db.getRepository(Mark).update(mark.id, this.mapToEntity(existed, id))
        }
      }
    }

    const addedMarks = marks.filter(item => !item.old).map(item => this.mapToEntity(item, id))
    await this.db.getRepository(Mark).save(addedMarks)

    return await this.db.getRepository(Mark).find({ userId: id })
  }


  mapToEntity({ id, name, description, lat, lng, timestamp }: WebMark, userId: string): Mark {
    return { id, name, description, lat, lng, userId, timestamp }
  }

}
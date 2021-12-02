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
  id: string;
  name: string;
  description?: string;
  rate?: number;
  lat: number;
  lng: number;
  timestamp: number;
  removed?: boolean;
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
    router.post("/sync", this.auth.authMiddleware, upload.single('value'), async (req: CRequest, res: express.Response) => {
      try {
        const value = req?.file.buffer.toString('utf8')
        const user = req.user
        const marks = await this.syncMarks(user, JSON.parse(value))
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
    const savedMarks = await this.db.getRepository(Mark).find({ userId: id })
    const marksMap = _.keyBy(savedMarks, 'id')
    const marksToAdd = []
    const marksToUpdate = []
    const marksIdsToRemove = []
    for (let mark of marks) {
      const existed = marksMap[mark.id]
      if(!existed && !mark.removed) {
        marksToAdd.push(mapToEntity(mark, id))
      }else{
        if(mark.removed) {
          marksIdsToRemove.push(mark.id)
        }else if(mark.timestamp > existed.timestamp) {
          marksToUpdate.push(mapToEntity(mark, id))
        }else{
          // do nothing
        }
      }
    }
    if (marksToAdd.length) {
      await this.db.getRepository(Mark).save(marksToAdd)
    }
    if (marksToUpdate.length) {
      await this.db.getRepository(Mark).save(marksToUpdate)
    }
    if (marksIdsToRemove.length) {
      await this.db.getRepository(Mark).delete(marksIdsToRemove)
    }
    
    return await this.db.getRepository(Mark).find({ userId: id })
  }

}
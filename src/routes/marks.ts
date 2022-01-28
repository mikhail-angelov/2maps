import { CommonRoutesConfig } from './common';
import express, { Request } from 'express';
import multer from 'multer'
import _ from 'lodash'
import { v4 as uuid } from '@lukeed/uuid';
import { Point } from 'geojson';
import { Connection } from "typeorm";
import { Mark } from '../entities/mark'
import { Auth } from './auth'

const isUUID = (id: string): boolean => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)

const upload = multer()

const mapToEntity = ({ id, name, description, lat, lng, timestamp, rate }: WebMark, userId: string): Mark => {
  const markId = isUUID(id.toString()) ? id : uuid()
  const location: Point = { type: 'Point', coordinates: [lng, lat] }
  return { id: markId, name, description: description || '', location, userId, timestamp: new Date(timestamp) || Date.now(), rate }
}
const mapToDto = ({ id, name, description, location, timestamp, rate }: Mark): WebMark => {
  const [lng, lat] = location.coordinates;
  return { id, name, description: description || '', lng, lat, timestamp: timestamp.getTime() || Date.now(), rate }
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
    router.post("/sync", this.auth.authMiddleware, upload.single('value'), async (req: Request, res: express.Response) => {
      try {
        const user = req.user
        if (!user?.id || !req?.file) {
          console.log('sync error', user)
          return res.status(400).json({ error: 'invalid request' })
        }
        console.log('markers sync for: ', user.email)
        const value = req?.file.buffer.toString('utf8')
        const newMarks = JSON.parse(value)
        console.log('to sync: ', newMarks.length)
        const marks = await this.syncMarks(user.id, newMarks)
        console.log('synced: ', marks.length)
        res.status(200).json(marks)
      } catch (e) {
        console.log('sync error', e)
        res.status(400).json({ error: 'invalid request' })
      }
    });
    router.post("/m/sync", this.auth.authMiddlewareMobile, upload.none(), async (req: Request, res: express.Response) => {
      try {
        const user = req.user
        if (!user?.id) {
          console.log('msync error', user)
          return res.status(400).json({ error: 'invalid request' })
        }
        console.log('markers m/sync for: ', user.email)
        const clientMarkers = JSON.parse(req.body.value)
        console.log('to sync: ', clientMarkers.length)
        const marks = await this.syncMarks(user.id, clientMarkers)
        console.log('synced: ', marks.length)
        res.status(200).json(marks)
      } catch (e) {
        console.log('msync error', e)
        res.status(400).json({ error: 'invalid request' })
      }
    });
    return router;
  }

  async syncMarks(userId: string, clientMarks: WebMark[]) {
    const marks = _.uniqBy(clientMarks, 'id')
    const savedMarks = await this.db.getRepository(Mark).find({ userId })
    const marksMap = _.keyBy(savedMarks, 'id')
    const marksToAdd = marks.filter(mark => !marksMap[mark.id]).map(mark => mapToEntity(mark, userId))
    const marksToUpdate = marks.filter(mark => marksMap[mark.id] && !mark.removed && mark.timestamp > marksMap[mark.id].timestamp.getTime()).map(mark => mapToEntity(mark, userId))
    const marksIdsToRemove = marks.filter(mark => marksMap[mark.id] && mark.removed).map(({ id }) => id)

    console.log('add', marksToAdd.length, 'update', marksToUpdate.length, 'remove', marksIdsToRemove.length)
    if (marksToAdd.length) {
      await this.db.getRepository(Mark).save(marksToAdd)
    }
    if (marksToUpdate.length) {
      await this.db.getRepository(Mark).save(marksToUpdate)
    }
    if (marksIdsToRemove.length) {
      await this.db.getRepository(Mark).delete(marksIdsToRemove)
    }

    const updatedMarks = await this.db.getRepository(Mark).find({ userId })
    return updatedMarks.map(mapToDto)
  }

}
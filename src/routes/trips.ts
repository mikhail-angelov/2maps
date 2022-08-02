import { CommonRoutesConfig } from './common';
import express, { Request } from 'express';
import _ from 'lodash'
import multer from 'multer'
import { v4 as uuid } from '@lukeed/uuid';
import { Connection, Repository } from "typeorm";
import { Trip } from '../entities/trip'
import { Auth } from './auth'

const upload = multer()

const isUUID = (id: string): boolean => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)

const mapToEntity = ({ id, name, description, markIds, timestamp }: WebTrip, userId: string): Trip => {
  const tripId = isUUID(id.toString()) ? id : uuid()
  return { id: tripId, name, description, markIds, userId, timestamp: new Date(timestamp) || Date.now() }
}
const mapToDto = ({ id, name, description, markIds, timestamp }: Trip): WebTrip => {
  return { id, name, description, markIds, timestamp: timestamp.getTime() || Date.now() }
}

export interface WebTrip {
  id: string;
  name: string;
  description?: string;
  markIds?: string;
  timestamp: number;
  removed?: boolean;
}

export class Trips implements CommonRoutesConfig {
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
        console.log('trips sync for: ', user.email)
        const value = req?.file.buffer.toString('utf8')
        const newTrips = JSON.parse(value)
        console.log('to sync: ', newTrips.length)
        const trips = await this.syncTrips(user.id, newTrips)
        console.log('synced: ', trips.length)
        res.status(200).json(trips)
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
        console.log('trips m/sync for: ', user.email)
        const clientTrips = JSON.parse(req.body.value)
        console.log('to sync: ', clientTrips.length)
        const trips = await this.syncTrips(user.id, clientTrips)
        console.log('synced: ', trips.length)
        res.status(200).json(trips)
      } catch (e) {
        console.log('msync error', e)
        res.status(400).json({ error: 'invalid request' })
      }
    });
    return router;
  }

  async syncTrips(userId: string, clientTrips: WebTrip[]) {
    const trips = _.uniqBy(clientTrips, 'id')
    const savedTrips = await this.db.getRepository(Trip).find({ userId })
    const tripsMap = _.keyBy(savedTrips, 'id')
    const tripsToAdd = trips.filter(trip => !tripsMap[trip.id]).map(trip => mapToEntity(trip, userId))
    const tripsToUpdate = trips.filter(trip => tripsMap[trip.id] && !trip.removed && trip.timestamp > tripsMap[trip.id].timestamp.getTime()).map(trip => mapToEntity(trip, userId))
    const tripsIdsToRemove = trips.filter(trip => tripsMap[trip.id] && trip.removed).map(({ id }) => id)

    console.log('add', tripsToAdd.length, 'update', tripsToUpdate.length, 'remove', tripsIdsToRemove.length)
    if (tripsToAdd.length) {
      await this.db.getRepository(Trip).save(tripsToAdd)
    }
    if (tripsToUpdate.length) {
      await this.db.getRepository(Trip).save(tripsToUpdate)
    }
    if (tripsIdsToRemove.length) {
      await this.db.getRepository(Trip).delete(tripsIdsToRemove)
    }

    const updatedTrips = await this.db.getRepository(Trip).find({ userId })
    return updatedTrips.map(mapToDto)
  }
}
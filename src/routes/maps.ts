import { CommonRoutesConfig } from './common';
import express from 'express';
import _ from 'lodash'
import * as aws from 'aws-sdk';
import { Connection, Repository } from "typeorm";
import { CRequest } from '../../types/express'
import { Auth } from './auth'
import { MapFile } from '../entities/mapFile'
import { MapType, Role } from '../entities/enums'


export interface WebMap {
  id: string;
  name: string;
  url: string;
  type: MapType;
  size: number;
  price: number;
}

const toWebMap = ({ id, name, url, size, price, type }: MapFile): WebMap => ({ id, name, url, size, price, type })

export class Maps implements CommonRoutesConfig {
  auth: Auth
  mapRepo: Repository<MapFile>
  private s3: aws.S3;
  private bucket: string;
  constructor(db: Connection, auth: Auth) {
    this.mapRepo = db.getRepository(MapFile);
    this.auth = auth;

    this.bucket = process.env.S3_BUCKET || '';
    const endpointUrl = process.env.S3_ENDPOINT_URL || '';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || '';
    this.s3 = new aws.S3({
      endpoint: endpointUrl,
      accessKeyId,
      secretAccessKey,
    });
    // refine maps DB
    try {
      this.s3.listObjectsV2({ Bucket: this.bucket }, async (err: aws.AWSError, data: aws.S3.Types.ListObjectsV2Output) => {
        if (err || !data || !data.Contents) {
          console.log('s3 error', this.bucket, err)
          return
        }
        const maps: Partial<MapFile>[] = data.Contents.map(({ Key = '', Size = 0 }) => ({ name: Key.split('.sqlitedb')[0], url: Key, size: Size }))
        this.refineMapsInDB(maps)
      });
    } catch (e) {
      console.log('invalid maps init', e)
    }
  }

  async refineMapsInDB(maps: Partial<MapFile>[]) {
    const existingMaps = await this.mapRepo.find()
    const existingMapUrls = existingMaps.map(({ url }) => url)
    const newMaps = maps.filter(({ url }) => url && !existingMapUrls.includes(url))
    if (newMaps.length > 0) {
      await this.mapRepo.save(newMaps)
    }
    //todo: delete maps that are not in the list
  }

  getRoutes() {
    const router = express.Router();
    router.get("", this.auth.authMiddlewareMobile, async (req: CRequest, res: express.Response) => {
      try {
        const user = req.user
        console.log('load maps for', user.email, user.role)
        const condition = user.role === Role.user ? {type: MapType.public } : { }
        const maps = await this.mapRepo.find(condition)
        res.status(200).json(maps.map(toWebMap))
      } catch (e) {
        console.log('load error', e)
        res.status(400).json({ error: 'invalid request' })
      }
    });

    router.post("/:id", this.auth.authMiddlewareMobile, async (req: CRequest, res: express.Response) => {
      try {
        const user = req.user
        const { id } = req.params;
        console.log('load map for', user.email, id)
        const map = await this.mapRepo.findOne(id)
        if (!map) {
          return res.status(400).json({ error: 'invalid request' })
        }
        //todo: check if user has access to this map
        const downloadUrl = await this.s3.getSignedUrlPromise('getObject', {
          Bucket: this.bucket,
          Key: map.url,
          Expires: 60,
        });

        res.status(200).json(toWebMap({ ...map, url: downloadUrl }))
      } catch (e) {
        console.log('load error', e)
        res.status(400).json({ error: 'invalid request' })
      }
    });

    router.get("/get", this.auth.authMiddleware, async (req: CRequest, res: express.Response) => {
      try {
        const user = req.user
        console.log('load maps for', user.email, user.role)
        const condition = user.role === Role.user ? {type: MapType.public } : { }
        const maps = await this.mapRepo.find(condition)
        res.status(200).json(maps.map(toWebMap))
      } catch (e) {
        console.log('load error', e)
        res.status(400).json({ error: 'invalid request' })
      }
    });

    router.put("/:id", this.auth.authAdminMiddleware, async (req: CRequest, res: express.Response) => {
      try {
        const user = req.user
        console.log('update map', req.params.id, req.body)
        const update = _.pick(req.body,['name', 'price', 'type']);
        await this.mapRepo.update(req.params.id, update);
        const map = await this.mapRepo.findOne(req.params.id);
        if(!map) {
          res.status(400).send("error")
          return
        }
        res.status(200).json(toWebMap(map))
      } catch (e) {
        console.log('update error', e)
        res.status(400).json({ error: 'invalid request' })
      }
    });
    return router;
  }
}
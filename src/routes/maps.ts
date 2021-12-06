import { CommonRoutesConfig } from './common';
import express from 'express';
import _ from 'lodash'
import * as aws from 'aws-sdk';
import { Connection } from "typeorm";
import { CRequest } from '../../types/express'
import { Auth } from './auth'
import { MapFile } from '../entities/mapFile'


export interface WebMap {
  id: string;
  name: string;
  url: string;
  size: number;
}

const toWebMap = ({ id, name, url, size }: MapFile): WebMap => ({ id, name, url, size })

export class Maps implements CommonRoutesConfig {
  auth: Auth
  db: Connection
  private s3: aws.S3;
  private bucket: string;
  constructor(db: Connection, auth: Auth) {
    this.db = db;
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
    this.s3.listObjectsV2({ Bucket: this.bucket }, async (err: aws.AWSError, data: aws.S3.Types.ListObjectsV2Output) => {
      if (err || !data || !data.Contents) {
        console.log('s3 error', this.bucket, err)
        return
      }
      const maps: Partial<MapFile>[] = data.Contents.map(({ Key = '', Size = 0 }) => ({ name: Key.split('.sqlitedb')[0], url: Key, size: Size }))
      this.refineMapsInDB(maps)
    });
  }

  async refineMapsInDB(maps: Partial<MapFile>[]) {
    const existingMaps = await this.db.getRepository(MapFile).find()
    const existingMapUrls = existingMaps.map(({ url }) => url)
    const newMaps = maps.filter(({ url }) => url && !existingMapUrls.includes(url))
    if (newMaps.length > 0) {
      await this.db.getRepository(MapFile).save(newMaps)
    }
    //todo: delete maps that are not in the list
  }

  getRoutes() {
    const router = express.Router();
    router.get("", this.auth.authMiddlewareMobile, async (req: CRequest, res: express.Response) => {
      try {
        const user = req.user
        console.log('load maps', user.email)
        const maps = await this.db.getRepository(MapFile).find()
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
        const map = await this.db.getRepository(MapFile).findOne(id)
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
    return router;
  }
}
import { CommonRoutesConfig } from './common';
import express from 'express';
import _ from 'lodash'
import { CRequest } from '../../types/express'
import { Auth } from './auth'

export class MapLoader implements CommonRoutesConfig {
  auth: Auth
  constructor(auth: Auth) {
    this.auth = auth;
  }

  getRoutes() {
    const router = express.Router();
    router.post("/:map", this.auth.authMiddleware, async (req: CRequest, res: express.Response) => {
      try {
        const user = req.user
        const { map } = req.params;
        console.log('load request for', user.email, map)
        // validate input and process one time load
        res.status(200).json({url:map})
      } catch (e) {
        console.log('load error', e)
        res.status(400).json({ error: 'invalid request' })
      }
    });
    return router;
  }


}
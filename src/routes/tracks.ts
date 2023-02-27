import { CommonRoutesConfig } from "./common";
import express, { Request } from "express";
import _ from "lodash";
import multer from "multer";
import { v4 as uuid } from "@lukeed/uuid";
import { Connection } from "typeorm";
import { Track } from "../entities/track";
import { TrackDto, TrackItemDto } from "../dto/track.dto";
import { Auth } from "./auth";
import { kmlToJson, jsonToKml } from "./kmlUtils";

const upload = multer();

const mapToEntity = (
  { name, image, track, timestamp }: TrackDto,
  userId: string
): Track => {
  return {
    id: uuid(),
    userId,
    name,
    image,
    track: JSON.stringify(track),
    timestamp: new Date(timestamp) || Date.now(),
  };
};
const mapListToDto = ({ id, name, image, timestamp }: Track): TrackItemDto => {
  return { id, name, timestamp: timestamp.getTime() || Date.now(), image };
};
const mapToDto = ({ id, name, image, track, timestamp }: Track): TrackDto => {
  return {
    id,
    name,
    timestamp: timestamp.getTime() || Date.now(),
    track: track ? JSON.parse(track) : "",
    image,
  };
};

export class Tracks implements CommonRoutesConfig {
  db: Connection;
  auth: Auth;
  constructor(db: Connection, auth: Auth) {
    this.db = db;
    this.auth = auth;
  }

  getRoutes() {
    const router = express.Router();
    router.get(
      "/",
      this.auth.authMiddleware,
      async (req: Request, res: express.Response) => {
        const user = req.user;
        try {
          const tracks = await this.db
            .getRepository(Track)
            .find({ userId: user?.id });
          res.status(200).json(tracks.map(mapListToDto));
        } catch (e) {
          console.log("get error", e);
          res.status(400).json({ error: "invalid request" });
        }
      }
    );
    router.get(
      "/:id",
      this.auth.authMiddleware,
      async (req: Request, res: express.Response) => {
        const user = req.user;
        const id = req.params.id;
        try {
          const track = await this.db
            .getRepository(Track)
            .findOne({ id, userId: user?.id });
          if (!track) {
            return res.status(400).json({ error: `no tack request ${id}` });
          }
          res.status(200).json(mapToDto(track));
        } catch (e) {
          console.log("get error", id, e);
          res.status(400).json({ error: "invalid request" });
        }
      }
    );
    router.get(
      "/:id/kml",
      this.auth.authMiddleware,
      async (req: Request, res: express.Response) => {
        const user = req.user;
        const id = req.params.id;
        try {
          const track = await this.db
            .getRepository(Track)
            .findOne({ id, userId: user?.id });
          if (!track) {
            return res.status(400).json({ error: `no tack request ${id}` });
          }
          res.status(200).send(new Buffer(jsonToKml(mapToDto(track)),'utf8'));
        } catch (e) {
          console.log("get error", id, e);
          res.status(400).json({ error: "invalid request" });
        }
      }
    );
    router.delete(
      "/:id",
      this.auth.authMiddleware,
      async (req: Request, res: express.Response) => {
        const user = req.user;
        const id = req.params.id;
        try {
          await this.db.getRepository(Track).delete({ id, userId: user?.id });
          res.status(200).json({ ok: true });
        } catch (e) {
          console.log("get error", id, e);
          res.status(400).json({ error: "invalid request" });
        }
      }
    );
    router.post(
      "/",
      this.auth.authMiddleware,
      async (req: Request, res: express.Response) => {
        const user = req.user;
        //todo validate  tack
        if (!user?.id) {
          return res.status(400).json({ error: `invalid request` });
        }
        try {
          const tack = mapToEntity(req.body, user.id);
          const newTrack = await this.db.getRepository(Track).save(tack);
          res.status(200).json(mapToDto(newTrack));
        } catch (e) {
          console.log("add error", e);
          res.status(400).json({ error: "invalid request" });
        }
      }
    );
    router.post(
      "/kml",
      this.auth.authMiddleware,
      upload.single("value"),
      async (req: Request, res: express.Response) => {
        const user = req.user;
        const value = req?.file?.buffer.toString("utf8");
        console.log("--kml", value);
        //todo validate  tack
        if (!user?.id || !value) {
          return res.status(400).json({ error: `invalid request` });
        }
        try {
          const track = kmlToJson(value)
          if (!track) {
            return res.status(400).json({ error: `invalid request` });
          }
          track.name = req.body.name
          const newTrack = await this.db.getRepository(Track).save({
            track: JSON.stringify(track.track),
            name: req.body.name,
            timestamp: Date.now(),
          });
          res.status(200).json(mapToDto(newTrack));
        } catch (e) {
          console.log("add error", e);
          res.status(400).json({ error: "invalid request" });
        }
      }
    );
    return router;
  }
}

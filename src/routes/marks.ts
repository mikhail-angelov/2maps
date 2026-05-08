import { CommonRoutesConfig } from "./common";
import express, { Request } from "express";
import multer from "multer";
import _ from "lodash";
import { v4 as uuid } from "@lukeed/uuid";
import { DataSource, MoreThan } from "typeorm";
import { Mark } from "../entities.sqlite/mark";
import { Auth } from "./auth";
import dayjs from "dayjs";
import { User } from "../entities.sqlite/user";

const isUUID = (id: string): boolean =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    id
  );

const upload = multer();

const mapToEntity = (
  { id, name, description, lat, lng, timestamp, rate }: WebMark,
  userId: string
): Mark => {
  const markId = isUUID(id.toString()) ? id : uuid();
  return {
    id: markId,
    name,
    description: description || "",
    lng, lat,
    userId,
    timestamp: new Date(timestamp) || Date.now(),
    rate,
  };
};
const mapToDto = ({
  id,
  name,
  description,
  lng,
  lat,
  timestamp,
  rate,
}: Mark): WebMark => {
  return {
    id,
    name,
    description: description || "",
    lng,
    lat,
    timestamp: timestamp.getTime() || Date.now(),
    rate,
  };
};

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
  db: DataSource;
  auth: Auth;
  constructor(db: DataSource, auth: Auth) {
    this.db = db;
    this.auth = auth;
  }

  getRoutes() {
    const router = express.Router();
    router.post(
      "/sync",
      this.auth.authMiddleware,
      upload.single("value"),
      async (req: Request, res: express.Response) => {
        try {
          const user = req.user;
          if (!user?.id || !req?.file) {
            console.log("sync error", user);
            return res.status(400).json({ error: "invalid request" });
          }
          console.log("markers sync for: ", user.email);
          const value = req?.file.buffer.toString("utf8");
          const newMarks = JSON.parse(value);
          console.log("to sync: ", newMarks.length);
          await this.syncMarks(user.id, newMarks);
          const marks = await this.getAll(user.id);
          console.log("synced: ", marks.length);
          res.status(200).json(marks);
        } catch (e) {
          console.log("sync error", e);
          res.status(400).json({ error: "invalid request" });
        }
      }
    );
    router.post(
      "/m/sync",
      this.auth.authMiddlewareMobile,
      // upload.none(),
      async (req: Request, res: express.Response) => {
        try {
          const user = req.user;
          if (!user?.id) {
            console.log("msync error", user);
            return res.status(400).json({ error: "invalid request" });
          }
          console.log("markers m/sync for: ", user.email);
          // const clientMarkers = JSON.parse(req.body.value);
          const clientMarkers = req.body;
          console.log("to sync: ", clientMarkers.length);
          await this.syncMarks(user.id, clientMarkers);
          const marks = await this.getAll(user.id);
          console.log("synced: ", marks.length);
          res.status(200).json(marks);
        } catch (e) {
          console.log("msync error", e);
          res.status(400).json({ error: "invalid request" });
        }
      }
    );
    router.post(
      "/batch",
      this.auth.authMiddleware,
      async (req: Request, res: express.Response) => {
        const user = req.user;
        if (!user?.id) {
          console.log("batch error", user);
          return res.status(400).json({ error: "invalid request" });
        }
        console.log("markers batch for: ", user.email);
        this.syncMarks(user.id, req.body);
        res.status(200).json([]);
      }
    );
    router.get(
      "/:id",
      this.auth.authMiddleware,
      async (req: Request, res: express.Response) => {
        const user = req.user;
        try {
          if (!user?.id) {
            console.log("get error", user);
            return res.status(400).json({ error: "invalid request" });
          }
          console.log("get for: ", user.email, req.params.id);
          const mark = await this.getById(user.id, req.params.id);
          res.status(200).json(mark);
        } catch (e) {
          console.log("get error", e);
          res.status(400).json({ error: "invalid request" });
        }
      }
    );
    router.post(
      "",
      this.auth.authMiddleware,
      async (req: Request, res: express.Response) => {
        const user = req.user;
        try {
          if (!user?.id) {
            console.log("get error", user);
            return res.status(400).json({ error: "invalid request" });
          }
          console.log("get for: ", user.email, req.params.id);
          const mark = await this.create(user.id, req.body);
          res.status(200).json(mark);
        } catch (e) {
          console.log("create error", e);
          res.status(400).json({ error: "invalid request" });
        }
      }
    );
    router.put(
      "",
      this.auth.authMiddleware,
      async (req: Request, res: express.Response) => {
        const user = req.user;
        try {
          if (!user?.id) {
            console.log("get error", user);
            return res.status(400).json({ error: "invalid request" });
          }
          console.log("get for: ", user.email, req.params.id);
          const mark = await this.update(user.id, req.body);
          res.status(200).json(mark);
        } catch (e) {
          console.log("update error", e);
          res.status(400).json({ error: "invalid request" });
        }
      }
    );
    router.delete(
      "/:id",
      this.auth.authMiddleware,
      async (req: Request, res: express.Response) => {
        const user = req.user;
        try {
          if (!user?.id) {
            console.log("get error", user);
            return res.status(400).json({ error: "invalid request" });
          }
          console.log("get for: ", user.email, req.params.id);
          const mark = await this.remove(user.id, req.params.id);
          res.status(200).json(mark);
        } catch (e) {
          console.log("delete error", e);
          res.status(400).json({ error: "invalid request" });
        }
      }
    );
    router.get(
      "/batch/:timestamp",
      this.auth.authMiddleware,
      async (req: Request, res: express.Response) => {
        const user = req.user;
        if (!user?.id) {
          console.log("get batch error", user);
          return res.status(400).json({ error: "invalid request" });
        }
        console.log("get batch for: ", user.email, req.params.timestamp);
        const marks = await this.getBatch(
          user.id,
          dayjs(req.params.timestamp).toDate()
        );
        res.status(200).json(marks);
      }
    );
    return router;
  }

  /**
   * Haversine distance in meters between two lat/lng points.
   */
  private distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async syncMarks(userId: string, clientMarks: WebMark[]) {
    const marks = _.uniqBy(clientMarks, "id");
    console.log("syncMarks", userId, marks.length);
    const savedMarks = await this.db.getRepository(Mark).find({ where: { userId } });
    const marksMap = _.keyBy(savedMarks, "id");

    const DUP_THRESHOLD_METERS = 10;

    const marksToAdd: Mark[] = [];
    const marksToUpdate: Mark[] = [];

    for (const mark of marks) {
      const existing = marksMap[mark.id];
      if (existing) {
        // Known ID: update if newer or coordinates changed
        if (!mark.removed &&
            (mark.timestamp > existing.timestamp.getTime() ||
             mark.lat !== existing.lat ||
             mark.lng !== existing.lng)) {
          marksToUpdate.push(mapToEntity(mark, userId));
        }
      } else {
        // Unknown ID: check for duplicate by location
        const dup = savedMarks.find(
          (s) =>
            s.userId === userId &&
            this.distanceMeters(mark.lat, mark.lng, s.lat, s.lng) <= DUP_THRESHOLD_METERS
        );
        if (dup) {
          // Found a nearby existing mark — treat as update, keeping server ID
          marksToUpdate.push(mapToEntity({ ...mark, id: dup.id }, userId));
          console.log("dedup: merged client mark into existing", dup.id, mark.name);
        } else {
          marksToAdd.push(mapToEntity(mark, userId));
        }
      }
    }

    const marksIdsToRemove = marks
      .filter((mark) => marksMap[mark.id] && mark.removed)
      .map(({ id }) => id);

    console.log(
      "add",
      marksToAdd.length,
      "update",
      marksToUpdate.length,
      "remove",
      marksIdsToRemove.length
    );
    if (marksToAdd.length) {
      await this.db.getRepository(Mark).save(marksToAdd);
    }
    if (marksToUpdate.length) {
      await this.db.getRepository(Mark).save(marksToUpdate);
    }
    if (marksIdsToRemove.length) {
      await this.db.getRepository(Mark).delete(marksIdsToRemove);
    }
  }

  async getAll(userId: string): Promise<WebMark[]> {
    const marks = await this.db.getRepository(Mark).find({ where: { userId } });
    const validMarks = marks.filter(
      (mark) => mark.lat && mark.lng
    );
    return validMarks.map(mapToDto);
  }
  async getById(userId: string, id: string): Promise<WebMark> {
    const mark = await this.db
      .getRepository(Mark)
      .findOne({ where: { id, userId } });
    if (!mark) throw new Error("mark not found");
    return mapToDto(mark);
  }
  async create(userId: string, webMark: WebMark): Promise<WebMark> {
    const mark = mapToEntity(webMark, userId);
    const result = await this.db.getRepository(Mark).save(mark);
    if (!result) throw new Error("mark not found");
    return mapToDto(result);
  }
  async update(userId: string, webMark: WebMark): Promise<WebMark> {
    const patch = mapToEntity(webMark, userId);
    const mark = await this.db
      .getRepository(Mark)
      .findOne({ where: { id: webMark.id, userId } });
    if (!mark) throw new Error("mark not found");
    const result = await this.db
      .getRepository(Mark)
      .save({ ...mark, ...patch });
    if (!result) throw new Error("mark not found");
    return mapToDto(result);
  }
  async remove(userId: string, id: string): Promise<any> {
    const mark = await this.db
      .getRepository(Mark)
      .findOne({ where: { id, userId } });
    if (!mark) throw new Error("mark not found");
    await this.db.getRepository(Mark).delete(id);
    return { status: "ok" };
  }
  async getBatch(userId: string, timestamp: Date): Promise<WebMark[]> {
    const marks = await this.db.getRepository(Mark).find({
      where: { userId, timestamp: MoreThan(dayjs(timestamp).toDate()) },
    });
    return marks.map(mapToDto);
  }
}

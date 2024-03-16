import { expect } from "chai";
import { Request } from "express";
import { Tracks } from "./tracks";
import { Track } from "../entities/track";
import {
  cleanDatabase,
  getDatabase,
  loadDatabase,
} from "../../test/database-setup";

const USER = {
  id: "aaade243-0fb7-480f-801c-bc64566209cc",
  name: "test",
  email: "test",
  password: "test",
};
const GEO_JSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [44.328298, 56.079617],
          [44.328377, 56.079494],
          [44.328399, 56.079403],
          [44.328434, 56.079301],
          [44.328482, 56.079193],
        ],
      },
      properties: {},
      id: "1",
    },
  ],
};
const TRACKS: Track[] = [
  {
    id: "014acc56-cb26-41a6-b995-1266157f3c10",
    userId: USER.id,
    name: "test",
    geoJson: JSON.stringify(GEO_JSON),
    timestamp: new Date(1626944504856),
  },
];

describe("tracks", () => {
  let tracks: Tracks;
  beforeEach(async () => {
    const db = await getDatabase();
    const auth: any = {
      authMiddleware: (q: any, r: any, next: any) => {
        q.user = USER;
        next();
      },
    };
    tracks = new Tracks(db, auth);
    await loadDatabase({
      User: [USER],
      Track: TRACKS,
    });
  });
  afterEach(() => cleanDatabase());

  it("should get one", (done) => {
    const req = { method: "get", url: `/${TRACKS[0].id}` } as Request;
    req.params = { id: TRACKS[0].id };
    const routes = tracks.getRoutes();
    //1 - get track
    routes.stack[1].handle(req, {
      status: () => ({
        json: (resp: any) => {
          expect(resp.id).to.equal(TRACKS[0].id);
          done();
        },
      }),
    });
  });
  it("should create one", (done) => {
    const req = {
      method: "post",
      body: {
        name: "test",
        image: null,
        geoJson: GEO_JSON,
        timestamp: Date.now(),
      },
    } as Request;
    const routes = tracks.getRoutes();
    //4 - create track
    routes.stack[4].handle(req, {
      status: () => ({
        json: (resp: any) => {
          expect(resp.name).to.equal("test");
          done();
        },
      }),
    });
  });
  xit("should process kml file", (done) => {
    const req = {
      method: "post",
      body: { name: "test", image: null, track: "", timestamp: Date.now() },
    } as Request;
    const routes = tracks.getRoutes();
    //5 - create track with kml
    routes.stack[5].handle(req, {
      status: () => ({
        json: (resp: any) => {
          expect(resp.name).to.equal("test");
          done();
        },
      }),
    });
  });
});

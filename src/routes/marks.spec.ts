import { expect } from "chai";
import dayjs from "dayjs";
import { Marks, WebMark } from "./marks";
import { Point } from "geojson";
import { Mark } from "../entities.sqlite/mark";
import {
  cleanDatabase,
  getDatabase,
  loadDatabase,
} from "../../test/database-setup";
import { User } from "../entities.sqlite/user";

const USER = {
  id: "aaade243-0fb7-480f-801c-bc64566209cc",
  name: "test",
  email: "test",
  password: "test",
};
const lat = 56.32323794803307
const lng = 43.989515211547825
const MARKS: Mark[] = [
  {
    id: "014acc56-cb26-41a6-b995-1266157f3c07",
    userId: USER.id,
    name: "test",
    description: "",
    lat,lng,
    timestamp: new Date(1626944504856),
  },
  {
    id: "014acc56-cb26-41a6-b995-1266157f3c08",
    userId: USER.id,
    name: "test2",
    description: "none",
    rate: 2,
    lat,lng,
    timestamp: new Date(1626944504857),
  },
  {
    id: "014acc56-cb26-41a6-b995-1266157f3c09",
    userId: USER.id,
    name: "to remove",
    description: "none",
    lat,lng,
    timestamp: new Date(1626944504858),
  },
];

describe("marks", () => {
  let marks: Marks;
  beforeEach(async () => {
    const db = await getDatabase();
    const auth: any = { authMiddleware: () => Promise.resolve({ user: USER }) };
    marks = new Marks(db, auth);
    await loadDatabase({
      User: [USER],
      Mark: MARKS,
    });
    const a = await db.getRepository(User).find();
    console.log("syncMarks 1", a);
  });
  afterEach(() => cleanDatabase());

  it("check blank sync", async () => {
    const webMarks: WebMark[] = [];
    await marks.syncMarks(USER.id, webMarks);
    const syncedMarks = await marks.getAll(USER.id);
    expect(syncedMarks.length).to.equal(3);
  });
  it("check sync with conflict", async () => {
    const webMarks: WebMark[] = [
      {
        id: "014acc56-cb26-41a6-b995-1266157f3c07",
        name: "test-ignore",
        lat: 56.32323794803307,
        lng: 43.989515211547825,
        timestamp: 1626944504856,
      },
      {
        id: "014acc56-cb26-41a6-b995-1266157f3c08",
        name: "update second",
        description: "new",
        rate: 2,
        lat: 56.32323794803307,
        lng: 43.989515211547825,
        timestamp: 1626944504857,
      },
      {
        id: "014acc56-cb26-41a6-b995-1266157f3c00",
        name: "test-good",
        lat: 56.32323794803307,
        lng: 43.989515211547825,
        timestamp: 1626944504856,
      },
      {
        id: "014acc56-cb26-41a6-b995-1266157f3c00",
        name: "test-dropped",
        lat: 56.32323794803307,
        lng: 43.989515211547825,
        timestamp: 1626944504856,
      },
      {
        id: "014acc56-cb26-41a6-b995-1266157f3c09",
        name: "to remove",
        removed: true,
        lat: 56.32323794803307,
        lng: 43.989515211547825,
        timestamp: 1626944504856,
      },
    ];
    await marks.syncMarks(USER.id, webMarks);
    const syncedMarks = await marks.getAll(USER.id);
    expect(syncedMarks.length).to.equal(3);
  });

  it("should return fresh batch", async () => {
    const res = await marks.getBatch(
      USER.id,
      dayjs(1626944504856).subtract(1, "day").toDate()
    );
    expect(res.length).greaterThanOrEqual(1);
  });
});

import { expect } from "chai";
import { Wikimapia } from "./wikimapia";
import { cleanDatabase, getDatabase } from "../../test/database-setup";

describe("wikimapia", () => {
  let wikimapia: Wikimapia;
  const coords = { x: 0, y: 1, z: 2 };
  beforeEach(async () => {
    const db = await getDatabase();
    wikimapia = new Wikimapia(db);
    await wikimapia.addTile(coords, Buffer.from("test"));
  });
  afterEach(() => cleanDatabase());

  it("should get wiki tile", async () => {
    const tile = await wikimapia.getTile(coords);
    expect(tile?.x).equal(coords.x);
    expect(tile?.image.toString()).equal("test");
  });
  it("should update wiki tile", async () => {
    let tile = await wikimapia.getTile(coords);
    const id = tile?.id || "";
    await wikimapia.updateTile(id, Buffer.from("next"));
    tile = await wikimapia.getTile(coords);
    expect(tile?.image.toString()).equal("next");
  });
});

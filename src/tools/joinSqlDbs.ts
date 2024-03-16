import _ from "lodash";
import { createConnection } from "typeorm";
import rdl from "readline";
import fs from "fs";
import { Tile } from "../entitiesMap/tile";
import { Info } from "../entitiesMap/info";

const sharp = require("sharp");

const BATCH = 1;

const progress = (value: any, cursor: number = 1) => {
  rdl.cursorTo(process.stdout, cursor, 0);
  process.stdout.write(value);
};
export const createDBConnection = async (
  name: string,
  synchronize: boolean = false
) => {
  return await createConnection({
    name,
    type: "sqlite",
    database: `./data/${name}.sqlitedb`,
    entities: [Tile, Info],
    synchronize,
    // logger: 'debug'
  });
};
const joinDBs = async () => {
  const connection = await createDBConnection("mendeJoined", true);
  const mainRep = connection.getRepository(Tile);
  const files = fs
    .readdirSync("./data")
    .filter((item) => item.includes("mende-"))
    .map((item) => item.replace(".sqlitedb", ""));
  console.log(files);

  let minzoom = 5;
  let maxzoom = 5;
  try {
    for (const file of files) {
      const toCopy = await createDBConnection(file);
      const info = (await toCopy.getRepository(Info).find({ take: 1 }))?.[0];
      let m = info?.minzoom || 0;
      minzoom = minzoom > m ? m : minzoom;
      m = info?.maxzoom || 0;
      maxzoom = maxzoom < m ? m : maxzoom;
      const rep = toCopy.getRepository(Tile);
      const count = await rep.count();
      console.log("process ", file, count, minzoom, maxzoom);
      let skip = 0;
      for (let i = 0; i <= count + BATCH; i = i + BATCH) {
        const tiles = await rep.find({ skip, take: BATCH });
        if (tiles.length > 0) {
          const data = tiles.map(({ x, y, z, image }: Tile) => ({
            x,
            y,
            z,
            image,
          }));
          const r = await mainRep.save(data, { transaction: true, chunk: 100 });
          // console.log('processed ', file, skip,'/',count, r)
        }
        skip += BATCH;
      }
      await toCopy.close();
    }
    await connection.getRepository(Info).insert({ minzoom, maxzoom });
  } catch (e) {
    console.log("opps, join error", e);
    throw new Error("cancel on error");
  }
  console.log("done!");
  await connection.close();
};

const mergeTiles = async () => {
  const DUB_COUNT = 24857;

  const c = await createDBConnection("dub", true);
  const dbRep = c.getRepository(Tile);
  const connection = await createDBConnection("mende");
  const mainRep = connection.getRepository(Tile);
  try {
    const dubs = await mainRep
      .createQueryBuilder()
      .select(["x", "y", "z", `COUNT() as c`])
      .groupBy("x")
      .addGroupBy("y")
      .addGroupBy("z")
      .orderBy("c", "DESC")
      .take(DUB_COUNT)
      .getRawMany();
    console.log("-", dubs.length, dubs[0]);
    let i = 0;
    for (const { x, y, z } of dubs) {
      i++;
      const tiles = await mainRep.find({ where: { x, y, z } });
      const fileName = `${__dirname}/${x}2.jpg`;
      console.log("-", tiles.length, i, "/", DUB_COUNT);
      if (tiles.length > 1) {
        const image = await sharp(tiles[0].image)
          .composite([{ input: tiles[1].image, blend: "overlay" }])
          .jpeg({ mozjpeg: true })
          .toBuffer();

        await mainRep.delete({ x, y, z });
        await mainRep.insert({ x, y, z, image });
      }
    }
  } catch (e) {
    console.log("opps, join error", e);
    throw new Error("cancel on error");
  }
  console.log("done!");
  await connection.close();
};

mergeTiles();

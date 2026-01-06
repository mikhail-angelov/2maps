import { DataSource } from "typeorm";
import { Tile } from "./entitiesMap/tile";
import { Info } from "./entitiesMap/info";
import { MbTile } from "./entitiesMap/mbTile";

interface TileRequest {
  name: string;
  x: number;
  y: number;
  z: number;
}

const connections: { [key: string]: DataSource } = {};

export const getTile = async  ({name, x, y, z}: {name: string, x: number, y: number, z: number}) => {
  const connection = await getConnection(name);
  const tileRow = 2 ** z - y - 1;
  const tile = await connection
    .getRepository(MbTile)
    .findOne({ where: { tileRow, tileColumn: x, zoomLevel: z } });
  return tile;
};

const getConnection = async (name: string) => {
  if (!connections[name]) {
    connections[name] = await createDBConnection(name);
  }
  return connections[name];
};

export const createDBConnection = async (name: string) => {
  const c = new DataSource({
    name,
    type: "sqlite",
    database: `${__dirname}/../data/${name}.mbtiles`,
    entities: [MbTile],
    synchronize: false,
    logger: "debug",
  });
  await c.initialize();
  return c;
};

export const closeConnections = async () => {
  Object.keys(connections).forEach(async (key) => {
    await connections[key].destroy();
  });
};

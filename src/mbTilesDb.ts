import { DataSource } from "typeorm";
import { MbTile } from "./entitiesMap/mbTile";
import { existsSync } from "fs";

interface TileRequest {
  name: string;
  x: number;
  y: number;
  z: number;
}

const connections: { [key: string]: DataSource } = {};
export const getOSMTile = async ({ name, x, y, z }: TileRequest) => {
  try {
    const connection = await getConnection(name);
    const tileRow = 2 ** z - y - 1;
    const tile = await connection
      .getRepository(MbTile)
      .findOne({ where: { tileColumn: x, zoomLevel: z, tileRow } });
    return tile;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getConnection = async (name: string) => {
  if (!connections[name]) {
    connections[name] = await createDBConnection(name);
  }
  return connections[name];
};

export const createDBConnection = async (name: string) => {
  if (!existsSync(`${__dirname}/../data/${name}.mbtiles`)) {
    throw new Error(`Database ${name} not found`);
  }
  const c = new DataSource({
    name,
    type: "sqlite",
    database: `${__dirname}/../data/${name}.mbtiles`,
    entities: [MbTile],
    synchronize: false,
  });
  await c.initialize();
  return c;
};

export const closeConnections = async () => {
  Object.keys(connections).forEach(async (key) => {
    await connections[key].destroy();
  });
};

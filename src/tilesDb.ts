import { createConnections, Connection } from "typeorm";
import { Tile } from './entities/tile'
import { MbTile } from './entities/mbTile'

interface TileRequest {
    name: string,
    x: number,
    y: number,
    z: number,
}

const connections: {[key:string]: Connection} = {}

export const getTile = async ({ name, x, y, z }: TileRequest) => {
    const connection = await getConnection(name);
    const tile = await connection.getRepository(Tile).findOne({ x, y, z })
    return tile;
}
export const getOSMTile = async ({ name, x, y, z }: TileRequest) => {
    const connection = await getConnection(name);
    const tileRow = 2 ** z - y - 1;
    const tile = await connection.getRepository(MbTile).findOne({ tileColumn: x, zoomLevel: z, tileRow });
    return tile;
}

const getConnection = async (name: string) => {
    if (!connections[name]) {
        connections[name] = await createDBConnection(name);
    }
    return connections[name];
}

const createDBConnection = async (name: string) => {
    const connections = await createConnections([
        {
            name,
            type: "sqlite",
            database: `./data/${name}.sqlitedb`,
            entities: [Tile],
            synchronize: false,
            logger: 'debug'
        }]);
    return connections[0]
}

export const closeConnections = async () => {
    Object.keys(connections).forEach(async (key) => {
        await connections[key].close()
    })
}

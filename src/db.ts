import { createConnections, getConnection, Connection } from "typeorm";
import { Tile } from './entities/tile'
import { User } from './entities/user'
import { Mark } from './entities/mark'
import { MapFile } from './entities/mapFile'
import { TileSource } from "./entities/tileSource";

interface InitParams {
    userDB: string;
}
interface CreateDB {
    name: string;
    file: string;
}
export enum DB {
    Users='users',
}
export const initDbConnections = async ({ userDB }: InitParams) => {
    const connections = await createConnections([
        {
            name: DB.Users,
            type: "sqlite",
            database: userDB,
            entities: [User, Mark, MapFile, TileSource],
            synchronize: true,
            logger: 'debug'
        }]);
    return connections
}

export const closeConnections = async () => {
    let connection = await getConnection(DB.Users)
    await connection.close()
}

//TBD: refactor it

export const createDBConnection = async ({ name, file }: CreateDB) => {
    const connections = await createConnections([
        {
            name,
            type: "sqlite",
            database: file,
            entities: [Tile],
            synchronize: true,
            logger: 'debug'
        }]);
    return connections[0]
}

export const closeConnection = async (connection: Connection) => {
    await connection.close()
}
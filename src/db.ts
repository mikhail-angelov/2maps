import { createConnections, getConnection, Connection } from "typeorm";
import { EtoMesto } from './entities/etoMesto'
import { User } from './entities/user'
import { Mark } from './entities/mark'
import { MapFile } from './entities/mapFile'
import { MbTile } from "./entities/mbTile";

interface InitParams {
    mendDB: string;
    osmDB: string;
    userDB: string;
}
interface CreateDB {
    name: string;
    file: string;
}
export enum DB {
    Users='users',
    Mende='mende',
    Osm='osm'
}
export const initDbConnections = async ({ mendDB, userDB, osmDB }: InitParams) => {
    const connections = await createConnections([
        {
            name: DB.Mende,
            type: "sqlite",
            database: mendDB,
            entities: [EtoMesto],
            synchronize: false,
            logger: 'debug'
        }, {
            name: DB.Osm,
            type: "sqlite",
            database: osmDB,
            entities: [MbTile],
            synchronize: false,
            logger: 'debug'
        }, {
            name: DB.Users,
            type: "sqlite",
            database: userDB,
            entities: [User, Mark, MapFile],
            synchronize: true,
            logger: 'debug'
        }]);
    return connections
}

export const closeConnections = async () => {
    let connection = await getConnection(DB.Mende)
    await connection.close()
    connection = await getConnection(DB.Osm)
    await connection.close()
    connection = await getConnection(DB.Users)
    await connection.close()
}

//TBD: refactor it

export const createDBConnection = async ({ name, file }: CreateDB) => {
    const connections = await createConnections([
        {
            name,
            type: "sqlite",
            database: file,
            entities: [EtoMesto],
            synchronize: true,
            logger: 'debug'
        }]);
    return connections[0]
}

export const closeConnection = async (connection: Connection) => {
    await connection.close()
}
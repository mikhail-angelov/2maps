import { createConnection, getConnection, getConnectionManager } from "typeorm";
import { Mark } from './entities/mark'
import { User } from './entities/user'
import { MapFile } from './entities/mapFile'
import { TileSource } from './entities/tileSource'
const config = require('../ormconfig.js');

export const initDbConnection = async () => {
    const connection = await createConnection(config);
    return connection
}

export const closeConnection = async () => {
    let connection = await getConnection()
    await connection.close()
}

export const initDbConnectionTest = async (db: any) => {
    try {
        const conn = await db.initDb({
            entities: [User, Mark, MapFile, TileSource],
        });
        return conn
    } catch (e) {
        const conn = getConnectionManager().get()
        await conn.synchronize(true)
        return conn
    }
}
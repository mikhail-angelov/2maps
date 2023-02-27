import {
    createConnection,
    getConnection,
    getConnectionManager,
    getConnectionOptions,
    DefaultNamingStrategy,
    ConnectionOptions,
} from "typeorm";
import { Mark } from './entities/mark'
import { Track } from './entities/track'
import { User } from './entities/user'
import { MapFile } from './entities/mapFile'
import { TileSource } from './entities/tileSource'
import { WikiTile } from './entities/wiki'
// const config = require('../ormconfig.js');

const getDbConfig = async () => {
    const baseOptions: ConnectionOptions = await getConnectionOptions();
    const config = {
        ...baseOptions,
        namingStrategy: new DefaultNamingStrategy(),
        entities: [
            __dirname + '/entities/**/*.{ts,js}',
        ],
        migrations: [__dirname + '/migrations/**/*.{ts,js}'],
        keepConnectionAlive: true,
    };
    return config;
};

export const initDbConnection = async () => {
    const config = await getDbConfig();
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
            entities: [User, Mark, Track, MapFile, TileSource, WikiTile],
        });
        return conn
    } catch (e) {
        const conn = getConnectionManager().get()
        await conn.synchronize(true)
        return conn
    }
}
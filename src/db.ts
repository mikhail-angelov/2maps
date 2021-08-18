import { createConnections, getConnection, Connection } from "typeorm";
import { EtoMesto } from './entities/etoMesto'
import { User } from './entities/user'
import { Mark } from './entities/mark'

interface InitParams {
    mendDB: string;
    userDB: string;
}
interface CreateDB {
    name: string;
    file: string;
}
export enum DB {
    Users='users',
    Mende='mende'
}
export const initDbConnections = async ({ mendDB, userDB }: InitParams) => {
    const connections = await createConnections([
        {
            name: DB.Mende,
            type: "sqlite",
            database: mendDB,
            entities: [EtoMesto],
            synchronize: false,
            logger: 'debug'
        }, {
            name: DB.Users,
            type: "sqlite",
            database: userDB,
            entities: [User, Mark],
            synchronize: true,
            logger: 'debug'
        }]);
    return connections
}

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

export const closeConnections = async () => {
    let connection = await getConnection('mende')
    await connection.close()
    connection = await getConnection('users')
    await connection.close()
}


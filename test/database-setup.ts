import { DataSource, DataSourceOptions } from "typeorm";

const testDatabaseConfig: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [`${__dirname}/../src/entities.sqlite/*{.ts,.js}`],
  synchronize: true,
  // logging: 'all',
};
let appDataSource = new DataSource(testDatabaseConfig);
export const getDatabase = async () => {
  try {
    if (appDataSource.isInitialized) {
      return appDataSource;
    }
    await appDataSource.initialize();
    return appDataSource;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("getDatabase error:", error);
    throw error;
  }
};

export const cleanDatabase = async () => {
  const database = await getDatabase();
  await database.manager.connection.dropDatabase();
  await database.destroy();
};
export const loadDatabase = async (data: any) => {
  try {
    const database = await getDatabase();
    // eslint-disable-next-line no-restricted-syntax
    for (const table of Object.keys(data)) {
      // deep copy db data, because rep.insert modify input data in place
      const copiedData = data[table].map((item: any) => ({ ...item }));
      const rep = database.manager.getRepository(table);
      // eslint-disable-next-line no-await-in-loop
      await rep.insert(copiedData);
      // console.log('DB loaded: ', table, data[table].length);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("loadDatabase error:", error);
  }
};

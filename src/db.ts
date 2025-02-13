import { DataSource, DefaultNamingStrategy } from "typeorm";
import appDataSource from '../ormconfig'
// const baseOptions = require("../ormconfig.js");

// const getDbConfig = () => {
//   const config = {
//     ...baseOptions,
//     namingStrategy: new DefaultNamingStrategy(),
//     entities: [__dirname + "/entities/**/*.{ts,js}"],
//     migrations: [__dirname + "/migrations/**/*.{ts,js}"],
//     keepConnectionAlive: true,
//   };
//   return config;
// };

// const appDataSource = new DataSource(getDbConfig());
export const initDbConnection = async () => {
  await appDataSource.initialize();
  return appDataSource;
};

export const closeConnection = async () => {
  await appDataSource.destroy();
};

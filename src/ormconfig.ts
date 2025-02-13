import { DataSource } from 'typeorm';

const database = __dirname + '/../data/main.db'

console.log('connecting sqlite DB', database);
export default new DataSource({
  type: 'sqlite',
  database,
  entities: [
    'src/entities.sqlite/**/*.{ts,js}',
  ],
  migrations: [`${__dirname}/src/m/*{.ts,.js}`],
  logging: false,
});

import { join } from 'path';
import { DataSource } from 'typeorm';

const database = join(__dirname, '/../data/main.db')

console.log('connecting sqlite DB', database);
export default new DataSource({
  type: 'sqlite',
  database,
  entities: [
    __dirname +'/entities.sqlite/**/*.{ts,js}',
  ],
  migrations: [`${__dirname}/m/*{.ts,.js}`],
  logging: false,
});

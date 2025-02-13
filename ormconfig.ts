import { DataSource } from 'typeorm';

console.log('connecting sqlite DB');
export default new DataSource({
  type: 'sqlite',
  database: __dirname + '/data/main.db',
  entities: [
    'src/entities.sqlite/**/*.{ts,js}',
  ],
  migrations: [`${__dirname}/src/m/*{.ts,.js}`],
  logging: false,
});

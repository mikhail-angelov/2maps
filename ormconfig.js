const url = process.env.DB_URL || 'postgresql://postgres:postgres@localhost:5432/2map'
console.log('connecting DB: ', url.split('@')[1], process.env.NODE_ENV);

module.exports = {
  type: 'postgres',
  url,
  extra: {
    // Ref.: https://github.com/brianc/node-postgres/issues/2009
    rejectUnauthorized: false,
  },
  synchronize: false,
  autoSchemaSync: false,
  migrationsTableName: 'migrations',
  logging: process.env.NODE_ENV !== 'production',
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations',
  },
  entities: [
    'src/entities/**/*.{ts,js}',
  ],
  migrations: ['src/migrations/**/*.{ts,js}'],
};

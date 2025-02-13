import { Mark } from "../entities/mark";
import { Mark as Mark2 } from "../entities.sqlite/mark";
import { DataSource } from "typeorm";

const pgSource = new DataSource({
  type: "postgres",
  url: "postgresql://postgres:postgres@localhost:5432/2maps",
  entities: [`src/entities/*{.ts,.js}`],
  logging: "all",
});
const liteSource = new DataSource({
  type: "sqlite",
  database: "./data/main.db",
  entities: ["src/entities.sqlite/**/*.{ts,js}"],
  logging: "all",
});

const cp = async (rep1: any, rep2: any) => {
  const data = await rep1.find();
  console.log("data ", data);
  await rep2.save(data);
};

const convertPg2Sqlite = async () => {
  try {
    await pgSource.initialize();
    await liteSource.initialize();
    const pgConnection = pgSource.manager.connection;
    const liteConnection = liteSource.manager.connection;
    const pgTables = await pgConnection.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    console.log("pgTables ", pgTables);
    const tables = ["wiki", "track", "tileSource", "mapFile"];
    // await cp(pgConnection.getRepository('wiki'), liteConnection.getRepository('wiki'));
    // await cp(pgConnection.getRepository('track'), liteConnection.getRepository('track'));
    // await cp(pgConnection.getRepository('tile_source'), liteConnection.getRepository('tile_source'));
    // await cp(pgConnection.getRepository('map_file'), liteConnection.getRepository('map_file'));
    // await cp(pgConnection.getRepository('user'), liteConnection.getRepository('user'));
    // await cp(pgConnection.getRepository(User), liteConnection.getRepository(User2));
    const repo = pgConnection.getRepository(Mark);
    const repo2 = liteConnection.getRepository(Mark2);
    const marks = await repo.find();
    console.log("marks ", marks.length, marks[0]);
    const marks2 = marks.map(({ location, ...rest }) => ({
      ...rest,
      lat: location.coordinates[1],
      lng: location.coordinates[0],
    }));
    await repo2.save(marks2);

    await pgSource.destroy();
    await liteSource.destroy();
  } catch (e) {
    console.log("error ", e);
  }
};
convertPg2Sqlite();

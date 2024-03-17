import express from "express";
import * as http from "http";
import * as winston from "winston";
import * as expressWinston from "express-winston";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Tiles } from "./routes/tiles";
import { OsmTiles } from "./routes/osm";
import { Auth } from "./routes/auth";
import { initDbConnection } from "./db";
import { Marks } from "./routes/marks";
import { Tracks } from "./routes/tracks";
import { Maps } from "./routes/maps";
import { Users } from "./routes/users";
import { Wikimapia } from "./routes/wikimapia";
import sender from "./routes/mailer";

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 3000;

//static ui
app.use(express.static("ui/public"));

app.use(express.json());
app.use(cookieParser());
app.use(cors());

const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true })
  ),
};

if (!process.env.DEBUG) {
  loggerOptions.meta = false; // when not debugging, log requests as one-liners
}

app.use(expressWinston.logger(loggerOptions));
app.set("view engine", "ejs");
app.get("/", function (req, res) {
  res.render("../ui/index.ejs", {
    mapBoxKey: process.env.MAP_BOX_KEY || "",
    metrica: "",
  });
});

const run = async () => {
  const db = await initDbConnection();
  const tiles = new Tiles(db);
  const osm = new OsmTiles();
  const auth = new Auth(db, sender);
  const marks = new Marks(db, auth);
  const tracks = new Tracks(db, auth);
  const maps = new Maps(db, auth);
  const users = new Users(db, auth);
  const wikimapia = new Wikimapia(db);
  app.use("/auth", auth.getRoutes());
  app.use("/user", users.getRoutes());
  app.use("/marks", marks.getRoutes());
  app.use("/tracks", tracks.getRoutes());
  app.use("/maps", maps.getRoutes());
  app.use("/tiles", tiles.getRoutes());
  app.use("/osm-tiles", osm.getRoutes());
  app.use("/download", marks.getRoutes()); //todo: remove it
  app.use("/wikimapia", wikimapia.getRoutes());

  server.listen(port, () => {
    console.log(`Server running at port: ${port}`);
  });
};
run();

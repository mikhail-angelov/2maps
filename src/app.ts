import express from 'express';
import * as http from 'http';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cookieParser from 'cookie-parser'
import cors from 'cors';
import { MendeTiles } from './routes/mende';
import { OsmTiles } from './routes/osm'
import { Auth } from './routes/auth';
import { getConnection } from 'typeorm';
import { initDbConnections, DB } from './db'
import { Marks } from './routes/marks';
import { MapLoader } from './routes/mapLoader';
import sender from './routes/mailer'

const mendDB = process.env.DB_MENDE || "./data/mende-nn.sqlitedb"
const osmDB = process.env.DB_OSM || "./data/nn-osm.mbtiles"
const userDB = process.env.DB_USER || "./data/users.sqlitedb"

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = 3000;

//static ui
app.use(express.static('ui/public'))

app.use(express.json());
app.use(cookieParser())
app.use(cors())

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

const run = async () => {
    await initDbConnections({ mendDB, osmDB, userDB })

    const mende = new MendeTiles(getConnection(DB.Mende))
    const osm = new OsmTiles(getConnection(DB.Osm))
    const auth = new Auth(getConnection(DB.Users), sender)
    const markers = new Marks(getConnection(DB.Users), auth)
    const mapLoader = new MapLoader(auth)
    app.use('/auth', auth.getRoutes());
    app.use('/marks', markers.getRoutes());
    app.use('/map-mende', mende.getRoutes());
    app.use('/map-osm', osm.getRoutes());
    app.use('/download', markers.getRoutes());


    server.listen(port, () => {
        console.log(`Server running at port: ${port}`);
    });
}
run()

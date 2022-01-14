import express from 'express';
import * as http from 'http';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cookieParser from 'cookie-parser'
import cors from 'cors';
import { Tiles } from './routes/tiles';
import { OsmTiles } from './routes/osm'
import { Auth } from './routes/auth';
import { initDbConnection } from './db'
import { Marks } from './routes/marks';
import { Maps } from './routes/maps';
import { Users } from './routes/users';
import sender from './routes/mailer'

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 3000;

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
    const db = await initDbConnection();
    const tiles = new Tiles(db)
    const osm = new OsmTiles()
    const auth = new Auth(db, sender)
    const markers = new Marks(db, auth)
    const maps = new Maps(db,auth)
    const users = new Users(db,auth)
    app.use('/auth', auth.getRoutes());
    app.use('/user', users.getRoutes());
    app.use('/marks', markers.getRoutes());
    app.use('/maps', maps.getRoutes());
    app.use('/tiles', tiles.getRoutes());
    app.use('/osm-tiles', osm.getRoutes());
    app.use('/download', markers.getRoutes());

    server.listen(port, () => {
        console.log(`Server running at port: ${port}`);
    });
}
run()

import express from 'express';
import * as http from 'http';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import {MendeTiles} from './routes/mende';
import {Auth} from './routes/auth';
import {Marks} from './routes/marks';
import {CommonRoutesConfig} from './routes/common';
import debug from 'debug';
import {initDbConnections, DB} from './db'
import sender from './routes/mailer'
import { getConnection } from 'typeorm';

const mendDB = process.env.DB_MENDE || "./data/mende-nn.sqlitedb"
const userDB = process.env.DB_USER || "./data/users.sqlitedb"

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = 3000;
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');

// here we are adding middleware to parse all incoming requests as JSON 
app.use(express.json());

// here we are adding middleware to allow cross-origin requests
app.use(cors());

// here we are preparing the expressWinston logging middleware configuration,
// which will automatically log all HTTP requests handled by Express.js
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

// initialize the logger with the above configuration
app.use(expressWinston.logger(loggerOptions));

const run = async ()=>{
    //db
    await initDbConnections({mendDB, userDB})

// here we are adding the UserRoutes to our array,
// after sending the Express.js application object to have the routes added to our app!
const mende = new MendeTiles(getConnection(DB.Mende))
const auth = new Auth(getConnection(DB.Users), sender) 
const markers = new Marks(getConnection(DB.Users),auth)
app.use('/auth',auth.getRoutes());
app.use('/marks',markers.getRoutes());
app.use('/map/mende',mende.getRoutes());


// this is a simple route to make sure everything is working properly
app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send('ok')
});

server.listen(port, () => {
    // our only exception to avoiding console.log(), because we
    // always want to know when the server is done starting up
    console.log(`Server running at http://localhost:${port}`);
});
}
run()

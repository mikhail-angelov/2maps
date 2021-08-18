import express from 'express'

declare namespace Express {
    interface Request {
        user?: any;
    }
}

export type CRequest = express.Request &{user?:any;file?:any}
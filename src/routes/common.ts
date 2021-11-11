import express from 'express';
export interface CommonRoutesConfig {

    getRoutes: ()=>express.IRouter
}

export const maxAge = 60 * 60 * 24 * 7;
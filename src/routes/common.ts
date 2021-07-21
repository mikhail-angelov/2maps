import express from 'express';
export interface CommonRoutesConfig {

    getRoutes: ()=>express.IRouter
}
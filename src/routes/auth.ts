import { CommonRoutesConfig } from './common';
import express from 'express';
import { Connection } from "typeorm";
import { User } from '../entities/user'

export class Auth extends CommonRoutesConfig {
  db: Connection
  constructor(app: express.Application, db: Connection) {
    super(app, 'Auth');
    this.db = db;
  }

  configureRoutes() {
    // (we'll add the actual route configuration here next)
    this.app.post("/auth/login", (req, res) => {
      console.log("login", req.body);
    });
    return this.app;
  }

  async login(){
    
  }
  async logout(){
    
  }
  async check(){
    
  }
  async checkAuth(){
    
  }
  async register(){

  }
  async forgetPassword(){

  }
  async resetPassword(){

  }


}
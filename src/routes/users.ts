import { CommonRoutesConfig } from './common';
import express from 'express';
import { Connection, Repository } from "typeorm";
import { Auth } from './auth'
import { User } from "../entities/user";
import { Role } from '../entities/enums';

interface UserDto {
  id: string;
  email: string;
  role: Role;
}
const mapUser = ({id,email, role}: User): UserDto => ({id,email, role})

export class Users implements CommonRoutesConfig {
  userRepo: Repository<User>
  auth: Auth
  constructor(db: Connection, auth: Auth) {
    this.userRepo = db.getRepository(User);
    this.auth = auth;
  }
  getRoutes() {
    const router = express.Router();
    router.get("/", this.auth.authAdminMiddleware, async (req, res) => {
      console.log('get users')
      try {
        const users = await this.userRepo.find();
        const result = users.map(mapUser);
        res.status(200).json(result)
      } catch (e) {
        console.error('get users error', e)
        res.status(400).send("error")
      }
    });
    router.post("/", this.auth.authAdminMiddleware, async (req, res) => {
      console.log('create user')
      try {
        const { email, role = Role.user } = req.body;
        const user = await this.userRepo.save({ email, role, password: `${Date.now()}` });
        res.status(200).json(mapUser(user))
      } catch (e) {
        console.error('create user error', e)
        res.status(400).send("error")
      }
    });
    router.put("/:id", this.auth.authAdminMiddleware, async (req, res) => {
      console.log('update user', req.params.id, req.body)
      try {
        const { role } = req.body;
        await this.userRepo.update(req.params.id, { role });
        const user = await this.userRepo.findOne(req.params.id);
        if(!user) {
          res.status(400).send("error")
          return
        }
        res.status(200).json(mapUser(user))
      } catch (e) {
        console.error('update user error', e)

      }
    });
    return router;
  }
}
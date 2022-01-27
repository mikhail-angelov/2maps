import { CommonRoutesConfig } from './common';
import express from 'express';
import { CRequest } from '../../types/express'
import { Connection } from "typeorm";
import jwt, { VerifyErrors } from 'jsonwebtoken'
import bcrypt from 'bcrypt-nodejs'
import { User } from '../entities/user'
import { Role } from '../entities/enums'
import { Sender } from './mailer'

const HOST = process.env.HOST || ''

const JWT_SECRET = 'asdjkdknpjnpwwijoi'
export const JWT_COOKIES = 'mapnn'
const JWT_HEADER = 'authorization'

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}
interface Credentials {
  email: string;
  password: string;
}
interface SignUp {
  name: string;
  email: string;
  password: string;
}
interface Forget {
  email: string;
}
interface Reset {
  resetToken: string;
  password: string;
}

interface ChangePassword {
  password: string;
}

export class Auth implements CommonRoutesConfig {
  db: Connection
  sender: Sender
  constructor(db: Connection, sender: Sender) {
    this.db = db;
    this.sender = sender;
  }

  getRoutes() {
    const router = express.Router();
    // (we'll add the actual route configuration here next)
    router.post("/login", async (req, res) => {
      try {
        const [token] = await this.login(req.body)
        res.status(200).cookie(JWT_COOKIES, token, { maxAge: 864000000 }).json({ auth: 'ok' })
      } catch (e) {
        console.log('login error', e)
        res.status(401).json({ error: 'invalid login' })
      }
    });
    router.post("/logout", async (req, res) => {
      res.clearCookie(JWT_COOKIES)
      res.status(200).json({ auth: 'off' })
    });
    router.post("/check", async (req, res) => {
      try {

        const [token, decodedToken] = await this.check(req)
        res.status(200).cookie(JWT_COOKIES, token, { maxAge: 864000000 }).json({ auth: 'ok', ...decodedToken })
      } catch (e) {
        console.log('check error', e)
        res.status(401).json({ error: 'invalid auth' })
      }
    });
    router.post("/sign-up", async (req, res) => {
      try {
        console.log('req.body', req.body)
        const [token] = await this.register(req.body)
        res.status(200).cookie(JWT_COOKIES, token, { maxAge: 864000000 }).json({ auth: 'ok' })
      } catch (e) {
        console.log('sign up error', e)
        res.status(401).json({ error: 'invalid sign up' })
      }
    });
    router.post("/forget", async (req, res) => {
      try {
        await this.forgetPassword(req.body)
        res.status(200).json({ auth: 'ok' })
      } catch (e) {
        console.log('forget error', e)
        res.status(401).json({ error: 'invalid reset' })
      }

    });
    router.post("/reset-password", async (req, res) => {
      try {
        const token = await this.resetPassword(req.body)
        res.status(200).cookie(JWT_COOKIES, token, { maxAge: 864000, sameSite: false }).json({ auth: 'ok' })
      } catch (e) {
        console.log('reset error', e)
        res.status(401).json({ error: 'invalid reset' })
      }
    });

    //mobile
    router.post("/m/login", async (req, res) => {
      try {
        const [token, user] = await this.login(req.body)
        res.status(200).json({ token, user })
      } catch (e) {
        console.log('login error', e)
        res.status(401).json({ error: 'invalid login' })
      }
    });
    router.post("/m/logout", async (req, res) => {
      res.status(200).json({ auth: 'off' })
    });
    router.post("/m/check", async (req, res) => {
      try {
        const [token, user] = await this.checkMobile(req)
        res.status(200).json({ token, user })
      } catch (e) {
        console.log('check error', e)
        res.status(401).json({ error: 'invalid auth' })
      }
    });
    router.post("/m/sign-up", async (req, res) => {
      try {
        console.log('req.body', req.body)
        const [token, user] = await this.register(req.body)
        res.status(200).json({ token, user })
      } catch (e) {
        console.log('sign up error', e)
        res.status(401).json({ error: 'invalid sign up' })
      }
    });
    router.post("/m/forget", async (req, res) => {
      try {
        await this.forgetPassword(req.body)
        res.status(200).json({ auth: 'ok' })
      } catch (e) {
        console.log('forget error', e)
        res.status(401).json({ error: 'invalid reset' })
      }

    });
    router.post("/m/reset-password", async (req, res) => {
      try {
        const [token, user] = await this.resetPassword(req.body)
        res.status(200).json({ token, user })
      } catch (e) {
        console.log('reset error', e)
        res.status(401).json({ error: 'invalid reset' })
      }
    });
    router.post("/m/change-password", this.authMiddlewareMobile, async (req: CRequest, res) => {
      try {
        await this.changePassword(req.user.id, req.body.password)
        res.status(200).json({ status: 'password changed' })
      } catch (e) {
        console.log('password change error', e)
        res.status(401).json({ error: 'invalid password changing' })
      }
    });
    return router;
  }

  async login({ email, password }: Credentials): Promise<[string, JwtPayload]> {
    const e = email.toLowerCase()
    const user = await this.db.getRepository(User).findOne({ email: e })
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw "invalid login"
    }
    const payload: JwtPayload = { id: user.id, email: e, role: user.role }
    return [jwt.sign(payload, JWT_SECRET, { expiresIn: 864000000 }), payload];
  }

  async check(req: CRequest): Promise<[string, JwtPayload]> {
    const testToken = req.cookies ? req.cookies[JWT_COOKIES] || '' : ''
    if (!testToken) {
      throw "invalid auth"
    }
    const {id, email, role}: any = jwt.verify(testToken, JWT_SECRET)
    const payload: JwtPayload = { id, email, role}
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 864000000 });
    return [token, payload]
  }
  async checkMobile(req: CRequest) {
    const authHeader = req.headers ? req.headers[JWT_HEADER] || '' : ''
    const testToken: string = authHeader ? authHeader.slice(7) : ''
    if (!testToken) {
      throw "invalid auth"
    }
    const {id, email, role}: any = jwt.verify(testToken, JWT_SECRET)
    const payload: JwtPayload = {id, email, role}
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 864000000 });
    return [token, payload]
  }
  async authMiddleware(req: CRequest, res: express.Response, next: express.NextFunction) {
    const testToken = req.cookies ? req.cookies[JWT_COOKIES] || '' : ''
    if (!testToken) {
      return res.status(401).json({ error: 'invalid auth' })
    }
    jwt.verify(testToken, JWT_SECRET, (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        return res.status(401).json({ error: 'invalid auth' })
      }
      req.user = decoded
      next()
    })

  }
  async authAdminMiddleware(req: CRequest, res: express.Response, next: express.NextFunction) {
    const testToken = req.cookies ? req.cookies[JWT_COOKIES] || '' : ''
    if (!testToken) {
      return res.status(401).json({ error: 'invalid auth' })
    }
    jwt.verify(testToken, JWT_SECRET, (err: VerifyErrors | null, decoded: any) => {
      if (err || decoded.role !== Role.admin.toString()) {
        console.log('err', err, decoded.role)
        return res.status(401).json({ error: 'invalid admin auth' })
      }
      req.user = decoded
      next()
    })

  }
  async authMiddlewareMobile(req: CRequest, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers ? req.headers[JWT_HEADER] || '' : ''
    const testToken: string = authHeader ? authHeader.slice(7) : ''
    try {
      jwt.verify(testToken, JWT_SECRET, (err: VerifyErrors | null, decoded: any) => {
        if (err) {
          return res.status(401).json({ error: 'invalid auth' })
        }
        req.user = decoded
        next()
      })
    } catch (e) {
      res.status(401).json({ error: 'invalid auth' })
    }
  }
  async register({ name, email, password }: SignUp): Promise<[string, JwtPayload]> {
    const e = email.toLowerCase()
    let user = await this.db.getRepository(User).findOne({ email: e })
    if (user || !name || !password) {
      throw "invalid user"
    }
    const salt = bcrypt.genSaltSync(10)
    const saltedPass = bcrypt.hashSync(password, salt)
    user = await this.db.getRepository(User).save({ name, email: e, password: saltedPass })

    const payload: JwtPayload = { id: user.id, email:e, role: user.role }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 864000000 });
    await this.sender.sendEmail(e, 'Welcome to Map-NN app', 'Thank you for register at Map-NN app, use it for good!')
    return [token, payload]
  }
  async forgetPassword({ email }: Forget) {
    return this.db.transaction(async transactionalEntityManager => {
      const user = await transactionalEntityManager.getRepository(User).findOne({ email: email.toLowerCase() })
      if (!user) {
        throw "invalid user"
      }
      const resetToken = bcrypt.genSaltSync(10)
      await transactionalEntityManager.getRepository(User).update(user.id, { resetToken })
      const link = `${HOST}/?reset-token=${encodeURIComponent(resetToken)}`
      await this.sender.sendEmail(email, 'Map-nn reset password', `to reset password for map-nn use this link <a href="${link}">${link}</a>`)
    })
  }
  async resetPassword({ resetToken, password }: Reset) {
    let user = await this.db.getRepository(User).findOne({ resetToken: decodeURIComponent(resetToken) })
    if (!user || !resetToken) {
      throw "invalid user"
    }

    const salt = bcrypt.genSaltSync(10)
    const saltedPass = bcrypt.hashSync(password, salt)
    await this.db.getRepository(User).update(user.id, { password: saltedPass, resetToken: undefined })

    const payload: JwtPayload = { id: user.id, email: user.email, role: user.role }
    return [jwt.sign(payload, JWT_SECRET, { expiresIn: 864000 }), payload];
  }

  changePassword(userId: string, newPassword: string) {
    const salt = bcrypt.genSaltSync(10)
    const saltedPass = bcrypt.hashSync(newPassword, salt)
    return this.db.getRepository(User).update(userId, { password: saltedPass })
  }

}
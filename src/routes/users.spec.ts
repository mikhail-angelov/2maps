import { expect } from 'chai'
import { DbUnit } from 'nestjs-db-unit';
import { initDbConnectionTest } from '../db'
import { Auth, JWT_COOKIES } from './auth'
import { Users } from './users'
import { Request } from 'express'
import { Role } from '../entities/enums';

describe('users', () => {
    let db = new DbUnit();
    let auth: Auth
    let users: Users
    let authToken: string
    let userId: string
    beforeEach(async () => {
        const conn = await initDbConnectionTest(db);
        const sender: any = { sendEmail: () => { } }
        auth = new Auth(conn, sender)
        users = new Users(conn, auth)
        // add user
        const [a, payload] = await auth.register({ name: 'test', email: 'test', password: 'test' })
        userId = payload.id
        await users.userRepo.update(userId, { role: Role.admin }) //promote to admin
        const [token, p] = await auth.login({ email: 'test', password: 'test' })
        authToken = token
    })
    afterEach(() => db.closeDb());

    it('get list', (done) => {
        const req = { method: 'get', cookies: { [JWT_COOKIES]: authToken } } as Request
        const routes = users.getRoutes()

        //0 - get list
        routes.stack[0].handle(req, {
            status: () => ({
                json: (resp: any) => {
                    expect(resp.length).to.equal(1)
                    done()
                }
            })
        })
    })
    it('create user', (done) => {
        const EMAIL = 'new@test.com'
        const req = { method: 'post', body: { email: EMAIL }, cookies: { [JWT_COOKIES]: authToken } } as Request
        const routes = users.getRoutes()

        //1 - add user
        routes.stack[1].handle(req, {
            status: () => ({
                json: (resp: any) => {
                    expect(resp.email).to.equal(EMAIL)
                    expect(resp.role).to.equal(Role.user)
                    done()
                }
            })
        })
    })
    it('update user', (done) => {
        const req = { method: 'put', params: { id: userId }, body: { role: Role.test }, cookies: { [JWT_COOKIES]: authToken } } as any
        const routes = users.getRoutes()

        //1 - update user
        routes.stack[2].handle(req, {
            status: () => ({
                json: (resp: any) => {
                    expect(resp.email).to.equal('test')
                    expect(resp.role).to.equal(Role.test)
                    done()
                }
            })
        })
    })
})
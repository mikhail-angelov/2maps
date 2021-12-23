import { expect } from 'chai'
import { DbUnit } from 'nestjs-db-unit';
import { initDbConnectionTest } from '../db'
import { Auth, JWT_COOKIES } from './auth'
import { CRequest } from '../../types/express'

describe('auth', () => {
    let db = new DbUnit();
    let auth: Auth
    beforeEach(async () => {
        const conn = await initDbConnectionTest(db);
        const app: any = { post: () => { } }
        const sender: any = { sendEmail: () => { } }
        auth = new Auth(conn, sender)
        // add user
        await auth.register({ name: 'test', email: 'test', password: 'test' })
    })
    afterEach(() => db.closeDb());

    it('login', async () => {
        const token = await auth.login({ email: 'test', password: 'test' })
        expect(!!token).to.equal(true)
    })

    it('login invalid', async () => {
        try {
            await auth.login({ email: 'test', password: 'invalid' })
            expect(false).to.equal(true);
        } catch (e) {
            expect(e).to.equal('invalid login');
        }
    })

    it('check', async () => {
        const [token, _] = await auth.login({ email: 'test', password: 'test' })
        const req = { cookies: { [JWT_COOKIES]: token } } as CRequest
        const [t, u] = await auth.check(req)
        expect(!!t).to.equal(true)
    })

    it('check invalid', async () => {
        try {
            const req = { cookies: { [JWT_COOKIES]: 'invalid' } } as CRequest
            await auth.check(req)
            expect(false).to.equal(true);
        } catch (e) {
            expect(!!e).to.equal(true);
        }
    })

    it('register', async () => {
        await auth.register({ name: 'test1', email: 'test1', password: 'test1' })
        const [token] = await auth.login({ email: 'test1', password: 'test1' })
        expect(!!token).to.equal(true)
    })
})
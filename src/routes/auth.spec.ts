import { expect } from 'chai'
import { Auth, JWT_COOKIES } from './auth'
import { Request } from 'express'
import { cleanDatabase, getDatabase } from '../../test/database-setup'

describe('auth', () => {
    let auth: Auth
    beforeEach(async () => {
        const db = await getDatabase();
        const sender: any = { sendEmail: () => null }
        auth = new Auth(db, sender)
        // add user
        await auth.register({ name: 'test', email: 'test', password: 'test' })
    })
    afterEach(() => cleanDatabase());

    it('login', async () => {
        const token = await auth.login({ email: 'test', password: 'test' })
        expect(!!token).to.equal(true)
    })

    it('login invalid', async () => {
        try {
            await auth.login({ email: 'test', password: 'invalid' })
            expect(false).to.equal(true);
        } catch (e: any) {
            expect(e.message).to.equal('invalid login');
        }
    })

    it('check', async () => {
        const [token, _] = await auth.login({ email: 'test', password: 'test' })
        const req = { cookies: { [JWT_COOKIES]: token } } as Request
        const [t, u] = await auth.check(req)
        expect(!!t).to.equal(true)
    })

    it('check invalid', async () => {
        try {
            const req = { cookies: { [JWT_COOKIES]: 'invalid' } } as Request
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
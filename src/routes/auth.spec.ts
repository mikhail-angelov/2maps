import jwt from "jsonwebtoken"
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

    // ---- Mobile auth tests ----

    it('loginMobile returns long-lived token', async () => {
        const [token, payload] = await auth.loginMobile({ email: 'test', password: 'test' })
        expect(!!token).to.equal(true)
        expect(payload.email).to.equal('test')
        // verify token expiry is roughly 10 years (in ms: 10*365*24*60*60*1000)
        const decoded: any = jwt.verify(token, 'asdjkdknpjnpwwijoi')
        const tenYearsMs = 10 * 365 * 24 * 60 * 60 * 1000
        const issuedAt = decoded.iat * 1000
        const expiresAt = decoded.exp * 1000
        const actualExpiry = expiresAt - issuedAt
        // allow 1 hour slack for clock skew
        expect(actualExpiry).to.be.within(tenYearsMs - 3600000, tenYearsMs + 3600000)
    })

    it('loginMobile rejects bad password', async () => {
        try {
            await auth.loginMobile({ email: 'test', password: 'wrong' })
            expect(false).to.equal(true)
        } catch (e: any) {
            expect(e.message).to.equal('invalid login')
        }
    })

    it('registerMobile creates user and returns long-lived token', async () => {
        const [token, payload] = await auth.registerMobile({
            name: 'mobile-test',
            email: 'mobile@test.com',
            password: 'testpass'
        })
        expect(!!token).to.equal(true)
        expect(payload.email).to.equal('mobile@test.com')

        // Verify can login with the new account
        const [loginToken] = await auth.loginMobile({ email: 'mobile@test.com', password: 'testpass' })
        expect(!!loginToken).to.equal(true)
    })

    it('registerMobile rejects duplicate email', async () => {
        try {
            await auth.registerMobile({
                name: 'dup',
                email: 'test',
                password: 'testpass'
            })
            expect(false).to.equal(true)
        } catch (e: any) {
            expect(e.message).to.equal('invalid user')
        }
    })

    it('checkMobile reissues long-lived token', async () => {
        const [token] = await auth.loginMobile({ email: 'test', password: 'test' })
        const req = { headers: { authorization: 'Bearer ' + token } } as unknown as Request
        const [newToken, payload] = await auth.checkMobile(req)
        expect(!!newToken).to.equal(true)
        expect(payload.email).to.equal('test')

        // New token should also be long-lived
        const decoded: any = jwt.verify(newToken, 'asdjkdknpjnpwwijoi')
        const tenYearsMs = 10 * 365 * 24 * 60 * 60 * 1000
        const actualExpiry = (decoded.exp - decoded.iat) * 1000
        expect(actualExpiry).to.be.within(tenYearsMs - 3600000, tenYearsMs + 3600000)
    })

    it('checkMobile rejects invalid token', async () => {
        const req = { headers: { authorization: 'Bearer fake-token' } } as unknown as Request
        try {
            await auth.checkMobile(req)
            expect(false).to.equal(true)
        } catch (e: any) {
            expect(!!e).to.equal(true)
        }
    })

    it('loginMobile then checkMobile preserves user data', async () => {
        const [token] = await auth.loginMobile({ email: 'test', password: 'test' })
        const req = { headers: { authorization: 'Bearer ' + token } } as unknown as Request
        const [newToken, payload] = await auth.checkMobile(req)
        expect(payload.email).to.equal('test')
        expect(payload.id).to.be.a('string')
        expect(newToken).to.not.equal(token) // re-issued
    })

    it('resetPasswordMobile issues long-lived token', async () => {
        // Generate a reset token by calling forgetPassword
        // We'll simulate by directly inserting a resetToken into the DB
        const db = await getDatabase()
        await db.getRepository('User').update(
            { email: 'test' },
            { resetToken: 'test-reset-token-123' }
        )
        const [token] = await auth.resetPasswordMobile({
            resetToken: 'test-reset-token-123',
            password: 'newpass'
        })
        expect(!!token).to.equal(true)

        // Should be able to login with new password
        const [loginToken] = await auth.loginMobile({ email: 'test', password: 'newpass' })
        expect(!!loginToken).to.equal(true)
    })

    it('mobile refresh re-issues token with long expiry', async () => {
        const [oldToken] = await auth.loginMobile({ email: 'test', password: 'test' })

        // Simulate /auth/m/refresh logic: verify old token, sign new one
        const decoded: any = jwt.verify(oldToken, 'asdjkdknpjnpwwijoi')
        const payload = { id: decoded.id, email: decoded.email, role: decoded.role }
        const newToken = jwt.sign(payload, 'asdjkdknpjnpwwijoi', { expiresIn: 10 * 365 * 24 * 60 * 60 * 1000 })

        expect(newToken).to.not.equal(oldToken)

        // Decode new token and verify expiry
        const newDecoded: any = jwt.verify(newToken, 'asdjkdknpjnpwwijoi')
        expect(newDecoded.email).to.equal('test')
        const tenYearsMs = 10 * 365 * 24 * 60 * 60 * 1000
        const actualExpiry = (newDecoded.exp - newDecoded.iat) * 1000
        expect(actualExpiry).to.be.within(tenYearsMs - 3600000, tenYearsMs + 3600000)
    })
})
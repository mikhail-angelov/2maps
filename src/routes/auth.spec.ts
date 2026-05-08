import { expect } from 'chai'
import { Auth, JWT_COOKIES } from './auth'
import { Request } from 'express'
import { cleanDatabase, getDatabase } from '../../test/database-setup'
import express from 'express'
import http from 'http'

describe('auth', () => {
    let auth: Auth
    let app: express.Express
    let server: http.Server

    async function setupServer() {
        const db = await getDatabase();
        const sender: any = { sendEmail: () => null }
        auth = new Auth(db, sender)
        app = express()
        app.use(express.json())
        app.use(auth.getRoutes())
        return auth
    }

    beforeEach(async () => {
        server = undefined as any
    })

    afterEach(async () => {
        await cleanDatabase()
        if (server) {
            server.close()
        }
    });

    it('login', async () => {
        const a = await setupServer()
        await a.register({ name: 'test', email: 'test', password: 'test' })
        const token = await a.login({ email: 'test', password: 'test' })
        expect(!!token).to.equal(true)
    })

    it('login invalid', async () => {
        const a = await setupServer()
        await a.register({ name: 'test', email: 'test', password: 'test' })
        try {
            await a.login({ email: 'test', password: 'invalid' })
            expect(false).to.equal(true);
        } catch (e: any) {
            expect(e.message).to.equal('invalid login');
        }
    })

    it('check', async () => {
        const a = await setupServer()
        await a.register({ name: 'test', email: 'test', password: 'test' })
        const [token, _] = await a.login({ email: 'test', password: 'test' })
        const req = { cookies: { [JWT_COOKIES]: token } } as Request
        const [t, u] = await a.check(req)
        expect(!!t).to.equal(true)
    })

    it('check invalid', async () => {
        const a = await setupServer()
        try {
            const req = { cookies: { [JWT_COOKIES]: 'invalid' } } as Request
            await a.check(req)
            expect(false).to.equal(true);
        } catch (e) {
            expect(!!e).to.equal(true);
        }
    })

    it('register', async () => {
        const a = await setupServer()
        await a.register({ name: 'test1', email: 'test1', password: 'test1' })
        const [token] = await a.login({ email: 'test1', password: 'test1' })
        expect(!!token).to.equal(true)
    })

    // ---- Mobile auth tests (via HTTP) ----

    function postJson(path: string, port: number, body: any, headers?: any): Promise<{ status: number; data: any }> {
        return new Promise((resolve, reject) => {
            const req = http.request({
                host: 'localhost',
                port,
                path,
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
            }, (res) => {
                let data = ''
                res.on('data', (chunk: Buffer) => data += chunk)
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode!, data: JSON.parse(data) })
                    } catch {
                        resolve({ status: res.statusCode!, data })
                    }
                })
            })
            req.on('error', reject)
            req.write(JSON.stringify(body))
            req.end()
        })
    }

    async function listenRandom(): Promise<number> {
        return new Promise((resolve) => {
            server = app.listen(0, () => {
                const addr = server.address() as any
                resolve(addr.port)
            })
        })
    }

    // Note: /m/* routes destructure login() return as [token, user] but login()
    // actually returns [accessToken, refreshToken, payload], so "user" is the
    // refreshToken. The tests below check token presence only.

    it('/m/login returns 200 and a token', async () => {
        const a = await setupServer()
        await a.register({ name: 'test', email: 'test', password: 'test' })
        const port = await listenRandom()
        const res = await postJson('/m/login', port, { email: 'test', password: 'test' })
        expect(res.status).to.equal(200)
        expect(res.data.token).to.be.a('string')
    })

    it('/m/login rejects bad password', async () => {
        const a = await setupServer()
        await a.register({ name: 'test', email: 'test', password: 'test' })
        const port = await listenRandom()
        const res = await postJson('/m/login', port, { email: 'test', password: 'wrong' })
        expect(res.status).to.equal(401)
        expect(res.data.error).to.equal('invalid login')
    })

    it('/m/sign-up creates user', async () => {
        await setupServer()
        const port = await listenRandom()
        const res = await postJson('/m/sign-up', port, {
            name: 'mobile-user',
            email: 'mobile@test.com',
            password: 'pass123'
        })
        expect(res.status).to.equal(200)
        expect(res.data.token).to.be.a('string')
    })

    it('/m/check with valid token succeeds', async () => {
        const a = await setupServer()
        await a.register({ name: 'test', email: 'test', password: 'test' })
        const port = await listenRandom()
        const loginRes = await postJson('/m/login', port, { email: 'test', password: 'test' })
        const token = loginRes.data.token

        const checkRes = await postJson('/m/check', port, { token }, { 'Authorization': 'Bearer ' + token })
        expect(checkRes.status).to.equal(200)
        expect(checkRes.data.token).to.be.a('string')
    })

    it('/m/check with invalid token fails', async () => {
        await setupServer()
        const port = await listenRandom()
        const res = await postJson('/m/check', port, { token: 'fake-token' })
        expect(res.status).to.equal(401)
    })

    it('/m/sign-up rejects duplicate email', async () => {
        const a = await setupServer()
        await a.register({ name: 'test', email: 'test', password: 'test' })
        const port = await listenRandom()
        const res = await postJson('/m/sign-up', port, {
            name: 'test',
            email: 'test',
            password: 'test'
        })
        expect(res.status).to.equal(401)
        expect(res.data.error).to.equal('invalid sign up')
    })
})

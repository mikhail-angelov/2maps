import { expect } from 'chai'
import { getConnection } from 'typeorm';
import {unlink} from 'fs'
import {promisify} from 'util'
import { initDbConnections, closeConnections } from './db'
import { User } from './entities/user'

const remove = promisify(unlink)
describe('db', () => {
    beforeEach(() => initDbConnections({ userDB: './tmp/user.sqlitedb' }))
    afterEach(async() => {
        await closeConnections()
        await remove('./tmp/user.sqlitedb') //remove user db
    })

    it('check users db', async () => {
        let user = await getConnection('users').getRepository(User).findOne()
        expect(!!user).to.equal(false)

        await getConnection('users').getRepository(User).insert({ email: 'test', password: 'test' })
        user = await getConnection('users').getRepository(User).findOne()
        expect(user?.email).to.equal('test')
    })
})
import { expect } from 'chai'
import { getConnection } from 'typeorm';
import {unlink} from 'fs'
import {promisify} from 'util'
import { initDbConnections, closeConnections } from './db'
import { EtoMesto } from './entities/etoMesto'
import { User } from './entities/user'

const remove = promisify(unlink)
describe('db', () => {
    beforeEach(() => initDbConnections({ mendDB: './tmp/pgm.sqlitedb', osmDB: './tmp/nn-osm.mbtiles', userDB: './tmp/user.sqlitedb' }))
    afterEach(async() => {
        await closeConnections()
        await remove('./tmp/user.sqlitedb') //remove user db
    })

    it('check tiles db', async () => {
        const tile = await getConnection('mende').getRepository(EtoMesto)
            .findOne()
        expect(!!tile?.x).to.equal(true)
    })

    it('check users db', async () => {
        let user = await getConnection('users').getRepository(User).findOne()
        expect(!!user).to.equal(false)

        await getConnection('users').getRepository(User).insert({ email: 'test', password: 'test' })
        user = await getConnection('users').getRepository(User).findOne()
        expect(user?.email).to.equal('test')
    })
})
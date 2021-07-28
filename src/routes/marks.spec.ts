import { expect } from 'chai'
import { getConnection } from 'typeorm';
import { unlink } from 'fs'
import { promisify } from 'util'
import { initDbConnections, closeConnections, DB } from '../db'
import { Mark } from '../entities/mark'
import { User } from '../entities/user'
import { Marks, WebMark } from './marks'

const remove = promisify(unlink)
describe('marks', () => {
    let marks: Marks
    let userId: string
    beforeEach(async () => {
        await initDbConnections({ mendDB: './tmp/pgm.sqlitedb', userDB: './tmp/user.sqlitedb' })
        const app: any = { post: () => { } }
        const auth: any = { authMiddleware : () => Promise.resolve('test') }
        marks = new Marks(getConnection(DB.Users), auth)
        // add marks
        const db = await getConnection('users')
        const user = await db.getRepository(User).save({id:'aaade243-0fb7-480f-801c-bc64566209cc',name:'test',email:'test', password:'test'})
        userId = user.id
        await db.getRepository(Mark).save([{
            id:'123567',
            userId,
            name:'test',
            description:'',
            lat: 56.32323794803307,
            lng:43.989515211547825,
            timestamp:1626944504856,
        }])
    })
    afterEach(async () => {
        await closeConnections()
        await remove('./tmp/user.sqlitedb') //remove user db
    })

    it('check sync', async () => {
        const webMarks:WebMark[] = []
        const syncedMarks = await marks.syncMarks({id:userId}, webMarks)
        expect(syncedMarks.length).to.equal(1)
    })
    it('check sync with conflict', async () => {
        const webMarks:WebMark[] = [{
            id:'123567',
            name:'test-ignore',
            lat: 56.32323794803307,
            lng:43.989515211547825,
            timestamp:1626944504856,
        },
        {
            id:'double',
            name:'test-good',
            lat: 56.32323794803307,
            lng:43.989515211547825,
            timestamp:1626944504856,
        },
        {
            id:'double',
            name:'test-dropped',
            lat: 56.32323794803307,
            lng:43.989515211547825,
            timestamp:1626944504856,
        }]
        const syncedMarks = await marks.syncMarks({id:userId}, webMarks)
        expect(syncedMarks.length).to.equal(2)
    })

})
import { expect } from 'chai'
import { DbUnit } from 'nestjs-db-unit';
import { initDbConnectionTest } from '../db'
import { Marks, WebMark } from './marks'
import { Point } from 'geojson';
import { Mark } from '../entities/mark'

const USER = { id: 'aaade243-0fb7-480f-801c-bc64566209cc', name: 'test', email: 'test', password: 'test' }
const location = { type: 'Point', coordinates: [43.989515211547825, 56.32323794803307] } as Point
const MARKS: Mark[] = [{
    id: '014acc56-cb26-41a6-b995-1266157f3c07',
    userId: USER.id,
    name: 'test',
    description: '',
    location,
    timestamp: new Date(1626944504856),
}, {
    id: '014acc56-cb26-41a6-b995-1266157f3c08',
    userId: USER.id,
    name: 'test2',
    description: 'none',
    rate: 2,
    location,
    timestamp: new Date(1626944504856),
}, {
    id: '014acc56-cb26-41a6-b995-1266157f3c09',
    userId: USER.id,
    name: 'to remove',
    description: 'none',
    location,
    timestamp: new Date(1626944504856),
}]

describe('marks', () => {
    let db = new DbUnit({ debug: true });
    let marks: Marks
    beforeEach(async () => {
        const conn = await initDbConnectionTest(db);
        const auth: any = { authMiddleware: () => Promise.resolve({ user: USER }) }
        marks = new Marks(conn, auth)
        await db.load({
            User: [USER],
            Mark: MARKS,
        });
    })
    afterEach(() => db.closeDb());

    it('check blank sync', async () => {
        const webMarks: WebMark[] = []
        const syncedMarks = await marks.syncMarks(USER.id, webMarks)
        expect(syncedMarks.length).to.equal(3)
    })
    it('check sync with conflict', async () => {
        const webMarks: WebMark[] = [{
            id: '014acc56-cb26-41a6-b995-1266157f3c07',
            name: 'test-ignore',
            lat: 56.32323794803307,
            lng: 43.989515211547825,
            timestamp: 1626944504856,
        },
        {
            id: '014acc56-cb26-41a6-b995-1266157f3c08',
            name: 'update second',
            description: 'new',
            rate: 2,
            lat: 56.32323794803307,
            lng: 43.989515211547825,
            timestamp: 1626944504857,
        },
        {
            id: '014acc56-cb26-41a6-b995-1266157f3c00',
            name: 'test-good',
            lat: 56.32323794803307,
            lng: 43.989515211547825,
            timestamp: 1626944504856,
        },
        {
            id: '014acc56-cb26-41a6-b995-1266157f3c00',
            name: 'test-dropped',
            lat: 56.32323794803307,
            lng: 43.989515211547825,
            timestamp: 1626944504856,
        },
        {
            id: '014acc56-cb26-41a6-b995-1266157f3c09',
            name: 'to remove',
            removed: true,
            lat: 56.32323794803307,
            lng: 43.989515211547825,
            timestamp: 1626944504856,
        }]
        const syncedMarks = await marks.syncMarks(USER.id, webMarks)
        console.log(syncedMarks)
        expect(syncedMarks.length).to.equal(3)
    })
})
import { expect } from 'chai'
import { DbUnit } from 'nestjs-db-unit';
import { initDbConnectionTest } from '../db'
import { Wikimapia } from './wikimapia'

describe('wikimapia', () => {
    const db = new DbUnit();
    let wikimapia: Wikimapia;
    const coords = { x: 0, y: 1, z: 2 }
    beforeEach(async () => {
        const conn = await initDbConnectionTest(db);
        wikimapia = new Wikimapia(conn)
        await wikimapia.addTile(coords, Buffer.from("test"))
    })
    afterEach(() => db.closeDb());

    it('should get wiki tile', async () => {
        const tile = await wikimapia.getTile(coords)
        expect(tile?.x).equal(coords.x)
        expect(tile?.image.toString()).equal("test")
    })
    it('should update wiki tile', async () => {
        let tile = await wikimapia.getTile(coords)
        const id = tile?.id||''
        await wikimapia.updateTile(id, Buffer.from('next'))
        tile = await wikimapia.getTile(coords)
        expect(tile?.image.toString()).equal("next")
    })

})
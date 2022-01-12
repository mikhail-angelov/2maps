import axios from 'axios'
import fs from 'fs'

interface FeatureResponse {
    folder: any[];
    page: number;
    count: number;
    found: string
}
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const url = 'http://api.wikimapia.org/?function=box&bbox=43.135590,55.210566,45.803570,56.853144&key=example&count=100&format=json'
const loadToJson = async () => {
    const items = []
    let data: FeatureResponse|null=null
    try {
        let response = await axios.get<FeatureResponse>(url)
        data = response.data
        const found = +data.found
        let loaded = data.count
        let page = 1
        items.push(...data.folder)
        console.log('loaded of ',found, page, loaded)
        while (loaded < found && page < 1000) {
            page++
            await delay(30000) // 30 sec, to avoid wikimapia limits
            response = await axios.get<FeatureResponse>(`${url}&page=${page}`)
            data = response.data
            loaded += data.count
            items.push(...data.folder)
            console.log('loaded of ',found, page, loaded)
        }
    } catch (e) {
        console.log('error ', e, data)
        //message: 'Maximum number (10000) of objects per area reached. Request smaller area to get other places.'
    }
    fs.writeFileSync('./wikimapia.json', JSON.stringify(items, null, 2))
}
loadToJson()
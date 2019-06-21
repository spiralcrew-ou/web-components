import { IpfsClient } from './ipfs.client' 
import { CidConfig } from '../cid.config';

describe ('Local Services Tests', () => {

    it.skip('should create and read ipfs data', async() => {

        let ipfsClient = new IpfsClient();

        let object = {
            text: 'abc',
            type: 'par',
            links: []
        }

        let cidConfig = new CidConfig(
            'base58btc', 1, 'raw', 'sha2-256');

        let id = await ipfsClient.addObject(object, cidConfig);

        expect(id).toBeDefined();
        expect(id).not.toBe('');

        let objectRead = await ipfsClient.get(id);

        expect(objectRead).toEqual(object);
        
    })
})
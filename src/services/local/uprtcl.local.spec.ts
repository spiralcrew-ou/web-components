// import Dexie from 'dexie';
// import indexedDB from 'fake-indexeddb';
// Dexie.dependencies.indexedDB = indexedDB;

import {UprtclLocal} from './uprtcl.local'

describe ('Local Services Tests', () => {

    it('Smoke test', async() => {
        const p = new UprtclLocal()
        expect(p).toBe(null)
        console.log(p)
    })
})
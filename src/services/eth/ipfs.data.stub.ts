import { ipldService } from '../ipld';
import { ipfsCid } from '..';

export class IpfsStub {
    store = new Object();

    async getData(id: string): Promise<any> {
        return this.store[id];
    }
    
    async createData(data: any): Promise<string> {
        const idHex = await this.getObjectId(data);
        this.store[idHex] = data;
        return idHex;
    }

    async getObjectId(data: any) {
        const id = await ipldService.generateCid(JSON.stringify(data), ipfsCid);
        return id.toString();
    }
}


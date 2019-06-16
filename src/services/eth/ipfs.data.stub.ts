import Buffer from 'buffer/';

const buf2hex = (buffer) => { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

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
        const dataString = JSON.stringify(data);
        const id = await window.crypto.subtle.digest('SHA-256', Buffer.Buffer.from(dataString));
        return buf2hex(id);
    }
}


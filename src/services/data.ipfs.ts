import { DataService } from './data.service';

export class DataIpfs implements DataService {
  ipfsClient = null;

  constructor(host: string) {
    this.ipfsClient = window['IpfsHttpClient']({
      host,
      port: 5001,
      protocol: 'https'
    });
  }

  async getData(dataId: string): Promise<any> {
    const data = await this.ipfsClient.cat(dataId);
    console.log('[IPFS] getData', data);
    return data;
  }
  async createData(data: any): Promise<string> {
    const dataId = await this.ipfsClient.add(data);
    console.log('[IPFS] createData', dataId);
    return dataId;
  }
}

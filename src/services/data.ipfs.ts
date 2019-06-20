import { DataService } from './data.service';
import { CidConfig } from './cid.config';

export class DataIpfs implements DataService {
  ipfsClient = null;

  getCidConfig(): CidConfig {
    return new CidConfig(
      'base58btc', 0, 'dag-pb', 'sha2-256', true);
  }

  setCidConfig(cidConfig: CidConfig): void {
    console.error({cidConfig})
    throw new Error("IPFS dont accept new Cid configurations for the moment");
  }

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

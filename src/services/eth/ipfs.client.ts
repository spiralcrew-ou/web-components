import { CidConfig } from "../local/cid.config";

const ipfsClient = window['IpfsHttpClient']

const defaultOptions = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
};

export class IpfsClient {
  client: any;

  constructor(options = defaultOptions) {
    this.client = ipfsClient(options);
  }

  private getObjectBuffer(object: any): Buffer {
    return Buffer.from(JSON.stringify(object));
  }

  private cidConfigToOptions(cidConfig: CidConfig): any {
    // TODO check if this is correct and IPFS codec is always 
    if (cidConfig.codec !== 'dag-pb') throw new Error('unexpected codec');
    return {
      cidVersion: cidConfig.version,
      cidBase: cidConfig.base,
      hashAlg: cidConfig.type
    }
  }

  public async computeHash(object: object, cidConfig: CidConfig): Promise<string> {
    /** just like add but overwrite onlyHash option */
    let options = this.cidConfigToOptions(cidConfig);
    options.onlyHash = true;
    const result = await this.client.add(
      this.getObjectBuffer(object), options)
    
    return result[0].hash;
  }

  public async addObject(object: any, cidConfig: CidConfig): Promise<string> {
    const result = await this.client.add(
      this.getObjectBuffer(object),
      this.cidConfigToOptions(cidConfig));

    return result[0].hash;
  }

  public async get(hash: string): Promise<any> {
    const raw = await this.client.cat(hash);
    return JSON.parse(Buffer.from(raw).toString());
  }
}

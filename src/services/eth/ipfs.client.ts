import { CidConfig } from "../cid.config";

const ipfsClient = window['IpfsHttpClient']

const defaultOptions: any = {
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

  public async addObject(object: any, cidConfig: CidConfig): Promise<string> {
    const result = await this.client.dag.put(
      this.getObjectBuffer(object), { format: cidConfig.codec, hashAlg: cidConfig.type, cidVersion: cidConfig.version });
    return result.toString(cidConfig.base)
  }

  public async get(hash: string): Promise<any> {
    const raw = await this.client.cat(hash);
    return JSON.parse(Buffer.from(raw).toString());
  }
}

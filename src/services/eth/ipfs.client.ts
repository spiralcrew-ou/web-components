import { CidConfig } from "../cid.config";

const defaultOptions: any = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
};

export class IpfsClient {
  client: any;
  connectionReady: any;

  constructor(options = defaultOptions) {
    this.connectionReady = new Promise((resolve) => {
      let interval = setInterval(() => {
        let ipfsClient = window['IpfsHttpClient']
        console.log('[IPFS] Waiting for client injection')
        if (ipfsClient) {
          this.client = ipfsClient(options)
          clearInterval(interval)
          resolve()
        }
      }, 200)
    })
  }

  public ready(): Promise<void> {
    if (this.client) return Promise.resolve();
    else return this.connectionReady;
  }

  private getObjectBuffer(object: object): Buffer {
    return Buffer.from(JSON.stringify(object));
  }

  public async addObject(object: object, cidConfig: CidConfig): Promise<string> {
    await this.ready();

    const result = await this.client.dag.put(
      this.getObjectBuffer(object), { format: cidConfig.codec, hashAlg: cidConfig.type, cidVersion: cidConfig.version });
    return result.toString(cidConfig.base)
  }

  public async get<T>(hash: string): Promise<T> {
    await this.ready();

    const raw = await this.client.get(hash);
    return JSON.parse(Buffer.from(raw[0].content).toString());
  }
}

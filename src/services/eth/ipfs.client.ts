const defaultOptions = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
};

export class IpfsClient {
  client: any;

  constructor(options = defaultOptions) {
    this.client = window['IpfsHttpClient'](options);
  }

  public async addObject(object: any, options: any = {}): Promise<string> {
    const buffer = Buffer.from(JSON.stringify(object));
    const result = await this.client.add(buffer, options);
    return result[0].hash;
  }

  public async get(hash: string): Promise<any> {
    const raw = await this.client.cat(hash);
    return JSON.parse(Buffer.from(raw).toString());
  }
}

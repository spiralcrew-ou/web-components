export class Cid {
  base: string;
  version: number;
  codec: string;
  type: string;

  constructor(_base: string, _version: number, _codec: string, _type: string) {
    this.base = _base;
    this.version = _version;
    this.codec = _codec;
    this.type = _type;
  }
}

export const c1Cid = new Cid('base58btc', 1, 'raw', 'sha3-256');
export const hcCid = new Cid('base58btc', 0, 'dag-pb', 'sha2-256');
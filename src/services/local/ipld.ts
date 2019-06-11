import CID from 'cids';
import multihashing from 'multihashing-async';
import Buffer from 'buffer/';

export class IpldService {

  private VERSION = 'v1';
  private CODEC = 'raw';
  private TYPE = 'sha2-256';
  private BASE = 'base58btc';

  /** wrapper that takes a message and computes its [cid](https://github.com/multiformats/cid) */
  async generateCid(
    message: string, 
    base: string,
    version: string,
    codec: string,
    type: string): Promise<string> {

    const b = Buffer.Buffer.from(message);
    const encoded = await multihashing.digest(b, type);
    // TODO check if raw or dag-pb
    const cid = new CID(version, codec, encoded, base);
  
    return cid.toString();
  }

  async generateCidDft(message: string): Promise<string> {
    return this.generateCid(message, this.TYPE, this.VERSION, this.CODEC, this.BASE);
  }
}

export const ipldService = new IpldService();

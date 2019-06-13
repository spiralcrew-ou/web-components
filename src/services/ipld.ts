import CID from 'cids';
import multihashing from 'multihashing-async';
import Buffer from 'buffer/';
import { c1Cid } from './local/cid.config';

export class IpldService {

  /** wrapper that takes a message and computes its [cid](https://github.com/multiformats/cid) */
  async generateCid(
    message: string, 
    base: string,
    version: number,
    codec: string,
    type: string): Promise<string> {

    const b = Buffer.Buffer.from(message);
    const encoded = await multihashing(b, type);
    // TODO check if raw or dag-pb
    const cid = new CID(version, codec, encoded, base);
  
    return cid.toString();
  }

  async generateCidDft(message: string): Promise<string> {
    return this.generateCid(message, c1Cid.type, c1Cid.version, c1Cid.codec, c1Cid.base);
  }
}

export const ipldService = new IpldService();

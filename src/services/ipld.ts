import CID from 'cids';
import multihashing from 'multihashing-async';
import Buffer from 'buffer/';
import { CidConfig } from './local/cid.config';

export class IpldService {

  /** wrapper that takes a message and computes its [cid](https://github.com/multiformats/cid) */
  async generateCid(
    message: string, 
    cidConfig: CidConfig): Promise<string> {

    const b = Buffer.Buffer.from(message);
    const encoded = await multihashing(b, cidConfig.type);
    // TODO check if raw or dag-pb
    const cid = new CID(cidConfig.version, cidConfig.codec, encoded, cidConfig.base);
  
    return cid.toString();
  }

}

export const ipldService = new IpldService();

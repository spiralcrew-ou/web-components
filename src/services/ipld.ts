import CID from 'cids';
import multihashing from 'multihashing-async';
import Buffer from 'buffer/';
import { IpfsClient } from './eth/ipfs.client';
import { CidConfig } from './cid.config';

export class IpldService {
  ipfsClient = new IpfsClient();

  async generateCidOrdered(
    object: any,
    cidConfig: CidConfig,
    propertyOrder: string[]
  ) {
    const plain = {};

    for (const key of propertyOrder) {
      plain[key] = object[key];
    }

    return ipldService.generateCid(plain, cidConfig);
  }

  /** wrapper that takes a message and computes its [cid](https://github.com/multiformats/cid) */
  async generateCid(object: object, cidConfig: CidConfig): Promise<string> {
    if (typeof object !== 'object')
      throw new Error('Object expected, not the stringified string!');

    /** ipfs hash is not "just" the buffer hash,
     * so use ipfs client to compute the ID */
    if (cidConfig.onIpfs) {
      return this.ipfsClient.computeHash(object, cidConfig);
    }

    /** other clients should hash the stringified object directly  */
    const b = Buffer.Buffer.from(JSON.stringify(object));
    const encoded = await multihashing(b, cidConfig.type);
    // TODO check if raw or dag-pb
    const cid = new CID(
      cidConfig.version,
      cidConfig.codec,
      encoded,
      cidConfig.base
    );

    return cid.toString();
  }
}

export const ipldService = new IpldService();

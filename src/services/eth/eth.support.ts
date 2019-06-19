import CID from 'cids';
import multihashing from 'multihashing-async';

/** hashes the cid to fit in a bytes32 word */
export const hash = async (perspectiveCidStr: string) => {
  const cid = new CID(perspectiveCidStr);
  const encoded = await multihashing.digest(cid.buffer, 'sha2-256');
  return '0x' + encoded.toString('hex');
}

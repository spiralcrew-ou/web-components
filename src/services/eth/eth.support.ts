import CID from 'cids';
import multihashing from 'multihashing-async';
import Buffer from 'buffer/';
import toBuffer from 'typedarray-to-buffer';
import { CidConfig } from '../local/cid.config';

const Bufferi = Buffer.Buffer;

/** multibase to number */
const constants: [string, number][] = [
  ['base8', 37 ],
  ['base10', 39 ],
  ['base16', 66 ],
  ['base32', 62 ],
  ['base32pad', 63 ],
  ['base32hex', 76 ],
  ['base32hexpad', 74 ],
  ['base32z', 68 ],
  ['base58flickr', 90 ],
  ['base58btc', 122 ],
  ['base64', 109 ],
  ['base64pad', 77 ],
  ['base64url', 75 ],
  ['Ubase64urlpad', 55 ]
];

const multibaseToUint = (multibaseName: string) : number => {
  return constants.filter(e => e[0]==multibaseName)[0][1];
}

const uintToMultibase = (number: number) : string => {
  return constants.filter(e => e[1]==number)[0][0];
}

/** simulate a Cid as the one that will be received by the contract */
export const generateCid = async (message: string, cidConfig: CidConfig) => {
  const b = Bufferi.from(message);
  const encoded = await multihashing(b, cidConfig.type);
  return new CID(cidConfig.version, cidConfig.codec, encoded, cidConfig.base);
}

/** hashes the cid to fit in a bytes32 word */
export const hash = async (perspectiveCidStr: string) => {
  const cid = new CID(perspectiveCidStr);
  const encoded = await multihashing.digest(cid.buffer, 'sha2-256');
  return '0x' + encoded.toString('hex');
}

export const cidToHeadParts = (cidStr: string) : string[] => {
  /** store the encoded cids as they are, including the multibase bytes */
  let cid = new CID(cidStr);
  let bytes = cid.buffer;
  
  /* push the code of the multibse (UTF8 number of the string) */
  let firstByte = new Bufferi(1).fill(multibaseToUint(cid.multibaseName));
  let arr = [firstByte, bytes];
  let bytesWithMultibase = Bufferi.concat(arr);

  /** convert to hex */
  let cidEncoded16 = bytesWithMultibase.toString('hex')
  /** pad with zeros */
  cidEncoded16 = cidEncoded16.padStart(128, '0');

  let cidHex0 = cidEncoded16.slice(-64);      /** LSB */
  let cidHex1 = cidEncoded16.slice(-128, -64);

  return [ '0x' + cidHex1, '0x' + cidHex0 ];
}

export const headPartsToCid = (headParts) => {
  let cidHex1 = headParts[0].substring(2);
  let cidHex0 = headParts[1].substring(2); /** LSB */
  
  let cidHex = cidHex1.concat(cidHex0).replace(/^0+/, '');
  let cidBufferWithBase = Bufferi.from(cidHex, 'hex');
  
  let multibaseCode = cidBufferWithBase[0];
  let cidBuffer = cidBufferWithBase.slice(1)

  let multibaseName = uintToMultibase(multibaseCode);

  /** Force Buffer class */
  let cid = new CID(toBuffer(cidBuffer));
  
  return cid.toBaseEncodedString(multibaseName);
}
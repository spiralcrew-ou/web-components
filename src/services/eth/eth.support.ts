import CID from 'cids';
import multibase from 'multibase';
import multihashing from 'multihashing-async';
import Buffer from 'buffer/';

const constants: [string, number][] = [
  ['7', 37],
  ['9', 39],
  ['f', 66],
  ['b', 62],
  ['c', 63],
  ['v', 76],
  ['t', 74],
  ['h', 68],
  ['Z', 90],
  ['z', 122],
  ['m', 109],
  ['M', 77],
  ['u', 75],
  ['U', 55]
];

export const multibaseToUint = (code: string): number => {
  return constants.filter(e => e[0] == code)[0][1];
}

export const uintToMultibase = (number: number): string => {
  return constants.filter(e => e[1] == number)[0][0];
}

export interface HeadData {
  head1: string,
  head0: string,
  base: number
}

export const cidToHeadData = (cidEncoded: string):
  HeadData => {

  const baseNumber: number = multibaseToUint(cidEncoded[0]);
  const cid = new CID(cidEncoded);

  const cidEncoded16 = cid.toString('base16');

  let cidHex0 = null;
  let cidHex1 = null;

  if (cidEncoded16.length <= 64) {
    cidHex0 = cidEncoded16.padStart(64, '0');
    cidHex1 = new Array(64).fill('0').join('');
  } else {
    cidHex0 = cidEncoded16.slice(-64);
    cidHex1 = cidEncoded16.slice(-cidEncoded16.length, -64).padStart(64, '0');
  }

  return {
    head1: cidHex1,
    head0: cidHex0,
    base: baseNumber
  };
}

export const headDataToCid = (headData: HeadData): string => {
  let cidBase = headData.base;
  let cid = new CID(headData.head1.concat(headData.head0), 'base16');
  const base = multibase.getBase(cidBase);
  return cid.toString(base.name);
}

export const hash = async (data: string): Promise<string> => {
  const encoded = await multihashing(
    Buffer.Buffer.from(data), 'sha3-256');
  return '0x' + encoded.toString('hex');
}

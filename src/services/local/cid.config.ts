export class CidConfig {
  base: string;
  version: number;
  codec: string;
  type: string;
  onIpfs: boolean;

  constructor(_base: string, _version: number, _codec: string, _type: string, _onIpfs: boolean) {
    this.base = _base;
    this.version = _version;
    this.codec = _codec;
    this.type = _type;
    this.onIpfs = _onIpfs;
  }
}
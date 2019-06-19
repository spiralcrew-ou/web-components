export class CidConfig {
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
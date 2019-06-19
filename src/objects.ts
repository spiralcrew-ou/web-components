import {
  Perspective as IPerspective,
  Commit as ICommit,
  Context as IContext,
  TextNode as ITextNode,
  Position
} from './types';

import { ipldService } from './services/ipld';

export class Perspective implements IPerspective {
  id: string;
  origin: string;
  creatorId: string;
  timestamp: number;
  contextId: string;
  name: string;

  constructor(_origin, _creatorId, _timestamp, _contextId, _name) {
    this.id = null;
    this.origin = _origin;
    this.creatorId = _creatorId;
    this.timestamp = _timestamp;
    this.contextId = _contextId;
    this.name = _name;
  }

  async setId(base: string, version: number, codec: string, type: string) {
    const plain = {
      origin: this.origin,
      creatorId: this.creatorId,
      timestamp: this.timestamp,
      contextId: this.contextId,
      name: this.name
    };

    this.id = await ipldService.generateCid(
      JSON.stringify(plain),
      base,
      version,
      codec,
      type
    );
  }
}

export class Commit implements ICommit {
  id?: string;
  creatorId: string;
  timestamp: number;
  message: string;
  parentsIds: string[];
  dataId: string;

  constructor(_creatorId, _timestamp, _message, _parentsIds, _dataId) {
    this.id = null;
    this.creatorId = _creatorId;
    this.timestamp = _timestamp;
    this.message = _message;
    this.parentsIds = _parentsIds;
    this.dataId = _dataId;
  }

  async setId(base: string, version: number, codec: string, type: string) {
    const plain = {
      creatorId: this.creatorId,
      timestamp: this.timestamp,
      message: this.message,
      parentsIds: this.parentsIds,
      dataId: this.dataId
    };

    this.id = await ipldService.generateCid(
      JSON.stringify(plain),
      base,
      version,
      codec,
      type
    );
  }
}

export class Context implements IContext {
  id?: string;
  creatorId: string;
  timestamp: number;
  nonce: number;

  constructor(_creatorId, _timestamp, _nonce) {
    this.id = null;
    this.creatorId = _creatorId;
    this.timestamp = _timestamp;
    this.nonce = _nonce;
  }

  async setId(base: string, version: number, codec: string, type: string) {
    const plain = {
      creatorId: this.creatorId,
      timestamp: this.timestamp,
      nonce: this.nonce
    };

    this.id = await ipldService.generateCid(
      JSON.stringify(plain),
      base,
      version,
      codec,
      type
    );
  }
}

export class TextNode implements ITextNode {
  id?: string;
  text: string;
  type: string;
  links: {
    position?: Position;
    link: string;
  }[];

  constructor(_text: string, _type: string, _links: any) {
    this.id = null;
    this.text = _text;
    this.type = _type;
    this.links = _links;
  }

  async setId(base: string, version: number, codec: string, type: string) {
    const plain = {
      text: this.text,
      type: this.type,
      links: this.links
    };

    this.id = await ipldService.generateCid(
      JSON.stringify(plain),
      base,
      version,
      codec,
      type
    );
  }
}

export class KnownSources {
  hash: string;
  sources: string[];
  constructor(_hash, _sources) {
    this.hash = _hash;
    this.sources = _sources;
  }
}

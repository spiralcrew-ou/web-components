import {
  Perspective as IPerspective,
  Commit as ICommit,
  Context as IContext,
  Draft as IDraft,
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
  headId: string;

  constructor(_origin, _creatorId, _timestamp, _contextId, _name, _headId) {
    this.id = null;
    this.origin = _origin
    this.creatorId = _creatorId
    this.timestamp = _timestamp
    this.contextId = _contextId
    this.name = _name
    this.headId = _headId
  }

  async setId(base: string, version: number, codec: string, type: string) {
    const plain = {
      'origin': this.origin,
      'creatorId': this.creatorId,
      'timestamp': this.timestamp,
      'contextId': this.contextId,
      'name': this.name
    };

    this.id = await ipldService.generateCid(
      JSON.stringify(plain),
      base,
      version,
      codec,
      type);
  }
}

export class Commit implements ICommit {
  id?: string; creatorId: string;
  timestamp: number;
  message: string;
  parentsIds: string[];
  dataId: string;

  constructor(_creatorId, _timestamp, _message, _parentsId, _dataId) {
    this.id = null;
    this.creatorId = _creatorId
    this.timestamp = _timestamp
    this.message = _message
    this.parentsIds = _parentsId
    this.dataId = _dataId
  }

  async setId(base: string, version: number, codec: string, type: string) {
    const plain = {
      'creatorId': this.creatorId,
      'timestamp': this.timestamp,
      'message': this.message,
      'parentsIds': this.parentsIds.toString(),
      'dataId': this.dataId
    };

    this.id = await ipldService.generateCid(
      JSON.stringify(plain),
      base,
      version,
      codec,
      type);
  }
}

export class Context implements IContext {
  id?: string;
  creatorId: string;
  timestamp: number;
  nonce: number;

  constructor(_creatorId, _timestamp, _nonce) {
    this.id = null;
    this.creatorId = _creatorId
    this.timestamp = _timestamp
    this.nonce = _nonce
  }

  async setId(base: string, version: number, codec: string, type: string) {
    const plain = {
      'creatorId': this.creatorId,
      'timestamp': this.timestamp,
      'nonce': this.nonce
    };

    this.id = await ipldService.generateCid(
      JSON.stringify(plain),
      base,
      version,
      codec,
      type);
  }
}

export class TextNode implements ITextNode {
  id?: string;
  text: string;
  links: {
    position?: Position;
    type?: Position;
    link: string;
  }[];

  constructor(_text: string, _links: any) {
    this.id = null;
    this.text = _text
    this.links = _links
  }

  async setId(base: string, version: number, codec: string, type: string) {
    const plain = {
      'text': this.text,
      'links': this.links,
    };

    this.id = await ipldService.generateCid(
      JSON.stringify(plain),
      base,
      version,
      codec,
      type);
  }
}

export class Draft implements IDraft {
  perspectiveId: string;
  dataId: string;
  id: string

  constructor(_id: string, _perspectiveId: string, _dataId: string) {
    this.id = _id
    this.perspectiveId = _perspectiveId
    this.dataId = _dataId
  }
}

export class KnownSources {
  hash: string
  sources: string[]
  constructor(_hash, _sources) {
    this.hash = _hash
    this.sources = _sources
  }
}
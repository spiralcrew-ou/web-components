import {
  Perspective as IPerspective,
  Commit as ICommit,
  Context as IContext,
  Draft as IDraft,
  TextNode as ITextNode,
  Position
} from './types';

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
}

export class Draft implements IDraft {
  perspectiveId: string;
  dataId: string;
  id: string;

  constructor(_id: string, _perspectiveId: string, _dataId: string) {
    this.id = _id;
    this.perspectiveId = _perspectiveId;
    this.dataId = _dataId;
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

import {
  Perspective as IPerspective,
  Commit as ICommit,
  Context as IContext
} from '../../types';

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
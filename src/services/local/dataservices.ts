// Only data access module
import {
  Perspective as IPerspective,
  Commit as ICommit,
  Context as IContext,
  Draft as IDraft,
  TextNode as ITextNode
} from '../../types';

import { ipldService } from './ipld';

import Dexie from 'dexie';

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
    position?: import("../../types").Position;
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

class LocalDatabase extends Dexie {
  perspectives: Dexie.Table<Perspective, string>
  commits: Dexie.Table<Commit, string>
  contexts: Dexie.Table<Context, string>
  drafts: Dexie.Table<Draft, string>
  textNode: Dexie.Table<TextNode, string>
  knowSources: Dexie.Table<KnownSources, string>

  constructor() {
    super('CollectiveOne');
    this.version(0.1).stores({
      perspectives: 'id,contextId',
      commits: 'id',
      contexts: 'id',
      drafts: 'id',
      knowSources: 'hash',
      textNode: 'id'
    })
    this.contexts.mapToClass(Context)
    this.perspectives.mapToClass(Perspective)
    this.commits.mapToClass(Commit)
    this.drafts.mapToClass(Draft)
    this.knowSources.mapToClass(KnownSources)
    this.textNode.mapToClass(TextNode)
  }
}

const db = new LocalDatabase()

window['db'] = db

export const fetchPerspective = (_id: string) => {
  return db.perspectives.where('id').equals(_id)
}

export const insertPerspective = (perspective): Promise<any> => {
  return db.perspectives.add(perspective)
}

export const updatePerspectiveHead = (perspectiveId, commitId): Promise<any> => {
  return db.perspectives.where('id').equals(perspectiveId).modify({ headId: commitId })
}

export const insertContext = (context): Promise<any> => {
  return db.contexts.add(context)
}

export const insertCommit = (commit): Promise<any> => {
  return db.commits.add(commit)
}

export const getContext = (contextId): Promise<any> => {
  return db.contexts.get(contextId)
}

export const getPerpectives = (contextId): Promise<any> => {
  return db.perspectives.where('contextId').equals(contextId).toArray()
}

export const getPerspective = (perspectiveId: string): Promise<IPerspective> => {
  return db.perspectives.get(perspectiveId)
}

export const getCommit = (commitId: string): Promise<ICommit> => {
  return db.commits.get(commitId)
}

export const insertDraft = (draft: Draft): Promise<any> => {
  return db.drafts.add(draft)
}

export const getDraft = (id: string): Promise<any> => {
  return db.drafts.get(id)
}

export const modifyDraft = (draft: Draft): void => {
  db.drafts.where('id').equals(draft.id).modify(draft)
}

export const getKnownSources = (hash: string): Promise<string[]> => {
  return db.knowSources.get(hash).then(result => {
    if (!result)
      return []
    else
      return result.sources
  })
}

export const insertKnownSources = (knownSources: KnownSources): Promise<any> => {
  return db.knowSources.put(knownSources)
}

export const insertTextNode = async (object: TextNode): Promise<any> => {
  return db.textNode.add(object)
}

export const getTextNode = (id: string): Promise<TextNode> => {
  return db.textNode.get(id)
}

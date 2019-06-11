import { UprtclService } from '../uprtcl.service';

import {
  Perspective as IPerspective,
  Commit as ICommit,
  Context as IContext
} from '../../types';

import {
  insertPerspective, Perspective,
  insertContext, Context,
  insertCommit, Commit,
  getContext, 
  getPerpectives,
  getPerspective,
  getCommit,
  updatePerspectiveHead,
  // Draft
} from './dataservices';

const userId = 'anon';
const origin = 'local';

/** standard C1 settings */
const BASE = 'base58btc';
const VERSION = 'v1';
const CODEC = 'raw';
const TYPE = 'sha3-256';

/** standard Holochain settings */
// const BASE = 'base58btc';
// const VERSION = 0;
// const CODEC = 'dag-pg';
// const TYPE = 'sha2-256';

export class UprtclLocal implements UprtclService {

  constructor() {
  }

  getContext(_contextId: string): Promise<IContext> {
    return getContext(_contextId)
  }

  getPerspective(_perspectiveId: string): Promise<IPerspective> {
    return getPerspective(_perspectiveId)
  }

  getCommit(_commitId: string): Promise<ICommit> {
    return getCommit(_commitId);
  }

  async getRootContextId(): Promise<string> {
    let context = new Context(userId, 0, 0);
    context.setId(BASE, VERSION, CODEC, TYPE);
    return context.id;
  }

  getContextPerspectives(_contextId: string): Promise<IPerspective[]> {
    return getPerpectives(_contextId) 
  }

  async createContext(_timestamp: number, _nonce: number): Promise<string> {
    let context = new Context(userId, _timestamp, _nonce)
    context.setId(BASE, VERSION, CODEC, TYPE);
    await insertContext(context);
    return context.id;
  }

  createPerspective(_contextId: string, _name: string, _timestamp: number, _headId: string): Promise<string> {
    // TODO: Get userID or userCreator
    let perspective = new Perspective(origin, userId, _timestamp, _contextId, _name, _headId);
    perspective.setId(BASE, VERSION, CODEC, TYPE);
    return insertPerspective(perspective);
  }

  createCommit(_timestamp: number, _message: string, _parentsIds: string[], _dataId: string): Promise<string> { 
    let commit = new Commit(userId, new Date().getDate(), _message, _parentsIds, _dataId);
    commit.setId(BASE, VERSION, CODEC, TYPE);
    return insertCommit(commit);
  }

  cloneContext(_context: IContext): Promise<string> {
    throw new Error("Method not implemented.");
  }

  clonePerspective(_perspective: IPerspective): Promise<string> {
    throw new Error("Method not implemented.");
  }

  cloneCommit(_commit: ICommit): Promise<string> {
    throw new Error("Method not implemented.");
  }

  updateHead(_perspectiveId: string, _commitId: string): Promise<void> {
    return updatePerspectiveHead(_perspectiveId,_commitId)
  }




}
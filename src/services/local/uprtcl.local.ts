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
// import { c1Cid as cidConfig } from './cid.config';
import { hcCid as cidConfig } from './cid.config';

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
    await context.setId(cidConfig.base, cidConfig.version, cidConfig.codec, cidConfig.type);
    return Promise.resolve(context.id);
  }

  async getContextPerspectives(_contextId: string): Promise<IPerspective[]> {
    return getPerpectives(_contextId) 
  }

  async createContext(_timestamp: number, _nonce: number): Promise<string> {
    let context = new Context(userId, _timestamp, _nonce)
    await context.setId(cidConfig.base, cidConfig.version, cidConfig.codec, cidConfig.type);
    return insertContext(context);
  }

  async createPerspective(_contextId: string, _name: string, _timestamp: number, _headId: string): Promise<string> {
    // TODO: Get userID or userCreator
    let perspective = new Perspective(origin, userId, _timestamp, _contextId, _name, _headId);
    await perspective.setId(cidConfig.base, cidConfig.version, cidConfig.codec, cidConfig.type);
    return insertPerspective(perspective);
  }

  async createCommit(_timestamp: number, _message: string, _parentsIds: string[], _dataId: string): Promise<string> { 
    let commit = new Commit(userId, new Date().getDate(), _message, _parentsIds, _dataId);
    await commit.setId(cidConfig.base, cidConfig.version, cidConfig.codec, cidConfig.type);
    return insertCommit(commit);
  }

  async cloneContext(_context: IContext): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async clonePerspective(_perspective: IPerspective): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async cloneCommit(_commit: ICommit): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async updateHead(_perspectiveId: string, _commitId: string): Promise<void> {
    return updatePerspectiveHead(_perspectiveId,_commitId)
  }




}
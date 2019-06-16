import { UprtclService } from '../uprtcl.service';

import {
  Perspective as IPerspective,
  Commit as ICommit,
  Context as IContext
} from '../../types';

import { Perspective, Commit, Context } from '../../objects';

import {
  insertPerspective,
  insertContext,
  insertCommit,
  getContext,
  getPerpectives,
  getPerspective,
  getCommit,
  updatePerspectiveHead
  // Draft
} from './dataservices';

const userId = 'anon';

/** standard C1 settings */
import { c1Cid as cidConfig } from './cid.config';
//import { hcCid as cidConfig } from './cid.config';

export class UprtclLocal implements UprtclService {
  currentOrigin = 'local';

  constructor() {}

  public setCurrentOrigin(origin: string) {
    this.currentOrigin = origin;
  }

  getContext(_contextId: string): Promise<IContext> {
    return getContext(_contextId);
  }

  getPerspective(_perspectiveId: string): Promise<IPerspective> {
    return getPerspective(_perspectiveId);
  }

  getCommit(_commitId: string): Promise<ICommit> {
    return getCommit(_commitId);
  }

  async existContext(_contextId: string): Promise<Boolean> {
    const contextId = await this.getContext(_contextId);
    return contextId != null;
  }

  async existPerspective(_perspectiveId: string): Promise<Boolean> {
    const perspectiveId = await this.getPerspective(_perspectiveId);
    return perspectiveId != null;
  }

  async existCommit(_commitId: string): Promise<Boolean> {
    const commitId = await this.getContext(_commitId);
    return commitId != null;
  }

  async getRootContextId(): Promise<string> {
    let context = new Context(userId, 0, 0);
    await context.setId(
      cidConfig.base,
      cidConfig.version,
      cidConfig.codec,
      cidConfig.type
    );
    return Promise.resolve(context.id);
  }

  async getContextPerspectives(_contextId: string): Promise<IPerspective[]> {
    return getPerpectives(_contextId);
  }

  async createContext(_timestamp: number, _nonce: number): Promise<string> {
    let context = new Context(userId, _timestamp, _nonce);
    await context.setId(
      cidConfig.base,
      cidConfig.version,
      cidConfig.codec,
      cidConfig.type
    );
    const exists = await this.existContext(context.id);
    return !exists ? insertContext(context) : Promise.resolve(context.id);
  }

  async createPerspective(
    _contextId: string,
    _name: string,
    _timestamp: number,
    _headId: string
  ): Promise<string> {
    let perspective = new Perspective(
      this.currentOrigin,
      userId,
      _timestamp,
      _contextId,
      _name,
      _headId
    );
    await perspective.setId(
      cidConfig.base,
      cidConfig.version,
      cidConfig.codec,
      cidConfig.type
    );
    const exists = await this.existPerspective(perspective.id);
    return !exists
      ? insertPerspective(perspective)
      : Promise.resolve(perspective.id);
  }

  async createCommit(
    _timestamp: number,
    _message: string,
    _parentsIds: string[],
    _dataId: string
  ): Promise<string> {
    let commit = new Commit(
      userId,
      new Date().getDate(),
      _message,
      _parentsIds,
      _dataId
    );
    await commit.setId(
      cidConfig.base,
      cidConfig.version,
      cidConfig.codec,
      cidConfig.type
    );
    const exists = await this.existCommit(commit.id);
    return !exists ? insertCommit(commit) : Promise.resolve(commit.id);
  }

  async cloneContext(_context: IContext): Promise<string> {
    return insertContext(_context);
  }

  async clonePerspective(_perspective: IPerspective): Promise<string> {
    return insertPerspective(_perspective);
  }

  async cloneCommit(_commit: ICommit): Promise<string> {
    return insertCommit(_commit);
  }

  async updateHead(_perspectiveId: string, _commitId: string): Promise<void> {
    return updatePerspectiveHead(_perspectiveId, _commitId);
  }
}

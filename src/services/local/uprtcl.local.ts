import { UprtclService } from '../uprtcl.service';

import {
  Perspective as IPerspective,
  Commit as ICommit,
  Context as IContext
} from '../../types';

import { Perspective, Commit, Context } from '../../objects';

import Dexie from 'dexie';
import { ipldService } from '../ipld';
import { CidConfig } from './cid.config';

export class UprtclLocal extends Dexie implements UprtclService {
  rootContexts: Dexie.Table<string, string>;
  contexts: Dexie.Table<Context, string>;
  perspectives: Dexie.Table<Perspective, string>;
  heads: Dexie.Table<string, string>;
  commits: Dexie.Table<Commit, string>;
  currentConfig: CidConfig;

  constructor(config: CidConfig) {
    super('_prtcl');
    this.version(0.1).stores({
      rootContexts: '',
      perspectives: 'id,contextId',
      heads: '',
      commits: 'id',
      contexts: 'id'
    });
    this.rootContexts = this.table('rootContexts');
    this.contexts.mapToClass(Context);
    this.perspectives.mapToClass(Perspective);
    this.heads = this.table('heads');
    this.commits.mapToClass(Commit);
    this.currentConfig = config;
  }

  updateConfig(config: CidConfig) {
    this.currentConfig = config;
  }

  generateCid(object: any, propertyOrder: string[]) {
    const plain = {};

    for (const key of propertyOrder) {
      plain[key] = object[key];
    }

    return ipldService.generateCid(
      JSON.stringify(plain),
      this.currentConfig
    );
  }

  getContext(contextId: string): Promise<IContext> {
    return this.contexts.get(contextId);
  }

  getPerspective(perspectiveId: string): Promise<IPerspective> {
    console.log('local getPerspective', perspectiveId);
    this.perspectives
      .get(perspectiveId)
      .then(perspective => console.log('local getPerspective', perspective));
    return this.perspectives.get(perspectiveId);
  }

  getCommit(commitId: string): Promise<ICommit> {
    return this.commits.get(commitId);
  }

  async getRootContextId(): Promise<string> {
    throw new Error('not implemented');
  }

  getProviderRootContextId(serviceProvider: string): Promise<string> {
    return this.rootContexts.get(serviceProvider);
  }

  async setProviderRootContextId(
    serviceProvider: string,
    rootContextId: string
  ): Promise<void> {
    await this.rootContexts.put(rootContextId, serviceProvider);
  }

  async getContextPerspectives(contextId: string): Promise<IPerspective[]> {
    return this.perspectives
      .where('contextId')
      .equals(contextId)
      .toArray();
  }

  async createContext(context: Context): Promise<string> {
    const contextId = await this.generateCid(context, [
      'creatorId',
      'timestamp',
      'nonce'
    ]);
    context.id = contextId;
    return this.contexts.put(context);
  }

  async createPerspective(perspective: Perspective): Promise<string> {
    console.log('local createPerspective', perspective);
    const perspectiveId = await this.generateCid(perspective, [
      'origin',
      'creatorId',
      'timestamp',
      'contextId',
      'name'
    ]);
    perspective.id = perspectiveId;
    return this.perspectives.put(perspective);
  }

  async createCommit(commit: Commit): Promise<string> {
    const commitId = await this.generateCid(commit, [
      'creatorId',
      'timestamp',
      'message',
      'parentsIds',
      'dataId'
    ]);
    commit.id = commitId;
    return this.commits.put(commit);
  }

  async updateHead(perspectiveId: string, headId: string): Promise<void> {
    await this.heads.put(headId, perspectiveId);
  }

  getHead(perspectiveId: string): Promise<string> {
    return this.heads.get(perspectiveId);
  }
}

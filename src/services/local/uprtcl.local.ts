import { UprtclService } from '../uprtcl.service';

import {
  Perspective as IPerspective,
  Commit as ICommit,
  Context as IContext,
  PropertyOrder
} from '../../types';

import { Perspective, Commit, Context } from './db.objects';

import Dexie from 'dexie';
import { ipldService } from '../ipld';
import { CidConfig } from '../cid.config';
import { CidCompatible } from '../cid.service';

export class UprtclLocal extends Dexie implements UprtclService, CidCompatible {
  contexts: Dexie.Table<Context, string>;
  perspectives: Dexie.Table<Perspective, string>;
  heads: Dexie.Table<string, string>;
  commits: Dexie.Table<Commit, string>;

  currentConfig: CidConfig;

  constructor() {
    super('_prtcl');
    this.version(0.1).stores({
      perspectives: 'id,contextId',
      heads: '',
      commits: 'id',
      contexts: 'id'
    });
    this.contexts.mapToClass(Context);
    this.perspectives.mapToClass(Perspective);
    this.heads = this.table('heads');
    this.commits.mapToClass(Commit);
  }

  setCidConfig(config: CidConfig) {
    this.currentConfig = config;
  }

  getCidConfig() {
    return this.currentConfig;
  }

  updateConfig(config: CidConfig) {
    this.currentConfig = config;
  }

  getContext(contextId: string): Promise<IContext> {
    return this.contexts.get(contextId);
  }

  getPerspective(perspectiveId: string): Promise<IPerspective> {
    return this.perspectives.get(perspectiveId);
  }

  getCommit(commitId: string): Promise<ICommit> {
    return this.commits.get(commitId);
  }

  async getContextPerspectives(contextId: string): Promise<IPerspective[]> {
    return this.perspectives
      .where('contextId')
      .equals(contextId)
      .toArray();
  }

  async createContext(context: Context): Promise<string> {
    context.id = await ipldService.generateCidOrdered(
      context,
      this.currentConfig,
      PropertyOrder.Context
    );
    return this.contexts.put(context);
  }

  async createPerspective(perspective: Perspective): Promise<string> {
    const perspectiveId = await ipldService.generateCidOrdered(
      perspective,
      this.currentConfig,
      PropertyOrder.Perspective
    );
    perspective.id = perspectiveId;
    return this.perspectives.put(perspective);
  }

  async createCommit(commit: Commit): Promise<string> {
    const commitId = await ipldService.generateCidOrdered(
      commit,
      this.currentConfig,
      PropertyOrder.Commit
    );
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

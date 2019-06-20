import { Commit, Context, Perspective } from '../../types';
import { UprtclService } from '../uprtcl.service';
import { http } from './http';
import { CidConfig } from '../cid.config';

export class UprtclCollectiveOne implements UprtclService {
  
  cidConfig: CidConfig;
  
  constructor() {
    this.cidConfig = new CidConfig('base58btc', 1, 'raw',    'sha3-256', false);
  }

  getCidConfig(): CidConfig {
    return this.cidConfig;
  }

  setCidConfig(): CidConfig {
    throw new Error('Collectiveone Cid version is fixed for the moment');
  }

  computeContextId(context: Context): Promise<string> {
    console.log({context});
    throw new Error('Not implemented');
  }

  async getContext(contextId: string): Promise<Context> {
    return await http.get<Context>(`/ctx/${contextId}`);
  }

  async getPerspective(perspectiveId: string): Promise<Perspective> {
    return await http.get<Perspective>(`/persp/${perspectiveId}`);
  }

  async getCommit(commitId: string): Promise<Commit> {
    return await http.get<Commit>(`/commit/${commitId}`);
  }

  async getContextPerspectives(contextId: string): Promise<Perspective[]> {
    return await http.get<Perspective[]>(`/ctx/${contextId}/perspectives`);
  }

  async createContext(context: Context): Promise<string> {
    return await http.post('/ctx', [context]);
  }

  async createPerspective(perspective: Perspective) {
    return await http.post('/persp', [perspective]);
  }

  async createCommit(commit: Commit) {
    return await http.post('/commit', [commit]);
  }

  async getHead(perspectiveId: string): Promise<string> {
    const perspective = await http.get(`/persp/${perspectiveId}`);
    return perspective['headId'];
  }

  async updateHead(perspectiveId: string, commitId: string): Promise<void> {
    await http.put(`/persp/${perspectiveId}?headId=${commitId}`, null);
  }
}

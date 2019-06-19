import { Commit, Context, Perspective } from './../../objects';
import { UprtclService } from '../uprtcl.service';
import { http } from './http';

export class UprtclCollectiveOne implements UprtclService {
  constructor() {}

  async getContext(contextId: string): Promise<Context> {
    return await http.get<Context>(`/ctx/${contextId}`);
  }

  async getPerspective(perspectiveId: string): Promise<Perspective> {
    return await http.get<Perspective>(`/persp/${perspectiveId}`);
  }

  async getCommit(commitId: string): Promise<Commit> {
    return await http.get<Commit>(`/commit/${commitId}`);
  }

  async getRootContextId(): Promise<string> {
    return await http.get<string>('/u/rootContextId');
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

  import { Commit, Context, Perspective } from '../../types';
  import { UprtclService } from '../uprtcl.service';
  import { http } from './http';
  
  export class UprtclCollectiveOne implements UprtclService {
    
    constructor() {
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

    async getRootContextId(): Promise<string> {
      return await http.get<string>('/u/rootContextId');
    }

    async getContextId(context: Context): Promise<string> {
      return await http.put('/ctxId', context)
    }

    async getContextPerspectives(contextId: string): Promise<Perspective[]> {
      return await http.get<Perspective[]>(`/ctx/${contextId}/ctxPersps`)
    }
  
    async createContext(
      _timestamp: number,
      _nonce: number): Promise<string> {

      let context: Context;

      context.timestamp = _timestamp;
      context.nonce = _nonce

      return await http.post('/ctx', context)
    }
  
    async createPerspective(
      _contextId: string,
      _name: string,
      _timestamp: number,
      _headId: string) {

      let perspective: Perspective;

      perspective.contextId = _contextId;
      perspective.name = _name;
      perspective.timestamp = _timestamp;
      perspective.headId = _headId;
      
      return await http.post<string>('/persp', perspective)
    }
  
    async createCommit(
      _timestamp: number,
      _message: string,
      _parentsIds: string[],
      _dataId: string
    ) {

      let commit: Commit;
      
      commit.timestamp = _timestamp;
      commit.message = _message;
      commit.parentsIds = _parentsIds;
      commit.dataId = _dataId;

      return await http.post<string>('/commit', commit)
    }

    cloneContext(context: Context): Promise<string> {
      return http.post<string>('/ctx', context);
    }
    clonePerspective(perspective: Perspective): Promise<string> {
      return http.post<string>('/persp', perspective);
    }
    cloneCommit(commit: Commit): Promise<string> {
      return http.post<string>('/commit', commit);
    }
    
    updateHead(perspectiveId: string, commitId: string): Promise<void> {
      return http.put<void>(`/persp/${perspectiveId}?headId=${commitId}`, null);
    }
  
  }
  
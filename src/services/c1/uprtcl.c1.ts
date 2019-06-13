  import { Commit, Context, Perspective } from './data.objects.c1';
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

    async getContextPerspectives(contextId: string): Promise<Perspective[]> {
      return await http.get<Perspective[]>(`/ctx/${contextId}/perspectives`)
    }
  
    async createContext(
      _timestamp: number,
      _nonce: number): Promise<string> {

      let context: Context = new Context();

      context.id = null;
      context.timestamp = _timestamp;
      context.nonce = _nonce

      return await http.post('/ctx', [ context ])
    }
  
    async createPerspective(
      _contextId: string,
      _name: string,
      _timestamp: number,
      _headId: string) {

      let perspective: Perspective = new Perspective();

      perspective.id = null;
      perspective.creatorId = null;
      perspective.contextId = _contextId;
      perspective.name = _name;
      perspective.timestamp = _timestamp;
      perspective.headId = _headId;
      
      return await http.post('/persp', [ perspective ]);
    }
  
    async createCommit(
      _timestamp: number,
      _message: string,
      _parentsIds: string[],
      _dataId: string
    ) {

      let commit: Commit = new Commit();
      
      commit.timestamp = _timestamp;
      commit.message = _message;
      commit.parentsIds = _parentsIds;
      commit.dataId = _dataId;

      return await http.post('/commit', [ commit ])
    }

    cloneContext(context: Context): Promise<string> {
      return http.post('/ctx', context);
    }
    clonePerspective(perspective: Perspective): Promise<string> {
      return http.post('/persp', perspective);
    }
    cloneCommit(commit: Commit): Promise<string> {
      return http.post('/commit', commit);
    }
    
    async updateHead(perspectiveId: string, commitId: string): Promise<void> {
      /** convert Promise<string> into Promise<void> */
      await http.put(`/persp/${perspectiveId}?headId=${commitId}`, null);      
    }
  
  }
  
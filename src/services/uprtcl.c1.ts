  import { Commit, Context, Perspective } from '../types';
  import { UprtclService } from './uprtcl.service';
  
  function get<T>(url: string): Promise<T> {
    return fetch(url, { 
      method: "GET"
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json() as Promise<{ data: T }>
    })
    .then(data => {
        return data.data
    })
  }

  function put<T>(url: string, _body: any) {
    return putOrPost<T>(url, _body, "PUT")
  }

  function post<T>(url: string, _body: any) {
    return putOrPost<T>(url, _body, "POST")
  }

  function putOrPost<T>(url: string, _body: any, _method: string): Promise<T> {
    return fetch(url, { 
      method: _method,
      body: JSON.stringify(_body)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json() as Promise<{ data: T }>
    })
    .then(data => {
        return data.data
    })
  }

  export class UprtclCollectiveOne implements UprtclService {
    
    constructor() {
    }
  
    async getContext(contextId: string): Promise<Context> {
      return await get<Context>('/ctx/' + contextId);
    }
  
    async getPerspective(perspectiveId: string): Promise<Perspective> {
      return await get<Perspective>('/persp/' + perspectiveId);
    }
  
    async getCommit(commitId: string): Promise<Commit> {
      return await get<Commit>('/commit/' + commitId);
    }

    async getRootContextId(): Promise<string> {
      return await get<string>('/u/rootContextId');
    }

    async getContextId(context: Context): Promise<string> {
      return await put('/ctxId', context)
    }

    async getContextPerspectives(contextId: string): Promise<Perspective[]> {
      return await get<Perspective[]>(`/ctx/${contextId}/ctxPersps`)
    }
  
    async createContext(
      _timestamp: number,
      _nonce: number): Promise<string> {

      let context: Context;

      context.timestamp = _timestamp;
      context.nonce = _nonce

      return await post('/ctx', context)
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
      
      return await post<string>('/persp', perspective)
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

      return await post<string>('/persp', commit)
    }

    cloneContext(context: Context): Promise<string> {
      throw new Error("Method not implemented.");
    }
    clonePerspective(perspective: Perspective): Promise<string> {
      throw new Error("Method not implemented.");
    }
    cloneCommit(commit: Commit): Promise<string> {
      throw new Error("Method not implemented.");
    }
    
    updateHead(perspectiveId: string, commitId: string): Promise<void> {
      return put<void>(`/persp/${perspectiveId}?headId=${commitId}`, null);
    }
  
  }
  
  import { Commit, Context, Perspective } from '../types';
import { UprtclService } from './uprtcl.service';
  
  interface AppUser {
    did: string,
    rootPerspectiveLink: string
  }

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

  function put(url: string, _body: any) {
    return putOrPost(url, _body, "PUT")
  }

  function post(url: string, _body: any) {
    return putOrPost(url, _body, "POST")
  }

  function putOrPost(url: string, _body: any, _method: string): Promise<string> {
    return fetch(url, { 
      method: _method,
      body: JSON.stringify(_body)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json() as Promise<{ data: string }>
    })
    .then(data => {
        return data.data
    })
  }

  export class UprtclCollectiveOne implements UprtclService {
    
    constructor() {
    }
  
    async getRootPerspective(): Promise<Perspective> {
      const user = await get<AppUser>('/u/me');
      return await this.getPerspective(user.rootPerspectiveLink);
    }
  
    async getContextId(context: Context): Promise<string> {
      return await put('/ctxId', context)
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
  
    async getContextPerspectives(contextId: string): Promise<Perspective[]> {
      return await get<Perspective[]>('/ctxPersps')
    }
  
    async createContext(context: Context): Promise<string> {
      return await post('/ctx', context)
    }
  
    async createPerspective(
      contextId: string,
      name: string,
      headLink: string) {
      const perspective = new Perspective();
      
      return await post('/persp', perspective)
    }
  
    async createCommit() {
      return await post('/persp', perspective)
    }
  
  }
import { UprtclService } from '../uprtcl.service';
import {
  generateCID,
  generateCommitId,
  generateUserContextId
} from '../../main_functions';

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
    let rootContextId = generateUserContextId('anon');
    const rootContext = await getContext(rootContextId)

    if (rootContext)
      return rootContextId
    
    // Asume that is first time and will need create contextRoot
    rootContextId = await this.createContext(0,0)
    const commit = await this.createCommit(new Date().getTime(),'First commit', [],null)
    await this.createPerspective(rootContextId,'Root Perspective',new Date().getTime(),commit)
    return rootContextId

 
  }

  getContextId(_context: IContext): Promise<string> {
    // TODO: To see with Pepo. Too much weed?? 
    throw new Error("Method not implemented.");
  }

  getContextPerspectives(_contextId: string): Promise<IPerspective[]> {
    return getPerpectives(_contextId) 
  }

  createContext(_timestamp: number, _nonce: number): Promise<string> {
    const creatorId = 'anon'
    let cid = ''
    if ((_timestamp===0) && (_nonce === 0)) //MonkeyPatch: create user context. Check this with pepo
      cid = generateUserContextId(creatorId)
    else
      cid = generateCID(creatorId)
   
    return insertContext(new Context(cid, creatorId, _timestamp, _nonce)).then(() => { return cid })
  }

  createPerspective(_contextId: string, _name: string, _timestamp: number, _headId: string): Promise<string> {
    // TODO: Get userID or userCreator
    const creatorId = 'anon'
    const origin = 'local'
    const cid = generateCID(creatorId, [], 'First Commit')
    return insertPerspective(new Perspective(cid, origin, creatorId, _timestamp, _contextId, _name, _headId))

    // TO-REVIEW: createPerspective method may be will return Perspective instead of string (to check with pepo)
  }

  createCommit(_timestamp: number, _message: string, _parentsIds: string[], _dataId: string): Promise<string> { 
    const creatorId = 'anon'
    const commitId = generateCommitId(creatorId, _parentsIds, _message, _dataId)
    return insertCommit(new Commit(commitId, new Date().getDate(), _message, _parentsIds, _dataId))
  }

  cloneContext(_context: IContext): Promise<string> {
    throw new Error("Method not implemented.");
  }

  clonePerspective(_perspective: IPerspective): Promise<string> {
    throw new Error("Method not implemented.");
  }

  cloneCommit(_commit: ICommit): Promise<string> {
    throw new Error("Method not implemented.");
  }

  updateHead(_perspectiveId: string, _commitId: string): Promise<void> {
    return updatePerspectiveHead(_perspectiveId,_commitId)
  }




}
import { UprtclService } from '../uprtcl.service';
import {
  generateCID,
  generateCommitId,
  generateUserContext
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
  getContext, getPerpectives
} from './dataservices';




export class UprtclLocal implements UprtclService {

  constructor() {
  }

  getContext(_contextId: string): Promise<IContext> {

    throw new Error("Method not implemented.");
  }

  getPerspective(_perspectiveId: string): Promise<IPerspective> {
    throw new Error("Method not implemented.");
  }

  getCommit(_commitId: string): Promise<ICommit> {
    throw new Error("Method not implemented.");
  }

  getRootContextId(): Promise<string> {
    const contextId = generateUserContext('anon')
    return getContext(contextId).then(ctx => {
      if (!ctx) {
        //this.createContext(0,0).then(result => {return result})
        this.createCommit(new Date().getTime(),'',[],null).then(headId  =>{
          this.createContext(0,0).then(newCtx => {
            this.createPerspective(newCtx,'User Context',new Date().getTime(),headId).then( () => {
              return newCtx
            })
          })
        } )
      } else {
        return ctx.id
      }
      
    })

    // throw new Error("Method not implemented.");
  }

  getContextId(_context: IContext): Promise<string> {
    throw new Error("Method not implemented.");
  }

  getContextPerspectives(_contextId: string): Promise<IPerspective[]> {
    return getPerpectives(_contextId) 
  }

  createContext(_timestamp: number, _nonce: number): Promise<string> {
    const creatorId = 'anon'
    let cid = ''
    if ((_timestamp===0) && (_nonce === 0)) //MonkeyPatch: create user context. Check this with pepo
      cid = generateUserContext(creatorId)
    else
      cid = generateCID(creatorId)
   
    return insertContext(new Context(cid, creatorId, _timestamp, _nonce)).then(() => { return cid })
  }

  createPerspective(_contextId: string, _name: string, _timestamp: number, _headId: string): Promise<string> {
    // TODO: Get userID or userCreator
    const creatorId = 'anon'
    const origin = 'local://'
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
    throw new Error("Method not implemented.");
  }




}
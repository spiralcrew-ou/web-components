import { UprtclService } from '../uprtcl.service';
import { Context, Commit, Perspective } from './../../objects';

import { EthereumConnection } from './eth.connection';
import { IpfsStub } from './ipfs.data.stub';

import { hash } from './eth.support';

const enableDebug = false;

// function makeid(length) {
//   var result           = '';
//   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   var charactersLength = characters.length;
//   for ( var i = 0; i < length; i++ ) {
//      result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// }

const userId = 'did:sec256k1:01' // + makeid(10);
const ADD_PERSP = 'addPerspective(bytes32,bytes32,address,string)';
const UPDATE_HEAD = 'updateHead(bytes32,string)';
// const CHANGE_OWNER = 'changeOwner(bytes32,address)';
const GET_PERSP = 'getPerspective(bytes32)';

export class UprtclEthereum implements UprtclService {
  
  ipfsClient = null;
  ethereum = null;

  constructor(host: string) {
    this.ipfsClient = new IpfsStub();
    this.ethereum = new EthereumConnection(host);
  }

  async getContext(contextId: string): Promise<Context> {
    if (enableDebug) debugger;
    return this.ipfsClient.getData(contextId);
  }

  async getPerspective(perspectiveId: string): Promise<Perspective> {
    if (enableDebug) debugger;
    await this.ethereum.ready();

    /** Content addressable part comes from IPFS */
    const persp = await this.ipfsClient.getData(perspectiveId);
    persp.id = perspectiveId;

    /** Head comes from ethereum */
    let perspectiveIdHash = await hash(perspectiveId);
    const perspective = this.ethereum.call(
      GET_PERSP, 
      [perspectiveIdHash]);
      
    persp.headId = perspective.headCid;
    return persp;
  }

  async getCommit(commitId: string): Promise<Commit> {
    if (enableDebug) debugger;
    return this.ipfsClient.getData(commitId);
  }

  async getHead(perspectiveId: string): Promise<string> {
    if (enableDebug) debugger;
    await this.ethereum.ready();
    
    let perspectiveIdHash = await hash(perspectiveId);

    const perspective = this.ethereum.call(
      GET_PERSP, 
      [perspectiveIdHash]);

    return perspective.headCid;
  }

  /** 
   * Ethereum dont know of root contexts. The consumer app can decide
   * the logic (multihash) used to derive the id of the root context of
   * a user and directly query for it using getContext(rootContextId)
   */
  async getRootContextId(): Promise<string> {
    if (enableDebug) debugger;
    const context = new Context(
      userId, 0, 0);
    return this.ipfsClient.getObjectId(context);
  }

  async getContextPerspectives(contextId: string): Promise<Perspective[]> {
    if (enableDebug) debugger;
    await this.ethereum.ready();
    const contextIdHash = await hash(contextId);

    let perspectiveOfContextAddedEvents = await this.ethereum.uprtclInstance.getPastEvents(
      'PerspectiveAdded', {
        filter: { contextIdHash: contextIdHash },
        fromBlock: 0
      }
    )
    
    let perspectiveIdHashes = perspectiveOfContextAddedEvents.map(e => e.returnValues.perspectiveIdHash);
    let perspectives = [];

    for (let i=0; i<perspectiveIdHashes.length; i++) {
      let perspectiveIdHash = perspectiveIdHashes[i];

      /** check the creation event to reverse map the cid */
      let perspectiveAddedEvent = await this.ethereum.uprtclInstance.getPastEvents(
        'PerspectiveAdded', {
          filter: { perspectiveIdHash: perspectiveIdHash },
          fromBlock: 0
        }
      )

      /** one event should exist only */
      perspectiveAddedEvent = perspectiveAddedEvent[0];

      let perspective = await this.getPerspective(perspectiveAddedEvent.returnValues.perspectiveCid);
      perspectives.push(perspective);
    } 

    return perspectives;
  }

  async createContext(context: Context): Promise<string> {
    if (enableDebug) debugger;
    await this.ethereum.ready();
    
    let contextIdOrg = context.id;

    let contextPlain = {
      'creatorId': context.creatorId,
      'timestamp': context.timestamp,
      'nonce': context.nonce,
    }

    let contextId = await this.ipfsClient.createData(contextPlain);

    if (contextIdOrg) {
      if (contextIdOrg != contextId) {
        throw new Error('context ID computed by IPFS is not the same as the input one.')
      }
    }

    return contextId;
  }

  async createPerspective(perspective: Perspective) : Promise<string> {
    if (enableDebug) debugger;
    await this.ethereum.ready();

    /** validate */
    if (!perspective.origin) throw new Error('origin cannot be empty');
    if (!perspective.contextId) throw new Error('context cannot be empty');

    let perspectiveIdOrg = perspective.id;

    /** force fields order */
    let perspectivePlain = {
      'origin': perspective.origin,
      'creatorId': perspective.creatorId,
      'timestamp': perspective.timestamp,
      'contextId': perspective.contextId,
      'name': perspective.name
    }

    /** Store the perspective data in the data layer */
    let perspectiveId = await this.ipfsClient.createData(perspectivePlain);

    if (perspectiveIdOrg) {
      if (perspectiveIdOrg != perspectiveId) {
        throw new Error('perspective ID computed by IPFS is not the same as the input one.')
      }
    }
    
    let perspectiveIdHash = await hash(perspectiveId);
    let contextIdHash = await hash(perspective.contextId);
    
    return this.ethereum.send(
        ADD_PERSP, 
        [perspectiveIdHash, contextIdHash, this.ethereum.account, perspectiveId]);
  }

  async updateHead(perspectiveId: string, headId: string): Promise<void> {
    if (enableDebug) debugger;
    let perspectiveIdHash = await hash(perspectiveId);

    return this.ethereum.send(
      UPDATE_HEAD, 
      [perspectiveIdHash, headId]);
  }

  async createCommit(commit: Commit) {
    if (enableDebug) debugger;
    await this.ethereum.ready();

    let commitIdOrg = commit.id;

    /** force fields order */
    let commitPlain = {
      'creatorId': commit.creatorId,
      'timestamp': commit.timestamp,
      'message': commit.message,
      'parentsIds': commit.parentsIds,
      'dataId': commit.dataId
    }

    /** Store the perspective data in the data layer */
    let commitId = await this.ipfsClient.createData(commitPlain);

    if (commitIdOrg) {
      if (commitIdOrg != commitId) {
        throw new Error('commit ID computed by IPFS is not the same as the input one.')
      }
    }    

    return this.ipfsClient.createData(commit);
  }

}

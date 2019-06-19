import { UprtclService } from '../uprtcl.service';
import { Context, Commit, Perspective } from './../../objects';

import { EthereumConnection } from './eth.connection';
import { IpfsStub } from './ipfs.data.stub';

import { hash, cidToHeadData, headDataToCid, HeadData } from './eth.support';

const userId = 'did:sec256k1:mykey';

export class UprtclEthereum implements UprtclService {
  
  ipfsClient = null;
  ethereum = null;

  constructor(host: string) {
    this.ipfsClient = new IpfsStub();
    this.ethereum = new EthereumConnection(host);
  }

  async hash(data: string): Promise<string> {
    return hash(data);
  }

  async getContext(contextId: string): Promise<Context> {
    return this.ipfsClient.getData(contextId);
  }

  async getPerspective(perspectiveId: string): Promise<Perspective> {
    await this.ethereum.ready();
    /** Content addressable part comes from IPFS */
    const persp = await this.ipfsClient.getData(perspectiveId);
    persp.id = perspectiveId;

    /** Head comes from ethereum */
    const result = await this.ethereum.uprtclInstance.getPerspective(perspectiveId);
    persp.headId = result.head;

    return persp;
  }

  async getCommit(commitId: string): Promise<Commit> {
    return this.ipfsClient.getData(commitId);
  }

  async getHead(perspectiveId: string): Promise<string> {
    await this.ethereum.ready();
    /** Head comes from ethereum */
    let perspectiveIdHash = await this.hash(perspectiveId);
    
    let perspData = await this.ethereum.uprtclInstance.methods
      .getPerspective(perspectiveIdHash)
      .call();

    let headData: HeadData = {
      base: perspData.base,
      head1: perspData.head1,
      head0: perspData.head0
    }

    return headDataToCid(headData);
  }

  /** 
   * Ethereum dont know of root contexts. The consumer app can decide
   * the logic (multihash) used to derive the id of the root context of
   * a user and directly query for it using getContext(rootContextId)
   */
  async getRootContextId(): Promise<string> {
    const context = new Context(
      userId, 0, 0);
    return this.ipfsClient.getObjectId(context);
  }

  async getContextPerspectives(contextId: string): Promise<Perspective[]> {
    await this.ethereum.ready();
    const contextIdHash = await this.hash(contextId);
    let events = await this.ethereum.uprtclInstance.getPastEvents(
      'PerspectiveAdded', {
        filter: { contextId: contextIdHash },
        fromBlock: 0
      }
    )
    
    let perspectiveIds = events.map(e => e.args.perspectiveId);

    // TODO: paralelize calls with Promise.all
    let perspectives = [];
    for (let i=0; i<perspectiveIds.length; i++) {
      let perspective = await this.getPerspective(perspectiveIds[i]);
      perspectives.push(perspective);
    } 

    return perspectives;
  }

  async createContext(context: Context): Promise<string> {
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
    
    let perspectiveIdHash = await this.hash(perspectiveId);
    let contextIdHash = await this.hash(perspective.contextId);
    
    /** perspective is added but the head is set to null 
     * updateHead() should be to set the head */
    await this.ethereum.uprtclInstance.methods
      .addPerspective(perspectiveIdHash, contextIdHash, this.ethereum.account)
      .send({ from: this.ethereum.account });

    return perspectiveId;
  }

  async updateHead(perspectiveId: string, headId: string): Promise<void> {
    debugger
    let perspectiveIdHash = await this.hash(perspectiveId);

    let headParts = cidToHeadData(headId);

    await this.ethereum.uprtclInstance.methods
      .updateHead(perspectiveIdHash, headParts.base, headParts.head1, headParts.head0)
      .send({ from: this.ethereum.account })
  }

  async createCommit(commit: Commit) {
    
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

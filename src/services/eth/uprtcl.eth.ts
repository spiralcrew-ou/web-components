import { UprtclService } from '../uprtcl.service';
import { Context, Commit, Perspective } from '../../types';

import { EthereumConnection } from './eth.connection';
import { IpfsClient } from './ipfs.client';

import { hash } from './eth.support';
import { CidConfig } from '../cid.config';

// function makeid(length) {
//   var result           = '';
//   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   var charactersLength = characters.length;
//   for ( var i = 0; i < length; i++ ) {
//      result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// }

const ADD_PERSP = 'addPerspective(bytes32,bytes32,address,string)';
const UPDATE_HEAD = 'updateHead(bytes32,string)';
// const CHANGE_OWNER = 'changeOwner(bytes32,address)';
const GET_PERSP = 'getPerspective(bytes32)';

export class UprtclEthereum implements UprtclService {
  
  ipfsClient: IpfsClient;
  ethereum: EthereumConnection;
  cidConfig: CidConfig;

  constructor(host: string) {
    this.ipfsClient = new IpfsClient();
    this.ethereum = new EthereumConnection(host);
    this.cidConfig = new CidConfig(
      'base58btc', 1, 'raw', 'sha2-256');
  }

  getCidConfig(): CidConfig {
    return this.cidConfig;
  }

  setCidConfig(): CidConfig {
    throw new Error('Ethereum Cid version is fixed for the moment');
  }
  
  async getContext(contextId: string): Promise<Context> {
    let result = await this.ipfsClient.get(contextId);
    console.log(`[ETH] getContext ${contextId}`, result)
    return result;
  }

  async getPerspective(perspectiveId: string): Promise<Perspective> {
    await this.ethereum.ready();

    /** Content addressable part comes from IPFS */
    const perspective: Perspective = await this.ipfsClient.get(perspectiveId);
    perspective.id = perspectiveId;
    console.log(`[ETH] getPerspective ${perspectiveId}`, perspective)
    return perspective;
  }

  async getCommit(commitId: string): Promise<Commit> {
    let result = await this.ipfsClient.get(commitId);
    console.log(`[ETH] getCommit ${commitId}`, result);
    return result;
  }

  async getHead(perspectiveId: string): Promise<string> {
    await this.ethereum.ready();
    
    let perspectiveIdHash = await hash(perspectiveId);

    const perspective = await this.ethereum.call(
      GET_PERSP, 
      [perspectiveIdHash]);

    console.log(`[ETH] getHead ${perspectiveId}`, perspective);
    
    /** empty string is null */
    return perspective.headCid !== '' ? perspective.headCid : null;
  }

  async getContextPerspectives(contextId: string): Promise<Perspective[]> {
    await this.ethereum.ready();
    const contextIdHash = await hash(contextId);

    let perspectiveOfContextAddedEvents = await this.ethereum.uprtclInstance.getPastEvents(
      'PerspectiveAdded', {
        filter: { contextIdHash: contextIdHash },
        fromBlock: 0
      }
    )
    
    let perspectiveIdHashes = perspectiveOfContextAddedEvents.map(e => e.returnValues.perspectiveIdHash);
    console.log(`[ETH] getContextPerspectives Hases ${contextId}`, perspectiveIdHashes);

    let promises : Promise<Perspective>[] = perspectiveIdHashes.map(async (perspectiveIdHash) => {
      /** check the creation event to reverse map the cid */
      let perspectiveAddedEvent = await this.ethereum.uprtclInstance.getPastEvents(
        'PerspectiveAdded', {
          filter: { perspectiveIdHash: perspectiveIdHash },
          fromBlock: 0
        }
      )

      /** one event should exist only */
      perspectiveAddedEvent = perspectiveAddedEvent[0];

      console.log(`[ETH] Reverse map perspective hash ${perspectiveIdHash}`, perspectiveAddedEvent);
      return this.getPerspective(perspectiveAddedEvent.returnValues.perspectiveCid);
    })

    return Promise.all(promises);
  }

  async createContext(context: Context): Promise<string> {
    await this.ethereum.ready();
    
    let contextIdOrg = context.id;

    let contextPlain = {
      'creatorId': context.creatorId,
      'timestamp': context.timestamp,
      'nonce': context.nonce,
    }

    let contextId = await this.ipfsClient.addObject(contextPlain, this.cidConfig);

    if (contextIdOrg) {
      if (contextIdOrg != contextId) {
        throw new Error('context ID computed by IPFS is not the same as the input one.')
      }
    }

    console.log(`[ETH] createContext`, context, contextId);
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
    let perspectiveId = await this.ipfsClient.addObject(perspectivePlain, this.cidConfig);
    console.log(`[ETH] createPerspective - added to IPFS`, perspectiveId);

    if (perspectiveIdOrg) {
      if (perspectiveIdOrg != perspectiveId) {
        throw new Error('perspective ID computed by IPFS is not the same as the input one.')
      }
    }
    
    let perspectiveIdHash = await hash(perspectiveId);
    let contextIdHash = await hash(perspective.contextId);
    
    let result = await this.ethereum.send(
        ADD_PERSP, 
        [perspectiveIdHash, contextIdHash, this.ethereum.account, perspectiveId]);

    console.log(`[ETH] createPerspective - TX mined`, result);
    return result;
  }

  async updateHead(perspectiveId: string, headId: string): Promise<void> {
    let perspectiveIdHash = await hash(perspectiveId);

    let result = await this.ethereum.send(
      UPDATE_HEAD, 
      [perspectiveIdHash, headId]);

    console.log(`[ETH] updateHead - TX mined`, result);
    return result;
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
    let commitId = await this.ipfsClient.addObject(commitPlain, this.cidConfig);

    if (commitIdOrg) {
      if (commitIdOrg != commitId) {
        throw new Error('commit ID computed by IPFS is not the same as the input one.')
      }
    }

    console.log(`[ETH] createCommit - added to IPFS`, commitId);
    return commitId;
  }

}

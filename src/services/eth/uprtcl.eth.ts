import { UprtclService } from '../uprtcl.service';
import { Context, Commit, Perspective } from './../../objects';

import { EthereumConnection } from './eth.connection';
import { IpfsStub } from './ipfs.data.stub';

import CID from 'cids';
import multihashing from 'multihashing-async';
import Buffer from 'buffer/';

const userId = 'did:sec256k1:mykey';

export class UprtclEthereum implements UprtclService {

  ipfsClient = null;
  ethereum = null;

  constructor(host: string) {
    this.ipfsClient = new IpfsStub();
    this.ethereum = new EthereumConnection(host);
  }

  private async hash(data: string) : Promise<string> {
    const encoded = await multihashing(
      Buffer.Buffer.from(data), 'sha3-256');
    return '0x' + encoded.toString('hex');
  }

  private cidToBytes32(cidEncoded: string) : string[] {
    const cid = new CID(cidEncoded);

    const cidEncoded16 = cid.toString('base16');
    
    let cidHex0 = null;
    let cidHex1 = null;

    if (cidEncoded16.length <= 64) {
      cidHex0 = cidEncoded16.padStart(64, '0');
      cidHex1 = new Array(64).fill('0').join('');
    } else {
      cidHex0 = cidEncoded16.slice(-64);
      cidHex1 = cidEncoded16.slice(-cidEncoded16.length, -64).padStart(64,'0');
    }

    return [ cidHex1, cidHex0 ];
  }

  async getContext(contextId: string): Promise<Context> {
    return this.ipfsClient.getData(contextId);
  }

  async getPerspective(perspectiveId: string): Promise<Perspective> {
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
    debugger
    const contextIdHash = await this.hash(contextId);
    let event = this.ethereum.uprtclInstance.PerspectiveAdded(
      { contextId: contextIdHash },
      { fromBlock: 0 });

    event.get((error, events) => {
      console.log(events);
      console.log(events);
    });

    /** 

    let perspectiveIds = events.map(e => e.perspectiveId);


    // TODO: paralelize calls with Promise.all
    let perspectives = [];
    for (let i=0; i<perspectiveIds.length; i++) {
      let perspective = await this.getPerspective(perspectiveIds[i]);
      perspectives.push(perspective);
    } 

    return perspectives;
    */

    return [];
  }

  async createContext(
    _timestamp: number,
    _nonce: number): Promise<string> {

    let context: Context = new Context(
      userId,
      _timestamp,
      _nonce);

    return this.ipfsClient.createData(context);
  }

  async createPerspective(
    _contextId: string,
    _name: string,
    _timestamp: number,
    _headCid: string) : Promise<string> {

    let perspective = {
      'origin': 'eth://XXXXX',
      'creatorId': userId,
      'timestamp': _timestamp,
      'contextId': _contextId,
      'name': _name
    }

    /** Store the perspective data in the data layer */
    let perspectiveId = await this.ipfsClient.createData(perspective);
    
    let perspectiveIdHash = this.hash(perspectiveId);
    let contextIdHash = this.hash(_contextId);
    
    await this.ethereum.uprtclInstance
      .methods['addPerspective(bytes32,bytes32,address)']
      (perspectiveIdHash, contextIdHash, userId,
      { from: this.ethereum.web3.accounts[0] });

    let headParts = this.cidToBytes32(_headCid);

    return this.ethereum.uprtclInstance
      .methods['updateHead(bytes32,bytes32,bytes32)']
      (perspectiveIdHash, headParts[0], headParts[1],
      { from: this.ethereum.uprtclInstance[0] });
  }

  async createCommit(
    _timestamp: number,
    _message: string,
    _parentsIds: string[],
    _dataId: string
  ) {

    let commit: Commit = new Commit(
      userId,
      _timestamp,
      _message,
      _parentsIds,
      _dataId
    );

    return this.ipfsClient.createData(commit);
  }

  cloneContext(context: Context): Promise<string> {
    return this.ipfsClient.createData(context);
  }
  clonePerspective(perspective: Perspective): Promise<string> {
    return this.ipfsClient.createData(perspective);
  }
  cloneCommit(commit: Commit): Promise<string> {
    return this.ipfsClient.createData(commit);
  }

  async updateHead(perspectiveId: string, commitId: string): Promise<void> {
    throw new Error(perspectiveId + commitId);
  }

}

import { UprtclService } from '../uprtcl.service';
import { DataIpfs } from '../data.ipfs';
import { Context, Commit, Perspective } from './../../objects';

const userId = 'asdasdsadas';

export class UprtclCollectiveOne implements UprtclService {

  ADDRESS = '0xsdfjhsdfkjdfskjlslkjsdlkj'
  ipfsClient = new DataIpfs('localhost://5000');
  web3Client = null;
  uprtclEthereum = null;

  constructor() {
    this.web3Client = window['web3'];
  }

  async connect() {
    this.uprtclEthereum = await this.web3Client.contract(this.ADDRESS);
  }

  async getContext(contextId: string): Promise<Context> {
    return this.ipfsClient.getData(contextId);
  }

  async getPerspective(perspectiveId: string): Promise<Perspective> {
    /** Content addressable part comes from IPFS */
    const persp = await this.ipfsClient.getData(perspectiveId);
    persp.id = perspectiveId;

    /** Head comes from ethereum */
    const result = await this.uprtclEthereum.getPerspective(perspectiveId);
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
    return null;
  }

  async getContextPerspectives(contextId: string): Promise<Perspective[]> {

    let events = await this.uprtclEthereum.PerspectiveAddedPromise(
      {
        filter: {
          contextId: contextId
        },
        fromBlock: 0
      }).getPromise();

    let perspectiveIds = events.map(e => e.perspectiveId);

    // TODO: paralelize calls with Promise.all
    let perspectives = [];
    for (let i=0; i<perspectiveIds.length; i++) {
      let perspective = await this.getPerspective(perspectiveIds[i]);
      perspectives.push(perspective);
    } 

    return perspectives;
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
    _headId: string) {

    let perspective = {
      'origin': 'eth://XXXXX',
      'creatorId': userId,
      'timestamp': _timestamp,
      'contextId': _contextId,
      'name': _name
    }

    let perspectiveId = await this.ipfsClient.createData(perspective);
    await this.uprtclEthereum.addPerspective(perspectiveId, _contextId);
    return this.uprtclEthereum.updateHead(perspectiveId, _headId);
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
    console.log(context);
    throw new Error('ethereum cannot clone contexts');
  }
  clonePerspective(perspective: Perspective): Promise<string> {
    console.log(perspective);
    throw new Error('ethereum cannot clone perspectives');
  }
  cloneCommit(commit: Commit): Promise<string> {
    console.log(commit);
    throw new Error('ethereum cannot clone commits');
  }

  async updateHead(perspectiveId: string, commitId: string): Promise<void> {
    return this.uprtclEthereum.updateHead(perspectiveId, commitId);
  }

}
